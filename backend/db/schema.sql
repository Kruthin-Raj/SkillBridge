-- ---------------------------------------------------------------------------
-- SkillBridge schema  (slide 7: users, listings, bids, exchanges, reviews)
--
-- Run this once in the Supabase dashboard:
--   Project -> SQL Editor -> New query -> paste -> Run
-- ---------------------------------------------------------------------------

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id             uuid primary key default gen_random_uuid(),
  email          text        not null unique,
  full_name      text        not null default '',
  bio            text        not null default '',
  avatar_url     text        not null default '',
  password_hash  text        not null default '',
  skills_offered text[]      not null default '{}',
  skills_wanted  text[]      not null default '{}',
  rating_average numeric(3,2) not null default 0,
  rating_count   integer     not null default 0,
  last_read_at   timestamptz not null default now(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- listings  -  one table serves both modes (slide 9)
--   freelance : budget + deadline are set, receives bids
--   exchange  : skill_offered + skill_wanted are set, receives exchanges
-- ---------------------------------------------------------------------------
create table if not exists public.listings (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null references public.users(id) on delete cascade,
  mode            text not null check (mode in ('freelance', 'exchange')),
  title           text not null,
  description     text not null,
  tags            text[] not null default '{}',

  -- freelance only
  budget          integer,
  deadline        timestamptz,
  accepted_bid_id uuid,

  -- exchange only
  skill_offered   text,
  skill_wanted    text,

  -- optional attachment (base64 data-url)
  image_url       text not null default '',

  status          text not null default 'open'
                    check (status in ('open', 'in_progress', 'completed', 'cancelled')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- Each mode must carry its own fields and nothing else.
  constraint listings_mode_fields check (
    (mode = 'freelance'
      and budget is not null and deadline is not null
      and skill_offered is null and skill_wanted is null)
    or
    (mode = 'exchange'
      and skill_offered is not null and skill_wanted is not null
      and budget is null and deadline is null)
  )
);

create index if not exists listings_mode_status_idx on public.listings (mode, status);
create index if not exists listings_owner_idx       on public.listings (owner_id);

-- ---------------------------------------------------------------------------
-- bids  -  freelance mode
-- ---------------------------------------------------------------------------
create table if not exists public.bids (
  id         uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  bidder_id  uuid not null references public.users(id)    on delete cascade,
  amount     integer not null check (amount > 0),
  message    text not null default '',
  status     text not null default 'pending'
               check (status in ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- One bid per student per listing.
  unique (listing_id, bidder_id)
);

create index if not exists bids_listing_idx on public.bids (listing_id);

alter table public.listings
  drop constraint if exists listings_accepted_bid_fk;
alter table public.listings
  add constraint listings_accepted_bid_fk
  foreign key (accepted_bid_id) references public.bids(id) on delete set null;

-- ---------------------------------------------------------------------------
-- exchanges  -  skill-swap mode
-- ---------------------------------------------------------------------------
create table if not exists public.exchanges (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null references public.listings(id) on delete cascade,
  owner_id    uuid not null references public.users(id)    on delete cascade,
  proposer_id uuid not null references public.users(id)    on delete cascade,
  message     text not null default '',
  status      text not null default 'pending'
                check (status in ('pending', 'accepted', 'declined', 'completed')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint exchanges_not_self check (owner_id <> proposer_id),
  unique (listing_id, proposer_id)
);

create index if not exists exchanges_owner_idx    on public.exchanges (owner_id);
create index if not exists exchanges_proposer_idx on public.exchanges (proposer_id);

-- ---------------------------------------------------------------------------
-- reviews  -  every completed job leaves a rating on both profiles (slide 9)
-- ---------------------------------------------------------------------------
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null references public.listings(id) on delete cascade,
  reviewer_id uuid not null references public.users(id)    on delete cascade,
  reviewee_id uuid not null references public.users(id)    on delete cascade,
  rating      integer not null check (rating between 1 and 5),
  comment     text not null default '',
  created_at  timestamptz not null default now(),

  constraint reviews_not_self check (reviewer_id <> reviewee_id),
  -- One review per person per listing.
  unique (listing_id, reviewer_id)
);

create index if not exists reviews_reviewee_idx on public.reviews (reviewee_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- The Express API is the only client and it uses the service-role key, which
-- bypasses RLS. We still enable RLS with no permissive policies so that a
-- leaked anon key cannot read the tables directly.
-- ---------------------------------------------------------------------------
alter table public.users     enable row level security;
alter table public.listings  enable row level security;
alter table public.bids      enable row level security;
alter table public.exchanges enable row level security;
alter table public.reviews   enable row level security;

-- ---------------------------------------------------------------------------
-- keep updated_at honest
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['users', 'listings', 'bids', 'exchanges'] loop
    execute format('drop trigger if exists touch_%1$s on public.%1$I', t);
    execute format(
      'create trigger touch_%1$s before update on public.%1$I
         for each row execute function public.touch_updated_at()', t);
  end loop;
end;
$$;

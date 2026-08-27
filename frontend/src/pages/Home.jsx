import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  {
    icon: '💼',
    title: 'Freelance Tasks',
    desc: 'Post paid tasks with budgets and deadlines. Students bid, you pick the best fit.',
    color: 'from-freelance/10 to-freelance/5 border-freelance/20',
    accent: 'text-freelance',
  },
  {
    icon: '🔄',
    title: 'Skill Exchange',
    desc: 'Teach what you know, learn what you need. No money involved — just mutual growth.',
    color: 'from-exchange/10 to-exchange/5 border-exchange/20',
    accent: 'text-exchange',
  },
  {
    icon: '⭐',
    title: 'Trust & Reviews',
    desc: 'Every completed job builds your campus reputation. Ratings and reviews drive quality.',
    color: 'from-amber-50 to-amber-50/50 border-amber-200/50',
    accent: 'text-amber-600',
  },
];

const STEPS = [
  { num: '01', title: 'Sign in with your college email', desc: 'Verified students only. Quick OTP-based login.' },
  { num: '02', title: 'Browse or post', desc: 'Find tasks to work on or post your own. Toggle between freelance and skill exchange.' },
  { num: '03', title: 'Bid or match', desc: 'Place bids on freelance tasks or get matched with skill swap partners.' },
  { num: '04', title: 'Deliver & get reviewed', desc: 'Complete the work, earn ratings, and build your campus profile.' },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="-mt-8 -mx-4">
      {/* Hero */}
      <section className="hero-gradient px-4 py-20 text-center text-white">
        <div className="mx-auto max-w-3xl animate-slide-up">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Your Campus,{' '}
            <span className="bg-gradient-to-r from-emerald-200 to-purple-200 bg-clip-text text-transparent">
              Your Marketplace
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/80">
            Freelance for pay or exchange skills for free — all within your verified student community.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/browse" className="btn rounded-full bg-white px-8 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 shadow-lg">
              Browse Listings
            </Link>
            {!user && (
              <Link to="/login" className="btn rounded-full border-2 border-white/30 px-8 py-3 text-sm font-semibold text-white hover:bg-white/10">
                Sign In
              </Link>
            )}
            {user && (
              <Link to="/new" className="btn rounded-full border-2 border-white/30 px-8 py-3 text-sm font-semibold text-white hover:bg-white/10">
                Post a Task
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold text-slate-900">Two modes, one platform</h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-sm text-slate-600">
          Whether you want to earn money or trade knowledge, SkillBridge has you covered.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`animate-fade-in rounded-2xl border bg-gradient-to-b p-6 ${f.color} transition hover:shadow-md`}
            >
              <span className="text-3xl">{f.icon}</span>
              <h3 className={`mt-3 text-lg font-semibold ${f.accent}`}>{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-slate-200 bg-white px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold text-slate-900">How it works</h2>
          <div className="mt-10 space-y-8">
            {STEPS.map((s) => (
              <div key={s.num} className="flex gap-5 animate-fade-in">
                <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                  {s.num}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{s.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 text-center">
        <div className="mx-auto max-w-md">
          <h2 className="text-2xl font-bold text-slate-900">Ready to get started?</h2>
          <p className="mt-2 text-sm text-slate-600">
            Join your campus community and start collaborating today.
          </p>
          <Link
            to={user ? '/browse' : '/login'}
            className="btn-primary mt-6 inline-flex rounded-full px-8 py-3"
          >
            {user ? 'Browse Listings' : 'Sign In Now'}
          </Link>
        </div>
      </section>
    </div>
  );
}

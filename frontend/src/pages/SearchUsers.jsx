import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function SearchUsers() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const { users: data } = await api.users.search(query);
        setUsers(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchUsers();
    } else {
      setUsers([]);
      setLoading(false);
    }
  }, [query]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-cw-text-1">Search Results</h1>
      </div>

      {query && (
        <p className="text-sm text-cw-text-2 mb-4">
          Showing results for <span className="font-semibold text-cw-text-1">"{query}"</span>
        </p>
      )}

      {loading ? (
        <div className="card text-center py-12">
          <p className="text-sm text-cw-text-3">Searching...</p>
        </div>
      ) : error ? (
        <div className="card text-center py-12 border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      ) : users.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-sm text-cw-text-2">No users found.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {users.map((user) => {
            const initials = (user.full_name || user.email || '?')
              .split(' ')
              .map((w) => w[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <Link key={user.id} to={`/users/${user.id}`} className="card hover:border-cw-accent hover:shadow-md transition">
                <div className="flex items-center gap-4">
                  <div className="avatar-md flex-shrink-0">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="Avatar" />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold text-cw-text-1 truncate">
                      {user.full_name || 'Anonymous Student'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-amber-500 text-sm">★</span>
                      <span className="text-sm font-medium text-cw-text-2">
                        {Number(user.rating_average || 0).toFixed(1)} 
                        <span className="text-cw-text-3 font-normal ml-1">({user.rating_count || 0})</span>
                      </span>
                    </div>
                  </div>
                </div>
                {((user.skills_offered?.length > 0) || (user.skills_wanted?.length > 0)) && (
                  <div className="mt-4 flex flex-wrap gap-1.5 border-t border-cw-border pt-3">
                    {user.skills_offered?.slice(0, 3).map(s => (
                      <span key={s} className="rounded-full bg-freelance/10 px-2 py-0.5 text-[10px] font-medium text-freelance truncate max-w-[100px]">
                        Teach: {s}
                      </span>
                    ))}
                    {user.skills_wanted?.slice(0, 3).map(s => (
                      <span key={s} className="rounded-full bg-exchange/10 px-2 py-0.5 text-[10px] font-medium text-exchange truncate max-w-[100px]">
                        Learn: {s}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { api } from '../lib/api';

const OPTIONS = [
  { value: 'todo', label: 'To Do', color: 'bg-slate-100 text-slate-700' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: 'review', label: 'Ready for Review', color: 'bg-purple-100 text-purple-800' },
];

export default function TaskProgress({ listingId, currentStatus, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpdate = async (status) => {
    if (status === currentStatus) return;
    setLoading(true);
    setError('');
    try {
      const { listing } = await api.listings.setWorkerStatus(listingId, status);
      if (onUpdate) onUpdate(listing);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="font-semibold text-slate-900 mb-3">Task Progress</h3>
      
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((opt) => {
          const isActive = currentStatus === opt.value || (!currentStatus && opt.value === 'todo');
          return (
            <button
              key={opt.value}
              onClick={() => handleUpdate(opt.value)}
              disabled={loading}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isActive 
                  ? opt.color + ' ring-2 ring-offset-1 ring-slate-300'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

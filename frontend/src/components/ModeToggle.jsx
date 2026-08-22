/**
 * The single toggle from slide 4 that switches the marketplace between
 * paid freelancing and free skill exchange.
 */
const MODES = [
  { value: 'freelance', label: 'Freelance', hint: 'Paid tasks with bids' },
  { value: 'exchange', label: 'Skill Exchange', hint: 'Swap skills, no money' },
];

export default function ModeToggle({ mode, onChange }) {
  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
      {MODES.map((option) => {
        const active = option.value === mode;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            title={option.hint}
            aria-pressed={active}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              active
                ? `text-white ${option.value === 'freelance' ? 'bg-freelance' : 'bg-exchange'}`
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

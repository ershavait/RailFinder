const CATEGORIES = [
  { label: 'All', icon: 'apps', bg: 'bg-primary-fixed', text: 'text-on-primary-fixed' },
  { label: 'Food & Drinks', icon: 'restaurant', bg: 'bg-tertiary-fixed', text: 'text-on-tertiary-fixed' },
  { label: 'Hotels & Stay', icon: 'hotel', bg: 'bg-primary-fixed', text: 'text-on-primary-fixed' },
  { label: 'Sightseeing', icon: 'photo_camera', bg: 'bg-secondary-fixed', text: 'text-on-secondary-fixed' },
  { label: 'Parks & Leisure', icon: 'park', bg: 'bg-[#d4f5d4]', text: 'text-[#1a4f1a]' },
  { label: 'Healthcare', icon: 'local_hospital', bg: 'bg-[#ffd6d6]', text: 'text-[#6b0000]' },
  { label: 'Worship', icon: 'temple_hindu', bg: 'bg-[#ffe8cc]', text: 'text-[#5c2d00]' },
  { label: 'Shopping', icon: 'shopping_bag', bg: 'bg-[#e4d4f5]', text: 'text-[#3a1f5c]' },
]

export default function CategoryGrid({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {CATEGORIES.map(cat => {
        const isActive = selected === cat.label
        return (
          <button
            key={cat.label}
            onClick={() => onSelect(cat.label)}
            className={`relative flex flex-col items-center gap-3 p-5 rounded-lg transition-all hover:scale-[1.02] active:scale-95 ${
              isActive
                ? 'ring-2 ring-secondary-container shadow-[0_8px_24px_rgba(26,27,31,0.12)]'
                : 'shadow-[0_4px_16px_rgba(26,27,31,0.06)]'
            } ${cat.bg} ${cat.text}`}
          >
            {isActive && (
              <span className="absolute top-2 right-2 w-5 h-5 bg-secondary-container rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-xs text-on-secondary-container">check</span>
              </span>
            )}
            <span className="material-symbols-outlined text-3xl">{cat.icon}</span>
            <span className="text-sm font-bold text-center leading-tight">{cat.label}</span>
          </button>
        )
      })}
    </div>
  )
}

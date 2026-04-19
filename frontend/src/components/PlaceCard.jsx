const TYPE_COLORS = {
  'Restaurant': 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  'Cafe': 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  'Fast Food': 'bg-secondary-fixed text-on-secondary-fixed-variant',
  'Food Court': 'bg-secondary-fixed text-on-secondary-fixed-variant',
  'Bar': 'bg-secondary-fixed text-on-secondary-fixed-variant',
  'Hotel': 'bg-primary-fixed text-on-primary-fixed-variant',
  'Guest House': 'bg-primary-fixed text-on-primary-fixed-variant',
  'Hospital': 'bg-[#ffd6d6] text-[#6b0000]',
  'Clinic': 'bg-[#ffd6d6] text-[#6b0000]',
  'Pharmacy': 'bg-[#ffd6d6] text-[#6b0000]',
  'Attraction': 'bg-[#e4d4f5] text-[#3a1f5c]',
  'Museum': 'bg-[#e4d4f5] text-[#3a1f5c]',
  'Park': 'bg-[#d4f5d4] text-[#1a4f1a]',
  'Temple/Mosque/Church': 'bg-[#ffe8cc] text-[#5c2d00]',
  'Shopping Mall': 'bg-[#e4d4f5] text-[#3a1f5c]',
}

const TYPE_ICONS = {
  'Restaurant': 'restaurant', 'Cafe': 'local_cafe', 'Fast Food': 'fastfood',
  'Food Court': 'food_court', 'Bar': 'local_bar', 'Hotel': 'hotel',
  'Guest House': 'bed', 'Hostel': 'bed', 'Lodge': 'cabin',
  'Hospital': 'local_hospital', 'Clinic': 'medical_services',
  'Pharmacy': 'medication', 'Doctor': 'stethoscope',
  'Attraction': 'tour', 'Museum': 'museum', 'Viewpoint': 'landscape',
  'Artwork': 'palette', 'Park': 'park', 'Garden': 'yard', 'Stadium': 'stadium',
  'Temple/Mosque/Church': 'temple_hindu', 'Shopping Mall': 'shopping_bag',
  'Supermarket': 'shopping_cart', 'Dept. Store': 'store',
}

export default function PlaceCard({ place, maxDist }) {
  const pct = Math.min((place.dist / maxDist) * 100, 100)
  const colorClass = TYPE_COLORS[place.type] || 'bg-surface-container text-on-surface-variant'
  const icon = TYPE_ICONS[place.type] || 'place'

  return (
    <div className="bg-surface-container-lowest p-5 rounded-lg flex gap-4 transition-all hover:scale-[1.01] cursor-pointer shadow-[0_4px_16px_rgba(26,27,31,0.04)]">
      {/* Icon */}
      <div className={`w-12 h-12 rounded-DEFAULT flex-shrink-0 flex items-center justify-center ${colorClass}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-0.5">
          <h3 className="font-bold text-on-surface truncate pr-2 leading-tight">{place.name}</h3>
          <span className={`flex-shrink-0 text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${colorClass}`}>
            {place.type}
          </span>
        </div>
        <div className="mt-3">
          <div className="flex justify-between items-end text-xs font-semibold text-on-surface-variant mb-1">
            <span>{place.dist.toFixed(2)} km away</span>
            <span className={place.dist < 0.5 ? 'text-[#1a4f1a]' : 'text-on-surface-variant opacity-70'}>
              {place.dist < 0.5 ? 'Very close' : place.dist < 1 ? 'Walking' : place.dist < 2 ? 'Short ride' : 'Nearby'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary-container rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

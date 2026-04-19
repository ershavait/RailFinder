export default function StationCard({ station, onConfirm, onBack }) {
  return (
    <div className="bg-surface-container-lowest rounded-lg p-6 shadow-[0_20px_40px_rgba(26,27,31,0.06)] max-w-xl mx-auto">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-14 h-14 rounded-DEFAULT bg-primary-fixed flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-primary text-2xl">train</span>
        </div>
        <div>
          <h2 className="text-2xl font-black text-primary leading-tight">{station.name}</h2>
          <span className="inline-block mt-1 px-3 py-0.5 bg-secondary-container text-on-secondary-container text-xs font-black uppercase rounded-full">
            {station.code}
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {station.state && (
          <div className="flex items-center gap-3 text-sm">
            <span className="material-symbols-outlined text-on-surface-variant text-base">location_on</span>
            <span className="text-on-surface-variant">State:</span>
            <span className="font-semibold text-on-surface">{station.state}</span>
          </div>
        )}
        {station.zone && (
          <div className="flex items-center gap-3 text-sm">
            <span className="material-symbols-outlined text-on-surface-variant text-base">map</span>
            <span className="text-on-surface-variant">Zone:</span>
            <span className="font-semibold text-on-surface">{station.zone}</span>
          </div>
        )}
        {station.address && (
          <div className="flex items-start gap-3 text-sm">
            <span className="material-symbols-outlined text-on-surface-variant text-base mt-0.5">home_pin</span>
            <span className="text-on-surface-variant">Address:</span>
            <span className="font-medium text-on-surface">{station.address}</span>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-full border border-outline-variant text-on-surface font-semibold hover:bg-surface-container-low transition-all active:scale-95"
        >
          Change Station
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-3 rounded-full bg-secondary-container text-on-secondary-container font-bold hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          Confirm
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </button>
      </div>
    </div>
  )
}

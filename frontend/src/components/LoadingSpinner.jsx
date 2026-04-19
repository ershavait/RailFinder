export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-surface-container-high border-t-secondary-container animate-spin" />
      <p className="text-on-surface-variant text-sm font-medium">{message}</p>
    </div>
  )
}

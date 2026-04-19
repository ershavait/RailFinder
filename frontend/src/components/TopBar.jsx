import { useNavigate, useLocation } from 'react-router-dom'

const STEPS = [
  { path: '/', label: 'Search', num: 1 },
  { path: '/station', label: 'Station', num: 2 },
  { path: '/category', label: 'Category', num: 3 },
  { path: '/results', label: 'Results', num: 4 },
]

export default function TopBar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const currentStep = STEPS.findIndex(s => s.path === pathname)

  return (
    <header className="sticky top-0 z-50 bg-[#faf9fe]/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto flex justify-between items-center px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-4">
          {currentStep > 0 && (
            <button
              onClick={() => navigate(-1)}
              className="material-symbols-outlined hover:bg-surface-container-low p-2 rounded-full transition-colors text-primary"
            >
              arrow_back
            </button>
          )}
          <button onClick={() => navigate('/')} className="flex flex-col text-left">
            <span className="text-xl font-black text-primary">Indian Railways</span>
            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
              Wayfinder
            </span>
          </button>
        </div>

        {/* Step Indicator (desktop) */}
        <div className="hidden md:flex items-center gap-2">
          {STEPS.map((step, i) => {
            const isActive = i === currentStep
            const isDone = i < currentStep
            return (
              <div key={step.path} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-secondary-container text-on-secondary-container'
                        : isDone
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container-highest text-on-surface-variant'
                    }`}
                  >
                    {isDone ? (
                      <span className="material-symbols-outlined text-sm">check</span>
                    ) : (
                      step.num
                    )}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      isActive ? 'text-primary font-bold' : 'text-on-surface-variant'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-8 h-0.5 ${isDone ? 'bg-primary' : 'bg-surface-container-highest'}`}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Train icon */}
        <span className="material-symbols-outlined text-2xl text-primary opacity-60">train</span>
      </div>
    </header>
  )
}

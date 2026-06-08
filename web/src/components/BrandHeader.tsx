import { Diamond } from './icons'

type Props = { onReset?: () => void; showReset?: boolean }

export default function BrandHeader({ onReset, showReset }: Props) {
  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2.5">
        <span
          className="grid h-8 w-8 place-items-center rounded-[9px] bg-gradient-to-br from-amber to-[#E8943B] text-bg shadow-[0_0_18px_rgba(242,178,76,0.35)]"
          aria-hidden="true"
        >
          <Diamond className="h-3.5 w-3.5" />
        </span>
        <span className="font-display text-xl font-bold tracking-tight">Kira</span>
      </div>

      {showReset && (
        <button
          onClick={onReset}
          className="min-h-11 rounded-full border border-line px-5 text-sm font-semibold text-ink transition-colors hover:border-amber focus-visible:border-amber"
        >
          Start over
        </button>
      )}
    </header>
  )
}

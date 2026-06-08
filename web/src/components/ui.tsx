import type { ButtonHTMLAttributes, ReactNode } from 'react'

// ── Button ──────────────────────────────────────────────────────────────────
type Variant = 'primary' | 'ghost'
interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}
export function Button({ variant = 'ghost', className = '', ...rest }: BtnProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full px-6 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50'
  const styles =
    variant === 'primary'
      ? 'min-h-12 bg-amber text-bg hover:bg-ambersoft'
      : 'min-h-11 border border-line text-ink hover:border-amber'
  return <button className={`${base} ${styles} ${className}`} {...rest} />
}

// ── Stage header (eyebrow + title) ───────────────────────────────────────────
export function StageHeader({ step, title }: { step: string; title: string }) {
  return (
    <div>
      <p className="eyebrow mb-1.5">{step}</p>
      <h2 className="font-display text-2xl font-bold sm:text-[1.7rem]">{title}</h2>
    </div>
  )
}

// ── Spinner with witty caption ───────────────────────────────────────────────
export function Spinner({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-8" role="status" aria-live="polite">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-amber" />
      <span className="text-muted">{label}</span>
    </div>
  )
}

// ── Inline note (amber-bordered) ─────────────────────────────────────────────
export function Note({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border-l-2 border-amber bg-surface px-3.5 py-2 text-sm text-muted">
      {children}
    </div>
  )
}

// ── Error banner ─────────────────────────────────────────────────────────────
export function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
    >
      {message}
    </div>
  )
}

// ── Tag / badge ──────────────────────────────────────────────────────────────
export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-full border border-line bg-surface2 px-2.5 py-0.5 font-mono text-[0.68rem] text-muted">
      {children}
    </span>
  )
}

// ── Download helper ──────────────────────────────────────────────────────────
export function downloadB64(b64: string, filename: string) {
  const a = document.createElement('a')
  a.href = `data:image/png;base64,${b64}`
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}

// Witty processing lines, one chosen at random per run.
export const SPIN = {
  identify: ['Squinting at the details…', 'Reading the fine print, logos and all…', 'Sizing it up…'],
  enhance: [
    'Rolling out the seamless backdrop…',
    'Adjusting the studio lights…',
    'Making it look expensive…',
    'Booking the (virtual) photographer…',
  ],
  suggest: ['Moodboarding scenes…', 'Scouting locations…', 'Auditioning props…'],
  place: ['Dressing the set…', 'Styling the scene…', 'Rolling cameras…'],
}
export const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]

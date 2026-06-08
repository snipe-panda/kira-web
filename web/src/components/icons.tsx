// Small inline SVG icons — crisp at any size, inherit currentColor.
type P = { className?: string }

export const Bolt = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="currentColor" />
  </svg>
)

export const Check = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <path d="m5 12 5 5L20 7" stroke="currentColor" strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const Spark = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <path d="M12 3v18M3 12h18M6 6l12 12M18 6 6 18" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

export const Upload = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <path d="M12 16V4m0 0L7 9m5-5 5 5M5 20h14" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const Diamond = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M12 2 22 12 12 22 2 12 12 2Z" />
  </svg>
)

export const STAGES = ['Upload', 'Identify', 'Enhance', 'Place'] as const
export type Stage = (typeof STAGES)[number]

type Props = { current: number } // 0-based index

export default function Stepper({ current }: Props) {
  const pct = ((current + 1) / STAGES.length) * 100

  return (
    <nav aria-label="Progress">
      {/* Mobile (<sm): compact — never overflows */}
      <div className="sm:hidden">
        <div className="flex items-baseline justify-between">
          <span className="eyebrow">
            Step {current + 1} / {STAGES.length}
          </span>
          <span className="font-display text-sm font-semibold text-ink">
            {STAGES[current]}
          </span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-amber transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* sm+ : full labelled stepper */}
      <ol className="hidden items-center gap-2 sm:flex">
        {STAGES.map((label, i) => {
          const state = i === current ? 'active' : i < current ? 'done' : 'todo'
          return (
            <li key={label} className="flex flex-1 items-center gap-2 last:flex-none">
              <span className="flex items-center gap-2 whitespace-nowrap">
                <span
                  aria-current={state === 'active' ? 'step' : undefined}
                  className={[
                    'grid h-7 w-7 place-items-center rounded-full font-mono text-[0.8rem] font-bold',
                    state === 'active'
                      ? 'bg-amber text-bg'
                      : state === 'done'
                        ? 'border border-amber text-amber'
                        : 'border border-line text-muted',
                  ].join(' ')}
                >
                  {i + 1}
                </span>
                <span
                  className={[
                    'text-sm',
                    state === 'active'
                      ? 'font-semibold text-ink'
                      : 'text-muted',
                  ].join(' ')}
                >
                  {label}
                </span>
              </span>
              {i < STAGES.length - 1 && (
                <span className="h-px flex-1 bg-line" aria-hidden="true" />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

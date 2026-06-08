import { useCallback, useEffect, useRef, useState } from 'react'
import { place, placements as fetchPlacements } from '../lib/api'
import { useKira } from '../store'
import type { Placement, StyleRegister } from '../lib/types'
import { Button, downloadB64, ErrorBanner, Spinner, StageHeader, Tag, SPIN, pick } from '../components/ui'

const REGISTERS: StyleRegister[] = ['Understated', 'Modern', 'Luxe']

export default function PlaceStage() {
  const k = useKira()
  const [loadingSuggest, setLoadingSuggest] = useState(false)
  const [loadingPlace, setLoadingPlace] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [suggestMsg, setSuggestMsg] = useState(() => pick(SPIN.suggest))
  const [placeMsg, setPlaceMsg] = useState(() => pick(SPIN.place))
  const ran = useRef(false)

  const getSuggestions = useCallback(
    async (register: StyleRegister) => {
      if (!k.productContext) return
      setSuggestMsg(pick(SPIN.suggest))
      setLoadingSuggest(true)
      setErr(null)
      try {
        const res = await fetchPlacements(k.productContext, register)
        k.setPlacements(res.placements ?? [])
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Could not get suggestions')
      } finally {
        setLoadingSuggest(false)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [k.productContext],
  )

  useEffect(() => {
    if (ran.current) return
    ran.current = true
    if (!k.placements) void getSuggestions(k.styleRegister)
  }, [k.placements, k.styleRegister, getSuggestions])

  const changeRegister = (r: StyleRegister) => {
    if (r === k.styleRegister) return
    k.setStyleRegister(r)
    k.setPlacements(null)
    k.setSelectedPlacement(null)
    k.setPlacementResult(null)
    void getSuggestions(r)
  }

  const generate = useCallback(
    async (idx: number, p: Placement) => {
      if (!k.file || !k.productContext) return
      k.setSelectedPlacement(idx)
      k.setPlacementResult(null)
      setPlaceMsg(pick(SPIN.place))
      setLoadingPlace(true)
      setErr(null)
      try {
        const res = await place(k.file, p.scene_prompt, k.productContext)
        k.setPlacementResult(res)
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Generation failed')
      } finally {
        setLoadingPlace(false)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [k.file, k.productContext],
  )

  const stem = (k.file?.name ?? 'image').replace(/\.[^.]+$/, '')
  const chosen = k.selectedPlacement != null ? k.placements?.[k.selectedPlacement] : null

  return (
    <section className="flex flex-col gap-6">
      <StageHeader step="Step 4 · Placement" title="Pick a lifestyle scene" />

      {/* Style register selector */}
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted">Styling — how restrained or premium every scene looks:</p>
        <div
          role="group"
          aria-label="Style register"
          className="inline-flex w-full max-w-sm rounded-full border border-line bg-surface p-1"
        >
          {REGISTERS.map((r) => (
            <button
              key={r}
              onClick={() => changeRegister(r)}
              aria-pressed={r === k.styleRegister}
              className={[
                'min-h-10 flex-1 rounded-full text-sm font-semibold transition-colors',
                r === k.styleRegister ? 'bg-amber text-bg' : 'text-muted hover:text-ink',
              ].join(' ')}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {err && <ErrorBanner message={err} />}
      {loadingSuggest && <Spinner label={suggestMsg} />}

      {!loadingSuggest && k.placements && k.placements.length > 0 && (
        <>
          <p className="text-sm text-muted">
            10 <b className="text-ink">{k.styleRegister}</b> scenes tailored to your product. Pick one to render.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {k.placements.map((p, i) => (
              <article key={i} className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display font-bold">{p.label}</h3>
                  {p.placement_type && <Tag>{p.placement_type.replace(/_/g, ' ')}</Tag>}
                </div>
                <p className="text-sm text-muted">{p.description}</p>
                {p.mood_keywords?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {p.mood_keywords.map((m) => (
                      <Tag key={m}>{m}</Tag>
                    ))}
                  </div>
                )}
                {p.color_palette?.length > 0 && (
                  <div className="flex gap-1.5" aria-hidden="true">
                    {p.color_palette.map((c, ci) => (
                      <span
                        key={ci}
                        className="h-4 w-4 rounded border border-white/10"
                        style={{ background: c }}
                        title={c}
                      />
                    ))}
                  </div>
                )}
                <details className="text-sm text-muted">
                  <summary className="cursor-pointer select-none">Why it works / scene prompt</summary>
                  {p.why_it_works && <p className="mt-2 italic">{p.why_it_works}</p>}
                  {p.scene_prompt && <p className="mt-2 text-xs text-muted/80">{p.scene_prompt}</p>}
                </details>
                <Button variant="primary" onClick={() => void generate(i, p)} disabled={loadingPlace}>
                  Generate
                </Button>
              </article>
            ))}
          </div>
        </>
      )}

      {/* Generation result */}
      {chosen && (
        <div className="flex flex-col gap-4 border-t border-line pt-6">
          <h3 className="font-display text-xl font-bold">Generating: {chosen.label}</h3>
          {loadingPlace && <Spinner label={placeMsg} />}
          {!loadingPlace && k.placementResult && (
            <>
              <p className="eyebrow">Lifestyle render · 1024×1024</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {k.placementResult.images.map((b64, i) => (
                  <figure key={i} className="flex flex-col gap-2">
                    <img
                      src={`data:image/png;base64,${b64}`}
                      alt={`${chosen.label} render`}
                      className="w-full rounded-xl border border-line"
                    />
                    <Button
                      onClick={() => downloadB64(b64, `${stem}_${chosen.label.replace(/\s+/g, '_').toLowerCase()}.png`)}
                    >
                      ↓ Download
                    </Button>
                  </figure>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Nav */}
      <div className="flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:justify-between">
        <Button onClick={() => k.goto('enhance')}>← Back to enhance</Button>
        <Button onClick={() => { k.setPlacements(null); k.setSelectedPlacement(null); k.setPlacementResult(null); void getSuggestions(k.styleRegister) }}>
          ↻ New suggestions
        </Button>
      </div>
    </section>
  )
}

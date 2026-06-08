import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { enhance } from '../lib/api'
import { useKira } from '../store'
import { Button, downloadB64, ErrorBanner, Note, Spinner, StageHeader, SPIN, pick } from '../components/ui'

export default function EnhanceStage() {
  const k = useKira()
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [spinMsg, setSpinMsg] = useState(() => pick(SPIN.enhance))
  const [draft, setDraft] = useState(k.adjustment)
  const ran = useRef(false)
  const beforeUrl = useMemo(() => (k.file ? URL.createObjectURL(k.file) : null), [k.file])

  const run = useCallback(
    async (adjustment: string) => {
      if (!k.file || !k.productContext) return
      setSpinMsg(pick(SPIN.enhance))
      setLoading(true)
      setErr(null)
      try {
        const res = await enhance(k.file, k.productContext, adjustment)
        k.setEnhanceResult(res)
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Enhancement failed')
      } finally {
        setLoading(false)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [k.file, k.productContext],
  )

  useEffect(() => {
    if (ran.current) return
    ran.current = true
    if (!k.enhanceResult) void run(k.adjustment)
  }, [k.enhanceResult, k.adjustment, run])

  const after = k.enhanceResult?.images?.[0]
  const stem = (k.file?.name ?? 'image').replace(/\.[^.]+$/, '')

  return (
    <section className="flex flex-col gap-6">
      <StageHeader step="Step 3 · Enhance" title="Studio enhancement" />

      {loading && <Spinner label={spinMsg} />}
      {err && (
        <div className="flex flex-col gap-3">
          <ErrorBanner message={err} />
          <div className="flex gap-3">
            <Button onClick={() => k.goto('identify')}>← Back</Button>
            <Button variant="primary" onClick={() => void run(k.adjustment)}>↻ Retry</Button>
          </div>
        </div>
      )}

      {!loading && !err && after && (
        <>
          <p className="eyebrow">Studio render · 1024×1024</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <figure className="flex flex-col gap-2">
              <figcaption className="eyebrow">Before</figcaption>
              {beforeUrl && (
                <img src={beforeUrl} alt="Original" className="w-full rounded-xl border border-line" />
              )}
            </figure>
            <figure className="flex flex-col gap-2">
              <figcaption className="eyebrow">After</figcaption>
              <img
                src={`data:image/png;base64,${after}`}
                alt="Studio-enhanced product"
                className="w-full rounded-xl border border-line"
              />
              <Button onClick={() => downloadB64(after, `studio_${stem}.png`)}>↓ Download</Button>
            </figure>
          </div>

          {/* Refine */}
          <div className="flex flex-col gap-3 border-t border-line pt-6">
            <p className="eyebrow">Refine</p>
            <h3 className="font-display text-xl font-bold">Adjust the result</h3>
            <p className="text-sm text-muted">
              Type a small change and re-run. Confirmed details stay intact — only the tweak is layered on.
            </p>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder='e.g. "soft warm grey background", "slight three-quarter angle", "soften the shadow"'
              className="min-h-20 w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-ink placeholder:text-muted focus:border-amber focus:outline-none"
            />
            {k.adjustment && <Note>Last refinement: <b className="text-ink">{k.adjustment}</b></Note>}
          </div>

          {/* Nav */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button onClick={() => k.goto('identify')}>← Back</Button>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={() => void run(k.adjustment)}>↻ Re-run</Button>
              <Button
                variant="primary"
                onClick={() => {
                  k.setAdjustment(draft.trim())
                  void run(draft.trim())
                }}
              >
                Apply &amp; re-run
              </Button>
            </div>
          </div>

          <div className="border-t border-line pt-6">
            <Button
              className="w-full sm:w-auto"
              onClick={() => {
                k.setPlacements(null)
                k.setSelectedPlacement(null)
                k.setPlacementResult(null)
                k.goto('place')
              }}
            >
              Browse lifestyle scenes →
            </Button>
          </div>
        </>
      )}
    </section>
  )
}

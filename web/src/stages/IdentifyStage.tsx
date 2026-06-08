import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { recognize } from '../lib/api'
import { useKira } from '../store'
import { Button, ErrorBanner, Spinner, StageHeader, SPIN, pick } from '../components/ui'

export default function IdentifyStage() {
  const k = useKira()
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [spinMsg] = useState(() => pick(SPIN.identify))
  const ran = useRef(false)
  const previewUrl = useMemo(() => (k.file ? URL.createObjectURL(k.file) : null), [k.file])

  // editable fields
  const [productType, setProductType] = useState('')
  const [material, setMaterial] = useState('')
  const [color, setColor] = useState('')
  const [dims, setDims] = useState('')
  const [features, setFeatures] = useState('')
  const [warnings, setWarnings] = useState('')

  const run = useCallback(async () => {
    if (!k.file) return
    setLoading(true)
    setErr(null)
    try {
      const rec = await recognize(k.file)
      if ('error' in rec) throw new Error(String(rec.error))
      k.setRecognition(rec)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Recognition failed')
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [k.file])

  // auto-run once on entry (StrictMode-safe via ref guard)
  useEffect(() => {
    if (ran.current) return
    ran.current = true
    if (!k.recognition) void run()
  }, [k.recognition, run])

  // populate the form when recognition arrives
  useEffect(() => {
    const r = k.recognition
    if (!r) return
    setProductType(r.identity?.product_type ?? '')
    setMaterial(r.surface?.material_likely ?? '')
    setColor(r.surface?.primary_color ?? '')
    setDims(r.form?.approximate_dimensions ?? '')
    setFeatures((r.detail?.distinguishing_features ?? []).join('\n'))
    setWarnings((r.meta?.warnings_for_enhancement ?? []).join('\n'))
  }, [k.recognition])

  const confidence = k.recognition?.meta?.confidence_score ?? null

  const goEnhance = () => {
    const toLines = (s: string) =>
      s.split('\n').map((x) => x.trim()).filter(Boolean)
    k.setProductContext({
      product_type: productType,
      material,
      primary_color: color,
      approximate_dimensions: dims,
      distinguishing_features: toLines(features),
      warnings_for_enhancement: toLines(warnings),
    })
    k.setEnhanceResult(null)
    k.goto('enhance')
  }

  const field =
    'w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-ink placeholder:text-muted focus:border-amber focus:outline-none'
  const label = 'mb-1.5 block text-sm text-muted'

  return (
    <section className="flex flex-col gap-6">
      <StageHeader step="Step 2 · Identify" title="Review the product details" />

      {loading && <Spinner label={spinMsg} />}
      {err && (
        <div className="flex flex-col gap-3">
          <ErrorBanner message={err} />
          <div className="flex gap-3">
            <Button onClick={() => k.goto('upload')}>← Back</Button>
            <Button variant="primary" onClick={() => void run()}>
              ↻ Retry
            </Button>
          </div>
        </div>
      )}

      {!loading && !err && k.recognition && (
        <>
          <div className="grid gap-6 md:grid-cols-[260px_1fr]">
            <div className="flex flex-col gap-3">
              <div className="overflow-hidden rounded-2xl border border-line bg-surface">
                {previewUrl && <img src={previewUrl} alt="Your product" className="w-full" />}
              </div>
              {confidence != null && (
                <div>
                  <p className="eyebrow">AI confidence</p>
                  <p className="font-display text-3xl font-bold text-ambersoft">
                    {Math.round(confidence * 100)}%
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted">
                Correct anything the AI got wrong — these details guide the enhancement.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={label}>Product type</label>
                  <input className={field} value={productType} onChange={(e) => setProductType(e.target.value)} />
                </div>
                <div>
                  <label className={label}>Material</label>
                  <input className={field} value={material} onChange={(e) => setMaterial(e.target.value)} />
                </div>
                <div>
                  <label className={label}>Primary colour</label>
                  <input className={field} value={color} onChange={(e) => setColor(e.target.value)} />
                </div>
                <div>
                  <label className={label}>Approximate size</label>
                  <input className={field} value={dims} onChange={(e) => setDims(e.target.value)} />
                </div>
              </div>
              <div>
                <label className={label}>Key features (one per line)</label>
                <textarea className={`${field} min-h-24`} value={features} onChange={(e) => setFeatures(e.target.value)} />
              </div>
              <div>
                <label className={label}>Do-not-alter list (one per line)</label>
                <textarea className={`${field} min-h-20`} value={warnings} onChange={(e) => setWarnings(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button onClick={() => k.goto('upload')}>← Back</Button>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={() => void run()}>↻ Redo AI</Button>
              <Button variant="primary" onClick={goEnhance}>
                Continue to Enhance →
              </Button>
            </div>
          </div>
        </>
      )}
    </section>
  )
}

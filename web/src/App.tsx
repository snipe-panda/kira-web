import { useState } from 'react'
import BrandHeader from './components/BrandHeader'
import Stepper from './components/Stepper'
import Dropzone from './components/Dropzone'
import { Bolt, Check, Spark } from './components/icons'

function Chip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-ink">
      <span className="text-amber [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      {children}
    </span>
  )
}

export default function App() {
  const [file, setFile] = useState<File | null>(null)
  const previewUrl = file ? URL.createObjectURL(file) : null

  return (
    <div className="mx-auto flex min-h-screen max-w-[1100px] flex-col gap-8 px-5 py-7 sm:px-8 sm:py-10">
      <BrandHeader showReset={!!file} onReset={() => setFile(null)} />
      <Stepper current={0} />

      {!file ? (
        // ── Hero / upload ────────────────────────────────────────────────
        // Mobile: headline → dropzone (CTA high) → subcopy/chips.
        // Desktop: text in the left column, dropzone in the right.
        <section className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:gap-x-12 lg:gap-y-6">
          <div className="lg:col-start-1 lg:row-start-1">
            <p className="eyebrow mb-3">AI Product Photography · Under 60 Seconds</p>
            <h1 className="font-display text-[clamp(2.3rem,7vw,3.6rem)] font-bold leading-[1.03]">
              One phone photo in.{' '}
              <span className="italic font-semibold text-ambersoft">Studio listing</span>{' '}
              out.
            </h1>
          </div>

          <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
            <Dropzone onFile={setFile} />
            <p className="mt-3 text-sm text-muted">
              No photo handy? Drop any image to see the pipeline run.
            </p>
          </div>

          <div className="flex flex-col gap-5 lg:col-start-1 lg:row-start-2">
            <p className="max-w-[42ch] text-[1.05rem] leading-relaxed text-ink/85">
              Drop a crooked, badly-lit shot from your phone. Kira straightens it,
              cuts the background, adds studio lighting, then suggests lifestyle
              scenes — listing-ready in seconds.
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-2.5">
              <Chip icon={<Bolt />}>No studio booking</Chip>
              <Chip icon={<Check />}>Amazon-compliant white BG</Chip>
              <Chip icon={<Spark />}>Ready in seconds</Chip>
            </div>
          </div>
        </section>
      ) : (
        // ── Preview (Phase 2: client-side only; wiring lands in Phase 3) ──
        <section className="flex flex-col gap-6 sm:grid sm:grid-cols-2 sm:items-center sm:gap-10">
          <div className="overflow-hidden rounded-[--radius-card] border border-line bg-surface">
            {previewUrl && (
              <img src={previewUrl} alt="Your uploaded product" className="w-full" />
            )}
          </div>
          <div className="flex flex-col gap-4">
            <p className="eyebrow">Ready</p>
            <p className="font-display text-2xl font-bold">{file.name}</p>
            <p className="text-sm text-muted">
              {(file.size / 1024).toFixed(0)} KB
            </p>
            <button
              className="min-h-12 rounded-full bg-amber px-6 font-semibold text-bg transition-colors hover:bg-ambersoft"
              onClick={() => alert('Flow wiring lands in Phase 3')}
            >
              Continue to Identify →
            </button>
            <button
              className="min-h-11 rounded-full border border-line px-6 text-sm font-semibold transition-colors hover:border-amber"
              onClick={() => setFile(null)}
            >
              Choose a different photo
            </button>
          </div>
        </section>
      )}
    </div>
  )
}

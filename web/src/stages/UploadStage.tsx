import Dropzone from '../components/Dropzone'
import { Bolt, Check, Spark } from '../components/icons'
import { Button } from '../components/ui'
import { useKira } from '../store'
import { useMemo, type ReactNode } from 'react'

function Chip({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-ink">
      <span className="text-amber [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      {children}
    </span>
  )
}

export default function UploadStage() {
  const k = useKira()
  const previewUrl = useMemo(() => (k.file ? URL.createObjectURL(k.file) : null), [k.file])

  if (k.file && previewUrl) {
    return (
      <section className="flex flex-col gap-6 sm:grid sm:grid-cols-2 sm:items-center sm:gap-10">
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <img src={previewUrl} alt="Your uploaded product" className="w-full" />
        </div>
        <div className="flex flex-col items-start gap-4">
          <p className="eyebrow">Ready</p>
          <p className="font-display text-2xl font-bold break-all">{k.file.name}</p>
          <p className="text-sm text-muted">{(k.file.size / 1024).toFixed(0)} KB</p>
          <Button
            variant="primary"
            className="w-full sm:w-auto"
            onClick={() => {
              k.setRecognition(null)
              k.goto('identify')
            }}
          >
            Continue to Identify →
          </Button>
          <Button variant="ghost" className="w-full sm:w-auto" onClick={() => k.setFile(null)}>
            Choose a different photo
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:gap-x-12 lg:gap-y-6">
      <div className="lg:col-start-1 lg:row-start-1">
        <p className="eyebrow mb-3">AI Product Photography · Under 60 Seconds</p>
        <h1 className="font-display text-[clamp(2.3rem,7vw,3.6rem)] font-bold leading-[1.03]">
          One phone photo in.{' '}
          <span className="italic font-semibold text-ambersoft">Studio listing</span> out.
        </h1>
      </div>

      <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
        <Dropzone onFile={k.setFile} />
        <p className="mt-3 text-sm text-muted">
          No photo handy? Drop any image to see the pipeline run.
        </p>
      </div>

      <div className="flex flex-col gap-5 lg:col-start-1 lg:row-start-2">
        <p className="max-w-[42ch] text-[1.05rem] leading-relaxed text-ink/85">
          Drop a crooked, badly-lit shot from your phone. Kira straightens it, cuts the
          background, adds studio lighting, then suggests lifestyle scenes — listing-ready in
          seconds.
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-2.5">
          <Chip icon={<Bolt />}>No studio booking</Chip>
          <Chip icon={<Check />}>Amazon-compliant white BG</Chip>
          <Chip icon={<Spark />}>Ready in seconds</Chip>
        </div>
      </div>
    </section>
  )
}

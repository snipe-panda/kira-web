import { useRef, useState } from 'react'
import { Upload } from './icons'

type Props = { onFile: (file: File) => void }

export default function Dropzone({ onFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)

  const pick = (files?: FileList | null) => {
    const f = files?.[0]
    if (f) onFile(f)
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDrag(true)
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDrag(false)
        pick(e.dataTransfer.files)
      }}
    >
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={[
          'flex w-full flex-col items-center gap-3 rounded-[18px] border border-dashed px-6 py-10 text-center transition-colors',
          'min-h-[200px] justify-center',
          drag ? 'border-amber bg-surface2' : 'border-line bg-surface hover:border-amber',
        ].join(' ')}
      >
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-surface2 text-amber">
          <Upload className="h-5 w-5" />
        </span>
        <span className="text-base font-semibold text-ink">
          Drop a product photo
          <span className="hidden text-muted sm:inline"> or click to browse</span>
        </span>
        <span className="text-sm text-muted">
          JPG or PNG · shot on any phone, however crooked
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="sr-only"
        onChange={(e) => pick(e.target.files)}
      />
    </div>
  )
}

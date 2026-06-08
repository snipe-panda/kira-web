import type {
  ImagesResult,
  Placement,
  ProductContext,
  Recognition,
  StyleRegister,
} from './types'

async function handle<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = (data as { error?: string }).error ?? `Request failed (${res.status})`
    throw new Error(msg)
  }
  return data as T
}

export async function recognize(file: File): Promise<Recognition> {
  const fd = new FormData()
  fd.append('file', file)
  return handle<Recognition>(await fetch('/api/recognize', { method: 'POST', body: fd }))
}

export async function enhance(
  file: File,
  productContext: ProductContext,
  adjustment: string,
): Promise<ImagesResult> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('product_context', JSON.stringify(productContext))
  fd.append('adjustment', adjustment)
  return handle<ImagesResult>(await fetch('/api/enhance', { method: 'POST', body: fd }))
}

export async function placements(
  productContext: ProductContext,
  styleRegister: StyleRegister,
): Promise<{ placements: Placement[] }> {
  const res = await fetch('/api/placements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product_context: productContext, style_register: styleRegister }),
  })
  return handle<{ placements: Placement[] }>(res)
}

export async function place(
  file: File,
  scenePrompt: string,
  productContext: ProductContext,
): Promise<ImagesResult> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('scene_prompt', scenePrompt)
  fd.append('product_context', JSON.stringify(productContext))
  return handle<ImagesResult>(await fetch('/api/place', { method: 'POST', body: fd }))
}

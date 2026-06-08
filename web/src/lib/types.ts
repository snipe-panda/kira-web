export type Stage = 'upload' | 'identify' | 'enhance' | 'place'

export type StyleRegister = 'Understated' | 'Modern' | 'Luxe'

export interface ProductContext {
  product_type: string
  material: string
  primary_color: string
  approximate_dimensions: string
  distinguishing_features: string[]
  warnings_for_enhancement: string[]
}

// Recognition JSON is deep + partly optional; we read a few known paths.
export interface Recognition {
  identity?: { product_type?: string }
  form?: { approximate_dimensions?: string }
  surface?: { primary_color?: string; material_likely?: string }
  detail?: { distinguishing_features?: string[] }
  meta?: { confidence_score?: number; warnings_for_enhancement?: string[] }
  [k: string]: unknown
}

export interface Placement {
  label: string
  placement_type: string
  description: string
  mood_keywords: string[]
  scene_prompt: string
  color_palette: string[]
  why_it_works: string
}

export interface ImagesResult {
  images: string[] // base64 (no data: prefix)
}

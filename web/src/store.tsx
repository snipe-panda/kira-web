import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type {
  ImagesResult,
  Placement,
  ProductContext,
  Recognition,
  Stage,
  StyleRegister,
} from './lib/types'

interface KiraState {
  stage: Stage
  goto: (s: Stage) => void

  file: File | null
  setFile: (f: File | null) => void

  recognition: Recognition | null
  setRecognition: (r: Recognition | null) => void

  productContext: ProductContext | null
  setProductContext: (c: ProductContext | null) => void

  enhanceResult: ImagesResult | null
  setEnhanceResult: (r: ImagesResult | null) => void
  adjustment: string
  setAdjustment: (a: string) => void

  styleRegister: StyleRegister
  setStyleRegister: (s: StyleRegister) => void
  placements: Placement[] | null
  setPlacements: (p: Placement[] | null) => void
  selectedPlacement: number | null
  setSelectedPlacement: (i: number | null) => void
  placementResult: ImagesResult | null
  setPlacementResult: (r: ImagesResult | null) => void

  reset: () => void
}

const Ctx = createContext<KiraState | null>(null)

export function KiraProvider({ children }: { children: ReactNode }) {
  const [stage, setStage] = useState<Stage>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [recognition, setRecognition] = useState<Recognition | null>(null)
  const [productContext, setProductContext] = useState<ProductContext | null>(null)
  const [enhanceResult, setEnhanceResult] = useState<ImagesResult | null>(null)
  const [adjustment, setAdjustment] = useState('')
  const [styleRegister, setStyleRegister] = useState<StyleRegister>('Modern')
  const [placements, setPlacements] = useState<Placement[] | null>(null)
  const [selectedPlacement, setSelectedPlacement] = useState<number | null>(null)
  const [placementResult, setPlacementResult] = useState<ImagesResult | null>(null)

  const value = useMemo<KiraState>(() => {
    const reset = () => {
      setStage('upload')
      setFile(null)
      setRecognition(null)
      setProductContext(null)
      setEnhanceResult(null)
      setAdjustment('')
      setStyleRegister('Modern')
      setPlacements(null)
      setSelectedPlacement(null)
      setPlacementResult(null)
    }
    return {
      stage,
      goto: setStage,
      file,
      setFile,
      recognition,
      setRecognition,
      productContext,
      setProductContext,
      enhanceResult,
      setEnhanceResult,
      adjustment,
      setAdjustment,
      styleRegister,
      setStyleRegister,
      placements,
      setPlacements,
      selectedPlacement,
      setSelectedPlacement,
      placementResult,
      setPlacementResult,
      reset,
    }
  }, [
    stage,
    file,
    recognition,
    productContext,
    enhanceResult,
    adjustment,
    styleRegister,
    placements,
    selectedPlacement,
    placementResult,
  ])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useKira(): KiraState {
  const v = useContext(Ctx)
  if (!v) throw new Error('useKira must be used within KiraProvider')
  return v
}

export const STAGE_INDEX: Record<Stage, number> = {
  upload: 0,
  identify: 1,
  enhance: 2,
  place: 3,
}

import BrandHeader from './components/BrandHeader'
import Stepper from './components/Stepper'
import UploadStage from './stages/UploadStage'
import IdentifyStage from './stages/IdentifyStage'
import EnhanceStage from './stages/EnhanceStage'
import PlaceStage from './stages/PlaceStage'
import { KiraProvider, STAGE_INDEX, useKira } from './store'

function Shell() {
  const k = useKira()
  return (
    <div className="mx-auto flex min-h-screen max-w-[1100px] flex-col gap-8 px-5 py-7 sm:px-8 sm:py-10">
      <BrandHeader showReset={k.stage !== 'upload' || !!k.file} onReset={k.reset} />
      <Stepper current={STAGE_INDEX[k.stage]} />
      {k.stage === 'upload' && <UploadStage />}
      {k.stage === 'identify' && <IdentifyStage />}
      {k.stage === 'enhance' && <EnhanceStage />}
      {k.stage === 'place' && <PlaceStage />}
    </div>
  )
}

export default function App() {
  return (
    <KiraProvider>
      <Shell />
    </KiraProvider>
  )
}

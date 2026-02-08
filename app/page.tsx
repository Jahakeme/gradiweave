import { GradientCanvas } from '@/components/GradientCanvas';
import { GradientTypeSelect } from '@/components/Controls/GradientTypeSelect';
import { WarpShapeSelect } from '@/components/Controls/WarpShapeSelect';
import { ParameterSliders } from '@/components/Controls/ParameterSliders';
import { DimensionInputs } from '@/components/Controls/DimensionInputs';
import { ColourPalette } from '@/components/Controls/ColourPalette';
import { ExportButton } from '@/components/ExportButton';
import { ImageUploader } from '@/components/ImageUploader';

export default function Home() {
  return (
    <main className="flex flex-col md:flex-row h-dvh bg-neutral-950">
      <div className="flex flex-1 items-center justify-center p-4 overflow-hidden min-h-0">
        <GradientCanvas />
      </div>
      <aside className="controls-scroll w-full md:w-80 shrink-0 border-t md:border-t-0 md:border-l border-neutral-800 bg-neutral-900 overflow-y-auto p-4 space-y-6 max-h-[45dvh] md:max-h-none">
        <h1 className="text-sm font-semibold text-neutral-100 tracking-wide">GradiWeave</h1>
        <GradientTypeSelect />
        <WarpShapeSelect />
        <ParameterSliders />
        <DimensionInputs />
        <ColourPalette />
        <ImageUploader />
        <ExportButton />
      </aside>
    </main>
  );
}

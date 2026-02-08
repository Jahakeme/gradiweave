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
    <main className="flex h-screen bg-neutral-950">
      <div className="flex flex-1 items-center justify-center p-4 overflow-hidden">
        <GradientCanvas />
      </div>
      <aside className="w-80 shrink-0 border-l border-neutral-800 bg-neutral-900 overflow-y-auto p-4 space-y-6">
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

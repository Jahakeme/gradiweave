'use client';

import * as Slider from '@radix-ui/react-slider';
import { useGradientStore } from '@/store/gradient-store';

function SliderRow({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-400">{label}</span>
        <span className="text-xs tabular-nums text-neutral-500">{value.toFixed(2)}</span>
      </div>
      <Slider.Root
        className="relative flex h-5 w-full touch-none items-center select-none"
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
      >
        <Slider.Track className="relative h-1 grow rounded-full bg-neutral-700">
          <Slider.Range className="absolute h-full rounded-full bg-blue-500" />
        </Slider.Track>
        <Slider.Thumb className="block h-4 w-4 rounded-full border border-neutral-600 bg-neutral-200 shadow outline-none hover:bg-white focus:ring-2 focus:ring-blue-500" />
      </Slider.Root>
    </div>
  );
}

export function ParameterSliders() {
  const warp = useGradientStore((s) => s.warp);
  const setWarp = useGradientStore((s) => s.setWarp);
  const warpSize = useGradientStore((s) => s.warpSize);
  const setWarpSize = useGradientStore((s) => s.setWarpSize);
  const noise = useGradientStore((s) => s.noise);
  const setNoise = useGradientStore((s) => s.setNoise);
  const warpShape = useGradientStore((s) => s.warpShape);

  const isFlat = warpShape === 'flat';

  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400">
        Parameters
      </label>
      <div className={isFlat ? 'opacity-40 pointer-events-none' : ''}>
        <SliderRow label="Warp" value={warp} onChange={setWarp} />
      </div>
      <div className={isFlat ? 'opacity-40 pointer-events-none' : ''}>
        <SliderRow label="Warp Size" value={warpSize} onChange={setWarpSize} />
      </div>
      <SliderRow label="Noise" value={noise} onChange={setNoise} />
    </div>
  );
}

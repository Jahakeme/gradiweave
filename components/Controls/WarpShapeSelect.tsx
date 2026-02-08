'use client';

import * as Select from '@radix-ui/react-select';
import { useGradientStore } from '@/store/gradient-store';
import {
  NOISE_WARP_SHAPES,
  GEOMETRIC_WARP_SHAPES,
  WARP_SHAPE_LABELS,
  type WarpShape,
} from '@/types/gradient';

export function WarpShapeSelect() {
  const warpShape = useGradientStore((s) => s.warpShape);
  const setWarpShape = useGradientStore((s) => s.setWarpShape);

  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400">
        Warp Shape
      </label>
      <Select.Root value={warpShape} onValueChange={(v) => setWarpShape(v as WarpShape)}>
        <Select.Trigger className="flex w-full items-center justify-between rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 outline-none hover:border-neutral-600 focus:border-blue-500">
          <Select.Value />
          <Select.Icon className="text-neutral-400">&#9662;</Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="z-50 max-h-72 overflow-y-auto rounded-md border border-neutral-700 bg-neutral-800 shadow-xl">
            <Select.Viewport className="p-1">
              <Select.Group>
                <Select.Label className="px-3 py-1 text-xs font-medium text-neutral-500">
                  Noise
                </Select.Label>
                {NOISE_WARP_SHAPES.map((s) => (
                  <Select.Item
                    key={s}
                    value={s}
                    className="cursor-pointer rounded px-3 py-1.5 text-sm text-neutral-100 outline-none data-[highlighted]:bg-neutral-700"
                  >
                    <Select.ItemText>{WARP_SHAPE_LABELS[s]}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Group>
              <Select.Separator className="my-1 h-px bg-neutral-700" />
              <Select.Group>
                <Select.Label className="px-3 py-1 text-xs font-medium text-neutral-500">
                  Geometric
                </Select.Label>
                {GEOMETRIC_WARP_SHAPES.map((s) => (
                  <Select.Item
                    key={s}
                    value={s}
                    className="cursor-pointer rounded px-3 py-1.5 text-sm text-neutral-100 outline-none data-[highlighted]:bg-neutral-700"
                  >
                    <Select.ItemText>{WARP_SHAPE_LABELS[s]}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Group>
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}

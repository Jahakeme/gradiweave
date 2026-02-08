'use client';

import * as Select from '@radix-ui/react-select';
import { useGradientStore } from '@/store/gradient-store';
import { useExport } from '@/hooks/useExport';
import type { PixelDensity } from '@/types/gradient';

const DENSITIES: PixelDensity[] = [1, 2, 3, 4];

export function ExportButton() {
  const pixelDensity = useGradientStore((s) => s.pixelDensity);
  const setPixelDensity = useGradientStore((s) => s.setPixelDensity);
  const width = useGradientStore((s) => s.width);
  const height = useGradientStore((s) => s.height);
  const { exportGradient, exporting } = useExport();

  const exportW = width * pixelDensity;
  const exportH = height * pixelDensity;

  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400">
        Export
      </label>
      <div className="flex items-center gap-2">
        <Select.Root
          value={String(pixelDensity)}
          onValueChange={(v) => setPixelDensity(Number(v) as PixelDensity)}
        >
          <Select.Trigger className="flex items-center gap-1 rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-sm text-neutral-100 outline-none hover:border-neutral-600">
            <Select.Value />
            <Select.Icon className="text-neutral-400">&#9662;</Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className="z-50 rounded-md border border-neutral-700 bg-neutral-800 shadow-xl">
              <Select.Viewport className="p-1">
                {DENSITIES.map((d) => (
                  <Select.Item
                    key={d}
                    value={String(d)}
                    className="cursor-pointer rounded px-3 py-1.5 text-sm text-neutral-100 outline-none data-[highlighted]:bg-neutral-700"
                  >
                    <Select.ItemText>{d}x</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>

        <button
          onClick={exportGradient}
          disabled={exporting}
          className="flex-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting ? 'Exporting...' : 'Download PNG'}
        </button>
      </div>
      <p className="text-xs text-neutral-500">
        {exportW} &times; {exportH} px
      </p>
    </div>
  );
}

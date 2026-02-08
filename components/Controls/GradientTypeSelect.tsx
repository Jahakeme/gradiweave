'use client';

import * as Select from '@radix-ui/react-select';
import { useGradientStore } from '@/store/gradient-store';
import {
  GRADIENT_TYPES,
  GRADIENT_TYPE_LABELS,
  SIMPLE_SUBTYPES,
  type GradientType,
  type SimpleGradientSubtype,
} from '@/types/gradient';

export function GradientTypeSelect() {
  const type = useGradientStore((s) => s.type);
  const setType = useGradientStore((s) => s.setType);
  const simpleSubtype = useGradientStore((s) => s.simpleSubtype);
  const setSimpleSubtype = useGradientStore((s) => s.setSimpleSubtype);
  const angle = useGradientStore((s) => s.angle);
  const setAngle = useGradientStore((s) => s.setAngle);

  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400">
        Gradient Type
      </label>
      <Select.Root value={type} onValueChange={(v) => setType(v as GradientType)}>
        <Select.Trigger className="flex w-full items-center justify-between rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 outline-none hover:border-neutral-600 focus:border-blue-500">
          <Select.Value />
          <Select.Icon className="text-neutral-400">&#9662;</Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="z-50 rounded-md border border-neutral-700 bg-neutral-800 shadow-xl">
            <Select.Viewport className="p-1">
              {GRADIENT_TYPES.map((t) => (
                <Select.Item
                  key={t}
                  value={t}
                  className="cursor-pointer rounded px-3 py-1.5 text-sm text-neutral-100 outline-none data-[highlighted]:bg-neutral-700"
                >
                  <Select.ItemText>{GRADIENT_TYPE_LABELS[t]}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>

      {type === 'simple' && (
        <div className="space-y-3 pl-2 border-l-2 border-neutral-700">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Subtype</label>
            <Select.Root
              value={simpleSubtype}
              onValueChange={(v) => setSimpleSubtype(v as SimpleGradientSubtype)}
            >
              <Select.Trigger className="flex w-full items-center justify-between rounded-md border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-neutral-100 outline-none hover:border-neutral-600">
                <Select.Value />
                <Select.Icon className="text-neutral-400">&#9662;</Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content className="z-50 rounded-md border border-neutral-700 bg-neutral-800 shadow-xl">
                  <Select.Viewport className="p-1">
                    {SIMPLE_SUBTYPES.map((st) => (
                      <Select.Item
                        key={st}
                        value={st}
                        className="cursor-pointer rounded px-3 py-1.5 text-sm text-neutral-100 outline-none capitalize data-[highlighted]:bg-neutral-700"
                      >
                        <Select.ItemText>{st}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </div>

          <div>
            <label className="block text-xs text-neutral-500 mb-1">
              Angle: {Math.round(angle)}°
            </label>
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
        </div>
      )}

      {(type === 'sharp-bezier' || type === 'soft-bezier') && (
        <div className="pl-2 border-l-2 border-neutral-700">
          <label className="block text-xs text-neutral-500 mb-1">
            Angle: {Math.round(angle)}°
          </label>
          <input
            type="range"
            min={0}
            max={360}
            step={1}
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
      )}
    </div>
  );
}

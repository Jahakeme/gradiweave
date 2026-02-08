'use client';

import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import * as Slider from '@radix-ui/react-slider';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { useGradientStore } from '@/store/gradient-store';
import { isInGamut, oklchToCssString, hexToOklch } from '@/lib/colours/conversion';
import type { ColourStop, OklchColour } from '@/types/gradient';

function OklchSlider({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between">
        <span className="text-xs text-neutral-400">{label}</span>
        <span className="text-xs tabular-nums text-neutral-500">
          {max > 1 ? Math.round(value) : value.toFixed(3)}
        </span>
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
        <Slider.Thumb className="block h-3.5 w-3.5 rounded-full border border-neutral-600 bg-neutral-200 shadow outline-none hover:bg-white focus:ring-2 focus:ring-blue-500" />
      </Slider.Root>
    </div>
  );
}

export function ColourPicker({
  colour,
  canRemove,
  onRemove,
}: {
  colour: ColourStop;
  canRemove: boolean;
  onRemove: () => void;
}) {
  const updateColour = useGradientStore((s) => s.updateColour);
  const setColourFormat = useGradientStore((s) => s.setColourFormat);
  const toggleColourLock = useGradientStore((s) => s.toggleColourLock);
  const [hexInput, setHexInput] = useState(colour.hex);

  const format = colour.displayFormat;
  const inGamut = isInGamut(colour.oklch);
  const cssColour = inGamut
    ? oklchToCssString(colour.oklch)
    : colour.hex;

  const handleOklchChange = (field: keyof OklchColour, value: number) => {
    const newOklch = { ...colour.oklch, [field]: value };
    updateColour(colour.id, newOklch);
  };

  const handleHexChange = (hex: string) => {
    setHexInput(hex);
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
      updateColour(colour.id, hexToOklch(hex));
    }
  };

  const handleFormatChange = (value: string) => {
    if (value === 'oklch' || value === 'hex') {
      setColourFormat(colour.id, value);
      if (value === 'hex') setHexInput(colour.hex);
    }
  };

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          className={`h-9 w-9 rounded-md shadow-sm transition-transform hover:scale-110 focus:ring-2 focus:ring-blue-500 outline-none ${
            colour.locked
              ? 'ring-2 ring-amber-400 border border-amber-500'
              : 'border border-neutral-600'
          }`}
          style={{ backgroundColor: cssColour }}
          title={colour.locked ? `${colour.hex} (locked)` : colour.hex}
        />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="z-50 w-64 rounded-lg border border-neutral-700 bg-neutral-850 bg-neutral-900 p-3 shadow-xl"
          sideOffset={8}
          align="start"
        >
          <div className="space-y-3">
            {/* Format toggle */}
            <ToggleGroup.Root
              type="single"
              value={format}
              onValueChange={handleFormatChange}
              className="flex rounded-md border border-neutral-700 overflow-hidden"
            >
              <ToggleGroup.Item
                value="oklch"
                className="flex-1 py-1 text-xs text-center text-neutral-400 data-[state=on]:bg-neutral-700 data-[state=on]:text-neutral-100"
              >
                OKLCH
              </ToggleGroup.Item>
              <ToggleGroup.Item
                value="hex"
                className="flex-1 py-1 text-xs text-center text-neutral-400 data-[state=on]:bg-neutral-700 data-[state=on]:text-neutral-100"
              >
                HEX
              </ToggleGroup.Item>
            </ToggleGroup.Root>

            {format === 'oklch' ? (
              <div className="space-y-2">
                <OklchSlider
                  label="Lightness"
                  value={colour.oklch.l}
                  onChange={(v) => handleOklchChange('l', v)}
                  min={0}
                  max={1}
                  step={0.005}
                />
                <OklchSlider
                  label="Chroma"
                  value={colour.oklch.c}
                  onChange={(v) => handleOklchChange('c', v)}
                  min={0}
                  max={0.4}
                  step={0.001}
                />
                <OklchSlider
                  label="Hue"
                  value={colour.oklch.h}
                  onChange={(v) => handleOklchChange('h', v)}
                  min={0}
                  max={360}
                  step={1}
                />
              </div>
            ) : (
              <input
                type="text"
                value={hexInput}
                onChange={(e) => handleHexChange(e.target.value)}
                spellCheck={false}
                className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1.5 font-mono text-sm text-neutral-100 outline-none focus:border-blue-500"
              />
            )}

            {/* Preview swatch */}
            <div
              className="h-8 w-full rounded-md border border-neutral-700"
              style={{ backgroundColor: cssColour }}
            />

            {/* Gamut warning */}
            {!inGamut && (
              <p className="text-xs text-amber-400">
                Outside sRGB gamut — will be clamped on export
              </p>
            )}

            {/* Lock toggle */}
            <button
              onClick={() => toggleColourLock(colour.id)}
              className={`w-full rounded-md py-1 text-xs transition-colors ${
                colour.locked
                  ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20'
                  : 'text-neutral-400 hover:bg-neutral-800'
              }`}
            >
              {colour.locked ? 'Locked — survives randomise' : 'Lock colour'}
            </button>

            {/* Remove button */}
            {canRemove && (
              <button
                onClick={onRemove}
                className="w-full rounded-md py-1 text-xs text-red-400 hover:bg-red-400/10 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
          <Popover.Arrow className="fill-neutral-700" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

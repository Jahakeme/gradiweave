'use client';

import { useGradientStore } from '@/store/gradient-store';
import { ColourPicker } from '@/components/ColourPicker';
import { randomOklch } from '@/lib/colours/random';

export function ColourPalette() {
  const colours = useGradientStore((s) => s.colours);
  const addColour = useGradientStore((s) => s.addColour);
  const removeColour = useGradientStore((s) => s.removeColour);
  const randomiseColours = useGradientStore((s) => s.randomiseColours);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium uppercase tracking-wider text-neutral-400">
          Colours ({colours.length}/12)
        </label>
        <button
          onClick={randomiseColours}
          className="rounded px-2 py-0.5 text-xs bg-neutral-800 text-neutral-400 hover:bg-neutral-700 transition-colors"
        >
          Randomise
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {colours.map((colour) => (
          <ColourPicker
            key={colour.id}
            colour={colour}
            canRemove={colours.length > 2}
            onRemove={() => removeColour(colour.id)}
          />
        ))}

        {colours.length < 12 && (
          <button
            onClick={() => addColour(randomOklch())}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-dashed border-neutral-600 text-neutral-500 hover:border-neutral-400 hover:text-neutral-300 transition-colors"
            title="Add colour"
          >
            +
          </button>
        )}
      </div>
    </div>
  );
}

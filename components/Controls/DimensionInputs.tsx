'use client';

import { useState, useEffect } from 'react';
import { useGradientStore } from '@/store/gradient-store';

const PRESETS = [
  { label: '642 x 642', w: 642, h: 642 },
  { label: '1920 x 1080', w: 1920, h: 1080 },
  { label: '1080 x 1080', w: 1080, h: 1080 },
  { label: '1080 x 1920', w: 1080, h: 1920 },
] as const;

function clampDim(v: number) {
  return Math.max(100, Math.min(4096, Math.round(v)));
}

function DimInput({
  value,
  onCommit,
}: {
  value: number;
  onCommit: (v: number) => void;
}) {
  const [local, setLocal] = useState(String(value));

  // Sync from store when value changes externally (e.g. preset click)
  useEffect(() => {
    setLocal(String(value));
  }, [value]);

  const commit = () => {
    const num = parseInt(local, 10);
    if (!isNaN(num)) {
      const clamped = clampDim(num);
      onCommit(clamped);
      setLocal(String(clamped));
    } else {
      setLocal(String(value));
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit();
      }}
      className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-sm text-neutral-100 outline-none focus:border-blue-500"
    />
  );
}

export function DimensionInputs() {
  const width = useGradientStore((s) => s.width);
  const height = useGradientStore((s) => s.height);
  const setDimensions = useGradientStore((s) => s.setDimensions);

  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400">
        Dimensions
      </label>
      <div className="flex items-center gap-2">
        <DimInput value={width} onCommit={(w) => setDimensions(w, height)} />
        <span className="text-neutral-500 text-sm shrink-0">&times;</span>
        <DimInput value={height} onCommit={(h) => setDimensions(width, h)} />
      </div>
      <div className="flex flex-wrap gap-1">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => setDimensions(p.w, p.h)}
            className={`rounded px-2 py-0.5 text-xs transition-colors ${
              width === p.w && height === p.h
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

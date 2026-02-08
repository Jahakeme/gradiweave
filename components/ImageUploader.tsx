'use client';

import { useState, useRef, useCallback, type DragEvent } from 'react';
import { useGradientStore } from '@/store/gradient-store';
import type { OklchColour, ColourStop } from '@/types/gradient';

interface ExtractedColour {
  hex: string;
  oklch: OklchColour;
}

export function ImageUploader() {
  const setColours = useGradientStore((s) => s.setColours);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const extractColours = useCallback(
    async (file: File) => {
      setLoading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append('image', file);

        const res = await fetch('/api/extract-colours', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Extraction failed');
        }

        const { colours } = (await res.json()) as { colours: ExtractedColour[] };

        const stops: ColourStop[] = colours.map((c) => ({
          id: crypto.randomUUID(),
          oklch: c.oklch,
          hex: c.hex,
          displayFormat: 'oklch' as const,
          locked: false,
        }));

        if (stops.length > 0) {
          setColours(stops);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Extraction failed');
      } finally {
        setLoading(false);
      }
    },
    [setColours],
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      extractColours(file);
    },
    [extractColours],
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400">
        Extract from Image
      </label>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer items-center justify-center rounded-md border-2 border-dashed px-3 py-4 text-center text-xs transition-colors ${
          dragOver
            ? 'border-blue-500 bg-blue-500/10 text-blue-400'
            : 'border-neutral-700 text-neutral-500 hover:border-neutral-500 hover:text-neutral-400'
        }`}
      >
        {loading ? (
          <span>Extracting colours...</span>
        ) : (
          <span>Drop image or click to browse</span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

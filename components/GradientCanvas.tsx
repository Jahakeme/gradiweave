'use client';

import { useRef, useState, useEffect } from 'react';
import { useGradientStore } from '@/store/gradient-store';
import { useGradientRenderer } from '@/hooks/useGradientRenderer';

export function GradientCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const width = useGradientStore((s) => s.width);
  const height = useGradientStore((s) => s.height);
  const [webglError, setWebglError] = useState<string | null>(null);
  const [contextLost, setContextLost] = useState(false);

  useGradientRenderer(canvasRef, setWebglError);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const onRestored = () => {
      setContextLost(false);
    };

    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);
    return () => {
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
    };
  }, []);

  if (webglError) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-neutral-400 text-sm p-8 text-center">
        <p className="font-medium text-neutral-200">WebGL2 Unavailable</p>
        <p>{webglError}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
      />
      {contextLost && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-950/80 text-neutral-300 text-sm">
          WebGL context lost — waiting for restoration...
        </div>
      )}
    </div>
  );
}

'use client';

import { useRef } from 'react';
import { useGradientStore } from '@/store/gradient-store';
import { useGradientRenderer } from '@/hooks/useGradientRenderer';

export function GradientCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const width = useGradientStore((s) => s.width);
  const height = useGradientStore((s) => s.height);
  useGradientRenderer(canvasRef);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
    />
  );
}

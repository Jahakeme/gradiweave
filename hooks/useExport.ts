'use client';

import { useState, useCallback } from 'react';
import { useGradientStore } from '@/store/gradient-store';
import { getRenderToBlob } from '@/hooks/useGradientRenderer';
import { triggerDownload } from '@/lib/export';

export function useExport() {
  const [exporting, setExporting] = useState(false);

  const exportGradient = useCallback(async () => {
    const renderToBlob = getRenderToBlob();
    if (!renderToBlob) return;

    const { width, height, pixelDensity } = useGradientStore.getState();

    setExporting(true);
    try {
      const blob = await renderToBlob(pixelDensity);
      const filename = `gradiweave-${width}x${height}@${pixelDensity}x.png`;
      triggerDownload(blob, filename);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  }, []);

  return { exportGradient, exporting };
}

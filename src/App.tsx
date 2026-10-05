/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Dropzone } from './components/Dropzone';
import { Controls } from './components/Controls';
import { Preview } from './components/Preview';
import { ImageSettings, ImageStats } from './types';
import { useDebounce } from './hooks/useDebounce';
import { Image as ImageIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { removeBackground } from '@imgly/background-removal';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [originalStats, setOriginalStats] = useState<ImageStats | null>(null);

  const [settings, setSettings] = useState<ImageSettings>({
    width: 0,
    height: 0,
    scale: 100,
    keepAspectRatio: true,
    format: 'image/jpeg',
    quality: 80,
    removeBackground: false,
  });

  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedStats, setProcessedStats] = useState<ImageStats | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bgRemovedImage, setBgRemovedImage] = useState<HTMLImageElement | null>(null);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const bgRemovalModelPromise = useRef<Promise<Blob> | null>(null);

  const debouncedSettings = useDebounce(settings, 150);

  // Load original image when file changes
  useEffect(() => {
    if (!file) return;

    setBgRemovedImage(null);
    setIsRemovingBg(false);
    bgRemovalModelPromise.current = null;

    const url = URL.createObjectURL(file);
    const img = new Image();
    
    img.onload = () => {
      setOriginalImage(img);
      setOriginalStats({
        width: img.width,
        height: img.height,
        size: file.size,
        format: file.type,
      });
      
      // Default settings based on original
      setSettings(s => ({
        ...s,
        width: img.width,
        height: img.height,
        scale: 100,
        format: (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp') 
          ? file.type as any 
          : 'image/jpeg',
        removeBackground: false
      }));
    };
    
    img.src = url;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  // Process image when debounced settings or original image change
  useEffect(() => {
    if (!originalImage || !originalStats) return;

    // Handle background removal caching
    if (debouncedSettings.removeBackground && !bgRemovedImage && !isRemovingBg && file) {
      setIsRemovingBg(true);
      setIsProcessing(true);
      
      const runBgRemoval = async () => {
        try {
          if (!bgRemovalModelPromise.current) {
            bgRemovalModelPromise.current = removeBackground(file);
          }
          const blob = await bgRemovalModelPromise.current;
          const url = URL.createObjectURL(blob);
          const img = new Image();
          img.onload = () => {
            setBgRemovedImage(img);
            setIsRemovingBg(false);
          };
          img.src = url;
        } catch (err) {
          console.error("Background removal failed:", err);
          setIsRemovingBg(false);
          setSettings(s => ({ ...s, removeBackground: false }));
        }
      };
      
      runBgRemoval();
      return; // Wait for it to finish before drawing
    }

    if (debouncedSettings.removeBackground && isRemovingBg) {
      setIsProcessing(true);
      return; // Still removing background, don't process yet
    }

    setIsProcessing(true);

    const processImage = async () => {
      try {
        const sourceImage = (debouncedSettings.removeBackground && bgRemovedImage) ? bgRemovedImage : originalImage;

        const canvas = document.createElement('canvas');
        canvas.width = debouncedSettings.width;
        canvas.height = debouncedSettings.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('No 2d context');

        // Fill background with white for JPEG if original had transparency (and we aren't saving as PNG/WebP with transparency)
        if (debouncedSettings.format === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Draw image resized
        ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);

        // Convert to Blob
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((b) => {
            if (b) resolve(b);
            else reject(new Error('Canvas to Blob failed'));
          }, debouncedSettings.format, debouncedSettings.format !== 'image/png' ? debouncedSettings.quality / 100 : undefined);
        });

        const newUrl = URL.createObjectURL(blob);
        
        setProcessedUrl(prev => {
          if (prev) URL.revokeObjectURL(prev);
          return newUrl;
        });

        setProcessedStats({
          width: canvas.width,
          height: canvas.height,
          size: blob.size,
          format: debouncedSettings.format,
        });
      } catch (err) {
        console.error("Error processing image:", err);
      } finally {
        setIsProcessing(false);
      }
    };

    processImage();

  }, [originalImage, originalStats, debouncedSettings, bgRemovedImage, isRemovingBg, file]);

  const handleDownload = useCallback(() => {
    if (!processedUrl || !file) return;

    const ext = settings.format.split('/')[1] === 'jpeg' ? 'jpg' : settings.format.split('/')[1];
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'image';
    const filename = `${baseName}-resized.${ext}`;

    const a = document.createElement('a');
    a.href = processedUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [processedUrl, file, settings.format]);

  const resetAll = () => {
    setFile(null);
    setOriginalImage(null);
    setOriginalStats(null);
    if (processedUrl) URL.revokeObjectURL(processedUrl);
    setProcessedUrl(null);
    setProcessedStats(null);
    setBgRemovedImage(null);
    setIsRemovingBg(false);
    bgRemovalModelPromise.current = null;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 p-2 rounded-xl border border-blue-500/20">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <h1 className="font-bold text-lg tracking-tight">PixelForge</h1>
          </div>
          {file && (
            <button 
              onClick={resetAll}
              className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              Start Over
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div 
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-2xl mx-auto mt-12 md:mt-24 text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-zinc-100">
                Resize and compress images <br className="hidden sm:block" />
                <span className="text-blue-400">securely in your browser.</span>
              </h2>
              <p className="text-zinc-400 mb-10 text-lg max-w-xl mx-auto">
                No uploads, no servers, full privacy. Instantly resize, adjust quality, and convert formats with a live preview.
              </p>
              <Dropzone onFile={setFile} />
            </motion.div>
          ) : (
            <motion.div 
              key="workspace"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col lg:flex-row gap-6 lg:gap-8 lg:h-[calc(100vh-8rem)]"
            >
              <div className="w-full lg:w-[380px] shrink-0 overflow-y-auto pr-2 custom-scrollbar">
                {originalStats && (
                  <Controls 
                    settings={settings} 
                    onChange={setSettings} 
                    originalStats={originalStats}
                  />
                )}
              </div>
              <div className="flex-1 min-h-[400px]">
                {originalStats && (
                  <Preview 
                    processedUrl={processedUrl}
                    originalStats={originalStats}
                    processedStats={processedStats}
                    isProcessing={isProcessing}
                    onDownload={handleDownload}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

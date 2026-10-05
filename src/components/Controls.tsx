import React from 'react';
import { ImageSettings, ImageStats } from '../types';
import { Lock, Unlock } from 'lucide-react';

interface ControlsProps {
  settings: ImageSettings;
  onChange: (s: ImageSettings) => void;
  originalStats: ImageStats;
}

export function Controls({ settings, onChange, originalStats }: ControlsProps) {
  const ratio = originalStats.width / originalStats.height;

  const handleWidthChange = (w: number) => {
    let h = settings.height;
    if (settings.keepAspectRatio) {
      h = Math.round(w / ratio);
    }
    onChange({ ...settings, width: w, height: h, scale: Math.round((w / originalStats.width) * 100) });
  };

  const handleHeightChange = (h: number) => {
    let w = settings.width;
    if (settings.keepAspectRatio) {
      w = Math.round(h * ratio);
    }
    onChange({ ...settings, width: w, height: h, scale: Math.round((h / originalStats.height) * 100) });
  };

  const handleScaleChange = (s: number) => {
    const w = Math.round(originalStats.width * (s / 100));
    const h = Math.round(originalStats.height * (s / 100));
    onChange({ ...settings, scale: s, width: w, height: h });
  };

  const applyPreset = (w: number) => {
    handleWidthChange(w);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6">
      <div>
        <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider mb-4">Dimensions</h3>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <label className="text-xs text-zinc-400 mb-2 block font-medium">Width (px)</label>
            <input type="number" value={settings.width} onChange={(e) => handleWidthChange(Number(e.target.value))} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors" />
          </div>
          <button
            onClick={() => onChange({ ...settings, keepAspectRatio: !settings.keepAspectRatio })}
            className={`mt-6 p-2 rounded-lg border ${settings.keepAspectRatio ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-zinc-950 border-zinc-800 text-zinc-500'} transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
            title="Lock Aspect Ratio"
          >
            {settings.keepAspectRatio ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>
          <div className="flex-1">
            <label className="text-xs text-zinc-400 mb-2 block font-medium">Height (px)</label>
            <input type="number" value={settings.height} onChange={(e) => handleHeightChange(Number(e.target.value))} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors" />
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-xs text-zinc-400 mb-2 font-medium">
            <span>Scale</span>
            <span className="text-blue-400 font-semibold">{settings.scale}%</span>
          </div>
          <input type="range" min="5" max="200" value={settings.scale} onChange={(e) => handleScaleChange(Number(e.target.value))} className="w-full accent-blue-500" />
        </div>

        <div>
          <label className="text-xs text-zinc-400 mb-3 block font-medium">Quick Presets (Width)</label>
          <div className="flex flex-wrap gap-2">
            {[640, 1080, 1920, 3840].map(p => (
              <button key={p} onClick={() => applyPreset(p)} className="px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded-full text-zinc-300 hover:border-zinc-600 hover:text-zinc-100 transition-colors focus:outline-none focus:border-blue-500 font-medium">
                {p}px {p === 1920 ? '(HD)' : p === 3840 ? '(4K)' : ''}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-px bg-zinc-800 w-full" />

      <div>
        <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider mb-4">Export Settings</h3>
        <div className="mb-6">
          <label className="text-xs text-zinc-400 mb-2 block font-medium">Format</label>
          <select value={settings.format} onChange={(e) => onChange({ ...settings, format: e.target.value as any })} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 appearance-none transition-colors">
            <option value="image/jpeg">JPEG</option>
            <option value="image/png">PNG</option>
            <option value="image/webp">WebP</option>
          </select>
        </div>

        {settings.format !== 'image/png' && (
          <div className="mb-6">
            <div className="flex justify-between text-xs text-zinc-400 mb-2 font-medium">
              <span>Quality</span>
              <span className="text-blue-400 font-semibold">{settings.quality}%</span>
            </div>
            <input type="range" min="1" max="100" value={settings.quality} onChange={(e) => onChange({ ...settings, quality: Number(e.target.value) })} className="w-full accent-blue-500" />
          </div>
        )}

        <div>
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={settings.removeBackground} onChange={(e) => onChange({ ...settings, removeBackground: e.target.checked })} />
              <div className={`block w-10 h-6 rounded-full transition-colors ${settings.removeBackground ? 'bg-blue-600' : 'bg-zinc-800 border border-zinc-700'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.removeBackground ? 'translate-x-4' : 'translate-x-0'}`}></div>
            </div>
            <div>
              <span className="text-sm text-zinc-200 font-medium group-hover:text-white transition-colors">Remove Background</span>
              <p className="text-xs text-zinc-500 mt-0.5">Uses local AI to separate subject</p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}

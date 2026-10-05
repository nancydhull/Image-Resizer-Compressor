import React from 'react';
import { ImageStats } from '../types';
import { formatBytes } from '../lib/utils';
import { Download, ArrowRight, Activity, Image as ImageIcon } from 'lucide-react';

interface PreviewProps {
  processedUrl: string | null;
  originalStats: ImageStats;
  processedStats: ImageStats | null;
  isProcessing: boolean;
  onDownload: () => void;
}

export function Preview({ processedUrl, originalStats, processedStats, isProcessing, onDownload }: PreviewProps) {
  let savings = 0;
  if (processedStats) {
    savings = ((originalStats.size - processedStats.size) / originalStats.size) * 100;
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col overflow-hidden h-full">
      {/* Stats Bar */}
      <div className="bg-zinc-950/80 border-b border-zinc-800 p-4 flex items-center justify-between gap-4 overflow-x-auto text-sm shrink-0">
        <div className="flex items-center gap-4 sm:gap-8 whitespace-nowrap">
           <div className="flex flex-col gap-1">
             <span className="text-zinc-500 text-[10px] sm:text-xs uppercase font-bold tracking-wider">Original</span>
             <span className="text-zinc-200 font-medium">{originalStats.width} × {originalStats.height}</span>
             <span className="text-zinc-400 text-xs">{formatBytes(originalStats.size)}</span>
           </div>
           
           <ArrowRight className="text-zinc-700 w-5 h-5 shrink-0" />
           
           <div className="flex flex-col gap-1">
             <span className="text-zinc-500 text-[10px] sm:text-xs uppercase font-bold tracking-wider">Processed</span>
             {processedStats ? (
               <>
                 <span className="text-zinc-200 font-medium">{processedStats.width} × {processedStats.height}</span>
                 <span className="text-zinc-400 text-xs">{formatBytes(processedStats.size)}</span>
               </>
             ) : (
                <span className="text-zinc-500 py-1">Processing...</span>
             )}
           </div>

           {processedStats && savings !== 0 && (
             <div className={`ml-2 sm:ml-4 px-2 py-1 rounded-md text-xs font-semibold ${savings > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
               {savings > 0 ? '-' : '+'}{Math.abs(savings).toFixed(1)}%
             </div>
           )}
        </div>
        
        <button
          onClick={onDownload}
          disabled={!processedUrl || isProcessing}
          className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-zinc-900 shadow-lg shadow-blue-500/20"
        >
          <Download className="w-4 h-4" /> 
          <span className="hidden sm:inline">Download</span>
        </button>
      </div>

      {/* Image Canvas Container */}
      <div className="flex-1 p-4 sm:p-8 flex items-center justify-center bg-zinc-950/40 relative overflow-hidden min-h-[300px]">
         {isProcessing && (
           <div className="absolute inset-0 z-10 bg-zinc-950/40 backdrop-blur-[2px] flex items-center justify-center">
             <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-2xl flex flex-col items-center gap-3">
               <Activity className="w-6 h-6 text-blue-500 animate-pulse" />
               <span className="text-zinc-300 text-sm font-medium">Processing Image...</span>
             </div>
           </div>
         )}
         {processedUrl ? (
           <div className="relative max-w-full max-h-full flex items-center justify-center rounded-lg shadow-2xl ring-1 ring-zinc-800"
                style={{ 
                  backgroundImage: 'conic-gradient(#27272a 25%, #18181b 25%, #18181b 50%, #27272a 50%, #27272a 75%, #18181b 75%, #18181b 100%)', 
                  backgroundSize: '24px 24px',
                  backgroundPosition: '0 0, 12px 12px'
                }}>
             <img src={processedUrl} alt="Processed preview" className="max-w-full max-h-[60vh] object-contain rounded-lg" />
           </div>
         ) : (
            <div className="flex flex-col items-center gap-4 text-zinc-600">
              <ImageIcon className="w-12 h-12 opacity-50" />
              <span>No preview available</span>
            </div>
         )}
      </div>
    </div>
  );
}

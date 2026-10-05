import React, { useCallback, useState } from 'react';
import { UploadCloud } from 'lucide-react';

export function Dropzone({ onFile }: { onFile: (file: File) => void }) {
  const [isDragging, setIsDragging] = useState(false);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) onFile(file);
    }
  }, [onFile]);

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
       onFile(e.target.files[0]);
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center w-full max-w-2xl mx-auto h-72 border-2 border-dashed rounded-2xl transition-colors cursor-pointer ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-500 hover:bg-zinc-800'}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <input id="file-upload" type="file" className="hidden" accept="image/jpeg, image/png, image/webp" onChange={onFileInput} />
      <UploadCloud className="w-12 h-12 text-zinc-400 mb-4" />
      <p className="text-zinc-200 font-medium mb-1 text-lg">Click or drag image to upload</p>
      <p className="text-zinc-500 text-sm">Supports JPG, PNG, WebP</p>
    </div>
  );
}

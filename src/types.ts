export type ImageFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export interface ImageStats {
  width: number;
  height: number;
  size: number;
  format: string;
}

export interface ImageSettings {
  width: number;
  height: number;
  scale: number;
  keepAspectRatio: boolean;
  format: ImageFormat;
  quality: number;
  removeBackground: boolean;
}

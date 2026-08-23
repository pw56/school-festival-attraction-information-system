// 描画・検証処理を行う内部関数
function drawVideoToCanvas(video: HTMLVideoElement): HTMLCanvasElement | null {
  let width = 0;
  let height = 0;

  if (video instanceof HTMLVideoElement) {
    // ビデオ要素の場合の処理
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      return null;
    }
    width = video.videoWidth;
    height = video.videoHeight;
  } else {
    // 想定外の型が渡された場合のセーフティ
    return null;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  // キャンバスに描画
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  return canvas;
}

export function videoToImageAsync(
  video: HTMLVideoElement,
  mime: 'image/png' | 'image/jpeg' | 'image/webp' = 'image/png',
  quality?: number // qualityは 0.0 から 1.0 の間で指定（例: 0.8）
): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const canvas = drawVideoToCanvas(video);
    if (!canvas) {
      return resolve(null);
    }
    
    canvas.toBlob((blob) => {
      if (!blob) {
        return resolve(null);
      }

      const url = URL.createObjectURL(blob);
      const img = new Image();
      
      // 画像の読み込みが完了したらresolveする
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      // 読み込みエラー時のハンドリング
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      
      img.src = url;
    }, mime, quality);
  });
}

/**
 * 画像の中央を正方形にクロップし、最大750x750pxでWebP形式（品質50%）に変換します。
 */
export async function processThumbnailImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const origWidth = img.naturalWidth;
      const origHeight = img.naturalHeight;

      // 短辺に合わせて正方形クロップのサイズを決定
      const minDimension = Math.min(origWidth, origHeight);
      const cropX = (origWidth - minDimension) / 2;
      const cropY = (origHeight - minDimension) / 2;

      // 最大750x750、それ以下の場合は元の正方形サイズを設定
      const targetSize = Math.min(minDimension, 750);

      const canvas = document.createElement('canvas');
      canvas.width = targetSize;
      canvas.height = targetSize;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context could not be created.'));
        return;
      }

      // 中央クロップしてリサイズ描画
      ctx.drawImage(
        img,
        cropX,
        cropY,
        minDimension,
        minDimension,
        0,
        0,
        targetSize,
        targetSize
      );

      // WebP変換 (品質50%)
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Image conversion to WebP failed.'));
          }
        },
        'image/webp',
        0.5
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image file.'));
    };

    img.src = url;
  });
}

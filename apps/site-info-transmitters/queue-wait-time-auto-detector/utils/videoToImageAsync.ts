// 長時間稼働時のOOM対策でキャンバス使い回し
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

function drawVideoToCanvas(video: HTMLVideoElement): void {
  // videoWidth / videoHeight が 0 の場合は描画しない
  const width = video.videoWidth || 0;
  const height = video.videoHeight || 0;

  /* 
  毎回サイズ変更が走るとブラウザ側で内部メモリの再確保が起きるため、
  サイズが変わったときだけ変更するようにするとさらに効率的
  */
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;

  if (width > 0 && height > 0) {
    ctx!.drawImage(video, 0, 0, width, height);
  }
}

export function videoToImageAsync(
  video: HTMLVideoElement,
  mime: 'image/png' | 'image/jpeg' | 'image/webp' = 'image/png',
  quality?: number // qualityは 0.0 から 1.0 の間で指定（例: 0.8）
): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    drawVideoToCanvas(video);
    
    // 0のときは処理を中断
    if (canvas.width === 0 || canvas.height === 0) {
      return resolve(null);
    }

    // メモリリーク（BlobURLの解放漏れ）を防ぐため、toBlob ではなく toDataURL を使用
    const dataUrl = canvas.toDataURL(mime, quality);
    const img = new Image();
    
    // 【重要】srcを代入する「前」にイベントリスナーを登録する
    img.onload = () => {
      resolve(img);
    };
    
    img.onerror = () => {
      resolve(null);
    };
    
    img.src = dataUrl;
  });
}

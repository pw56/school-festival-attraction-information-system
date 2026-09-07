// 長時間稼働時のOOM対策でキャンバス使い回し
const canvas = new OffscreenCanvas(0, 0);
const ctx = canvas.getContext('2d');

function drawVideoToCanvas(video: HTMLVideoElement): void {
  // videoWidth / videoHeight が 0 の場合は描画しない
  const width = video.videoWidth || 0;
  const height = video.videoHeight || 0;

  /*
  毎回サイズ変更が走るとブラウザ側で内部メモリの再確保が起きるため、
  サイズが変わったときだけ変更するようにする
  */
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;

  if (width > 0 && height > 0) {
    ctx!.drawImage(video, 0, 0, width, height);
  }
}

export function videoToImageAsync(
  video: HTMLVideoElement,
  mime: 'image/png' | 'image/jpeg' | 'image/webp' = 'image/jpeg',
  quality: number = 0.5 // qualityは 0.0 から 1.0 の間で指定
): Promise<HTMLImageElement | null> { // 画像の読み込みが完了してから返すため、非同期は必要
  return new Promise((resolve) => {
    drawVideoToCanvas(video);
    
    // 0のときは処理を中断
    if (canvas.width === 0 || canvas.height === 0) {
      return resolve(null);
    }

    canvas.convertToBlob({ type: mime, quality }).then((blob) => {
      if (!blob) {
        return resolve(null);
      }

      const objectUrl = URL.createObjectURL(blob);
      const img = new Image();
      
      // srcを代入する「前」にイベントリスナーを登録する
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        // Canvasの描画バッファをクリアしてグラフィックメモリを解放
        ctx!.clearRect(0, 0, canvas.width, canvas.height);
        resolve(img);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        ctx!.clearRect(0, 0, canvas.width, canvas.height);
        resolve(null);
      };
      
      img.src = objectUrl;
    }).catch(() => {
      resolve(null);
    });
  });
}

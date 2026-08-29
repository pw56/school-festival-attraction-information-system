import { ImageLayout, CropResult, CroppedBoundingBox } from './types';

// 長時間稼働時のOOM対策でキャンバス使い回し
const canvas = new OffscreenCanvas(0, 0);
const ctx = canvas.getContext('2d');

const trimmedCanvas = new OffscreenCanvas(0, 0);
const trimmedCtx = trimmedCanvas.getContext('2d');

/**
 * 手書きパスに基づいて画像を切り抜くユーティリティ関数
 */
export const cropImage = (
  imageElement: HTMLImageElement,
  points: number[],
  imageLayout: ImageLayout
): Promise<CropResult> => {
  return new Promise((resolve, reject) => {
    if (points.length < 6) {
      reject(new Error('有効な切り取り輪郭が描画されていません。'));
      return;
    }

    const origWidth = imageElement.naturalWidth;
    const origHeight = imageElement.naturalHeight;

    /* 
    毎回サイズ変更が走るとブラウザ側で内部メモリの再確保が起きるため、
    サイズが変わったときだけ変更するようにする
    */
    if (canvas.width !== origWidth) canvas.width = origWidth;
    if (canvas.height !== origHeight) canvas.height = origHeight;

    if (!ctx) {
      reject(new Error('Canvasコンテキストの取得に失敗しました。'));
      return;
    }

    // 以前の描画内容およびクリッピング状態をクリア
    ctx.save();
    ctx.clearRect(0, 0, origWidth, origHeight);

    // 画面表示サイズから元画像の解像度へのスケール比率 (アスペクト比を維持した画像サイズを基準に計算)
    const scaleX = origWidth / imageLayout.width;
    const scaleY = origHeight / imageLayout.height;

    // 座標を高解像度スケールに逆算 (画像のオフセット座標 x, y を差し引いて計算)
    const scaledPoints = points.map((val, index) =>
      index % 2 === 0
        ? (val - imageLayout.x) * scaleX
        : (val - imageLayout.y) * scaleY
    );

    // 1. 手書きパスでクリッピング領域（マスク）を作成
    ctx.beginPath();
    ctx.moveTo(scaledPoints[0], scaledPoints[1]);
    for (let i = 2; i < scaledPoints.length; i += 2) {
      ctx.lineTo(scaledPoints[i], scaledPoints[i + 1]);
    }
    ctx.closePath();
    ctx.clip();

    // 2. マスク内に等倍解像度で画像を描画
    ctx.drawImage(imageElement, 0, 0, origWidth, origHeight);

    // 描画状態（クリッピングパス等）を元に戻す
    ctx.restore();

    // 透明でないピクセル（アルファ値 > 0）のバウンディングボックスを計算
    const imageData = ctx.getImageData(0, 0, origWidth, origHeight);
    const data = imageData.data;

    let minX = origWidth;
    let minY = origHeight;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < origHeight; y++) {
      for (let x = 0; x < origWidth; x++) {
        const alpha = data[(y * origWidth + x) * 4 + 3];
        if (alpha > 0) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // 透明以外のピクセルが見つからなかった場合
    if (maxX < minX || maxY < minY) {
      reject(new Error('切り取り範囲内に有効な画像データが存在しません。'));
      return;
    }

    const cropX = minX;
    const cropY = minY;
    const cropWidth = maxX - minX + 1;
    const cropHeight = maxY - minY + 1;

    // バウンディングボックス領域のみを切り出す別Canvasを作成
    if (trimmedCanvas.width !== cropWidth) trimmedCanvas.width = cropWidth;
    if (trimmedCanvas.height !== cropHeight) trimmedCanvas.height = cropHeight;

    if (!trimmedCtx) {
      reject(new Error('トリミング用Canvasコンテキストの取得に失敗しました。'));
      return;
    }

    trimmedCtx.clearRect(0, 0, cropWidth, cropHeight);

    trimmedCtx.drawImage(
      canvas,
      cropX, cropY, cropWidth, cropHeight,
      0, 0, cropWidth, cropHeight
    );

    const boundingBox: CroppedBoundingBox = {
      x: cropX,
      y: cropY,
      width: cropWidth,
      height: cropHeight,
    };

    // 3. 高解像度の HTMLImageElement を生成して返却
    trimmedCanvas.convertToBlob({ type: 'image/png' }).then((blob) => {
      if (!blob) {
        reject(new Error('Blobの生成に失敗しました。'));
        return;
      }
      const objectUrl = URL.createObjectURL(blob);
      const clippedImage = new Image();

      // srcを代入する「前」にイベントリスナーを登録する
      clippedImage.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({ croppedImage: clippedImage, boundingBox }); // CropResult オブジェクトを返却
      };

      clippedImage.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('HTMLImageElementの生成に失敗しました。'));
      };

      clippedImage.src = objectUrl;
    }).catch((err) => {
      reject(err);
    });
  });
};

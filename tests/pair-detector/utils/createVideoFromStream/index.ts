/**
 * MediaStream から HTMLVideoElement を生成して返します。
 * @param stream 映像・音声を含む MediaStream オブジェクト
 * @param autoplay 即座に再生を開始するかどうか（デフォルト: true）
 * @returns 設定済みの HTMLVideoElement
 */
export function createVideoFromStream(
  stream: MediaStream, 
  autoplay: boolean = true
): HTMLVideoElement {
  // 1. video 要素の作成
  const video = document.createElement('video');

  // 2. ストリームの割り当て
  video.srcObject = stream;

  // 3. モバイルブラウザや自動再生ポリシーに対応するための属性設定
  video.playsInline = true; // iOS Safari でのインライン再生に必須
  video.muted = true;       // ブラウザの自動再生ポリシーをクリアするために必須

  // 4. 再生コントロールと配置の設定
  video.controls = false;   // 必要に応じて true に変更してください
  
  if (autoplay) {
    video.autoplay = true;
    
    // 確実に再生を開始させるための処理（非同期エラーのハンドリング）
    video.play().catch((error) => {
      console.warn("Video autoplay failed or was interrupted:", error);
    });
  }

  return video;
}

export default createVideoFromStream;

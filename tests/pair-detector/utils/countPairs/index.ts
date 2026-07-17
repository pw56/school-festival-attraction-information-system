import { ObjectDetector, FilesetResolver } from '@mediapipe/tasks-vision';

let objectDetector: ObjectDetector | null = null;
let isFirstCall: boolean = true;

// Detectorの初期化
async function initializeDetector() {
  // @mediapipe/tasks-vision のwasmファイル群が配置されている正しいパスを指定
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
  );
  
  // runningMode: "VIDEO" で初期化
  objectDetector = await ObjectDetector.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite", // 実際の.tfliteモデルのURLを指定
      delegate: "GPU" // パフォーマンス向上のためGPUを優先（利用可能な場合）
    },
    runningMode: "VIDEO"
  });
}

// フレームごとの検出ループ
async function startCountPairs
(
  videoElement: HTMLVideoElement, 
  onCountChanged: (count: number) => void
): Promise<() => void> {

  // 初期化
  if (isFirstCall) {
    await initializeDetector();
    isFirstCall = false;
  }

  if (!objectDetector) throw new Error('Model not found');

  // 実行フラグと前回のタイムスタンプは「関数スコープ内」で個別に管理する
  let isPlaying = true;
  let lastTimestamp = -1; 
  let animationFrameId: number;
  
  // ループ処理の実装
  function predictLoop() {
    // 停止フラグが立っているか、要素がなければ終了
    if (!isPlaying || !objectDetector || !videoElement) return;

    // ビデオデータが準備できているか確認（必須）
    if (videoElement.readyState >= 2) {
      try {
        // タイムスタンプを強制的に新しくする
        let startTimeMs = performance.now();
        if (startTimeMs <= lastTimestamp) {
          startTimeMs = lastTimestamp + 1;
        }
        
        const result = objectDetector.detectForVideo(videoElement, startTimeMs);
        lastTimestamp = startTimeMs; // タイムスタンプを更新
        
        const people = result.detections.filter((detection) => {
          return detection.categories.some(category => category.categoryName === 'person');
        });

        onCountChanged(people.length);
      } catch (error) {
        console.error("Detection error:", error);
      }
    }

    // readyStateの成否に関わらず、次のフレームを常に要求する
    // 次のフレームを要求し、IDを保存
    animationFrameId = requestAnimationFrame(predictLoop);
  }
  
  // 最初のアニメーションフレームを開始
  animationFrameId = requestAnimationFrame(predictLoop);

  // クリーンアップ関数を返す（コンポーネントのアンマウント時などに呼び出す）
  return () => {
    isPlaying = false;
    cancelAnimationFrame(animationFrameId); // メモリリーク防止：予約されたフレームも即座に解除

    // メモリリークおよびカメラリソースの占有を防ぐため、ビデオ要素を停止・解放
    try {
      videoElement.pause();
      videoElement.srcObject = null;
      videoElement.load();
    } catch (e) {
      console.warn("Error temporary stopping video element:", e);
    }
  };
}

export default startCountPairs;

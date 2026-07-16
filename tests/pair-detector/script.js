const video = document.getElementById('webcam');
const countText = document.getElementById('count-text');
let model;

// 1. Webカメラの起動
async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 },
            audio: false
        });
        video.srcObject = stream;
        return new Promise((resolve) => {
            video.onloadedmetadata = () => {
                resolve(video);
            };
        });
    } catch (error) {
        console.error("カメラのアクセスに失敗しました:", error);
        countText.innerText = "カメラエラー";
    }
}

// 2. 人数検出のループ処理
async function detectFaces() {
    // 映像から顔を検出（予測）
    const predictions = await model.detect(video);

    const people = predictions.filter(prediction => prediction.class === 'person');
    
    // 検出された配列の長さが「写っている人数」
    const peopleCount = people.length;
    
    // 画面のテキストを更新
    countText.innerText =
    `ペアの数: ${peopleCount}組`;

    // 次のフレームでも実行
    requestAnimationFrame(detectFaces);
}

// 3. メイン初期化処理
async function main() {
    countText.innerText = "モデル読み込み中...";
    
    // COCO-SSDモデルのロード
    model = await cocoSsd.load();
    
    // カメラの準備
    await setupCamera();
    
    // 映像の再生開始
    video.play();
    
    // ループ処理の開始
    detectFaces();
}

// ページ読み込み時に実行
main();
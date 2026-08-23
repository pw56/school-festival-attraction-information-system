import React, { useEffect, useRef, useState } from 'react';
import './global.css';
import { getGroups, Groups } from './getGroups';
import { videoToImageAsync } from './utils/toImage';
import { ImageCropper, ImageCropperRef, CropResult, CroppedBoundingBox } from './ImageCropper';
import QrScanner from 'qr-scanner';

// 動画用のグローバルなタイムスタンプ
// 動画のEffect内の変数だとバウンディングボックスの方で使えないのでグローバル
let videoTimestamp: number = -1;

// 設定アイコン（Settings.svg をコンポーネント化）
const SettingsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-gray-700"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

// UUID有効性チェックモック関数
const verifyUuidMock = async (uuid: string): Promise<{ isValid: boolean; attractionName: string }> => {
  return {
    isValid: true,
    attractionName: 'ワクワクコースター',
  };
};

const App = () => {
  // 認証状態の管理
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isSettingOpen, setIsSettingOpen] = useState<boolean>(false);

  // QRスキャナー用Ref
  const qrVideoRef = useRef<HTMLVideoElement | null>(null);

  // アップロードされたメディアの管理用
  const [mediaSrc, setMediaSrc] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  
  // ループ処理で参照するためのRef
  const imageRef = useRef<HTMLImageElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cropperRef = useRef<ImageCropperRef | null>(null);
  
  // 合成結果表示用
  const [mediaFrame, setMediaFrame] = useState<HTMLImageElement | null>(null);
  const [groups, setGroups] = useState<Groups>([]);
  const [croppedBoundingBox, setCroppedBoundingBox] = useState<CroppedBoundingBox | undefined>(undefined);

  // 1. QRスキャナー起動とスキャン処理
  useEffect(() => {
    if (isAuthenticated || !qrVideoRef.current) return;

    let isProcessing = false;
    const scanner = new QrScanner(
      qrVideoRef.current,
      async (result) => {
        if (isProcessing) return;
        isProcessing = true;
        scanner.stop();

        const uuid = result.data;
        const res = await verifyUuidMock(uuid);

        if (res.isValid) {
          window.alert(`認証に成功しました！\n出し物名: ${res.attractionName}`);
          setIsAuthenticated(true);
        } else {
          window.alert('認証に失敗しました。無効なQRコードです。');
          isProcessing = false;
          scanner.start();
        }
      },
      { returnDetailedScanResult: true }
    );

    scanner.start();

    return () => {
      scanner.destroy();
    };
  }, [isAuthenticated]);

  // 2. 認証成功後にWebカメラのストリーミングを開始
  useEffect(() => {
    if (!isAuthenticated) return;

    let stream: MediaStream | null = null;
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play().catch(() => {});
        }
        setMediaType('video');
      })
      .catch((err) => {
        console.error('カメラの起動に失敗しました', err);
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isAuthenticated]);

  // 切り取り範囲が更新・決定された時のハンドラ
  const handleCropChange = async (cropResult: CropResult) => {
    if (mediaType === 'image') {
      if (imageRef.current) {
        const rawImg = new Image();
        rawImg.src = imageRef.current.src;
        await rawImg.decode().catch(() => {});
        setMediaFrame(rawImg);
      }

      // 切り取り後のバウンディングボックスを State にセット
      setCroppedBoundingBox(cropResult.boundingBox);

      const detectedGroups = await getGroups(cropResult.croppedImage);
      setGroups(detectedGroups);
    }
  };

  // メモリリーク対策：アンマウント時にオブジェクトURLを解放
  useEffect(() => {
    return () => {
      if (mediaSrc) URL.revokeObjectURL(mediaSrc);
    };
  }, [mediaSrc]);

  // 画像用の1回限りの処理
  useEffect(() => {
    if (mediaType === 'image' && imageRef.current) {
      const processImage = async () => {
        const rawElement = imageRef.current!;

        // 1. まず元画像を mediaFrame に渡して ImageCropper をレンダリングさせる
        const rawImg = new Image();
        rawImg.src = rawElement.src;
        await rawImg.decode().catch(() => {});
        setMediaFrame(rawImg);

        // 2. レンダリング後に cropperRef が利用可能になるため、クロップ画像を取得（取得できなければ元画像）
        let inputElement: HTMLImageElement = rawElement;
        if (cropperRef.current) {
          const result = await cropperRef.current.getClippedImage();
          inputElement = result.croppedImage;
          setCroppedBoundingBox(result.boundingBox);
        }

        const detectedGroups = await getGroups(inputElement);
        setGroups(detectedGroups);
      };
      
      // 画像の読み込み完了を待って処理、または既に読み込み済みの場合は即時実行
      if (imageRef.current.complete) {
        processImage();
      } else {
        imageRef.current.onload = processImage;
      }
    }
  }, [mediaType, mediaSrc]);

  // 1秒ごとにメディアからデータを取得してグループ数検出メソッドに流すタイマー
  useEffect(() => {
    if (mediaType !== 'video' || !videoRef.current) return;

    const video = videoRef.current;

    const handleTimeUpdate = async () => {
      // 動画の現在の再生時間を秒単位（整数）で取得
      const currentTimeFloor = Math.floor(video.currentTime);

      // 前回の処理から動画の尺が1秒進んだか判定
      if (currentTimeFloor > videoTimestamp) {
        videoTimestamp = currentTimeFloor;

        // 動画が読み込まれている場合
        if (video.readyState >= 2) { // HAVE_CURRENT_DATA 以上
          const rawImg = await videoToImageAsync(video);
          if (!rawImg) return;

          // 1. まず元フレームを mediaFrame にセットして ImageCropper を確実にレンダリングさせる
          setMediaFrame(rawImg);

          // 2. cropperRef がある場合は切り抜き画像を、なければ元のフレーム画像を使用
          let processedImg: HTMLImageElement = rawImg;
          if (cropperRef.current) {
            const result = await cropperRef.current.getClippedImage();
            processedImg = result.croppedImage;
            setCroppedBoundingBox(result.boundingBox);
          }

          const detectedGroups = await getGroups(processedImg);
          setGroups(detectedGroups);
        }
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [mediaType, mediaSrc, isAuthenticated]);

  // QR未認証時の表示画面
  if (!isAuthenticated) {
    return (
      <main className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100 font-sans">
        <h1 className="mb-4 text-xl font-bold text-gray-800">QRコードをスキャンしてください</h1>
        <div className="relative h-64 w-64 overflow-hidden rounded-lg border-2 border-gray-400 bg-black shadow-md">
          <video ref={qrVideoRef} className="h-full w-full object-cover" />
        </div>
      </main>
    );
  }

  // 認証完了後の画面
  return (
    /* 元のCSS設定（透明背景、中央配置、スクロールバー非表示、フォント） */
    <main className="relative flex h-screen w-screen items-center justify-center bg-transparent overflow-hidden font-sans">
      
      {/* 画面右上：設定画面トグルボタン（小さめのSVGアイコン） */}
      <button
        onClick={() => setIsSettingOpen((prev) => !prev)}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/80 hover:bg-white shadow transition-all"
        title="設定"
      >
        <SettingsIcon />
      </button>

      {/* 入力データ(画像) */}
      {mediaType === 'image' && mediaSrc && (
        <img
          ref={imageRef}
          src={mediaSrc}
          alt="uploaded"
          className="absolute top-0 left-0 w-px h-px opacity-0 pointer-events-none"
        />
      )}

      {/* 入力データ(動画) - 人には見えないレベル(1px×1px/opacity-0)で常時レンダリング */}
      <video
        ref={videoRef}
        src={mediaSrc || undefined}
        muted
        autoPlay
        playsInline
        className="absolute top-0 left-0 w-px h-px opacity-0 pointer-events-none"
      />

      {/* メイン画面：設定が閉じられている時（中央に検出数を特大表示） */}
      {!isSettingOpen && (
        <div className="flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-600 mb-2">現在の検出グループ数</span>
          <span className="text-9xl font-extrabold text-blue-600 tracking-wider">
            {groups.length}
          </span>
        </div>
      )}

      {/* 設定画面オーバーレイ */}
      <div
        className={`fixed inset-0 bg-white/95 z-40 flex flex-col items-center justify-center p-6 ${
          isSettingOpen ? 'block' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="flex flex-col w-2/3 h-full items-center justify-center">
          {mediaFrame && (
            <ImageCropper
              ref={cropperRef}
              imageElement={mediaFrame}
              onCropChange={handleCropChange}
              className="w-full h-1/2"
            />
          )}
          
          {/* 設定を完了するボタン */}
          <button
            onClick={() => setIsSettingOpen(false)}
            className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded shadow"
          >
            設定を完了する
          </button>
        </div>
      </div>

    </main>
  );
}

export default App;

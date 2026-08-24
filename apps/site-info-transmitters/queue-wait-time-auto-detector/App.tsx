import { useEffect, useRef, useState } from 'react';
import './global.css';
import { getGroups, Groups } from './getGroups';
import { videoToImageAsync } from './utils/videoToImageAsync';
import { ImageCropper, ImageCropperRef } from './ImageCropper';
import QrScanner from 'qr-scanner';
import { isValidSecretUuid } from '../../utils/services/isValidSecretUuid';
import { getEventName } from './utils/getEventName';
import SettingsIcon from './assets/Settings.svg?react';

let videoTimestamp: number = -1;

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isSettingOpen, setIsSettingOpen] = useState<boolean>(false);

  const qrVideoRef = useRef<HTMLVideoElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cropperRef = useRef<ImageCropperRef | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const isWakeLockRequestedRef = useRef<boolean>(false);
  
  const [currentFrame, setCurrentFrame] = useState<HTMLImageElement | null>(null);
  const [groups, setGroups] = useState<Groups>([]);

  // カメラデバイス管理用の状態
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isCameraReady, setIsCameraReady] = useState<boolean>(false);

  // 利用可能なカメラ一覧を取得し、デフォルトで内カメラを選択
  useEffect(() => {
    const fetchCameras = async () => {
      try {
        // カメラ権限を取得してラベル名を開示させる
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // 取得した一時ストリームのトラックを停止
        stream.getTracks().forEach((track) => track.stop());

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((device) => device.kind === 'videoinput');
        setCameras(videoDevices);

        if (videoDevices.length > 0) {
          // 内カメラ（フロントカメラ）を優先的に検索
          const frontCamera = videoDevices.find((device) =>
            device.label.toLowerCase().includes('front') ||
            device.label.toLowerCase().includes('user') ||
            device.label.includes('内')
          );
          setSelectedDeviceId(frontCamera ? frontCamera.deviceId : videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error('カメラ一覧の取得に失敗しました', err);
      } finally {
        setIsCameraReady(true);
      }
    };

    fetchCameras();
  }, []);

  // Screen Wake Lockの取得処理
  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      } catch (err) {
        console.error('Wake Lockの取得に失敗しました:', err);
      }
    }
  };

  // visibilitychange イベントハンドラーの設定
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isWakeLockRequestedRef.current) {
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, []);

  // 設定完了ボタン押下時の処理
  const handleCompleteSettings = async () => {
    setIsSettingOpen(false);
    isWakeLockRequestedRef.current = true;
    await requestWakeLock();
  };

  // 1. QRスキャナー起動とスキャン処理
  useEffect(() => {
    if (!isCameraReady || isAuthenticated || !qrVideoRef.current) return;

    let isProcessing = false;
    const scanner = new QrScanner(
      qrVideoRef.current,
      async (result) => {
        if (isProcessing) return;
        isProcessing = true;
        scanner.stop();

        const uuid = result.data;
        const isValid = await isValidSecretUuid(uuid);

        if (isValid) {
          const eventName = await getEventName(uuid);
          window.alert(`認証に成功しました！\n出し物名: ${eventName}`);
          setIsAuthenticated(true);
        } else {
          window.alert('認証に失敗しました。無効なQRコードです。');
          isProcessing = false;
          scanner.start();
        }
      },
      {
        returnDetailedScanResult: true,
        preferredCamera: selectedDeviceId ? selectedDeviceId : 'user',
      }
    );

    scanner.start();

    return () => {
      scanner.destroy();
    };
  }, [isCameraReady, isAuthenticated, selectedDeviceId]);

  // 2. 認証成功後にWebカメラのストリーミングを開始
  useEffect(() => {
    if (!isAuthenticated) return;

    let stream: MediaStream | null = null;
    const videoConstraints: MediaTrackConstraints = selectedDeviceId
      ? { deviceId: { exact: selectedDeviceId } }
      : { facingMode: 'user' };

    navigator.mediaDevices
      .getUserMedia({ video: videoConstraints, audio: false })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play().catch(() => {});
        }
      })
      .catch((err) => {
        console.error('カメラの起動に失敗しました', err);
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isAuthenticated, selectedDeviceId]);

  // 3. 1秒ごとにカメラ映像を取得してグループ数検出を実行
  useEffect(() => {
    if (!videoRef.current || !isAuthenticated) return;

    const video = videoRef.current;

    const handleTimeUpdate = async () => {
      const currentTimeFloor = Math.floor(video.currentTime);

      if (currentTimeFloor > videoTimestamp) {
        videoTimestamp = currentTimeFloor;

        if (video.readyState >= 2) {
          const rawImg = await videoToImageAsync(video);
          if (!rawImg) return;

          setCurrentFrame(rawImg);

          let processedImg: HTMLImageElement = rawImg;
          if (cropperRef.current) {
            const result = await cropperRef.current.getClippedImage();
            processedImg = result.croppedImage;
          }

          const detectedGroups = await getGroups(processedImg);
          processedImg.src = ''; // 不要になった、内部バッファとBlobの紐付けを完全に切る
          setGroups(detectedGroups);
        }
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [isAuthenticated]);

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

  return (
    <main className="relative flex h-screen w-screen items-center justify-center bg-transparent overflow-hidden font-sans">
      <button
        onClick={() => setIsSettingOpen((prev) => !prev)}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/80 hover:bg-white shadow transition-all"
        title="設定"
      >
        <SettingsIcon />
      </button>

      <video
        ref={videoRef}
        muted
        autoPlay
        playsInline
        className="absolute top-0 left-0 w-px h-px opacity-0 pointer-events-none"
      />

      {!isSettingOpen && (
        <div className="flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-600 mb-2">現在の検出グループ数</span>
          <span className="text-9xl font-extrabold text-blue-600 tracking-wider">
            {groups.length}
          </span>
        </div>
      )}

      <div
        className={`fixed inset-0 bg-white/95 z-40 flex flex-col items-center justify-center p-6 ${
          isSettingOpen ? 'block' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="flex flex-col w-2/3 h-full items-center justify-center">
          {/* カメラ選択プルダウン */}
          <div className="mb-4 w-full max-w-md">
            <label htmlFor="camera-select" className="block text-sm font-medium text-gray-700 mb-1">
              使用するカメラを選択
            </label>
            <select
              id="camera-select"
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800"
            >
              {cameras.map((camera, index) => (
                <option key={camera.deviceId} value={camera.deviceId}>
                  {camera.label || `カメラ ${index + 1}`}
                </option>
              ))}
            </select>
          </div>

          {currentFrame && (
            <ImageCropper
              ref={cropperRef}
              imageElement={currentFrame}
              className="w-full h-1/2"
            />
          )}
          
          <button
            onClick={handleCompleteSettings}
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

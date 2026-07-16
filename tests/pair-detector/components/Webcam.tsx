import React, { useEffect, useRef } from 'react';

interface WebcamProps {
  /** 使用するカメラのデバイスID（親コンポーネントのStateから渡す） */
  deviceId?: string;
  /** 映像ストリームの準備が完了した際のイベント */
  onLoaded?: (stream: MediaStream) => void;
  /** カメラ起動エラー時のイベント */
  onError?: (error: unknown) => void;
  /** videoタグに適用するスタイルクラス（サイズや角丸など） */
  className?: string;
}

const Webcam = ({
  deviceId,
  onLoaded, 
  onError, 
  className = 'w-full h-auto' // デフォルトスタイル
}: WebcamProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // コールバックの頻繁な変更によるuseEffectの再実行（無限起動）を防ぐ
  const callbacksRef = useRef({ onLoaded, onError });
  useEffect(() => {
    callbacksRef.current = { onLoaded, onError };
  }, [onLoaded, onError]);

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    let isCancelled = false;
    const currentVideo = videoRef.current;

    const startVideo = async () => {
      if (!currentVideo) return;

      // 新しいカメラを起動する前に、古いストリームを確実に停止する
      if (currentVideo.srcObject) {
        const oldStream = currentVideo.srcObject as MediaStream;
        oldStream.getTracks().forEach(track => track.stop());
        currentVideo.srcObject = null;
      }

      try {
        const videoConstraints: MediaTrackConstraints = {
          width: { ideal: 640 },
          height: { ideal: 480 },
        };

        // deviceIdが指定されている場合はそれを使用、なければデフォルト
        if (deviceId) {
          videoConstraints.deviceId = { exact: deviceId };
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: false,
        });

        if (isCancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        activeStream = stream;
        currentVideo.srcObject = stream;
        
        currentVideo.onloadedmetadata = () => {
          if (!isCancelled) {
            callbacksRef.current.onLoaded?.(stream);
          }
        };
      } catch (error) {
        if (!isCancelled) {
          console.error('Webcam Component Error:', error);
          callbacksRef.current.onError?.(error);
        }
      }
    };

    startVideo();

    // クリーンアップ
    return () => {
      isCancelled = true;
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
      if (currentVideo) {
        currentVideo.srcObject = null;
        currentVideo.onloadedmetadata = null;
      }
    };
  }, [deviceId]); // 完全にマウント/アンマウント時のみ実行

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className={className}
    />
  );
};

export default Webcam;

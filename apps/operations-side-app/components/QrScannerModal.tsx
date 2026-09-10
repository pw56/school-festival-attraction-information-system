import React, { useEffect, useRef } from 'react';
import QrScanner from 'qr-scanner';

interface QrScannerModalProps {
  isOpen: boolean;
  onScanSuccess: (resultText: string) => void;
  onCancel: () => void;
  title?: string;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onScanSuccess,
  onCancel,
  title = 'QRコードを読み取る',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        mediaStreamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          const qrScanner = new QrScanner(
            videoRef.current,
            (result) => {
              stopScannerTracks();
              onScanSuccess(result.data);
            },
            {
              returnDetailedScanResult: true,
              highlightScanRegion: false,
              highlightCodeOutline: false,
            }
          );

          qrScannerRef.current = qrScanner;
          await qrScanner.start();
        }
      } catch (err) {
        console.error('Failed to access camera:', err);
        alert('カメラの起動に失敗しました。アクセス権限を確認してください。');
        onCancel();
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      stopScannerTracks();
    };
  }, [isOpen]);

  const stopScannerTracks = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = false;
        track.stop();
      });
      mediaStreamRef.current = null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="flex w-full max-w-md flex-col rounded-xl bg-white p-5 shadow-xl">
        <h3 className="mb-3 text-center text-lg font-bold text-gray-800">{title}</h3>

        {/* カメラ表示エリア */}
        <div className="relative h-80 w-full overflow-hidden rounded-lg bg-black">
          <video
            ref={videoRef}
            className="h-full w-full object-contain"
            playsInline
            muted
          />

          {/* スキャン枠オーバーレイ */}
          <div className="pointer-events-none absolute inset-0 flex flex-col">
            <div className="flex-1 bg-black/50" />
            <div className="flex h-56">
              <div className="flex-1 bg-black/50" />
              <div className="h-56 w-56 border-4 border-blue-500 bg-transparent" />
              <div className="flex-1 bg-black/50" />
            </div>
            <div className="flex-1 bg-black/50" />
          </div>
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg bg-gray-200 px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-300 active:bg-gray-400"
          >
            読み取りをキャンセル
          </button>
        </div>
      </div>
    </div>
  );
};

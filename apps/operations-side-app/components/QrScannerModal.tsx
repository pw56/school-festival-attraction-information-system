import React, { useEffect, useRef, useState } from 'react';
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
        // 高解像度および外カメラ優先のカメラ設定
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

          // QrScannerのインスタンス化
          const qrScanner = new QrScanner(
            videoRef.current,
            (result) => {
              // 読み取り成功時の処理
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

  // 高速切り替えのため track.enabled を用いてコントロールしつつクリーンアップ
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
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h3 style={{ margin: '0 0 12px 0', textAlign: 'center' }}>{title}</h3>

        {/* カメラ表示エリア */}
        <div style={styles.cameraContainer}>
          <video ref={videoRef} style={styles.video} playsInline muted />

          {/* QRスキャン用オーバーレイ */}
          <div style={styles.scanOverlay}>
            <div style={styles.overlayTop} />
            <div style={styles.overlayMiddle}>
              <div style={styles.overlayLeft} />
              <div style={styles.scanTargetBox} />
              <div style={styles.overlayRight} />
            </div>
            <div style={styles.overlayBottom} />
          </div>
        </div>

        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <button style={styles.cancelButton} onClick={onCancel}>
            読み取りをキャンセル
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    width: '90%',
    maxWidth: '500px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
  },
  cameraContainer: {
    position: 'relative',
    width: '100%',
    height: '350px',
    backgroundColor: '#000',
    overflow: 'hidden',
    borderRadius: '8px',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  scanOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    pointerEvents: 'none',
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayMiddle: {
    display: 'flex',
    height: '220px',
  },
  overlayLeft: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scanTargetBox: {
    width: '220px',
    height: '220px',
    border: '3px solid #228BE6',
    boxSizing: 'border-box',
    backgroundColor: 'transparent',
  },
  overlayRight: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  cancelButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 'bold',
    backgroundColor: '#e0e0e0',
    color: '#333',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};

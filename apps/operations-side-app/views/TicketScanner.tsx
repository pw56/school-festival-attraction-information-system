import React, { useState, useRef } from 'react';
import { QrScannerModal } from '../components/QrScannerModal';
import { SdkClient, ApiError } from '../../utils/sdk';

interface TicketScannerProps {
  sdkClient: SdkClient;
}

export const TicketScanner: React.FC<TicketScannerProps> = ({ sdkClient }) => {
  const [isScanning, setIsScanning] = useState(false);

  // 音声ファイルの参照
  const successAudioRef = useRef<HTMLAudioElement | null>(
    new Audio('/successful.mp3')
  );
  const failedAudioRef = useRef<HTMLAudioElement | null>(
    new Audio('/failed.mp3')
  );

  const playAudio = (type: 'success' | 'failed') => {
    try {
      const audio =
        type === 'success' ? successAudioRef.current : failedAudioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch((err) => console.warn('Audio play failed:', err));
      }
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  };

  const handleScanSuccess = async (qrData: string) => {
    setIsScanning(false);

    let parsedPayload: any;
    try {
      parsedPayload = JSON.parse(qrData);
    } catch (e) {
      playAudio('failed');
      alert('エラー: QRコードのデータの構文解析に失敗しました (JSON形式ではありません)。');
      return;
    }

    // 例: 整理券データの検証とAPI呼び出し
    if (!parsedPayload || typeof parsedPayload !== 'object' || !parsedPayload.ticket_id) {
      playAudio('failed');
      alert('エラー: 無効な整理券データです (必要な識別子が含まれていません)。');
      return;
    }

    try {
      // 整理券検証 API をコール
      await sdkClient.tickets.verifyTicket({
        ticket_id: parsedPayload.ticket_id,
        secret_id: parsedPayload.secret_id,
      });

      playAudio('success');
      alert('整理券の認証に成功しました。');
    } catch (error) {
      playAudio('failed');
      if (error instanceof ApiError) {
        alert(`通信エラー / APIエラー (${error.status}): ${error.message}`);
      } else {
        alert('予期せぬエラーが発生しました。');
      }
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>整理券の認証</h2>
      <p>「整理券を読み取る」ボタンを押して、カメラでQRコードをかざしてください。</p>

      <button
        onClick={() => setIsScanning(true)}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 'bold',
          backgroundColor: '#228BE6',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        整理券を読み取る
      </button>

      <QrScannerModal
        isOpen={isScanning}
        onScanSuccess={handleScanSuccess}
        onCancel={() => setIsScanning(false)}
        title="整理券QRコードを読み取る"
      />
    </div>
  );
};

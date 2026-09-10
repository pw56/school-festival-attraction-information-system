import React, { useState } from 'react';
import { QrScannerModal } from '../components/QrScannerModal';

interface TicketScannerProps {}

export const TicketScanner: React.FC<TicketScannerProps> = () => {
  const [isScanning, setIsScanning] = useState(false);

  const handleScanSuccess = async (qrData: string) => {
    setIsScanning(false);

    let parsedPayload: any;
    try {
      parsedPayload = JSON.parse(qrData);
    } catch (e) {
      alert('エラー: QRコードのデータの構文解析に失敗しました (JSON形式ではありません)。');
      return;
    }

    if (!parsedPayload || typeof parsedPayload !== 'object' || !parsedPayload.ticket_id) {
      alert('エラー: 無効な整理券データです (必要な識別子が含まれていません)。');
      return;
    }

    try {
      const res = await fetch('https://example.com/tickets/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticket_id: parsedPayload.ticket_id,
          secret_id: parsedPayload.secret_id,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }

      alert('整理券の認証に成功しました。');
    } catch (error: any) {
      if (error instanceof Error) {
        alert(`通信エラー / APIエラー: ${error.message}`);
      } else {
        alert('予期せぬエラーが発生しました。');
      }
    }
  };

  return (
    <div className="mx-auto max-w-xl p-6">
      <h2 className="mb-2 text-2xl font-bold text-gray-800">整理券の認証</h2>
      <p className="mb-6 text-gray-600">
        「整理券を読み取る」ボタンを押して、カメラでQRコードをかざしてください。
      </p>

      <button
        type="button"
        onClick={() => setIsScanning(true)}
        className="w-full rounded-lg bg-blue-600 py-3 text-base font-bold text-white shadow-md transition hover:bg-blue-700 active:bg-blue-800 sm:w-auto sm:px-6"
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

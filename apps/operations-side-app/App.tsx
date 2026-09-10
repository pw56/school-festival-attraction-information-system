import React, { useState } from 'react';
import { TicketScanner } from './views/TicketScanner';
import { EventInfoEditor } from './views/EventInfoEditor';
import { EventStatusEditor } from './views/EventStatusEditor';
import { QrScannerModal } from './components/QrScannerModal';
import { SdkClient, Event } from '../utils/sdk';

type TabType = 'tickets' | 'info' | 'status';

interface AppProps {
  sdkClient: SdkClient;
}

const App: React.FC<AppProps> = ({ sdkClient }) => {
  const [activeTab, setActiveTab] = useState<TabType>('tickets');
  const [secretId, setSecretId] = useState<string | null>(null);
  const [pendingTab, setPendingTab] = useState<TabType | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [eventData, setEventData] = useState<Event | null>(null);

  const handleTabClick = (tab: TabType) => {
    if (tab === 'tickets') {
      setActiveTab('tickets');
      return;
    }

    if (!secretId) {
      setPendingTab(tab);
      setIsAuthenticating(true);
    } else {
      setActiveTab(tab);
    }
  };

  const handleAuthQrScanSuccess = async (qrData: string) => {
    setIsAuthenticating(false);

    try {
      const parsed = JSON.parse(qrData);
      const extractedSecretId = parsed.secret_id || (typeof parsed === 'string' ? parsed : null);

      if (!extractedSecretId) {
        alert('失敗: QRコードから secret_id を取得できませんでした。');
        return;
      }

      const response = await sdkClient.events.getEvents();
      const targetEvent = response.data.find(
        (e) => e.id === parsed.id || e.id === extractedSecretId
      );

      setSecretId(extractedSecretId);
      if (targetEvent) {
        setEventData(targetEvent);
      } else {
        setEventData({
          id: extractedSecretId,
          name: parsed.name || '出し物',
          type: parsed.type || 'food_and_drink',
          location: parsed.location || { lat: 0, lng: 0, floor: 1 },
        } as Event);
      }

      alert('成功: secret_id の認証に成功しました。');

      if (pendingTab) {
        setActiveTab(pendingTab);
        setPendingTab(null);
      }
    } catch (e) {
      alert('失敗: QRコードの解析または通信処理に失敗しました。');
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-3xl bg-white font-sans text-gray-900 shadow-sm">
      {/* タブヘッダー */}
      <nav className="flex border-b border-gray-200 bg-gray-50">
        <button
          type="button"
          onClick={() => handleTabClick('tickets')}
          className={`flex-1 border-b-2 py-3 px-2 text-center text-sm font-bold transition ${
            activeTab === 'tickets'
              ? 'border-blue-600 bg-white text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          整理券の認証
        </button>
        <button
          type="button"
          onClick={() => handleTabClick('info')}
          className={`flex-1 border-b-2 py-3 px-2 text-center text-sm font-bold transition ${
            activeTab === 'info'
              ? 'border-blue-600 bg-white text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          出し物の情報の設定
        </button>
        <button
          type="button"
          onClick={() => handleTabClick('status')}
          className={`flex-1 border-b-2 py-3 px-2 text-center text-sm font-bold transition ${
            activeTab === 'status'
              ? 'border-blue-600 bg-white text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          出し物の運営状況の編集
        </button>
      </nav>

      {/* コンテンツ表示エリア */}
      <main className="p-2">
        {activeTab === 'tickets' && <TicketScanner sdkClient={sdkClient} />}

        {activeTab === 'info' && secretId && eventData && (
          <EventInfoEditor
            sdkClient={sdkClient}
            secretId={secretId}
            event={eventData}
            onUpdated={(updated) => setEventData(updated)}
          />
        )}

        {activeTab === 'status' && secretId && (
          <EventStatusEditor sdkClient={sdkClient} secretId={secretId} />
        )}
      </main>

      {/* 認証用 QRコードスキャナ */}
      <QrScannerModal
        isOpen={isAuthenticating}
        onScanSuccess={handleAuthQrScanSuccess}
        onCancel={() => {
          setIsAuthenticating(false);
          setPendingTab(null);
        }}
        title="secret_id QRコードの読み取り"
      />
    </div>
  );
};

export default App;

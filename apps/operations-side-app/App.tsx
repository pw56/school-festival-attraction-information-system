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

export const App: React.FC<AppProps> = ({ sdkClient }) => {
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
      const targetEvent = response.data.find((e) => e.id === parsed.id || e.id === extractedSecretId);

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
    <div style={styles.container}>
      {/* タブナビゲーション */}
      <nav style={styles.tabNav}>
        <button
          style={{
            ...styles.tabButton,
            ...(activeTab === 'tickets' ? styles.activeTab : {}),
          }}
          onClick={() => handleTabClick('tickets')}
        >
          整理券の認証
        </button>
        <button
          style={{
            ...styles.tabButton,
            ...(activeTab === 'info' ? styles.activeTab : {}),
          }}
          onClick={() => handleTabClick('info')}
        >
          出し物の情報の設定
        </button>
        <button
          style={{
            ...styles.tabButton,
            ...(activeTab === 'status' ? styles.activeTab : {}),
          }}
          onClick={() => handleTabClick('status')}
        >
          出し物の運営状況の編集
        </button>
      </nav>

      {/* タブコンテンツ */}
      <main style={styles.content}>
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

      {/* タブ切り替え用認証QRスキャナ */}
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

const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: 'sans-serif',
    maxWidth: '800px',
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  tabNav: {
    display: 'flex',
    borderBottom: '2px solid #e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  tabButton: {
    flex: 1,
    padding: '14px 8px',
    fontSize: '14px',
    fontWeight: 'bold',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: '#666',
    borderBottom: '3px solid transparent',
    transition: 'all 0.2s',
  },
  activeTab: {
    color: '#228BE6',
    borderBottom: '3px solid #228BE6',
    backgroundColor: '#fff',
  },
  content: {
    paddingTop: '20px',
  },
};

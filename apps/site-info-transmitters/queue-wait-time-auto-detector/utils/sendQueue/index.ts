import { sendData } from './sendData';

// オンライン復帰イベント検知
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    sendData();
  });
  
  // モジュール読み込み（アプリ起動）時にも未送信データがあれば送信試行
  sendData();
  
  // 定期的にキューの再送を試みる (例: 30秒ごと)
  setInterval(() => {
    sendData();
  }, 30000);
}

export { recordGroupCount } from './recordGroupCount';

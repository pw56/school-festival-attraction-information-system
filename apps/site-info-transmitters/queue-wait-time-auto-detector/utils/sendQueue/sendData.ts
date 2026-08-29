import { queueManager } from './queueManager';

let isSending = false;

export async function sendData(): Promise<void> {
  // オフラインなら実行しない
  if (!navigator.onLine) {
    return;
  }

  if (isSending) {
    return;
  }

  isSending = true;

  try {
    const items = await queueManager.getItems();
    if (items.length === 0) {
      return;
    }

    // 実際にAPIへ送信するイメージ（現在はプレースホルダー）
    await simulateApiCall(items);

    // 送信成功時、送信したアイテムのIDを集めてキューから一括削除
    const idsToRemove = items
      .map((item) => item.id)
      .filter((id): id is number => id !== undefined);

    if (idsToRemove.length > 0) {
      await queueManager.removeItems(idsToRemove);
    }
  } catch (error) {
    console.error('送信に失敗しました。次回以降に再試行します:', error);
  } finally {
    isSending = false;
  }
}

// ダミーのAPI送信処理
// 引数の型はそのうち決めるので、それまでは`unknown`
async function simulateApiCall(data: unknown): Promise<void> {
  // 未定のため処理なし（開発時は必要に応じてレスポンスの模擬を行う）
  if (Array.isArray(data) && data.length > 0) {
    const firstItem = data[0];
    const message = `ID: ${firstItem.eventId}\nグループ数: ${firstItem.groupCount}\n${firstItem.timestamp ? new Date(firstItem.timestamp).toISOString() : ''}`;
    window.alert(message);
  }
  return Promise.resolve();
}

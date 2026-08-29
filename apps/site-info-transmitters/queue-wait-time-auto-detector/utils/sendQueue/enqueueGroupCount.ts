import { EventId, GroupCount, RecordedTimestamp } from './types';
import { queueManager } from './queueManager';
import { sendData } from './sendData';

export async function enqueueGroupCount(
  eventId: EventId,
  groupCount: GroupCount,
  timestamp: RecordedTimestamp = new Date()
): Promise<void> {
  // キューに追加
  await queueManager.enqueue(eventId, groupCount, timestamp);
  
  // 即座に送信を試みる
  await sendData();
}

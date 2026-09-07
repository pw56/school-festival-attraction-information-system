import Dexie, { Table } from 'dexie';
import { QueueItem, EventId, GroupCount, RecordedTimestamp } from './types';

class AppDatabase extends Dexie {
  queue!: Table<QueueItem, number>;

  constructor() {
    super('GroupCountQueueDB');
    this.version(1).stores({
      queue: '++id, timestamp'
    });
  }
}

const db = new AppDatabase();

class QueueManager {
  // キューに新しいアイテムを追加
  async enqueue(eventId: EventId, groupCount: GroupCount, timestamp: RecordedTimestamp): Promise<number> {
    return await db.queue.add({ eventId, groupCount, timestamp });
  }

  // 送信対象のデータを取得
  async getItems(): Promise<QueueItem[]> {
    return await db.queue.orderBy('id').toArray();
  }

  // 送信が完了したアイテムをキューから削除
  async removeItems(ids: number[]): Promise<void> {
    await db.queue.bulkDelete(ids);
  }
}

export const queueManager = new QueueManager();

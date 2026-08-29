export type EventId = string;
export type GroupCount = number;
export type RecordedTimestamp = Date;

export interface QueueItem {
  id?: number;
  eventId: EventId;
  groupCount: GroupCount;
  timestamp: RecordedTimestamp;
}
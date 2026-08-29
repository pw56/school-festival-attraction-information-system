import { EventId } from "../../types";
export { EventId } from "../../types";

export type GroupCount = number;
export type RecordedTimestamp = Date;

export interface QueueItem {
  id?: number;
  eventId: EventId;
  groupCount: GroupCount;
  timestamp: RecordedTimestamp;
}
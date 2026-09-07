import { EventId } from "../../types";
export { EventId } from "../../types";

export type GroupCount = number;
export type RecordedTimestamp = Date;

export interface QueueItem {
  id?: number; // DBで自動で連番つけられてるので、コードになくても消してはいけない
  eventId: EventId;
  groupCount: GroupCount;
  timestamp: RecordedTimestamp;
}

// APIが決まったら、`interface`で`sendBody`も(オブジェクトの配列、JSONにする前の段階で使う)

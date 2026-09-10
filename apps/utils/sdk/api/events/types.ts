export type CrowdLevel = 'empty' | 'quiet' | 'normal' | 'busy' | 'crowded' | string;

export type CrowdLevelsResponse = {
  id: string;
  crowd_level: CrowdLevel;
};

export type OperationStatus = 'operating' | 'preparing' | 'paused' | 'under-maintenance' | string;

export type OperationStatusResponse = {
  status: OperationStatus;
};

export type TimeString = string;

export type TimeInterval = [TimeString, TimeString];

export type OperatingHourRule = {
  condition: 'date_range' | 'day_of_week' | 'default' | string;
  start_date?: string;
  end_date?: string;
  target?: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
  operating_hours: TimeInterval[];
};

export type OperatingHourRules = {
  timezone: string;
  rules: OperatingHourRule[];
};

export type AvailableTicketSlotRule = {
  condition: 'date_range' | 'day_of_week' | 'default' | string;
  start_date?: string;
  end_date?: string;
  target?: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
  target_period: TimeInterval;
  remaining_tickets: number;
};

export type AvailableTicketSlots = {
  timezone: string;
  rules: AvailableTicketSlotRule[];
};

export type EventType =
  | 'food_and_drink'
  | 'vehicles'
  | 'fair_stalls'
  | 'horror'
  | 'riddle_solving'
  | 'sports'
  | 'entertainment'
  | 'product_sales'
  | 'workshop'
  | 'exhibition'
  | 'stage'
  | 'rest_area'
  | 'information_desk'
  | 'restrooms'
  | 'stairs'
  | 'elevator'
  | 'first_aid_room'
  | 'parking_lot'
  | 'others'
  | string;

export type EventAccessibility =
  | 'wheelchair_accessible'
  | 'step_free_access'
  | 'accessible_restroom'
  | 'colorblind_friendly'
  | 'braille_pamphlet'
  | 'audio_guide_available'
  | 'subtitled_video'
  | 'script_available'
  | 'writing_board_available'
  | 'visual_instructions'
  | 'assistant_dog_allowed'
  | 'allergy_labels'
  | string;

export type Event = {
  id: string;
  name: string;
  thumbnail_path?: string;
  description?: string;
  operating_hour_rules?: OperatingHourRules;
  duration?: {
    duration_seconds: number;
    is_approximate: boolean;
    margin_seconds: number;
  };
  location: {
    lat: number;
    lng: number;
    floor: number;
  };
  max_party_size?: number;
  type: EventType;
  restrictions?: string;
  accessibility?: EventAccessibility[];
  available_ticket_slots?: AvailableTicketSlots;
};

export type QueueGroupCounts = number[];

export type QueueGroupItem = {
  timestamp: string;
  group_counts: QueueGroupCounts;
};

export type CrowdLevelTransmissionItem = {
  timestamp: string;
  crowd_level: CrowdLevel;
};

export type WaitTimeResponse = {
  id: string;
  wait_time_minutes: number;
};

export type CreateEventResponse = {
  secret_id: string;
  event: Event;
};

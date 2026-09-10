export type LocationRestriction = {
  enabled: boolean;
  session_timeout_minutes?: number;
  allowed_radius_meters?: number;
};

export type OperatingHours = {
  start_time: string;
  end_time: string;
};

export type SystemSettings = {
  location_restriction: LocationRestriction;
  operating_hours: OperatingHours;
  restrict_access_to_operating_hours: boolean;
  allowed_ticket_delay_minutes: number;
  prevent_duplicate_event_reservations_before_use: boolean;
  bot_protection_enabled: boolean;
  supported_languages: string[];
};

export type EventIdMappings = Record<string, string>;

export type GetEventIdMappingsParams = {
  admin_id: string;
};

export type UpdateSystemSettingsBody = {
  admin_id: string;
  settings?: SystemSettings;
};

export type { ErrorResponse } from '../../types';

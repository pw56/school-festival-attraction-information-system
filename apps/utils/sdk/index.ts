import { HttpClient } from './utils/HttpClient';
import { EventsApi, AdminEventsApi } from './apis/events';
import type { ClientOptions } from './types';

export class SdkClient {
  readonly http: HttpClient;
  readonly events: EventsApi;
  readonly adminEvents: AdminEventsApi;

  constructor(options: ClientOptions) {
    this.http = new HttpClient(options);
    this.events = new EventsApi(this.http);
    this.adminEvents = new AdminEventsApi(this.http);
  }
}

export * from './types';
export * from './utils/ApiError';
export * from './utils/HttpClient';
export * from './utils/validators';
export * from './apis/events';

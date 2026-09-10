import { HttpClient } from './utils/HttpClient';
import { EventsApi, AdminEventsApi } from './apis/events';
import { LogsApi } from './apis/logs';
import { TicketsApi } from './apis/tickets';
import { MapApi } from './apis/map';
import { SystemApi } from './apis/system';
import type { ClientOptions } from './types';

export class SdkClient {
  readonly http: HttpClient;
  readonly events: EventsApi;
  readonly adminEvents: AdminEventsApi;
  readonly logs: LogsApi;
  readonly tickets: TicketsApi;
  readonly map: MapApi;
  readonly system: SystemApi;

  constructor(options: ClientOptions) {
    this.http = new HttpClient(options);
    this.events = new EventsApi(this.http);
    this.adminEvents = new AdminEventsApi(this.http);
    this.logs = new LogsApi(this.http);
    this.tickets = new TicketsApi(this.http);
    this.map = new MapApi(this.http);
    this.system = new SystemApi(this.http);
  }
}

export * from './types';
export * from './utils/ApiError';
export * from './utils/HttpClient';
export * from './utils/validators';
export * from './apis/events';
export * from './apis/logs';
export * from './apis/tickets';
export * from './apis/map';
export * from './apis/system';

import { HttpClient } from './utils/HttpClient';
import type { ClientOptions } from './types';

export class SdkClient {
  readonly http: HttpClient;

  constructor(options: ClientOptions) {
    this.http = new HttpClient(options);
  }
}

export * from './types';
export * from './utils/ApiError';
export * from './utils/HttpClient';
export * from './utils/validators';

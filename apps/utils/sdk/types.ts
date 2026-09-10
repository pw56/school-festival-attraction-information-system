export type ClientOptions = {
  baseUrl: string;
  headers?: Record<string, string>;
  timeout?: number;
};

export type RequestOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
  timeout?: number;
  parseJson?: boolean;
  query?: Record<string, unknown>;
};

export type ApiResponse<T = unknown> = {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
};

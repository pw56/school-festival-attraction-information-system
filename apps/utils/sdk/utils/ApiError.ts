export class ApiError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly data: unknown;
  readonly headers: Headers;

  constructor(message: string, status: number, statusText: string, data: unknown, headers: Headers) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
    this.headers = headers;
  }
}

import type { ClientOptions, RequestOptions, ApiResponse } from '../types';
import { ApiError } from './ApiError';

export class HttpClient {
  #baseUrl: string;
  #defaultHeaders: Record<string, string>;
  #defaultTimeout: number;

  constructor(options: ClientOptions) {
    this.#baseUrl = options.baseUrl.replace(/\/$/, '');
    this.#defaultHeaders = options.headers ?? {};
    this.#defaultTimeout = options.timeout ?? 10000;
  }

  async request<T = unknown>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const {
      headers = {},
      timeout = this.#defaultTimeout,
      parseJson = true,
      query,
      ...fetchOptions
    } = options;

    const url = new URL(`${this.#baseUrl}${path.startsWith('/') ? path : `/${path}`}`);
    if (query) {
      const cleanQuery = Object.fromEntries(
        Object.entries(query).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
      );
      url.search = new URLSearchParams(cleanQuery).toString();
    }

    const mergedHeaders = {
      'Content-Type': 'application/json',
      ...this.#defaultHeaders,
      ...headers,
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: mergedHeaders,
        signal: controller.signal,
      });

      clearTimeout(timer);

      const contentType = response.headers.get('content-type');
      const isJson = parseJson && contentType?.includes('application/json');
      const data = isJson ? await response.json().catch(() => null) : await response.text();

      if (!response.ok) {
        throw new ApiError(
          `Request failed with status ${response.status}`,
          response.status,
          response.statusText,
          data,
          response.headers
        );
      }

      return {
        data: data as T,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
    } catch (error) {
      clearTimeout(timer);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError(`Request timeout after ${timeout}ms`, 408, 'Request Timeout', null, new Headers());
      }

      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown network error',
        0,
        'Network Error',
        null,
        new Headers()
      );
    }
  }
}

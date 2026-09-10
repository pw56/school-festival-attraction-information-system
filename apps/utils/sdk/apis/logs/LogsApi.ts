import type { HttpClient } from '../../utils/HttpClient';
import type { RequestOptions, ApiResponse } from '../../types';
import type { GetLogsQueryParams } from './types';

export class LogsApi {
  #client: HttpClient;

  constructor(client: HttpClient) {
    this.#client = client;
  }

  async getQueueGroupLogs(
    params: GetLogsQueryParams,
    options?: Omit<RequestOptions, 'query' | 'parseJson'>
  ): Promise<ApiResponse<string>> {
    return this.#client.request<string>('/api/logs/queue-group', {
      ...options,
      method: 'GET',
      parseJson: false,
      query: { ...params },
    });
  }

  async getTicketUsagesLogs(
    params: GetLogsQueryParams,
    options?: Omit<RequestOptions, 'query' | 'parseJson'>
  ): Promise<ApiResponse<string>> {
    return this.#client.request<string>('/api/logs/ticket-usages', {
      ...options,
      method: 'GET',
      parseJson: false,
      query: { ...params },
    });
  }

  async getWaitTimesLogs(
    params: GetLogsQueryParams,
    options?: Omit<RequestOptions, 'query' | 'parseJson'>
  ): Promise<ApiResponse<string>> {
    return this.#client.request<string>('/api/logs/wait-times', {
      ...options,
      method: 'GET',
      parseJson: false,
      query: { ...params },
    });
  }
}

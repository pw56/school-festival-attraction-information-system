import type { HttpClient } from '../../utils/HttpClient';
import { validateData, type Validator } from '../../utils/validators';
import type { RequestOptions, ApiResponse } from '../../types';
import type {
  CrowdLevelsResponse,
  OperationStatusResponse,
  Event,
  WaitTimeResponse,
  QueueGroupItem,
  CrowdLevelTransmissionItem,
} from './types';

export type GetCrowdLevelParams = {
  id: string;
};

export type GetEventStatusParams = {
  id: string;
};

export type GetWaitTimeParams = {
  id: string;
};

export type TransmitQueueGroupsBody = {
  secret_id: string;
  queue_groups: QueueGroupItem[];
};

export type TransmitCrowdLevelsBody = {
  secret_id: string;
  crowd_levels: CrowdLevelTransmissionItem[];
};

export class EventsApi {
  #client: HttpClient;

  constructor(client: HttpClient) {
    this.#client = client;
  }

  async getCrowdLevel(
    params: GetCrowdLevelParams,
    validator?: Validator<CrowdLevelsResponse>,
    options?: Omit<RequestOptions, 'query'>
  ): Promise<ApiResponse<CrowdLevelsResponse>> {
    const response = await this.#client.request<CrowdLevelsResponse>('/api/events/crowd-levels', {
      ...options,
      method: 'GET',
      query: { id: params.id },
    });

    return {
      ...response,
      data: validateData(response.data, validator),
    };
  }

  async getEventStatus(
    params: GetEventStatusParams,
    validator?: Validator<OperationStatusResponse>,
    options?: Omit<RequestOptions, 'query'>
  ): Promise<ApiResponse<OperationStatusResponse>> {
    const response = await this.#client.request<OperationStatusResponse>('/api/events/operation-status', {
      ...options,
      method: 'GET',
      query: { id: params.id },
    });

    return {
      ...response,
      data: validateData(response.data, validator),
    };
  }

  async getEvents(
    validator?: Validator<Event[]>,
    options?: RequestOptions
  ): Promise<ApiResponse<Event[]>> {
    const response = await this.#client.request<Event[]>('/api/events/profiles', {
      ...options,
      method: 'GET',
    });

    return {
      ...response,
      data: validateData(response.data, validator),
    };
  }

  async getWaitTime(
    params: GetWaitTimeParams,
    validator?: Validator<WaitTimeResponse>,
    options?: Omit<RequestOptions, 'query'>
  ): Promise<ApiResponse<WaitTimeResponse>> {
    const response = await this.#client.request<WaitTimeResponse>('/api/events/wait-times', {
      ...options,
      method: 'GET',
      query: { id: params.id },
    });

    return {
      ...response,
      data: validateData(response.data, validator),
    };
  }

  async transmitQueueGroups(
    body: TransmitQueueGroupsBody,
    options?: RequestOptions
  ): Promise<ApiResponse<void>> {
    return this.#client.request<void>('/api/events/site-info-transmission/queue-groups', {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async transmitCrowdLevels(
    body: TransmitCrowdLevelsBody,
    options?: RequestOptions
  ): Promise<ApiResponse<void>> {
    return this.#client.request<void>('/api/events/site-info-transmission/crowd-level', {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
}

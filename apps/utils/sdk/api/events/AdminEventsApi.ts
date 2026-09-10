import type { HttpClient } from '../../utils/HttpClient';
import { validateData, type Validator } from '../../utils/validators';
import type { RequestOptions, ApiResponse } from '../../types';
import type {
  OperationStatusResponse,
  OperationStatus,
  Event,
  CreateEventResponse,
} from './types';

export type UpdateEventStatusBody = {
  secret_id: string;
  status: OperationStatus;
};

export type CreateEventParams = {
  thumbnail_data: Blob | File;
  eventData: Partial<Event>;
};

export type UpdateEventParams = {
  secret_id: string;
  thumbnail_data: Blob | File;
  eventData: Partial<Event>;
};

export type DeleteEventParams = {
  secret_id: string;
};

export class AdminEventsApi {
  #client: HttpClient;

  constructor(client: HttpClient) {
    this.#client = client;
  }

  async updateEventStatus(
    body: UpdateEventStatusBody,
    validator?: Validator<OperationStatusResponse>,
    options?: RequestOptions
  ): Promise<ApiResponse<OperationStatusResponse>> {
    const response = await this.#client.request<OperationStatusResponse>('/api/events/operation-status', {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });

    return {
      ...response,
      data: validateData(response.data, validator),
    };
  }

  async createEvent(
    params: CreateEventParams,
    validator?: Validator<CreateEventResponse>,
    options?: Omit<RequestOptions, 'headers'> & { headers?: Record<string, string> }
  ): Promise<ApiResponse<CreateEventResponse>> {
    const formData = new FormData();
    formData.append('thumbnail_data', params.thumbnail_data);

    Object.entries(params.eventData).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(
          key,
          typeof value === 'object' ? JSON.stringify(value) : String(value)
        );
      }
    });

    const headers = { ...options?.headers };
    delete headers['Content-Type'];

    const response = await this.#client.request<CreateEventResponse>('/api/events/profiles', {
      ...options,
      method: 'POST',
      body: formData,
      headers,
    });

    return {
      ...response,
      data: validateData(response.data, validator),
    };
  }

  async updateEvent(
    params: UpdateEventParams,
    validator?: Validator<Event>,
    options?: Omit<RequestOptions, 'headers'> & { headers?: Record<string, string> }
  ): Promise<ApiResponse<Event>> {
    const formData = new FormData();
    formData.append('secret_id', params.secret_id);
    formData.append('thumbnail_data', params.thumbnail_data);

    Object.entries(params.eventData).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(
          key,
          typeof value === 'object' ? JSON.stringify(value) : String(value)
        );
      }
    });

    const headers = { ...options?.headers };
    delete headers['Content-Type'];

    const response = await this.#client.request<Event>('/api/events/profiles', {
      ...options,
      method: 'PUT',
      body: formData,
      headers,
    });

    return {
      ...response,
      data: validateData(response.data, validator),
    };
  }

  async deleteEvent(
    params: DeleteEventParams,
    options?: Omit<RequestOptions, 'query'>
  ): Promise<ApiResponse<void>> {
    return this.#client.request<void>('/api/events/profiles', {
      ...options,
      method: 'DELETE',
      query: { secret_id: params.secret_id },
    });
  }
}

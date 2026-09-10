import type { HttpClient } from '../../utils/HttpClient';
import { validateData, type Validator } from '../../utils/validators';
import type { RequestOptions, ApiResponse } from '../../types';
import type {
  SystemSettings,
  EventIdMappings,
  GetEventIdMappingsParams,
  UpdateSystemSettingsBody,
} from './types';

export class SystemApi {
  #client: HttpClient;

  constructor(client: HttpClient) {
    this.#client = client;
  }

  async getSystemSettings(
    validator?: Validator<SystemSettings>,
    options?: RequestOptions
  ): Promise<ApiResponse<SystemSettings>> {
    const response = await this.#client.request<SystemSettings>('/api/system/settings', {
      ...options,
      method: 'GET',
    });

    return {
      ...response,
      data: validateData(response.data, validator),
    };
  }

  async updateSystemSettings(
    body: UpdateSystemSettingsBody,
    validator?: Validator<SystemSettings>,
    options?: RequestOptions
  ): Promise<ApiResponse<SystemSettings>> {
    const response = await this.#client.request<SystemSettings>('/api/system/settings', {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });

    return {
      ...response,
      data: validateData(response.data, validator),
    };
  }

  async getEventIdMappings(
    params: GetEventIdMappingsParams,
    validator?: Validator<EventIdMappings>,
    options?: RequestOptions
  ): Promise<ApiResponse<EventIdMappings>> {
    const query = new URLSearchParams({ admin_id: params.admin_id }).toString();
    const response = await this.#client.request<EventIdMappings>(`/api/system/event-id-mappings?${query}`, {
      ...options,
      method: 'GET',
    });

    return {
      ...response,
      data: validateData(response.data, validator),
    };
  }
}

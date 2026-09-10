import type { HttpClient } from '../../utils/HttpClient';
import { validateData, type Validator } from '../../utils/validators';
import type { RequestOptions, ApiResponse } from '../../sdk/types';
import type { Map3DModel, UpdateMapBody } from './types';

export class MapApi {
  #client: HttpClient;

  constructor(client: HttpClient) {
    this.#client = client;
  }

  async getMap(
    validator?: Validator<Map3DModel>,
    options?: RequestOptions
  ): Promise<ApiResponse<Map3DModel>> {
    const response = await this.#client.request<Map3DModel>('/api/maps', {
      ...options,
      method: 'GET',
    });

    return {
      ...response,
      data: validateData(response.data, validator),
    };
  }

  async updateMap(
    body: UpdateMapBody,
    validator?: Validator<Map3DModel>,
    options?: RequestOptions
  ): Promise<ApiResponse<Map3DModel>> {
    const response = await this.#client.request<Map3DModel>('/api/maps', {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });

    return {
      ...response,
      data: validateData(response.data, validator),
    };
  }
}

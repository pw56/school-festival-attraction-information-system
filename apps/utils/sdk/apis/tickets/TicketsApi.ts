import type { HttpClient } from '../../utils/HttpClient';
import { validateData, type Validator } from '../../utils/validators';
import type { RequestOptions, ApiResponse } from '../../types';
import type {
  ReserveTicketBody,
  ReserveTicketResponse,
  CancelTicketBody,
  AuthenticateTicketBody,
  TransferTicketBody,
  SimpleMessageResponse,
} from './types';

export class TicketsApi {
  #client: HttpClient;

  constructor(client: HttpClient) {
    this.#client = client;
  }

  async reserveTicket(
    body: ReserveTicketBody,
    validator?: Validator<ReserveTicketResponse>,
    options?: RequestOptions
  ): Promise<ApiResponse<ReserveTicketResponse>> {
    const response = await this.#client.request<ReserveTicketResponse>('/api/tickets/reserve', {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });

    return {
      ...response,
      data: validateData(response.data, validator),
    };
  }

  async cancelTicket(
    body: CancelTicketBody,
    validator?: Validator<SimpleMessageResponse>,
    options?: RequestOptions
  ): Promise<ApiResponse<SimpleMessageResponse>> {
    const response = await this.#client.request<SimpleMessageResponse>('/api/tickets/cancel', {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });

    return {
      ...response,
      data: validateData(response.data, validator),
    };
  }

  async authenticateTicket(
    body: AuthenticateTicketBody,
    validator?: Validator<SimpleMessageResponse>,
    options?: RequestOptions
  ): Promise<ApiResponse<SimpleMessageResponse>> {
    const response = await this.#client.request<SimpleMessageResponse>('/api/tickets/authenticate', {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });

    return {
      ...response,
      data: validateData(response.data, validator),
    };
  }

  async transferTicket(
    body: TransferTicketBody,
    validator?: Validator<SimpleMessageResponse>,
    options?: RequestOptions
  ): Promise<ApiResponse<SimpleMessageResponse>> {
    const response = await this.#client.request<SimpleMessageResponse>('/api/tickets/transfer', {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });

    return {
      ...response,
      data: validateData(response.data, validator),
    };
  }
}

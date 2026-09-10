export type AuthType = 'totp' | 'token';

export type TicketSlot = {
  start_time: string;
  end_time: string;
};

export type Ticket = {
  ticket_id: string;
  event_id: string;
  ticket_slot: TicketSlot;
  auth_type: AuthType;
  auth_info: string;
};

export type TicketTransferData = {
  ticket: Ticket;
};

export type ReserveTicketBody = {
  event_id: string;
  ticket_slot: TicketSlot;
  auth_type: AuthType;
  fcmToken?: string;
};

export type ReserveTicketResponse = {
  ticket: Ticket;
  message: string;
};

export type CancelTicketBody = {
  ticket_id: string;
  auth_code: string;
};

export type AuthenticateTicketBody = {
  ticket_id: string;
  auth_code: string;
};

export type TransferTicketBody = {
  ticket_id: string;
  fcmToken: string;
};

export type SimpleMessageResponse = {
  message: string;
};

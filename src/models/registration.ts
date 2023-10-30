export enum PaymentStatus {
  PAID = 'PAID',
  NOT_PAID = 'NOT_PAID',
  LATER = 'LATER',
}

export interface PlayerRegistration {
  id: number;
  payment_status: PaymentStatus;
  user: number;
  team: number;
  ticket: number;
}

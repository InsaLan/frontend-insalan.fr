import type { TeamDeref } from '@/models/team';

export enum PaymentStatus {
  PAID = 'PAID',
  NOT_PAID = 'NOTPAID',
  LATER = 'LATER',
}

interface BasePlayerRegistration {
  id: number;
  payment_status: PaymentStatus;
  user: number;
  ticket: number;
}

export interface PlayerRegistration extends BasePlayerRegistration {
  team: number;
}

export interface PlayerRegistrationDeref extends BasePlayerRegistration {
  team: TeamDeref;
}

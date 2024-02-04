import type { TeamDeref } from '@/models/team';

export enum PaymentStatus {
  PAID = 'PAID',
  NOT_PAID = 'NOTPAID',
  LATER = 'LATER',
}

interface BaseRegistration {
  id: number;
  payment_status: PaymentStatus;
  user: number;
  ticket: string;
}

export interface Registration extends BaseRegistration {
  team: number;
}

export interface PlayerRegistration extends Registration {
  name_in_game: string;
}

export interface RegistrationDeref extends BaseRegistration {
  team: TeamDeref;
}

export interface PlayerRegistrationDeref extends RegistrationDeref {
  name_in_game: string;
}

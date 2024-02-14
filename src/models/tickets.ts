import type { User } from '@/models/user';

export enum TicketStatus {
  CANCELLED = 'CA',
  SCANNED = 'SC',
  VALID = 'VA',
}

export interface QRData {
  user: User['username'];
  token: string;
  status: TicketStatus;
}

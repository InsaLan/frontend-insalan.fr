import type { Team } from '@/models/team';
import type { EventTournament } from '@/models/tournament';
import type { User } from '@/models/user';

export enum TicketStatus {
  CANCELLED = 'CA',
  SCANNED = 'SC',
  VALID = 'VA',
}

export interface QRData {
  user: User['username'];
  identity: string;
  token: string;
  status: TicketStatus;
  tournament: EventTournament['name'];
  team: Team['name'];
}

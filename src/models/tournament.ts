import type { Event } from '@/models/event';
import type { Game } from '@/models/game';
import type { Team } from '@/models/team';

export interface Tournament {
  id: number;
  event: Event | Event['id'];
  game: Game | Game['id'];
  name: string;
  teams: Team[] | Team['id'][];
  logo?: string;
}

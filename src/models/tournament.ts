import type { Event } from '@/models/event';
import type { Game } from '@/models/game';
import type { Team } from '@/models/team';

export interface Tournament {
  id: number;
  teams: Team[] | Team['id'][];
  name: string;
  is_announced: boolean;
  rules: string;
  registration_open: string;
  registration_close: string;
  logo?: string;
  player_price_online: string;
  player_price_onsite: string;
  manager_price_online: string;
  manager_price_onsite: string;
  cashprizes: number[];
  event: Event | Event['id'];
  game: Game | Game['id'];
  manager_online_product: number;
  player_online_product: number;
}

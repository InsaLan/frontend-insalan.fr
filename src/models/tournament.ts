import type { Caster } from '@/models/caster';
import type { EventDeref } from '@/models/event';
import type { Game } from '@/models/game';
import type { Team } from '@/models/team';

interface BaseTournament {
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
  game: Game | Game['id'];
  manager_online_product: number;
  player_online_product: number;
  substitute_online_product: number;
  maxTeam: number;
  validated_teams: number;
  description: string;
  casters: Caster[];
  planning: string;
}

export interface TournamentDeref extends BaseTournament {
  event: EventDeref;
}

export interface Tournament extends BaseTournament {
  event: number;
}

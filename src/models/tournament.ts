import type { Bracket } from '@/models/bracket';
import type { Caster } from '@/models/caster';
import type { EventDeref } from '@/models/event';
import type { Game } from '@/models/game';
import type { Group } from '@/models/group';
import type { SeatSlot } from '@/models/seats';
import type { SwissRound } from '@/models/swiss';
import type { Team } from '@/models/team';

interface BaseTournament {
  id: number;
  teams: Team[] | Team['id'][];
  name: string;
  rules: string;
  logo?: string;
  maxTeam: number;
  validated_teams: number;
  description: string;
  description_bottom: string;
  game: Game;
  groups: Group[];
  brackets: Bracket[];
  swissRounds: SwissRound[];
}

interface BaseEventTournament extends BaseTournament {
  is_announced: boolean;
  registration_open: string;
  registration_close: string;
  player_price_online: string;
  player_price_onsite: string;
  manager_price_online: string;
  manager_price_onsite: string;
  cashprizes: number[];
  manager_online_product: number;
  player_online_product: number;
  substitute_online_product: number;
  casters: Caster[];
  planning_file: string;
}

export interface EventTournament extends BaseEventTournament {
  event: number;
}

export interface EventTournamentDeref extends BaseEventTournament {
  event: EventDeref;
  seatslots: SeatSlot[];
}

export interface PrivateTournament extends BaseTournament {
  password: boolean;
  running: boolean;
  start: string;
  rewards: string;
}

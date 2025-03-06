import type { PlayerRegistration } from '@/models/registration';
import type { TournamentDeref } from '@/models/tournament';

interface BaseTeam {
  id: number;
  name: string;
  players: PlayerRegistration[] | number[];
  managers: string[] | number[];
  substitutes: PlayerRegistration[] | number[];
  validated: boolean;
  captain: string;
  seat_slot: number | null;
  seed: number;
}

export interface TeamDeref extends BaseTeam {
  tournament: TournamentDeref;
}

export interface Team extends BaseTeam {
  tournament: number;
}

import type { TournamentDeref } from '@/models/tournament';

interface BaseTeam {
  id: number;
  name: string;
  players: string[];
  managers: string[];
  validated: boolean;
}

export interface TeamDeref extends BaseTeam {
  tournament: TournamentDeref;
}

export interface Team extends BaseTeam {
  tournament: number;
}

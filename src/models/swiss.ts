import type { Team } from '@/models/team';
import type { Match } from '@/models/Match';

export interface SwissRound {
  id: number;
  tournament: number;
  min_score: number;
  teams: Team[];
  matches: Match[];
}

export interface SwissSeeding {
  swiss: SwissRound;
  team: Team;
  seeding: number;
}

export interface SwissMatch {
  swiss: SwissRound;
}

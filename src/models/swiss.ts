import type { Match } from '@/models/match';
import type { Team } from '@/models/team';

export interface SwissRound {
  id: number;
  name: string;
  tournament: number;
  min_score: number;
  teams: Team[];
  matchs: SwissMatch[];
  stage?: number;
}

export interface SwissSeeding {
  swiss: SwissRound;
  team: Team;
  seeding: number;
}

export interface SwissMatch extends Match {
  swiss: SwissRound['id'];
  score_group: number;
}

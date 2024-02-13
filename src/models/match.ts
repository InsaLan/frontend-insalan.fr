import type { Team } from '@/models/team';

export enum MatchStatus {
  SCHEDULED = 'SCHEDULED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
}

export enum BestofType {
  BO1 = 1,
  BO3 = 3,
  BO5 = 5,
  BO7 = 7,
  RANKING = 0,
}

export interface Match {
  teams: Team[];
  round_number: number;
  score: Record<number, number>;
  index_in_round: number;
  status: MatchStatus;
  bo_type: BestofType;
  times: number[];
}

export interface Score {
  team: Team;
  match: Match;
  score: number;
}

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
export enum MatchTypeEnum {
  GROUP = 'group',
  BRACKET = 'bracket',
  SWISS = 'swiss',
}

export interface BaseMatch {
  id: number;
  round_number: number;
  score: Record<number, number>;
  index_in_round: number;
  status: MatchStatus;
  bo_type: BestofType;
}

export interface MatchType {
  id: number;
  type: MatchTypeEnum;
}

export interface Match extends BaseMatch {
  teams: number[];
  times: number[];
}
export interface ScorePatch {
  score: { [id: number]: number };
  times: number[];
}
export interface OngoingMatch extends BaseMatch {
  teams: { id: number; name: string }[];
  match_type: MatchType;
}
export interface Score {
  team: Team;
  match: Match;
  score: number;
}

import type { Match } from '@/models/match';

export enum BracketType {
  SINGLE = 'SINGLE',
  DOUBLE = 'DOUBLE',
}

export enum BracketSet {
  WINNER = 'WINNER',
  LOOSER = 'LOOSER',
}
export interface Bracket {
  id: number;
  name: string;
  tournament: number;
  bracket_type: BracketType;
  depth: number;
  winner: number;
  teams: number[];
  matchs: KnockoutMatch[];
}

export interface KnockoutMatch extends Match {
  bracket: Bracket;
  bracket_set: BracketSet;
}

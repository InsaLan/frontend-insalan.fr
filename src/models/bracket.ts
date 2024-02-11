
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
  team_count: number;

}

export interface KnockoutMatch {
  bracket: Bracket;
  bracket_set: BracketSet;
}

import type { Match } from '@/models/match';
import type { Tournament } from '@/models/tournament';

export interface Group {
  id: number;
  name: string;
  tournament: Tournament;
  matchs: Match[];
  teams: number[];
  round_count: number;
  scores: { [id:string]: number };
}

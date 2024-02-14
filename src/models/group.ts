import type { Tournament } from '@/models/tournament'
import type { Team } from '@/models/team';
import type { Match } from '@/models/match';
export interface Group {
  id: number;
  name: string;
  tournament: Tournament;
  matchs: Match[];
  teams: number;
  round_count: number;
  scores: { [id:string]: number };
}

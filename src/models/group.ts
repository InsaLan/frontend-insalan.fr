import type { Tournament } from '@/models/tournament'
import type { Team } from '@/models/team';
export interface Group {
  id: number;
  name: string;
  tournament: Tournament;
  teams: Team[];
  round_count: number;
  scores: { [id:string]: number };
}

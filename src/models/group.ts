import type { Match } from '@/models/match';
import type { Tournament } from '@/models/tournament';

export interface Group {
  id: number;
  name: string;
  tournament: Tournament;
  matchs: GroupMatch[];
  teams: number[];
  round_count: number;
  scores: { [id:string]: number };
  tiebreak_scores: { [id:string]: number };
}

export interface GroupMatch extends Match {
  group: Group['id'];
}

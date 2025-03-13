import type { Match } from '@/models/match';
import type { EventTournament } from '@/models/tournament';

export interface Group {
  id: number;
  name: string;
  tournament: EventTournament;
  matchs: GroupMatch[];
  teams: number[];
  round_count: number;
  scores: { [id:string]: number };
  tiebreak_scores: { [id:string]: number };
  seeding?: { [id:string]: number };
}

export interface GroupMatch extends Match {
  group: Group['id'];
}

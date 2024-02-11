import type { Tournament } from '@/models/tournament'
export interface Group {
  id: number;
  name: string;
  tournament: Tournament;
  round_count: number;
}

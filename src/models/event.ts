import type { EventTournamentDeref } from './tournament';

interface BaseEvent {
  id: number;
  name: string;
  description: string;
  date_start: Date;
  date_end: Date;
  ongoing: boolean;
  logo?: string;
  poster?: string;
  seats: [number, number][];
  planning_file: string;
}

export interface Event extends BaseEvent {
  tournaments?: number[];
}

export interface EventDeref extends BaseEvent {
  tournaments?: EventTournamentDeref[];
}

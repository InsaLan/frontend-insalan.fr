import type { TournamentDeref } from './tournament';

interface BaseEvent {
  id: number;
  name: string;
  description: string;
  year: number;
  month: number;
  ongoing: boolean;
  logo?: string;
  seats: [number, number][];
}

export interface Event extends BaseEvent {
  tournaments?: number[];
}

export interface EventDeref extends BaseEvent {
  tournaments?: TournamentDeref[];
}

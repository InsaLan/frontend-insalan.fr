import type { Tournament } from './tournament';

export interface Event {
  id: number;
  name: string;
  description: string;
  year: number;
  month: number;
  ongoing: boolean;
  tournaments?: Tournament[] | number[];
  logo?: string;
}

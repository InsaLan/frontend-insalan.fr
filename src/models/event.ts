import type { Tournament } from './tournament';

export interface Event {
  [index: string]: number | string | boolean | Tournament[] | undefined | number[];
  id: number;
  name: string;
  description: string;
  year: number;
  month: number;
  ongoing: boolean;
  tournaments?: Tournament[] | number[];
  logo?: string;
}

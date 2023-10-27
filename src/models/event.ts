import type { Tournament } from './tournament';

export interface Event {
  [index: string]: number | string | boolean | Tournament[] | undefined;
  id: number;
  name: string;
  description: string;
  year: number;
  month: number;
  ongoing: boolean;
  tournaments?: Tournament[];
  logo?: string;
}

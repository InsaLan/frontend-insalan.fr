export interface Game {
  id: number;
  name: string;
  short_name?: string;
  players_per_team: number;
  team_per_match: number;
}

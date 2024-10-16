import axios from 'axios';
import { defineStore, storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import {
  type Bracket, BracketSet, BracketType, type KnockoutMatch,
} from '@/models/bracket';
import type { Event } from '@/models/event';
import type { Group } from '@/models/group';
import { BestofType, type Match } from '@/models/match';
import type { PlayerRegistration, PlayerRegistrationDeref } from '@/models/registration';
import type { SwissMatch } from '@/models/swiss';
import type { Team } from '@/models/team';
import type { Tournament, TournamentDeref } from '@/models/tournament';

import { useUserStore } from './user.store';

const { get_csrf } = useUserStore();
const { csrf, inscriptions, user } = storeToRefs(useUserStore());

export function groupBy<T>(items: T[], key: keyof T): Record<string, T[]> {
  return items.reduce((result, item) => ({
    ...result,
    [item[key] as keyof T]: [
      ...(result[item[key] as string] || []),
      item,
    ],
  }), {} as Record<string, T[]>);
}

export const useTournamentStore = defineStore('tournament', () => {
  const eventsList = ref<Record<number, Event>>({});
  const tournamentsList = ref<Record<number, Tournament>>({});
  const unpaidRegistration = ref<{
    'id': number;
    'type': string;
    'user': string;
    'team': string;
  }[]>([]);

  const tourney_teams = ref<Record<string, Team[]>>({});
  const tournament = ref<Tournament | TournamentDeref>();
  const ongoingEvents = computed(() => Object.values(eventsList.value).reduce((res, item) => {
    if (item.ongoing) {
      res.push(item);
    }
    return res;
  }, [] as Event[]));
  const oldEvents = computed(() => Object.values(eventsList.value).reduce((res, item) => {
    if (!item.ongoing) {
      res.push(item);
    }
    return res;
  }, [] as Event[]));

  async function fetchAllEvents() {
    const res = await axios.get<Event[]>('/tournament/event');
    res.data.forEach((ev) => { eventsList.value[ev.id] = ev; });
  }

  async function fetchEventsByYear(year: number) {
    const res = await axios.get<Event[]>(`tournament/event/year/${year}`);
    res.data.forEach((ev) => { eventsList.value[ev.id] = ev; });
  }

  async function fetchEventsByYears(years: number[]) {
    await Promise.all(years.map((year) => fetchEventsByYear(year)));
  }

  async function fetchThisYear() {
    const year = new Date().getFullYear();
    await fetchEventsByYear(year);
  }

  async function fetchEventById(id: number) {
    const res = await axios<Event>(`tournament/event/${id}`);
    eventsList.value[id] = res.data;
  }

  async function fetchEventByIds(ids: number[]) {
    await Promise.all(ids.map((id) => fetchEventById(id)));
  }

  async function fetchOngoingEvents() {
    const res = await axios<Event[]>('tournament/event/ongoing/');
    res.data.forEach((ev) => { eventsList.value[ev.id] = ev; });
  }

  async function getEvent(id: number) {
    if (!(id in eventsList.value)) {
      await fetchEventById(id);
    }
  }

  async function getEvents(ids: number[]) {
    const missing: number[] = [];
    ids.forEach((id) => {
      if (!(id in eventsList.value)) {
        missing.push(id);
      }
    });
    if (missing.length > 0) {
      await fetchEventByIds(missing);
    }
  }

  async function getEventsByYears(years: number[]) {
    await fetchEventsByYears(years);
  }

  async function getOngoingEvents() {
    await fetchOngoingEvents();
  }

  /* **************
   * Tournaments  *
   ************** */
  async function fetchTournament(id: number) {
    const res = await axios.get<Tournament>(`/tournament/tournament/${id}/`);
    tournamentsList.value[id] = res.data;
  }

  async function fetchTournaments(ids: number[]) {
    await Promise.all<void>(ids.map<Promise<void>>((id) => fetchTournament(id)));
  }

  async function fetchTournamentFull(id: number) {
    const res = await axios.get<Tournament>(`/tournament/tournament/${id}/full`);
    tournamentsList.value[id] = res.data;
  }

  async function fetchTournamentsFull(ids: number[]) {
    await Promise.all<void>(ids.map<Promise<void>>((id) => fetchTournamentFull(id)));
  }

  async function getTournament(id: number) {
    if (!(id in tournamentsList.value)) {
      await fetchTournament(id);
    }
  }
  async function getTournaments(ids: number[]) {
    const missing: number[] = [];
    ids.forEach((id) => {
      if (!(id in tournamentsList.value)) {
        missing.push(id);
      }
    });
    if (missing.length > 0) {
      await fetchTournaments(missing);
    }
  }

  async function getTournamentFull(id: number) {
    if (!(id in tournamentsList.value) || typeof tournamentsList.value[id].event === 'number') {
      await fetchTournamentFull(id);
    }
    tournament.value = tournamentsList.value[id];
  }

  async function getTournamentsFull(ids: number[]) {
    const missing: number[] = [];
    ids.forEach((id) => {
      if (!(id in tournamentsList.value) || typeof tournamentsList.value[id].event === 'number') {
        missing.push(id);
      }
    });
    if (missing.length > 0) {
      await fetchTournamentsFull(missing);
    }
  }

  async function registerPlayerOrManager(
    team: number,
    name_in_game: string,
    password: string,
    role: string,
    tournament_id: number,
  ) {
    await get_csrf();

    const data = {
      team,
      password,
    } as Record<string, unknown>;

    if (role === 'player' || role === 'substitute') {
      data.name_in_game = name_in_game;
    }

    await axios.post(`tournament/${role}/`, data, {
      withCredentials: true,
      headers: {
        'X-CSRFToken': csrf.value,
      },
    });
    await fetchTournamentFull(tournament_id);
  }

  async function registerTeam(
    tournament_id: number,
    team: string,
    password: string,
    role?: string,
    name_in_game?: string,
    user_id?: number,
  ): Promise<Team> {
    await get_csrf();

    const data = {
      tournament: tournament_id,
      name: team,
      password,
    } as Record<string, unknown>;

    if (role === 'player') {
      data.players = [user_id];
      data.players_names_in_game = [name_in_game];
    }
    if (role === 'manager') {
      data.managers = [user_id];
    }
    if (role === 'substitute') {
      data.substitutes = [user_id];
      data.substitutes_names_in_game = [name_in_game];
    }

    const res = await axios.post<Team>('/tournament/team/', data, {
      withCredentials: true,
      headers: {
        'X-CSRFToken': csrf.value,
      },
    });
    await fetchTournamentFull(tournament_id).catch();
    return res.data;
  }

  async function payRegistration(
    tournament_obj: Tournament,
    role: string,
  ) {
    await get_csrf();

    let product_id;
    if (role === 'player') {
      product_id = tournament_obj.player_online_product;
    } else if (role === 'manager') {
      product_id = tournament_obj.manager_online_product;
    } else if (role === 'substitute') {
      product_id = tournament_obj.substitute_online_product;
    }
    if (!product_id) return;

    const data = {
      products: [product_id],
    } as Record<string, unknown>;

    const response = await axios.post<{
      redirect_url: string;
    }>('payment/pay/', data, {
      withCredentials: true,
      headers: {
        'X-CSRFToken': csrf.value,
      },
    });
    await fetchTournamentFull(tournament_obj.id);

    const { redirect_url } = response.data;

    window.location.href = redirect_url;
  }

  async function patch_registration(registration_type: string, registration_id: number, data: Record<string, string>) {
    await get_csrf();

    const res = await axios.patch<PlayerRegistrationDeref>(`/tournament/${registration_type}/${registration_id}/`, data, {
      withCredentials: true,
      headers: {
        'X-CSRFToken': csrf.value,
      },
    });

    // Update the inscriptions
    inscriptions.value.ongoing.forEach((registration) => {
      if (registration[1].id === registration_id) {
        (registration[1] as PlayerRegistrationDeref).name_in_game = res.data.name_in_game;
      }
    });
  }

  async function patch_team(team_id: number, data: Record<string, unknown>) {
    await get_csrf();

    const response = await axios.patch<Team>(`/tournament/team/${team_id}/`, data, {
      withCredentials: true,
      headers: {
        'X-CSRFToken': csrf.value,
      },
    });

    // Search for the team in the tournament and update with the response
    const tournament_teams = tournament.value?.teams as Team[];
    const index = tournament_teams.findIndex((team) => team.id === team_id);
    tournament_teams[index].name = response.data.name;
    tournament_teams[index].players = response.data.players;
    tournament_teams[index].substitutes = response.data.substitutes;
    tournament_teams[index].seat_slot = response.data.seat_slot;
  }

  async function leave_team(registration_type: string, registration_id: number) {
    await get_csrf();

    await axios.delete(`/tournament/${registration_type}/${registration_id}/`, {
      withCredentials: true,
      headers: {
        'X-CSRFToken': csrf.value,
      },
    });

    // Remove the registration from the tournament
    const team_id = inscriptions.value.ongoing.find(
      (registration) => registration[1].id === registration_id,
    )?.[1].team.id;
    const tournament_teams = tournament.value?.teams as Team[];
    const index = tournament_teams.findIndex((team) => team.id === team_id);

    if (registration_type === 'player') {
      tournament_teams[index].players = (
        tournament_teams[index].players as PlayerRegistration[]
      ).filter((player) => player.id !== registration_id);
    } else if (registration_type === 'substitute') {
      tournament_teams[index].substitutes = (
        tournament_teams[index].substitutes as PlayerRegistration[]
      ).filter((substitute) => substitute.id !== registration_id);
    } else if (registration_type === 'manager') {
      // remove the user from the managers
      tournament_teams[index].managers = (tournament_teams[index].managers as string[]).filter(
        (manager) => manager !== user.value.username,
      );
    }

    // If team is empty, remove it from the tournament
    if (tournament_teams[index].players.length === 0
      && tournament_teams[index].substitutes.length === 0
      && tournament_teams[index].managers.length === 0) {
      tournament_teams.splice(index, 1);
    }

    // Remove the registration from the ongoing inscriptions
    inscriptions.value.ongoing = inscriptions.value.ongoing.filter(
      (registration) => registration[1].id !== registration_id,
    );
  }

  async function get_ticket_pdf(token: string) {
    const response = await axios.get(`/tickets/generate/${token}`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ticket_${token}.pdf`);
    document.body.appendChild(link);
    link.click();
  }
  function getTournamentTeams() {
    tourney_teams.value = (tournament.value?.teams as Team[]).reduce((ret, team) => {
      if (team.validated) {
        ret.validated_teams.push(team);
      } else {
        ret.non_validated_teams.push(team);
      }
      return ret;
    }, { validated_teams: [] as Team[], non_validated_teams: [] as Team[] });
  }

  async function get_unpaid_registration() {
    const response = await axios.get<{
      id: number;
      type: string;
      user: string;
      team: string;
    }[]>('/tickets/unpaid');
    unpaidRegistration.value = response.data;
  }

  async function validate_registration(type: string, id: number) {
    await get_csrf();

    await axios.post('/tickets/pay', {
      id,
      type,
    }, {
      withCredentials: true,
      headers: {
        'X-CSRFToken': csrf.value,
      },
    });

    // Remove the registration from the unpaid list
    unpaidRegistration.value = unpaidRegistration.value.filter((registration) => (
      registration.id !== id || registration.type !== type
    ));
  }

  function get_validated_team_by_id(id: number) {
    return tourney_teams.value.validated_teams.find((team) => team.id === id);
  }
  function get_group_by_id(groups: Group[], id: number) {
    return groups.find((group) => group.id === id);
  }
  function is_winning_team(match: Match, team_id: number) {
    if (match.bo_type === BestofType.RANKING) {
      return match.score[team_id] >= Object.keys(match.score).length;
    }
    return match.score[team_id] >= Math.ceil(match.bo_type / 2);
  }

  function get_bracket_cols_count(bracket: Bracket) {
    if (bracket.bracket_type === BracketType.SINGLE) {
      return bracket.depth + 1;
    }
    return 2 * (bracket.depth - 1) + 3;
  }
  function get_winner_matchs_per_round(matchs: KnockoutMatch[], round: number) {
    const winner_matchs = matchs.filter((match) => match.bracket_set === BracketSet.WINNER);
    const round_matchs = groupBy(winner_matchs, 'round_number');
    return round_matchs[round];
  }
  function get_col_class(bracket: Bracket) {
    const nb_cols = get_bracket_cols_count(bracket);
    return `grid-cols-[repeat(${nb_cols},17rem)]`;
  }
  function get_col_style(bracket: Bracket) {
    const nb_cols = get_bracket_cols_count(bracket);
    return { 'grid-template-columns': `repeat(${nb_cols},17rem)` };
  }

  const get_matchs_per_round = (matchs: Match[]) => {
    const reversed_rounds = groupBy(matchs, 'round_number');
    return Object.values(reversed_rounds).reverse();
  };

  const get_looser_matchs = (matchs: KnockoutMatch[]) => {
    const looser_matchs = matchs.filter((match) => match.bracket_set === BracketSet.LOOSER);
    const round_matchs = groupBy(looser_matchs, 'round_number');
    return Object.values(round_matchs).reverse();
  };

  const knockout_match_results = (match: KnockoutMatch) => {
    const match_results = [] as Record<string, string | number | boolean | undefined>[];
    match.teams.forEach((team) => {
      const data = {} as Record<string, string | number | boolean | undefined>;
      data.name = get_validated_team_by_id(team)?.name;
      data.score = match.score[team];
      data.is_winner = is_winning_team(match, team);
      match_results.push(data);
    });

    return match_results;
  };

  const swiss_match_results = (matchs : SwissMatch[]) => {
    const round_matchs = groupBy(matchs, 'round_number');
    const res = {} as Record<
    string,
    Record<
    string,
    string | Record<
    string,
    string | number | boolean | undefined
    >[]
    >[]
    >;
    Object.entries(round_matchs).forEach(([round, roundMatchs]) => {
      res[round] = [] as Record<string, string | Record<string, string | number | boolean | undefined>[]>[];
      roundMatchs.forEach((match) => {
        const tmp = {} as { teams: Record<string, string | number | boolean | undefined>[]; status: string };
        tmp.teams = [];
        tmp.status = match.status;
        match.teams.forEach((team) => {
          const data = {} as { name: string | undefined; score: number; is_winner: boolean };
          data.name = get_validated_team_by_id(team)?.name;
          data.score = match.score[team];
          data.is_winner = is_winning_team(match, team);
          tmp.teams.push(data);
        });
        res[round].push(tmp);
      });
    });

    return res;
  };

  const soloGame = computed(() => (tournament.value as TournamentDeref | undefined)?.game.players_per_team === 1);

  function $reset() {
    eventsList.value = {};
    tournamentsList.value = {};
  }

  return {
    oldEvents,
    eventsList,
    ongoingEvents,
    tournamentsList,
    unpaidRegistration,
    tourney_teams,
    tournament,
    is_winning_team,
    get_validated_team_by_id,
    get_winner_matchs_per_round,
    get_group_by_id,
    get_col_class,
    get_col_style,
    get_bracket_cols_count,
    get_matchs_per_round,
    get_looser_matchs,
    knockout_match_results,
    swiss_match_results,
    getEvent,
    getEvents,
    getTournamentTeams,
    getEventsByYears,
    getOngoingEvents,
    getTournament,
    getTournaments,
    getTournamentFull,
    getTournamentsFull,
    fetchAllEvents,
    fetchEventsByYear,
    fetchEventsByYears,
    fetchThisYear,
    fetchEventById,
    fetchEventByIds,
    fetchOngoingEvents,
    fetchTournament,
    fetchTournaments,
    fetchTournamentFull,
    fetchTournamentsFull,
    registerTeam,
    registerPlayerOrManager,
    payRegistration,
    patch_registration,
    patch_team,
    leave_team,
    $reset,
    get_ticket_pdf,
    get_unpaid_registration,
    validate_registration,
    soloGame,
  };
});

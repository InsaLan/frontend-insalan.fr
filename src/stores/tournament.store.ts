import axios from 'axios';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Event } from '@/models/event';
import type { Tournament } from '@/models/tournament';

const groupBy = (items: Event[], key: string) => items.reduce<Record<number, Event[]>>(
  (result, item) => ({
    ...result,
    [item[key] as number]: [
      ...(result[item[key] as number] || []),
      item,
    ],
  }),
  {},
);

export const useTournamentStore = defineStore('tournament', () => {
  const events = ref<Record<number, Event[]>>({});
  const event = ref<Event[]>([]);
  const tournaments = ref<Record<number, Tournament>>({});
  const tournament = ref<Tournament>();

  async function fetchEvents() {
    try {
      const res = await axios.get<Event[]>('/tournament/event');
      const ev = res.data;
      events.value = groupBy(ev, 'year');
      // console.log(years)
    } catch (error) {
      // console.log(error);
    }
  }

  async function fetchThisYear() {
    const year = new Date().getFullYear();
    const res = await axios.get<Event[]>(`/tournament/event/year/${year}`);
    event.value = res.data;
    // console.log(res.data)
  }

  async function fetchTournaments(ids: number[]) {
    const promises = ids.map<Promise<Tournament | Error>>((id) => axios.get<Tournament>(`/tournament/tournament/${id}`).then((res) => res.data).catch((err: Error) => err));

    const data = await Promise.all<Tournament | Error>(promises);

    data.forEach((e, id) => {
      if (!(e instanceof Error)) {
        tournaments.value[ids[id]] = e;
      }
    });
  }

  async function fetchTournamentFull(id: number) {
    try {
      const res = await axios.get<Tournament>(`/tournament/tournament/${id}/full`);
      tournament.value = res.data;
      // console.log(res.data);
    } catch (error) {
      // console.log(error);
    }
  }

  async function fetchTournament(id: number) {
    try {
      const res = await axios.get<Tournament>(`/tournament/tournament/${id}`);
      tournament.value = res.data;
      // console.log(res.data);
    } catch (error) {
      // console.log(error);
    }
  }

  function $reset() {
    event.value = [];
    events.value = {};
    tournament.value = undefined;
    tournaments.value = {};
  }

  // const archives = computed(() => events.value.filter((event) => event.year <= new Date().getFullYear()))
  return {
    events,
    event,
    tournaments,
    tournament,
    fetchEvents,
    fetchTournament,
    fetchTournamentFull,
    fetchThisYear,
    fetchTournaments,
    $reset,
  };
});

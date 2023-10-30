import axios from 'axios';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { Event } from '@/models/event';
import type { Tournament } from '@/models/tournament';

const groupBy = <T extends object, K extends keyof T>(items: T[], key: K) => items.reduce((result, item) => ({
  ...result,
  [item[key]]: [
    ...(result[item[key]] || []),
    item,
  ],
}), {} as Record<T[K], T[]>);

export const useTournamentStore = defineStore('tournament', () => {
  const events = ref<Record<number, Event>>({});
  const tournaments = ref<Record<number, Tournament>>({});

  async function fetchAllEvents() {
    try {
      const res = await axios.get<Event[]>('/tournament/event');
      res.data.forEach((ev) => { events.value[ev.id] = ev; });
      // console.log(years)
    } catch (err: any) {
      // console.log(error);
    }
  }

  async function fetchEventsByYear(year: number) {
    try {
      const res = await axios.get<Event[]>(`tournament/event/year/${year}`);
      res.data.forEach((ev) => { events.value[ev.id] = ev; });
    } catch (err: any) {
      /* empty */
    }
  }

  async function fetchEventsByYears(years: number[]) {
    await Promise.all<void>(years.map<Promise<void>>((year) => fetchEventsByYear(year)));
  }

  async function fetchThisYear() {
    const year = new Date().getFullYear();
    await fetchEventsByYear(year);
  }

  async function fetchEventById(id: number) {
    try {
      const res = await axios<Event>(`tournament/event/${id}`);
      events.value[id] = res.data;
    } catch (err: any) {
      /* empty */
    }
  }

  async function fetchEventByIds(ids: number[]) {
    await Promise.all<void>(ids.map<Promise<void>>((id) => fetchEventById(id)));
  }

  async function fetchOngoingEvents() {
    const res = await axios<Event[]>('tournament/event/ongoing');
    res.data.forEach((ev) => { events.value[ev.id] = ev; });
  }

  const getEvent = computed(() => async (id: number) => {
    if (!(id in events.value)) {
      await fetchEventById(id);
    }
    return events.value[id];
  });

  const getEvents = computed(() => async (ids: number[]) => {
    const res = ref<Record<number, Event>>({});
    const missing: number[] = [];
    ids.forEach((id) => {
      if (!(id in events.value)) {
        missing.push(id);
      }
    });
    if (missing.length > 0) {
      await fetchEventByIds(missing);
    }
    ids.forEach((id) => { res.value[id] = events.value[id]; });
    return res;
  });

  const getEventsByYears = computed(() => async (years: number[]) => {
    await fetchEventsByYears(years);
    const groups = groupBy(Object.values(events.value), 'year');
    const res = ref<Record<number, Event[]>>({});
    years.forEach((year) => {
      res.value[year] = groups[year];
    });
    return res;
  });

  const getOngoingEvents = computed(async () => {
    await fetchOngoingEvents();
    const res = ref<Map<number, Event>>(new Map<number, Event>());
    Object.values(events.value).forEach((ev) => {
      if (ev.ongoing) {
        res.value.set(ev.id, ev);
      }
    });
    return res;
  });

  /* **************
   * Tournaments  *
   ************** */
  async function fetchTournament(id: number) {
    try {
      const res = await axios.get<Tournament>(`/tournament/tournament/${id}`);
      tournaments.value[id] = res.data;
    } catch (error) {
      /* empty */
    }
  }

  async function fetchTournaments(ids: number[]) {
    await Promise.all<void>(ids.map<Promise<void>>((id) => fetchTournament(id)));
  }

  async function fetchTournamentFull(id: number) {
    try {
      const res = await axios.get<Tournament>(`/tournament/tournament/${id}/full`);
      tournaments.value[id] = res.data;
      // console.log(res.data);
    } catch (error) {
      // console.log(error);
    }
  }

  async function fetchTournamentsFull(ids: number[]) {
    await Promise.all<void>(ids.map<Promise<void>>((id) => fetchTournamentFull(id)));
  }

  const getTournament = computed(() => async (id: number) => {
    if (!(id in tournaments.value)) {
      await fetchTournament(id);
    }
    return tournaments.value[id];
  });

  const getTournaments = computed(() => async (ids: number[]) => {
    const res = ref<Tournament[]>([]);
    const missing: number[] = [];
    ids.forEach((id) => {
      if (!(id in tournaments.value)) {
        missing.push(id);
      }
    });
    if (missing.length > 0) {
      await fetchTournaments(missing);
    }
    ids.forEach((id) => { res.value.push(tournaments.value[id]); });
    return res;
  });

  const getTournamentFull = computed(() => async (id: number) => {
    if (!(id in tournaments.value) || typeof tournaments.value[id].event === 'number') {
      await fetchTournamentFull(id);
    }
    return tournaments.value[id];
  });

  const getTournamentsFull = computed(() => async (ids: number[]) => {
    const res = ref<Tournament[]>([]);
    const missing: number[] = [];
    ids.forEach((id) => {
      if (!(id in tournaments.value) || typeof tournaments.value[id].event === 'number') {
        missing.push(id);
      }
    });
    if (missing.length > 0) {
      await fetchTournamentsFull(missing);
    }
    ids.forEach((id) => { res.value.push(tournaments.value[id]); });
    return res;
  });

  function $reset() {
    events.value = {};
    tournaments.value = {};
  }

  // const archives = computed(() => events.value.filter((event) => event.year <= new Date().getFullYear()))
  return {
    events,
    tournaments,
    getEvent,
    getEvents,
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
    $reset,
  };
});

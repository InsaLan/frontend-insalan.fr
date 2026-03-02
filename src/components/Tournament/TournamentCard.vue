<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onMounted } from 'vue';
import type { EventTournament, EventTournamentDeref } from '@/models/tournament';
import { useTournamentStore } from '@/stores/tournament.store';

const tournamentStore = useTournamentStore();

const props = defineProps<{
  id: number;
}>();

const { getTournament, getTournamentTeams } = tournamentStore;
const { eventTournamentsList, eventsList, tourney_teams } = storeToRefs(tournamentStore);
const tournament = computed<EventTournament | EventTournamentDeref | undefined>(
  () => eventTournamentsList.value[props.id],
);
const event_ongoing = computed(() => {
  if (tournament.value === undefined) {
    return false;
  }

  let event_id;
  if (typeof tournament.value.event === 'number') {
    event_id = tournament.value.event;
  } else {
    event_id = tournament.value.event.id;
  }

  const event = eventsList.value[event_id];

  return event === undefined ? false : event.ongoing;
});

const thresholds = computed(() => tournament.value?.max_team_thresholds ?? [0]);
const current_threshold_index = computed(() => tournament.value?.current_threshold_index ?? 0);

const available_thresholds = computed(() => current_threshold_index.value < thresholds.value.length - 1);

const max_teams = computed(() => {
  if (tournament.value === undefined) { return 1; }

  if (available_thresholds.value) {
    return thresholds.value[current_threshold_index.value + 1];
  }
  return thresholds.value[current_threshold_index.value];
});
const max_validated_teams = computed(() => thresholds.value
  .at(current_threshold_index.value) ?? 0);
const validated_teams_proportion = computed(() => (max_validated_teams.value / max_teams.value) * 100);
const is_threshold_full = computed(
  () => tournament.value?.validated_teams === thresholds.value.at(current_threshold_index.value),
);

onMounted(async () => {
  await getTournament(props.id);
  getTournamentTeams();
});
</script>
<template>
  <div v-if="tournament?.is_announced" class="grid place-items-center gap-2 bg-cyan-900 shadow-lg">
    <img
      :alt="`Logo du ${tournament?.name}`"
      :src="tournament?.logo"
      class="max-w-screen aspect-video text-clip"
    />
    <p class="text-lg">
      Équipes :
    </p>
    <div class="w-4/5">
      <div class="relative flex h-6 w-full items-center justify-center rounded-2xl bg-white text-lg text-black">
        <template
          v-if="is_threshold_full && available_thresholds"
        >
          <div
            class="tooltip-target z-[1] flex h-6 items-center justify-center rounded-s-2xl bg-green-600"
            :style="{ width: `${validated_teams_proportion}%` }"
            aria-describedby="validated_teams_tooltip"
          >
            {{ tournament?.validated_teams }}/{{ thresholds[current_threshold_index] }}
            <span
              id="validated_teams_tooltip"
              role="tooltip"
              class="tooltip-text invisible absolute top-8 rounded-md border border-white bg-theme-bg px-3 py-2 text-white opacity-0 transition duration-300"
            >
              {{ tournament?.validated_teams }}/{{ thresholds[current_threshold_index] }} équipes validées
            </span>
          </div>
          <span
            class="tooltip-target z-[1] flex justify-center"
            :style="{ width: `${((thresholds[current_threshold_index + 1] - thresholds[current_threshold_index]) / max_teams) * 100}%` }"
            aria-describedby="waiting_validation_teams_tooltip"
          >
            {{ tourney_teams.waiting_validation_teams.length }}/{{ thresholds[current_threshold_index + 1]
              - thresholds[current_threshold_index] }}
            <span
              id="waiting_validation_teams_tooltip"
              role="tooltip"
              class="tooltip-text invisible absolute top-8 w-36 rounded-md border border-white bg-theme-bg px-3 py-2 text-center text-white opacity-0 transition duration-300"
            >
              {{ tourney_teams.waiting_validation_teams.length }}/{{ thresholds[current_threshold_index + 1]
                - thresholds[current_threshold_index] }} en attente du palier
            </span>
          </span>
          <!--  -->
          <div
            class="absolute left-0 h-6 rounded-2xl bg-blue-800 opacity-80"
            :style="{ width: `${((tournament?.validated_teams + tourney_teams.waiting_validation_teams.length) / max_teams) * 100}%` }"
          />
        </template>
        <template
          v-else
        >
          <div
            class="absolute left-0 h-6 rounded-2xl bg-green-600"
            :style="{ width: `${(tournament?.validated_teams / max_validated_teams) * 100}%` }"
          />
          <span
            class="tooltip-target z-[1] flex justify-center"
            aria-describedby="validated_teams_tooltip"
          >
            {{ tournament?.validated_teams }}/{{ thresholds[current_threshold_index] }}
            <span
              id="validated_teams_tooltip"
              role="tooltip"
              class="tooltip-text invisible absolute top-8 rounded-md border border-white bg-theme-bg px-3 py-2 text-white opacity-0 transition duration-300"
            >
              {{ tournament?.validated_teams }}/{{ thresholds[current_threshold_index] }} équipes validées
            </span>
          </span>
        </template>
      </div>
    </div>
    <p class="text-lg">
      Cashprize :
      {{ tournament?.cashprizes?.length !== 0 ? `${tournament?.cashprizes?.reduce((acc, val) => acc += Number(val), 0)} €` : "À venir" }}
    </p>
    <div class="mb-3 flex w-4/5 justify-center gap-3 text-center">
      <router-link :to="`tournament/${tournament?.id as number}/info`" class="rounded border-2 border-green-600 p-2 text-lg hover:border-green-500">
        Plus d'infos
      </router-link>
      <button v-if="Date.parse(tournament?.registration_open) > Date.now()" type="button" class="rounded bg-green-600 p-2 text-lg opacity-60" disabled>
        Inscriptions à venir
      </button>
      <router-link
        v-else-if="event_ongoing && Date.parse(tournament?.registration_close) > Date.now()"
        :to="`tournament/${tournament?.id as number}/register`"
        class="rounded bg-green-600 p-2 text-lg hover:bg-green-500"
      >
        S'inscrire
      </router-link>
      <button v-else type="button" class="rounded bg-green-600 p-2 text-lg opacity-60" disabled>
        Inscriptions fermées
      </button>
    </div>
  </div>
  <!-- Placeholder when the tournament is not announced -->
  <div v-else class="grid place-items-center gap-2 bg-cyan-900 shadow-lg">
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 512 512"
      xml:space="preserve"
      class="aspect-video py-10"
    >
      <desc>
        Question mark
      </desc>
      <g>
        <path
          class="fill-white"
          d="M396.138,85.295c-13.172-25.037-33.795-45.898-59.342-61.03C311.26,9.2,280.435,0.001,246.98,0.001
          c-41.238-0.102-75.5,10.642-101.359,25.521c-25.962,14.826-37.156,32.088-37.156,32.088c-4.363,3.786-6.824,9.294-6.721,15.056
          c0.118,5.77,2.775,11.186,7.273,14.784l35.933,28.78c7.324,5.864,17.806,5.644,24.875-0.518c0,0,4.414-7.978,18.247-15.88
          c13.91-7.85,31.945-14.173,58.908-14.258c23.517-0.051,44.022,8.725,58.016,20.717c6.952,5.941,12.145,12.594,15.328,18.68
          c3.208,6.136,4.379,11.5,4.363,15.574c-0.068,13.766-2.742,22.77-6.603,30.442c-2.945,5.729-6.789,10.813-11.738,15.744
          c-7.384,7.384-17.398,14.207-28.634,20.479c-11.245,6.348-23.365,11.932-35.612,18.68c-13.978,7.74-28.77,18.858-39.701,35.544
          c-5.449,8.249-9.71,17.686-12.416,27.641c-2.742,9.964-3.98,20.412-3.98,31.071c0,11.372,0,20.708,0,20.708
          c0,10.719,8.69,19.41,19.41,19.41h46.762c10.719,0,19.41-8.691,19.41-19.41c0,0,0-9.336,0-20.708c0-4.107,0.467-6.755,0.917-8.436
          c0.773-2.512,1.206-3.14,2.47-4.668c1.29-1.452,3.895-3.674,8.698-6.331c7.019-3.946,18.298-9.276,31.07-16.176
          c19.121-10.456,42.367-24.646,61.972-48.062c9.752-11.686,18.374-25.758,24.323-41.968c6.001-16.21,9.242-34.431,9.226-53.96
          C410.243,120.761,404.879,101.971,396.138,85.295z"
        />
        <path
          class="st0 fill-white"
          d="M228.809,406.44c-29.152,0-52.788,23.644-52.788,52.788c0,29.136,23.637,52.772,52.788,52.772
          c29.136,0,52.763-23.636,52.763-52.772C281.572,430.084,257.945,406.44,228.809,406.44z"
        />
      </g>
    </svg>
    <p class="text-center text-xl">
      Le tournoi sera annoncé prochainement !
    </p>
  </div>
</template>

<style>
  .tooltip-text::after {
    content: "";
    position: absolute;
    left: 50%;
    bottom: 100%;
    margin-left: -5px;
    border-width: 6px;
    border-style: solid;
    border-color: transparent transparent #2c292d transparent;
  }

  .tooltip-target:hover .tooltip-text {
    visibility: visible;
    opacity: 1;
  }
</style>

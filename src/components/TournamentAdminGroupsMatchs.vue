<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import {
  between,
  integer,
  required,
} from '@vuelidate/validators';
import { computed, ref } from 'vue';
import { type Match, MatchStatus } from '@/models/match';
import type { TournamentDeref } from '@/models/tournament';
import { useNotificationStore } from '@/stores/notification.store';
import { useTournamentStore } from '@/stores/tournament.store';

import FormField from './FormField.vue';
import Modal from './Modal.vue';

const { tournament } = defineProps<{
  tournament: TournamentDeref;
}>();

const NotificationStore = useNotificationStore();
const { addNotification } = NotificationStore;

const tournamentStore = useTournamentStore();
const {
  get_validated_team_by_id,
  get_matchs_per_round,
  launchMatchs,
} = tournamentStore;

const has_groups = computed(() => (tournament.groups.length ?? 0) > 0);
const has_matchs = computed(() => has_groups.value && (tournament.groups[0].matchs.length ?? 0) > 0);

const modal_open = ref(false);
const modal_type = ref('');
const open_modal = (type: string) => {
  modal_open.value = true;
  modal_type.value = type;
};

const round_to_launch = ref(1);
const round_rule = computed(() => ({
  round_to_launch: {
    required,
    integer,
    between: between(1, Math.max(...tournament.groups.map((group) => group.round_count))),
  },
}));

const v_round$ = useVuelidate(round_rule, { round_to_launch });

const open_launch_round_modal = async () => {
  if (!has_matchs.value) {
    addNotification('Il n\'existe pas de matchs.', 'info');
    return;
  }

  open_modal('launch_round');
};

const launch_round_matchs = async () => {
  const is_valid = await v_round$.value.$validate();

  if (!is_valid) return;

  await launchMatchs({ tournament: tournament.id, round: round_to_launch.value });

  addNotification(`Les matchs du round ${round_to_launch.value} ont bien été lancés.`, 'info');

  modal_open.value = false;
};

const max_round = computed(() => Math.max(...tournament.groups.map((group) => group.round_count)));

const selected_matchs = ref(new Set<number>());
const select_match = (match: Match) => {
  if (match.status === MatchStatus.SCHEDULED) {
    if (selected_matchs.value.has(match.id)) {
      selected_matchs.value.delete(match.id);
    } else {
      selected_matchs.value.add(match.id);
    }
  }
};

const launch_selected_matchs = async () => {
  if (!has_matchs.value) {
    addNotification('Il n\'existe pas de matchs.', 'info');
    return;
  }

  if (selected_matchs.value.size === 0) {
    addNotification('Aucun match sélectionné.', 'warn');
    return;
  }

  await launchMatchs({ tournament: tournament.id, matchs: Array.from(selected_matchs.value) }, 'group');

  selected_matchs.value.clear();

  addNotification('Les matchs ont bien été lancés.', 'info');
};
</script>

<template>
  <div
    class="m-4 flex flex-wrap justify-center gap-4 lg:mb-0 lg:gap-8"
  >
    <button
      type="button"
      class="rounded bg-blue-800 p-2 font-bold transition duration-150 ease-in-out"
      :class="[!has_matchs ? '-z-10 opacity-60' : 'hover:ring hover:ring-pink-500']"
      :disabled="!has_matchs"
      @click="open_launch_round_modal"
    >
      Lancer un round
    </button>
    <button
      type="button"
      class="rounded bg-blue-800 p-2 font-bold transition duration-150 ease-in-out"
      :class="[!has_matchs || selected_matchs.size === 0 ? '-z-10 opacity-60' : 'hover:ring hover:ring-pink-500']"
      :disabled="!has_matchs || selected_matchs.size === 0 "
      @click="launch_selected_matchs"
    >
      Lancer les matchs sélectionnés
    </button>
    <router-link
      :to="{ name: 'tournament_admin_groups' }"
      class="rounded bg-blue-800 p-2 font-bold transition duration-150 ease-in-out hover:ring hover:ring-pink-500"
    >
      Gérer les poules
    </router-link>
  </div>

  <div class="m-2 overflow-auto md:m-4 xl:m-8">
    <table
      class="w-full table-fixed"
    >
      <tr class="border-b-2">
        <th class="w-32 border-r-2 p-2">
          Poule
        </th>
        <th
          v-for="round in max_round"
          :key="round"
          :class="{ 'border-r': round < max_round }"
          class="w-56 xl:w-[34rem]"
        >
          Tour {{ round }}
        </th>
      </tr>
      <tr
        v-for="group in tournament.groups"
        :key="group.id"
        class="border-b"
      >
        <td class="border-r-2 text-center">
          {{ group.name }}
        </td>
        <td
          v-for="matchs in get_matchs_per_round(group.matchs).reverse()"
          :key="matchs[0].round_number"
          :class="{ 'border-r': matchs[0].round_number < max_round }"
          class=""
        >
          <div class="flex flex-wrap justify-around gap-2 p-2">
            <table
              v-for="match in matchs"
              :key="match.id"
              class="border-separate rounded border px-2 pb-2"
              :class="[
                selected_matchs.has(match.id)
                  ? 'border-4 border-blue-800'
                  : 'm-[3px]',
                match.status === MatchStatus.SCHEDULED && !selected_matchs.has(match.id)
                  ? 'hover:m-[2px] hover:border-2 hover:border-blue-800'
                  : '',
              ]"
              @click="select_match(match)"
              @keypress="select_match(match)"
            >
              <tr>
                <th
                  colspan="2"
                  class="border-b-2"
                >
                  <div
                    class="grid w-full grid-cols-[1fr,2fr,1fr]"
                  >
                    <span class="text-left">BO {{ match.bo_type }}</span>

                    <span v-if="match.status === MatchStatus.SCHEDULED" class="text-center text-blue-500">
                      <fa-awesome-icon
                        icon="fa-solid fa-clock"
                      />
                      Prévu
                    </span>
                    <span v-else-if="match.status === MatchStatus.ONGOING" class="text-center text-orange-500">
                      <fa-awesome-icon
                        icon="fa-solid fa-arrows-rotate"
                      />
                      En cours
                    </span>
                    <span v-else class="text-center text-green-500">
                      <fa-awesome-icon
                        icon="fa-solid fa-check"
                      />
                      Terminé
                    </span>
                  </div>
                </th>
              </tr>
              <tr
                v-for="team_id in match.teams"
                :key="team_id"
              >
                <td
                  class="w-52 truncate"
                >
                  {{ get_validated_team_by_id(team_id)?.name }}
                </td>
                <td
                  class="w-6 text-right"
                >
                  {{ match.score[team_id] }}
                </td>
              </tr>
            </table>
          </div>
        </td>
      </tr>
    </table>
  </div>

  <Modal v-if="modal_open && modal_type === 'launch_round'">
    <template #icon>
      <div/>
    </template>
    <template #title>
      <h3 class="text-white-900 text-base font-semibold leading-6">
        Lancer les matchs d'un round
      </h3>
    </template>
    <template #body>
      <form
        id="create_groups_form"
        class="m-4 flex flex-col gap-4"
        @submit.prevent="launch_round_matchs"
      >
        <FormField
          v-slot="context"
          :validations="v_round$.round_to_launch"
        >
          <label for="round">
            Numéro du round
          </label>
          <input
            id="round"
            v-model="round_to_launch"
            type="number"
            name="round"
            aria-label="Round number"
            class="ml-2 bg-inherit"
            :class="{ error: context.invalid }"
          >
        </FormField>
      </form>
    </template>
    <template #buttons>
      <button
        class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
        type="button"
        @click="launch_round_matchs"
      >
        Lancer le round
      </button>
      <button
        class="mt-3 inline-flex w-full justify-center rounded-md bg-gray-500 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-300 sm:mt-0 sm:w-auto"
        type="button"
        @click="modal_open = false;"
      >
        Annuler
      </button>
    </template>
  </Modal>
</template>

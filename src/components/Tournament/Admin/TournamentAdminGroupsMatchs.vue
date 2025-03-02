<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import {
  between,
  integer,
  required,
} from '@vuelidate/validators';
import { computed, ref } from 'vue';
import FormField from '@/components/FormField.vue';
import Modal from '@/components/Modal.vue';
import MatchCard from '@/components/Tournament/MatchCard.vue';
import { MatchTypeEnum } from '@/models/match';
import type { TournamentDeref } from '@/models/tournament';
import { useNotificationStore } from '@/stores/notification.store';
import { useTournamentStore } from '@/stores/tournament.store';

const { tournament } = defineProps<{
  tournament: TournamentDeref;
}>();

const NotificationStore = useNotificationStore();
const { addNotification } = NotificationStore;

const tournamentStore = useTournamentStore();
const {
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

  await launchMatchs({ tournament: tournament.id, round: round_to_launch.value }, 'group');

  addNotification(`Les matchs du round ${round_to_launch.value} ont bien été lancés.`, 'info');

  modal_open.value = false;
};

const max_round = computed(() => Math.max(...tournament.groups.map((group) => group.round_count)));

const selected_matchs = ref(new Set<number>());

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
    <router-link
      :to="{ name: 'tournament_admin_groups' }"
      class="rounded bg-blue-800 p-2 font-bold transition duration-150 ease-in-out hover:ring hover:ring-pink-500"
    >
      <fa-awesome-icon
        icon="fa-solid fa-arrow-left"
      />
      Gérer les poules
    </router-link>
    <button
      type="button"
      class="rounded bg-blue-800 p-2 font-bold transition duration-150 ease-in-out"
      :class="[!has_matchs ? '-z-10 opacity-60' : 'hover:ring hover:ring-pink-500']"
      :disabled="!has_matchs"
      @click="open_launch_round_modal"
    >
      Lancer un tour
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
  </div>

  <div
    v-if="has_groups"
    class="m-2 flex justify-center md:m-4 xl:m-8"
  >
    <div
      class="overflow-x-auto"
    >
      <div
        class="grid"
        :style="{ 'grid-template-columns': `6rem repeat(${max_round}, 18rem)` }"
      >
        <span class="border-b-2 border-r-2 p-2 text-center text-xl">
          Poule
        </span>
        <div
          v-for="round in max_round"
          :key="round"
          class="border-b-2 border-r text-center text-xl"
        >
          Tour {{ round }}
        </div>
        <template
          v-for="group in tournament.groups"
          :key="group.id"
        >
          <div
            class="flex items-center justify-center text-wrap border-b border-r-2 text-xl"
          >
            {{ group.name }}
          </div>
          <div
            v-for="matchs in get_matchs_per_round(group.matchs).reverse()"
            :key="matchs[0].round_number"
            class="border-b border-r"
          >
            <div class="flex flex-wrap justify-around p-1">
              <MatchCard
                v-for="match in matchs"
                :key="match.id"
                v-model="selected_matchs"
                :match="match"
                :match-type="{ type: MatchTypeEnum.GROUP, id: match.group }"
                :team-per-match="tournament.game.team_per_match"
                :editable="true"
                :selectable="true"
                class="grow"
              />
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>

  <Modal v-if="modal_open && modal_type === 'launch_round'">
    <template #icon>
      <div/>
    </template>
    <template #title>
      <h3 class="text-white-900 text-base font-semibold leading-6">
        Lancer les matchs d'un tour
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
            Numéro du tour
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
        Lancer le tour
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

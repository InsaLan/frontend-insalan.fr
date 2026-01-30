<script setup lang="ts">
import useVuelidate from '@vuelidate/core';
import { storeToRefs } from 'pinia';
import { computed, reactive, ref } from 'vue';
import FormField from '@/components/FormField.vue';
import Modal from '@/components/Modal.vue';
import AdminBracket from '@/components/Tournament/Admin/AdminBracket.vue';
import AdminGroups from '@/components/Tournament/Admin/AdminGroups.vue';
import AdminGroupsMatchs from '@/components/Tournament/Admin/AdminGroupsMatchs.vue';
import AdminSwiss from '@/components/Tournament/Admin/AdminSwiss.vue';
import TournamentBrackets from '@/components/Tournament/TournamentBrackets.vue';
import TournamentGroups from '@/components/Tournament/TournamentGroups.vue';
import TournamentSwiss from '@/components/Tournament/TournamentSwiss.vue';
import { BracketType } from '@/models/bracket';
import { BestofType } from '@/models/match';
import type { Stage } from '@/models/stage';
import type { EventTournamentDeref, PrivateTournament } from '@/models/tournament';
import { useNotificationStore } from '@/stores/notification.store';
import { useTournamentStore } from '@/stores/tournament.store';
import {
  between,
  integer,
  maxLength,
  minLength,
  minValue,
  required,
} from '@/support/locales/errors.fr';

const { tournament } = defineProps<{
  tournament: EventTournamentDeref | PrivateTournament;
}>();

const { addNotification } = useNotificationStore();

const {
  createBracket,
  createGroups,
  createSwiss,
  createStage,
  updateStage,
  deleteStage,
} = useTournamentStore();

const { tourney_teams } = storeToRefs(useTournamentStore());
const validated_teams_count = tourney_teams.value.validated_teams.length;

const selected_stage = ref(tournament.stages.at(0)?.id ?? 0);
const selected_stage_name = computed(() => tournament.stages.filter((s) => s.id === selected_stage.value).at(0)?.name ?? '');

const brackets = computed(() => tournament.brackets.filter((b) => b.stage === selected_stage.value));
const groups = computed(() => tournament.groups.filter((b) => b.stage === selected_stage.value));
const swiss_rounds = computed(() => tournament.swissRounds.filter((b) => b.stage === selected_stage.value));

const show_groups_matchs = ref(false);

const create_stage_modal = ref(false);
const edit_stage = ref(0);
const delete_stage_id = ref(0);

const stage_data = reactive({
  name: '',
  index: tournament.stages.length + 1,
});
const stage_rules = computed(() => ({
  name: { required },
  index: {},
}));

const v$ = useVuelidate(stage_rules, stage_data, { $scope: false });

const create_stage = async () => {
  const is_valid = await v$.value.$validate();

  if (!is_valid) return;

  const res = await createStage({ tournament: tournament.id, ...stage_data });

  if (res) addNotification('La phase a bien été crée.', 'info');

  create_stage_modal.value = false;
};

const update_stage = async (stage_id: number) => {
  const res = await updateStage({
    id: stage_id,
    name: stage_data.name,
    index: (tournament.stages.filter((s: Stage) => s.id === stage_id).at(0) as Stage).index,
  });

  if (res) addNotification('La phase a bien été mise à jour.', 'info');

  edit_stage.value = 0;
};

const delete_stage = async (stage_id: number) => {
  const res = await deleteStage(stage_id);

  if (res) addNotification('La phase a bien été supprimée.', 'info');

  delete_stage_id.value = 0;
  // eslint-disable-next-line prefer-destructuring
  selected_stage.value = tournament.stages.at(0)?.id ?? 0;
};

const add_format_modal = ref(false);
const format_type = ref('');

const bracket_data = reactive({
  name: '',
  team_count: 0,
  bracket_type: BracketType.SINGLE,
  bo_type: BestofType.BO1,
});
const bracket_rules = computed(() => ({
  name: { required },
  team_count: { required, between: between(2, validated_teams_count) },
  bracket_type: { required },
  bo_type: { required },
}));

const v_bracket$ = useVuelidate(bracket_rules, bracket_data, { $scope: false });

const add_bracket = async () => {
  const is_valid = await v_bracket$.value.$validate();

  if (!is_valid) return;

  const res = await createBracket(selected_stage.value, bracket_data);

  if (res) addNotification(`L'arbre ${bracket_data.name} a bien été créé.`, 'info');

  add_format_modal.value = false;
};

const group_data = reactive({
  count: 0,
  team_per_group: 0,
  names: [''],
  use_seeding: false,
  auto_fill: false,
});

const update_names = (event: Event) => {
  const names = (event.target as HTMLInputElement)?.value.split(',');
  names.forEach((el) => el.trim());
  group_data.names = names;
};

const rules_group = computed(() => ({
  count: {
    required,
    integer,
    between: between(1, (validated_teams_count ?? 0) / 2),
  },
  team_per_group: {
    required,
    integer,
    between: between(2, validated_teams_count),
  },
  names: { minLength: minLength(group_data.count) },
  use_seeding: { required },
  auto_fill: { required },
}));

const v_group$ = useVuelidate(rules_group, group_data, { $scope: false });

const add_groups = async () => {
  const is_valid = await v_group$.value.$validate();

  if (!is_valid) return;

  const res = await createGroups(selected_stage.value, group_data);

  if (res) addNotification('Les poules ont bien été créées.', 'info');

  add_format_modal.value = false;
};

const swiss_data = reactive({
  name: '',
  min_score: 0,
  use_seeding: false,
  bo_type: BestofType.BO1,
  auto_fill: false,
  team_count: 1,
});
const swiss_rules = computed(() => ({
  name: { required, maxLength: maxLength(40) },
  min_score: { integer, required, minValue: minValue(1) },
  use_seeding: { required },
  bo_type: { required },
  auto_fill: { required },
  team_count: { required, between: between(1, validated_teams_count) },
}));

const v_swiss$ = useVuelidate(swiss_rules, swiss_data, { $scope: false });

const add_swiss = async () => {
  const is_valid = await v_swiss$.value.$validate();

  if (!is_valid) return;

  const res = await createSwiss(selected_stage.value, swiss_data);

  if (res) addNotification('La ronde suisse a bien été créées.', 'info');

  add_format_modal.value = false;
};

const add_format = async () => {
  switch (format_type.value) {
    case 'bracket':
      await add_bracket();
      break;
    case 'group':
      await add_groups();
      break;
    case 'swiss':
      await add_swiss();
      break;
    default:
  }
};

const has_formats = computed(() => !(
  tournament.groups.length === 0
  && tournament.swissRounds.length === 0
  && tournament.brackets.length === 0));
const selected_format = ref('group');
</script>

<template>
  <section
    id="stages"
    class="my-3"
    :class="{ 'flex flex-1 items-center justify-center': !has_formats }"
  >
    <template
      v-if="tournament.stages.length === 0"
    >
      <h1
        v-if="!has_formats"
        class="text-2xl"
      >
        Les phases du tournoi ne sont pas encore disponibles.
      </h1>

      <template
        v-else
      >
        <div class="mb-3 flex flex-wrap justify-center gap-x-8 gap-y-2">
          <button
            v-for="(format_name, format) in { group: 'Poules', swiss: 'Ronde Suisse', bracket: 'Arbres' }"
            :key="format"
            type="button"
            class="rounded-lg bg-cyan-900 p-2 transition duration-150 ease-in-out hover:ring-2 hover:ring-[#63d1ff]"
            :class="{ 'ring-2 ring-[#63d1ff]': format === selected_format }"
            @click="selected_format = format"
          >
            {{ format_name }}
          </button>
        </div>

        <hr class="m-auto w-4/5">

        <TournamentBrackets
          v-if="selected_format === 'bracket'"
          :tournament="tournament"
        />

        <TournamentGroups
          v-if="selected_format === 'group'"
          :tournament="tournament"
        />

        <TournamentSwiss
          v-if="selected_format === 'swiss'"
          :tournament="tournament"
        />
      </template>
    </template>

    <template
      v-else
    >
      <div
        class="mb-3 flex flex-wrap justify-center gap-x-8 gap-y-4"
      >
        <button
          v-for="stage in tournament.stages"
          :key="stage.id"
          type="button"
          class="rounded-lg bg-cyan-900 p-2 transition duration-150 ease-in-out hover:ring-2 hover:ring-[#63d1ff]"
          :class="{ 'ring-2 ring-[#63d1ff]': stage.id === selected_stage }"
          @click="selected_stage = stage.id"
        >
          <div
            v-if="edit_stage === stage.id"
            class="flex items-center justify-between gap-1.5"
          >
            <input
              id="stage_name"
              v-model="stage_data.name"
              name="stage_name"
              type="text"
              class="bg-inherit p-0 text-center"
              :size="stage_data.name.length"
              @click.stop
            >
            <fa-awesome-icon
              class="text-green-700 hover:cursor-pointer hover:text-green-900"
              icon="fa-solid fa-save"
              size="sm"
              title="Sauvegarder la phase"
              @click.stop="update_stage(stage.id)"
            />
            <fa-awesome-icon
              class="text-red-500 hover:cursor-pointer hover:text-red-700"
              icon="fa-solid fa-xmark"
              size="md"
              title="Annuler"
              @click.stop="edit_stage = 0"
            />
          </div>
          <div
            v-else
            class="flex items-center justify-between gap-1.5"
          >
            {{ stage.name }}
            <fa-awesome-icon
              class="hover:cursor-pointer hover:text-gray-500"
              icon="fa-solid fa-pencil"
              size="2xs"
              title="Éditer la phase"
              @click.stop="edit_stage = stage.id; stage_data.name = stage.name"
            />
            <fa-awesome-icon
              class="text-red-500 hover:cursor-pointer hover:text-red-700"
              icon="fa-solid fa-trash-can"
              size="sm"
              title="Supprimer la phase"
              @click.stop="delete_stage_id = stage.id"
            />
          </div>
        </button>
      </div>
      <div class="mb-3 flex flex-wrap justify-center gap-x-8 gap-y-4">
        <button
          type="button"
          class="rounded bg-blue-800 p-2 text-xl transition duration-150 ease-in-out hover:ring hover:ring-pink-500"
          @click="create_stage_modal = true"
        >
          Nouvelle Phase
        </button>
        <button
          type="button"
          class="rounded bg-blue-800 p-2 text-xl transition duration-150 ease-in-out hover:ring hover:ring-pink-500"
          @click="add_format_modal = true"
        >
          Ajouter un format
        </button>
      </div>

      <hr class="m-auto w-4/5">

      <section
        v-if="groups.length !== 0"
        id="groups"
        class="m-4 flex flex-col justify-center gap-2"
      >
        <AdminGroupsMatchs
          v-if="show_groups_matchs"
          v-model="show_groups_matchs"
          :groups="groups"
        />
        <AdminGroups
          v-else
          v-model="show_groups_matchs"
          :groups="groups"
        />
      </section>

      <section
        v-if="swiss_rounds.length !== 0"
        id="swiss_rounds"
      >
        <AdminSwiss
          v-for="swiss in swiss_rounds"
          :key="swiss.id"
          :swiss="swiss"
        />
      </section>

      <section
        v-if="brackets.length !== 0"
        id="brackets"
      >
        <AdminBracket
          v-for="bracket in brackets"
          :key="bracket.id"
          :bracket="bracket"
        />
      </section>
    </template>
  </section>

  <Modal
    v-if="create_stage_modal"
  >
    <template #icon>
      <div/>
    </template>
    <template #title>
      <h3 class="text-white-900 text-base font-semibold leading-6">
        Nouvelle phase de tournoi
      </h3>
    </template>
    <template #body>
      <form
        id="create_phase"
        class="mt-4"
        @submit.prevent="create_stage()"
      >
        <FormField
          v-slot="context"
          :validations="v$.name"
        >
          <label for="stage_name">
            Nom de la phase :
          </label>
          <input
            id="stage_name"
            v-model="stage_data.name"
            type="text"
            name="stage_name"
            aria-label="Stage's name"
            class="bg-inherit"
            :class="{ error: context.invalid }"
            @blur="v$.name.$touch"
          />
        </FormField>
        <button class="hidden" type="submit"/>
      </form>
    </template>
    <template #buttons>
      <button
        class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
        type="button"
        @click="create_stage()"
      >
        Valider
      </button>
      <button
        class="mt-3 inline-flex w-full justify-center rounded-md bg-gray-500 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-300 sm:mt-0 sm:w-auto"
        type="button"
        @click="create_stage_modal = false"
      >
        Annuler
      </button>
    </template>
  </Modal>

  <Modal v-if="delete_stage_id !== 0">
    <template #title>
      <h3 class="text-white-900 text-base font-semibold leading-6">
        Supprimer la phase
      </h3>
    </template>
    <template #body>
      La phase va être supprimée ainsi que tous les formats qui lui sont liés.
    </template>
    <template #buttons>
      <button
        class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
        type="button"
        @click="delete_stage(delete_stage_id)"
      >
        Valider
      </button>
      <button
        class="mt-3 inline-flex w-full justify-center rounded-md bg-gray-500 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-300 sm:mt-0 sm:w-auto"
        type="button"
        @click="delete_stage_id = 0;"
      >
        Annuler
      </button>
    </template>
  </Modal>

  <Modal
    v-if="add_format_modal"
  >
    <template #icon>
      <div/>
    </template>
    <template #title>
      <h3 class="text-white-900 text-base font-semibold leading-6">
        Ajouter un format à {{ selected_stage_name }}
      </h3>
    </template>
    <template #body>
      <form
        id="add_format"
        class="m-4 flex flex-col gap-4"
        @submit.prevent="add_format()"
      >
        <div>
          <label for="format_type">
            Type de format
          </label>
          <select
            id="format_type"
            v-model="format_type"
            name="format_type"
            class="bg-theme-bg"
          >
            <option value="bracket">
              Arbre
            </option>
            <option value="group">
              Poules
            </option>
            <option value="swiss">
              Ronde suisse
            </option>
          </select>
        </div>
        <div
          v-if="format_type === 'bracket'"
          class="flex flex-col gap-4"
        >
          <FormField
            v-slot="context"
            :validations="v_bracket$.name"
          >
            <label for="bracket_name">
              Nom de l'arbre
            </label>
            <input
              id="bracket_name"
              v-model="bracket_data.name"
              type="text"
              name="bracket_name"
              aria-label="Bracket's name"
              class="ml-2 bg-inherit"
              :class="{ error: context.invalid }"
              @blur="v_bracket$.name.$touch"
            />
          </FormField>
          <FormField
            v-slot="context"
            :validations="v_bracket$.bracket_type"
          >
            <label for="bracket_type">
              Type d'arbre
            </label>
            <select
              id="bracket_type"
              v-model="bracket_data.bracket_type"
              :class="{ error: context.invalid }"
              aria-label="Bracket's type"
              class="ml-2 bg-theme-bg"
              @blur="v_bracket$.bracket_type.$touch"
            >
              <option
                v-for="bracket_type in Object.keys(BracketType).filter((v) => !Number.isInteger(Number(v)))"
                :key="bracket_type"
                :value="bracket_type"
              >
                {{ bracket_type === BracketType.SINGLE ? 'Élimination direct' : 'Double élimination' }}
              </option>
            </select>
          </FormField>
          <FormField
            v-slot="context"
            :validations="v_bracket$.team_count"
          >
            <label for="bracket_team_count">
              Nombre d'équipes
            </label>
            <input
              id="bracket_team_count"
              v-model.number="bracket_data.team_count"
              name="bracket_team_count"
              class="ml-2 bg-inherit"
              type="number"
              :class="{ error: context.invalid }"
              @blur="v_bracket$.team_count.$touch"
            />
          </FormField>
          <FormField
            v-slot="context"
            :validations="v_bracket$.bo_type"
          >
            <label for="bo_type">
              Type de BO
            </label>
            <select
              id="bo_type"
              v-model="bracket_data.bo_type"
              name="bo_type"
              class="ml-2 bg-theme-bg"
              :class="{ error: context.invalid }"
              @blur="v_bracket$.bo_type.$touch"
            >
              <option
                v-for="value in Object.keys(BestofType).filter((v) => Number.isInteger(Number(v)))"
                :key="value"
                :value="value"
              >
                {{ value === '0' ? 'Classement' : `BO ${value}` }}
              </option>
            </select>
          </FormField>
        </div>
        <div
          v-if="format_type === 'group'"
          class="flex flex-col gap-4"
        >
          <FormField
            v-slot="context"
            :validations="v_group$.count"
            class="flex flex-col"
          >
            <div>
              <label for="group_count">
                Nombre de poules
              </label>
              <input
                id="group_count"
                v-model="group_data.count"
                :class="{ error: context.invalid }"
                aria-label="Group count"
                class="ml-2 bg-inherit"
                type="number"
                @blur="v_group$.count.$touch"
              >
            </div>
          </FormField>
          <FormField
            v-slot="context"
            :validations="v_group$.team_per_group"
            class="flex flex-col"
          >
            <div>
              <label for="team_per_group">
                Nombre d'équipes par poules
              </label>
              <input
                id="team_per_group"
                v-model="group_data.team_per_group"
                :class="{ error: context.invalid }"
                aria-label="Team per group"
                class="ml-2 bg-inherit"
                type="number"
                @blur="v_group$.team_per_group.$touch"
              >
            </div>
          </FormField>
          <FormField
            v-slot="context"
            :validations="v_group$.names"
            class="flex flex-col"
          >
            <label for="names">
              Noms des poules (Liste de noms séparées par des virgules)
            </label>
            <input
              id="names"
              :class="{ error: context.invalid }"
              aria-label="Group names"
              class="ml-2 bg-inherit"
              type="text"
              :value="group_data.names.join(',')"
              @input="update_names"
              @blur="v_group$.names.$touch"
            >
          </FormField>
          <FormField
            v-slot="context"
            :validations="v_group$.use_seeding"
            class="flex flex-col"
          >
            <div>
              <label for="auto_fill">
                Remplir automatiquement les poules
              </label>
              <input
                id="auto_fill"
                v-model="group_data.auto_fill"
                :class="{ error: context.invalid }"
                aria-label="Autofill groups at creation"
                class="ml-2 bg-inherit"
                type="checkbox"
                @blur="v_group$.auto_fill.$touch"
              >
            </div>
          </FormField>
          <FormField
            v-slot="context"
            :validations="v_group$.use_seeding"
            class="flex flex-col"
          >
            <div>
              <label for="seeding">
                Utiliser le seeding des équipes
              </label>
              <input
                id="seeding"
                v-model="group_data.use_seeding"
                :class="{ error: context.invalid }"
                :disabled="!group_data.auto_fill"
                aria-label="Use team seeding"
                class="ml-2 bg-inherit"
                type="checkbox"
                @blur="v_group$.use_seeding.$touch"
              >
            </div>
          </FormField>
        </div>
        <div
          v-if="format_type === 'swiss'"
          class="flex flex-col gap-4"
        >
          <FormField
            v-slot="context"
            :validations="v_swiss$.name"
          >
            <label for="swiss_name">
              Nom de la ronde suisse
            </label>
            <input
              id="swiss_name"
              v-model="swiss_data.name"
              type="text"
              aria-label="Name of the Swiss Round"
              class="ml-2 bg-inherit"
              :class="{ error: context.invalid }"
              @blur="v_swiss$.name.$touch"
            >
          </FormField>
          <FormField
            v-slot="context"
            :validations="v_swiss$.team_count"
          >
            <label for="swiss_team_count">
              Nombre d'équipes
            </label>
            <input
              id="swiss_team_count"
              v-model="swiss_data.team_count"
              type="number"
              name="swiss_team_count"
              aria-label="Number of teams"
              class="ml-2 bg-inherit"
              :class="{ error: context.invalid }"
              @blur="v_swiss$.team_count.touch"
            />
          </FormField>
          <FormField
            v-slot="context"
            :validations="v_swiss$.min_score"
          >
            <label for="min_score">
              Score de qualification
            </label>
            <input
              id="min_score"
              v-model="swiss_data.min_score"
              type="number"
              name="min_score"
              aria-label="Score for qualification"
              class="ml-2 bg-inherit"
              :class="{ error: context.invalid }"
              @blur="v_swiss$.min_score.$touch"
            />
          </FormField>
          <FormField
            v-slot="context"
            :validations="v_swiss$.use_seeding"
          >
            <label for="auto_fill">
              Remplir automatiquement la ronde suisse
            </label>
            <input
              id="auto_fill"
              v-model="swiss_data.auto_fill"
              :class="{ error: context.invalid }"
              aria-label="Autofill swiss round at creation"
              class="ml-2 bg-inherit"
              type="checkbox"
              @blur="v_swiss$.auto_fill.$touch"
            >
          </FormField>
          <FormField
            v-slot="context"
            :validations="v_swiss$.use_seeding"
          >
            <label for="seeding">
              Utiliser le seeding des équipes
            </label>
            <input
              id="seeding"
              v-model="swiss_data.use_seeding"
              :class="{ error: context.invalid }"
              :disabled="!swiss_data.auto_fill"
              aria-label="Use team seeding"
              class="ml-2 bg-inherit"
              type="checkbox"
              @blur="v_swiss$.use_seeding.$touch"
            >
          </FormField>
          <FormField
            v-slot="context"
            :validations="v_swiss$.bo_type"
          >
            <label for="bo_type">
              Type de BO
            </label>
            <select
              id="bo_type"
              v-model="swiss_data.bo_type"
              name="bo_type"
              class="ml-2 bg-theme-bg"
              :class="{ error: context.invalid }"
              @blur="v_swiss$.bo_type.$touch"
            >
              <option
                v-for="value in Object.keys(BestofType).filter((v) => Number.isInteger(Number(v)))"
                :key="value"
                :value="value"
              >
                {{ value === '0' ? 'Classement' : `BO ${value}` }}
              </option>
            </select>
          </FormField>
        </div>
        <button class="hidden" type="submit"/>
      </form>
    </template>
    <template #buttons>
      <button
        class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
        type="button"
        @click="add_format()"
      >
        Valider
      </button>
      <button
        class="mt-3 inline-flex w-full justify-center rounded-md bg-gray-500 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-300 sm:mt-0 sm:w-auto"
        type="button"
        @click="add_format_modal = false"
      >
        Annuler
      </button>
    </template>
  </Modal>
</template>

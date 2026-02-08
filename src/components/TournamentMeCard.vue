<script setup lang="ts">
import { useVuelidate, type ValidationRule } from '@vuelidate/core';
import { computed, reactive, ref } from 'vue';
import FormField from '@/components/FormField.vue';
import Modal from '@/components/Modal.vue';
import { BestofType, type OngoingMatch, type ScorePatch } from '@/models/match';
import { useUserStore } from '@/stores/user.store';
import { between, required } from '@/support/locales/errors.fr';

interface Props {
  ongoingMatch: OngoingMatch;
}

const props = defineProps<Props>();

const userStore = useUserStore();
const { send_score } = userStore;

const modal_enter_score = ref(false);
const modal_enter_times = ref(false);
const invalid_score = ref('');

const max_score = computed(() => {
  if (props.ongoingMatch.bo_type === BestofType.RANKING) {
    return Object.keys(props.ongoingMatch.teams).length;
  }
  return props.ongoingMatch.bo_type as number;
});

const data_score: { score: { [id: number]: number }; times: number[] } = reactive({
  score: Object.keys(props.ongoingMatch.teams).reduce((res, team) => {
    res[Number(team)] = 0;
    return res;
  }, {} as Record<number, number>),
  times: [],
});

const game_number = computed(() => {
  if (props.ongoingMatch.bo_type === BestofType.RANKING) {
    return 1;
  }
  return Object.values(data_score.score).reduce((a, b) => a + b, 0);
});

const rules_score = computed(() => ({
  score: Object.entries(data_score.score).reduce((res, team) => {
    res[Number(team[0])] = {
      between: between(0, max_score.value),
    };
    return res;
  }, {} as Record<number, { between: ValidationRule }>),
  times: { required },
}));

const v$_time_game = useVuelidate(rules_score, data_score);

const openScoreModal = () => {
  Object.keys(props.ongoingMatch.teams).forEach((id) => {
    data_score.score[parseInt(id, 10)] = 0;
  });
  modal_enter_score.value = true;
};

const closeModalEnterScore = () => {
  invalid_score.value = '';
  modal_enter_score.value = false;
};

const NextModalEnterScore = () => {
  if (props.ongoingMatch.bo_type !== BestofType.RANKING) {
    const score_total = Object.values(data_score.score).reduce((a, b) => a + b, 0);
    if (score_total > (props.ongoingMatch.bo_type as number)
        || Object.keys(data_score.score).length === 0) {
      invalid_score.value = 'Les scores que vous avez rentrés ne sont pas valide !';
    } else {
      invalid_score.value = '';
      modal_enter_times.value = true;
      modal_enter_score.value = false;
    }
  } else { // we are in ranking
    const ranks = Object.values(data_score.score).reduce((a, b) => a + b, 0);
    const n = Object.keys(props.ongoingMatch.teams).length;
    if (ranks !== (n * (n + 1)) / 2) {
      invalid_score.value = 'Les scores que vous avez rentrés ne sont pas valide !';
    } else {
      invalid_score.value = '';
      modal_enter_times.value = true;
      modal_enter_score.value = false;
    }
  }
};

const PrevModalEnterScore = () => {
  modal_enter_times.value = false;
  modal_enter_score.value = true;
  invalid_score.value = '';
};

const sendScore = async () => {
  const scores = ({} as ScorePatch);
  const times = data_score.times.filter((time) => time !== null);
  if (times.length !== game_number.value) {
    invalid_score.value = 'Les temps ne peuvent pas être nuls';
    return;
  }
  scores.times = times;
  scores.score = data_score.score;
  await send_score(props.ongoingMatch, scores);
  data_score.score = {};
  data_score.times = [];
  modal_enter_times.value = false;
  modal_enter_score.value = false;
};

const gameSpecificData = computed(() => {
  const processor = props.ongoingMatch.game.game_processor;
  const apiData = props.ongoingMatch.api_data;

  switch (processor) {
    case 'LoL': {
      const pregame = apiData?.pregame;
      if (!pregame || !Array.isArray(pregame) || pregame.length === 0) {
        return null;
      }
      return {
        type: 'lol',
        title: 'Codes de tournoi :',
        items: (pregame as string[]).map((code, index) => ({
          label: `Game ${index + 1}`,
          value: code,
        })),
      };
    }
    default:
      return null;
  }
});
</script>

<template>
  <div id="ongoing_match">
    <div class="m-3 u-text-center text-4xl font-bold">
      Partie en cours
    </div>
    <div class="u-mx-2 flex flex-col justify-around rounded-md bg-cyan-900">
      <div class="flex u-full-width flex-col divide-y">
        <div v-for="team, team_id in ongoingMatch.teams" :key="team_id" class="u-mx-1 u-p-2">
          <p class="truncate text-xl font-bold">
            {{ team }}
          </p>
        </div>
      </div>
      <div v-if="gameSpecificData" class="u-m-1 border-t border-cyan-700 bg-cyan-800 u-p-1">
        <p class="u-mb-1 text-lg font-semibold">
          {{ gameSpecificData.title }}
        </p>
        <div class="space-y-1 font-mono text-sm">
          <p v-for="item in gameSpecificData.items" :key="item.label">
            {{ item.label }}: {{ item.value }}
          </p>
        </div>
      </div>
      <button type="button" class="u-full-width rounded-b-md bg-red-700 u-p-1 duration-100 hover:bg-red-400" @click="openScoreModal()">
        Terminer la partie manuellement
      </button>
    </div>
  </div>

  <Modal v-if="modal_enter_score">
    <template #title>
      Enregistrer le {{ ongoingMatch.bo_type === BestofType.RANKING ? 'classement' : 'score' }}
    </template>
    <template #body>
      <form id="patch-user" @submit.prevent="">
        <FormField
          v-for="(name, id) in ongoingMatch.teams"
          :key="id"
          :validations="v$_time_game.score[id]"
          label="{{id}}"
        >
          <label :for="`input${id}`">{{ name }}</label>
          <input
            :id="`input${id}`"
            v-model="data_score.score[Number(id)]"
            aria-label="score"
            placeholder="score"
            required
            type="number"
            @blur="v$_time_game.score[id].$touch"
          />
        </FormField>
        <!-- hidden submit button with tailwind-->
        <button class="u-hidden" type="submit"/>
      </form>
      <p v-if="invalid_score.length > 0" class="u-color-error-1">
        {{ invalid_score }}
      </p>
    </template>
    <template #buttons>
      <button
        class="c-btn-bg-3"
        type="button"
        @click="closeModalEnterScore"
      >
        Annuler
      </button>
      <button
        class="c-btn-secondary"
        type="button"
        @click.prevent="NextModalEnterScore"
      >
        Suivant
      </button>
    </template>
  </Modal>

  <Modal v-if="modal_enter_times">
    <template #title>
      Enregistrer les durées de match (en minutes)
    </template>
    <template #body>
      <form id="patch-user" @submit.prevent="">
        <FormField
          v-for="n in game_number"
          :key="n"
          :validations="v$_time_game.times"
          label="times"
          @blur="v$_time_game.$touch"
        >
          <label :for="`input${n}`">Partie {{ n }} </label>
          <input
            :id="`input${n}`"
            v-model="data_score.times[n]"
            aria-label="duration (minutes)"
            placeholder="5"
            required
            type="number"
            min="1"
          />
        </FormField>
        <p v-if="invalid_score.length > 0" class="u-color-error-1">
          {{ invalid_score }}
        </p>
        <!-- hidden submit button with tailwind-->
        <button class="u-hidden" type="submit"/>
      </form>
    </template>
    <template #buttons>
      <button
        class="c-btn-bg-3"
        type="button"
        @click="PrevModalEnterScore"
      >
        Retour
      </button>
      <button
        class="c-btn-secondary"
        type="submit"
        @click="sendScore"
      >
        Envoyer
      </button>
    </template>
  </Modal>
</template>

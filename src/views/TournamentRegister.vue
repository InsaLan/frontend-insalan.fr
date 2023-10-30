<script setup lang="ts">
import useVuelidate from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { storeToRefs } from 'pinia';
import {
  computed, onMounted, reactive, ref,
} from 'vue';
import FormField from '@/components/FormField.vue';
import type { Tournament } from '@/models/tournament';
import { useTournamentStore } from '@/stores/tournament.store';

const props = defineProps<{
  id: number;
}>();

const tournamentStore = useTournamentStore();

const { getTournament } = storeToRefs(tournamentStore);
const tournament = ref<Tournament>();

onMounted(async () => {
  tournament.value = await getTournament.value(props.id);
});

const acceptRules = helpers.withParams(
  { type: 'acceptRules' },
  (value) => value === true,
);

const register_form = reactive({
  team: '',
  pseudo: '',
  password: '',
  role: '',
  accept_rules: false,
});

const rules = computed(() => ({
  team: { required },
  pseudo: { required },
  password: { required },
  role: { required },
  accept_rules: { acceptRules },
}));

const v$ = useVuelidate(rules, register_form, { $autoDirty: true });

const register_team = () => {
  /* empty */
};

const register_player = () => {
  /* empty */
};

const create = ref(true);
</script>

<template>
  <div
    :style="{ backgroundImage: `url(${tournament?.logo})` }"
    class="flex h-min items-center justify-center bg-cover bg-center py-10 2xl:h-[calc(100vh_-_6rem)] 2xl:py-0"
  >
    <!-- Design 3-->
    <div class="w-11/12 md:w-9/12 2xl:w-1/2">
      <div class="bg-[#63d1ff] py-8 text-center text-6xl font-bold text-white" style="text-shadow: black 0 0 5px;">
        Inscription {{ tournament?.name }}
      </div>
      <div class="flex hover:cursor-pointer">
        <button
          :class="{ 'bg-slate-500': !create }"
          class="w-full bg-[#2c292d] py-2 text-center text-2xl"
          type="button"
          @click="create = !create"
        >
          Créer une équipe
        </button>
        <button
          :class="{ 'bg-slate-500': create }"
          class="w-full bg-[#2c292d] py-2 text-center text-2xl"
          type="button"
          @click="create = !create"
        >
          Rejoindre une équipe
        </button>
      </div>
      <div class="flex flex-col bg-[#2c292d] p-8">
        <form class="grid gap-x-14 gap-y-2 sm:grid-cols-2">
          <FormField v-slot="context" :validations="v$.team" class="flex flex-col text-xl" required>
            <label for="team">
              Nom de l'équipe
            </label>
            <input id="team" :class="{ error: context.invalid }" placeholder="Équipe 1" type="text"/>
          </FormField>
          <FormField v-slot="context" :validations="v$.team" class="flex flex-col text-xl" required>
            <label for="pseudo">
              Pseudo en jeu
            </label>
            <input id="pseudo" :class="{ error: context.invalid }" placeholder="xxxx" type="text"/>
          </FormField>
          <FormField v-slot="context" :validations="v$.team" class="relative flex flex-col text-xl" required>
            <label for="pwd">
              Mot de passe
            </label>
            <input id="pwd" :class="{ error: context.invalid }" type="password"/>
            <fa-awesome-icon
              v-if="create"
              class="absolute left-[93%] top-[56%] z-10"
              icon="fa-solid fa-arrows-rotate"
              size="s"
              title="Générer un mot de passe"
              style="color: black;"
            />
          </FormField>
          <FormField v-slot="context" :validations="v$.team" class="flex flex-col text-xl" required>
            <label for="role">
              Rôle dans l'équipe
            </label>
            <select id="role" :class="{ error: context.invalid }" class="text-black">
              <option selected value="joueur">
                Joueur
              </option>
              <option value="manager">
                Manager
              </option>
            </select>
          </FormField>
        </form>

        <span class="my-3 text-center text-4xl">Rappel du Règlement</span>
        <ul class="my-5 text-2xl">
          <li>Pas d'insulte</li>
          <li>Apporter son propre matériel <b>filaire </b></li>
          <li>Pas d'insulte</li>
          <li>Apporter son propre matériel <b>filaire </b></li>
          <li>Pas d'insulte</li>
          <li>Apporter son propre matériel <b>filaire </b></li>
        </ul>
        <div class="self-center text-3xl">
          <input id="check" type="checkbox"/>
          <label for="check"> J'accepte les <a :href="`/tournament/${tournament?.id}#rules`" class="text-[#63d1ff]">règles du tournoi</a></label>
        </div>
      </div>
      <div class="flex justify-center bg-[#63d1ff] p-5">
        <button
          v-if="create"
          class="rounded border-solid bg-green-600 p-3 text-3xl md:w-5/12"
          type="button"
          @click="register_team"
        >
          Créer l'équipe
        </button>
        <button
          v-else
          class="rounded border-solid bg-green-600 p-3 text-3xl md:w-5/12"
          type="button"
          @click="register_player"
        >
          Rejoindre
        </button>
      </div>
    </div>
  </div>
</template>

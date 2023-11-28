<script setup lang="ts">
import useVuelidate from '@vuelidate/core';
import {
  helpers, minLength, required,
} from '@vuelidate/validators';
import { storeToRefs } from 'pinia';
import {
  computed, onMounted, reactive, ref,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import FormField from '@/components/FormField.vue';
import Modal from '@/components/Modal.vue';
import type { Team } from '@/models/team';
import type { Tournament } from '@/models/tournament';
import { useTournamentStore } from '@/stores/tournament.store';
import { useUserStore } from '@/stores/user.store';

const props = defineProps<{
  id: number;
}>();

const { user } = useUserStore();

const tournamentStore = useTournamentStore();

const { registerTeam, registerPlayerOrManager, getTournamentFull } = tournamentStore;
const { tournamentsList } = storeToRefs(tournamentStore);
const tournament = computed<Tournament | undefined>(() => tournamentsList.value[props.id]);
// const tournament = ref<Tournament>();

const acceptRules = helpers.withParams(
  { type: 'acceptRules' },
  (value) => value === true,
);

const register_form = reactive({
  team: '',
  name_in_game: '',
  password: '',
  role: 'player',
  accept_rules: false,
});

const selected_team = computed(() => {
  const res = (tournament.value?.teams as Team[]).filter((team) => team.name === register_form.team);
  if (res.length === 1) {
    return res[0];
  }
  return null;
});

const rules = computed(() => ({
  team: { required },
  name_in_game: register_form.role === 'player' ? { required } : {},
  password: { required, minLengthValue: minLength(8) },
  role: { required },
  accept_rules: { acceptRules },
}));

const v$ = useVuelidate(rules, register_form, { $autoDirty: true });

const open_modal = ref(false);

const register_team = async () => {
  const isValid = await v$.value.$validate();
  if (!isValid) return;

  try {
    await registerTeam(
      tournament.value?.id as number,
      register_form.team,
      register_form.password,
      register_form.role,
      register_form.name_in_game,
      user.id,
    );
  } catch (err) {
    return;
  }

  open_modal.value = true;
};

const register_player = async () => {
  const isValid = await v$.value.$validate();
  if (!isValid) return;

  try {
    await registerPlayerOrManager(
      selected_team.value?.id as number,
      register_form.name_in_game,
      register_form.password,
      register_form.role,
      tournament.value?.id as number,
    );
  } catch {
    return;
  }

  open_modal.value = true;
};

const payment = async () => {
  /* */
};

const generate_password = () => {
  const symboles = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = new Uint8Array(8);
  crypto.getRandomValues(values);
  register_form.password = '';
  values.forEach((v) => { register_form.password += symboles[v % 62]; });
};

const create = ref(true);

const router = useRouter();
const { query } = useRoute();
onMounted(async () => {
  try {
    await getTournamentFull(props.id);
  } catch (err: unknown) {
    router.go(-1);
  }
  if ('team' in query && 'pwd' in query) {
    const res = (tournament.value?.teams as Team[]).filter((val) => val.id === Number(query.team));
    if (res.length === 1) {
      create.value = false;
      register_form.team = res[0].name;
      register_form.password = query.pwd as string;
    }
  }
  if (Date.parse(tournament.value?.registration_open) > Date.now()) {
    router.go(-1);
  }
});

const host = import.meta.env.VITE_WEBSITE_HOST as string;
</script>

<template>
  <div
    :style="{ backgroundImage: `url(${tournament?.logo})` }"
    class="flex h-min items-center justify-center bg-cover bg-center py-10 2xl:min-h-[calc(100vh_-_6rem)] 2xl:py-4"
  >
    <!-- Design 3-->
    <div class="w-11/12 md:w-9/12 2xl:w-1/2">
      <div class="text-shadow bg-[#63d1ff] py-8 text-center text-6xl font-bold text-white">
        Inscription {{ tournament?.name }}
      </div>
      <div class="flex hover:cursor-pointer">
        <button
          :class="{ 'bg-slate-500 shadow-inner': !create }"
          class="w-full bg-[#2c292d] py-2 text-center text-2xl"
          type="button"
          @click="create = true"
        >
          Créer une équipe
        </button>
        <button
          :class="{ 'bg-slate-500 shadow-inner': create }"
          class="w-full bg-[#2c292d] py-2 text-center text-2xl"
          type="button"
          @click="create = false"
        >
          Rejoindre une équipe
        </button>
      </div>
      <div class="flex flex-col bg-[#2c292d] p-8">
        <form class="grid gap-x-14 gap-y-2 sm:grid-cols-2">
          <FormField v-if="create" v-slot="context" :validations="v$.team" class="flex flex-col text-xl" required>
            <label for="team">
              Nom de l'équipe
            </label>
            <input id="team" v-model="register_form.team" class="text-black" :class="{ error: context.invalid }" placeholder="Équipe 1" type="text"/>
          </FormField>
          <FormField v-else v-slot="context" :validations="v$.team" class="flex flex-col text-xl" required>
            <label for="teams">
              Équipe
            </label>
            <select id="teams" v-model="register_form.team" :class="{ error: context.invalid }" class="text-black">
              <option value="" selected>
                Sélectionner une équipe
              </option>
              <option v-for="(team, idx) in (tournament?.teams as Team[])" :key="idx" :value="team.name" :idx="idx">
                {{ team.name }}
              </option>
            </select>
          </FormField>
          <FormField v-slot="context" :validations="v$.name_in_game" class="flex flex-col text-xl" required>
            <label for="name_in_game">
              Pseudo en jeu
            </label>
            <input id="name_in_game" v-model="register_form.name_in_game" class="text-black disabled:opacity-75" :class="{ error: context.invalid }" :disabled="register_form.role === 'manager'" placeholder="Pseudo" type="text"/>
          </FormField>
          <FormField v-slot="context" :validations="v$.password" class="relative flex flex-col text-xl" required>
            <label for="pwd">
              Mot de passe
            </label>
            <input id="pwd" v-model="register_form.password" class="text-black" :class="{ error: context.invalid }" type="password"/>
            <button type="button" @click="generate_password">
              <fa-awesome-icon
                v-if="create"
                class="absolute right-2 top-10 z-10"
                icon="fa-solid fa-arrows-rotate"
                size="s"
                title="Générer un mot de passe"
                style="color: black;"
              />
            </button>
          </FormField>
          <FormField v-slot="context" :validations="v$.role" class="flex flex-col text-xl" required>
            <label for="role">
              Rôle dans l'équipe
            </label>
            <select id="role" v-model="register_form.role" :class="{ error: context.invalid }" class="text-black">
              <option value="player">
                Joueur
              </option>
              <option value="manager">
                Manager
              </option>
              <option value="substitute">
                Remplaçant
              </option>
            </select>
          </FormField>
        </form>

        <span class="my-3 text-center text-4xl">Rappel du Règlement</span>
        <ul class="my-5 text-2xl">
          <li>Pas d'insulte</li>
          <li>Apporter son propre matériel <b>filaire </b></li>
        </ul>
        <FormField v-slot="context" :validations="v$.accept_rules" class="flex flex-col self-center text-3xl">
          <div>
            <input id="check" v-model="register_form.accept_rules" :class="{ error: context.invalid }" type="checkbox"/>
            <label for="check"> J'accepte les <router-link :to="`/tournament/${tournament?.id}?s=rules`" class="text-[#63d1ff]">règles du tournoi</router-link></label>
          </div>
        </FormField>
      </div>
      <div class="flex justify-center bg-[#63d1ff] p-5">
        <button
          v-if="create"
          class="rounded border-solid bg-green-600 p-3 text-3xl md:w-5/12"
          :class="{ 'opacity-60': tournament?.validated_teams >= tournament?.maxTeam }"
          type="button"
          :disabled="tournament?.validated_teams >= tournament?.maxTeam"
          @click="register_team"
        >
          {{ tournament?.validated_teams >= tournament?.maxTeam ? 'Inscriptions complètes' : 'Créer l\'équipe' }}
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

  <Modal v-if="open_modal">
    <template #icon>
      <div/>
    </template>
    <template #title>
      <h3 v-if="create" id="open_modal-title" class="text-white-900 text-base font-semibold leading-6">
        Inscription de l'équipe {{ register_form.team }}
      </h3>
      <h3 v-else id="open_modal-title" class="text-white-900 text-base font-semibold leading-6">
        Inscription de {{ register_form.name_in_game }} dans l'équipe
        {{ selected_team?.name }}
      </h3>
    </template>
    <template #body>
      <div v-if="create" class="p-4 text-justify">
        L'inscription de votre équipe {{ register_form.team }} à bien été enregistrée. Il ne vous reste plus qu'à
        transmettre le lien suivant à vos coéquipiers⋅ères/managers⋅euses pour
        qu'ils puissent rejoindre votre équipe : <br>
        <a
          :href="`${host}/tournament/${tournament?.id}/register?team=${selected_team?.id}&pwd=${register_form.password}`"
          class="text-[#62d1ff] underline hover:text-blue-600"
        >
          {{ `${host}/tournament/${tournament?.id}/register?team=${selected_team?.id}&pwd=${register_form.password}` }}
        </a> <br>
        Vous pouvez dès à présent payer votre inscription ou bien revenir le faire plus tard.
      </div>
      <div v-else class="p-4 text-justify">
        Votre inscription dans l'équipe {{ selected_team?.name }} à bien été enregistrée. <br>
        Vous pouvez dès à présent payer votre inscription ou bien revenir le faire plus tard.
      </div>
    </template>
    <template #buttons>
      <button
        class="ml-2 inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:mt-0 sm:w-auto"
        type="button"
        @click="payment"
      >
        Continuer & payer
      </button>
      <router-link
        :to="`/tournament/${tournament?.id}?s=teams`"
        class="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto"
      >
        Continuer
      </router-link>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { storeToRefs } from 'pinia';
import { computed, reactive } from 'vue';
import FormField from '@/components/FormField.vue';
import { useTournamentStore } from '@/stores/tournament.store';

const props = defineProps<{
  id: number;
}>();
const tournamentStore = useTournamentStore();

const { tournaments } = storeToRefs(tournamentStore);
const logo_url = `url(${tournaments.value[props.id].logo as string})`;

const register_form = reactive({
  team: '',
  pseudo: '',
});

const rules = computed(() => ({
  team: { required },
  pseudo: { required },
}));

const v$ = useVuelidate(rules, register_form, { $autoDirty: true });

const register_team = () => {
  console.log('test');
};

const create = ref(true);
</script>

<template>
  <div class="main flex h-min items-center justify-center py-10 2xl:h-[calc(100vh_-_6rem)] 2xl:py-0">
    <!-- Design 3-->
    <div class="w-11/12 md:w-9/12 2xl:w-1/2">
      <div class="bg-[#63d1ff] py-8 text-center text-6xl font-bold text-white" style="text-shadow: black 0px 0px 5px;">
        Inscription {{ name }}
      </div>
      <div class="flex hover:cursor-pointer">
        <a class="w-full bg-[#2c292d] py-2 text-center text-2xl" :class="{ 'bg-slate-500': !create }" @click="create = !create">
          Créer une équipe
        </a>
        <a class="w-full bg-[#2c292d] py-2 text-center text-2xl" :class="{ 'bg-slate-500': create }" @click="create = !create">
          Rejoindre une équipe
        </a>
      </div>
      <div class="flex flex-col bg-[#2c292d] p-8">
        <form class="grid gap-x-14 gap-y-2 sm:grid-cols-2">
          <FormField v-slot="context" required label="Nom de l'équipe" :validations="v$.team" class="flex flex-col text-xl">
            <input :class="{ error: context.invalid }" placeholder="Équipe 1" type="text"/>
          </FormField>
          <FormField v-slot="context" required label="Pseudo en jeu" :validations="v$.team" class="flex flex-col text-xl">
            <input :class="{ error: context.invalid }" placeholder="xxxx" type="text"/>
          </FormField>
          <FormField v-slot="context" required label="Mot de passe" :validations="v$.team" class="relative flex flex-col text-xl">
            <input :class="{ error: context.invalid }" type="password"/>
            <fa-awesome-icon v-if="create" class="absolute left-[93%] top-[56%] z-10" style="color: black;" size="s" icon="fa-solid fa-arrows-rotate"/>
          </FormField>
          <FormField v-slot="context" required label="Rôle dans l'équipe" :validations="v$.team" class="flex flex-col text-xl">
            <select :class="{ error: context.invalid }" class="text-black">
              <option value="joueur" selected>
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
          <li>Apporter son propre matériel <b>filaire </b> </li>
          <li>Pas d'insulte</li>
          <li>Apporter son propre matériel <b>filaire </b> </li>
          <li>Pas d'insulte</li>
          <li>Apporter son propre matériel <b>filaire </b> </li>
        </ul>
        <div class="self-center text-3xl">
          <input id="check" type="checkbox"/>
          <label for="check"> J'accepte les <a :href="trules" class="text-[#63d1ff]">règles du tournoi</a></label>
        </div>
      </div>
      <div class="flex justify-center bg-[#63d1ff] p-5">
        <button v-if="create" class="rounded border-solid bg-green-600 p-3 text-3xl md:w-5/12" @click="register_team">
          Créer l'équipe
        </button>
        <button v-else class="rounded border-solid bg-green-600 p-3 text-3xl md:w-5/12" @click="register_player">
          Rejoindre
        </button>
      </div>
      <!--<div class="flex flex-col md:flex-row items-center justify-between p-5 bg-[#63d1ff]">
          <button @click="register_team" class="mb-5 md:mb-0 md:w-5/12 border-solid bg-green-600 text-3xl p-3 rounded">Créer l'équipe</button>
          <button @click="register_team_pay" class="md:w-5/12 border-solid bg-green-600 text-3xl p-3 rounded">Créer l'équipe & payer</button>
        </div>
      -->
    </div>
  </div>
</template>

<style scoped>
.main {
	background-image: v-bind(logo_url);
	background-size: cover;
	background-position: center;
}
</style>

<script setup lang="ts">
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { storeToRefs } from 'pinia';
import { computed, reactive, ref } from 'vue';
import FormField from '@/components/FormField.vue';
import { useTournamentStore } from '@/stores/tournament.store';

const props = defineProps<{
  id: number;
}>();

const tournamentStore = useTournamentStore();

const { tournaments } = storeToRefs(tournamentStore);
const { name } = tournaments.value[props.id];
const trules = `/tournament/${tournaments.value[props.id].id}#rules`;

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
  /* empty */
};

const register_player = () => {
  /* empty */
};

const create = ref(true);
</script>

<template>
  <div class="flex h-min items-center justify-center bg-cover bg-center py-10 2xl:h-[calc(100vh_-_6rem)] 2xl:py-0" :style="{ backgroundImage: 'url(' + tournaments[props.id].logo + ')' }">
    <!-- Design 3-->
    <div class="w-11/12 md:w-9/12 2xl:w-1/2">
      <div class="bg-[#63d1ff] py-8 text-center text-6xl font-bold text-white" style="text-shadow: black 0px 0px 5px;">
        Inscription {{ name }}
      </div>
      <div class="flex hover:cursor-pointer">
        <button type="button" class="w-full bg-[#2c292d] py-2 text-center text-2xl" :class="{ 'bg-slate-500': !create }" @click="create = !create">
          Créer une équipe
        </button>
        <button type="button" class="w-full bg-[#2c292d] py-2 text-center text-2xl" :class="{ 'bg-slate-500': create }" @click="create = !create">
          Rejoindre une équipe
        </button>
      </div>
      <div class="flex flex-col bg-[#2c292d] p-8">
        <form class="grid gap-x-14 gap-y-2 sm:grid-cols-2">
          <FormField v-slot="context" required :validations="v$.team" class="flex flex-col text-xl">
            <label>
              Nom de l'équipe
              <input :class="{ error: context.invalid }" placeholder="Équipe 1" type="text"/>
            </label>
          </FormField>
          <FormField v-slot="context" required :validations="v$.team" class="flex flex-col text-xl">
            <label>
              Pseudo en jeu
              <input :class="{ error: context.invalid }" placeholder="xxxx" type="text"/>
            </label>
          </FormField>
          <FormField v-slot="context" required :validations="v$.team" class="relative flex flex-col text-xl">
            <label>
              Mot de passe
              <input :class="{ error: context.invalid }" type="password"/>
            </label>
            <fa-awesome-icon v-if="create" class="absolute left-[93%] top-[56%] z-10" style="color: black;" size="s" icon="fa-solid fa-arrows-rotate"/>
          </FormField>
          <FormField v-slot="context" required :validations="v$.team" class="flex flex-col text-xl">
            <label>
              Rôle dans l'équipe
              <select :class="{ error: context.invalid }" class="text-black">
                <option value="joueur" selected>
                  Joueur
                </option>
                <option value="manager">
                  Manager
                </option>
              </select>
            </label>
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
        <button v-if="create" type="button" class="rounded border-solid bg-green-600 p-3 text-3xl md:w-5/12" @click="register_team">
          Créer l'équipe
        </button>
        <button v-else type="button" class="rounded border-solid bg-green-600 p-3 text-3xl md:w-5/12" @click="register_player">
          Rejoindre
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>

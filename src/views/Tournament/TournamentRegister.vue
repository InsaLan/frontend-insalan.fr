<script setup lang="ts">
import useVuelidate from '@vuelidate/core';
import { storeToRefs } from 'pinia';
import {
  computed, reactive, ref,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import FormField from '@/components/FormField.vue';
import Modal from '@/components/Modal.vue';
import PasswordInput from '@/components/PasswordInput.vue';
import TravelFormModal from '@/components/Tournament/TravelFormModal.vue';
import type { Team } from '@/models/team';
import type { EventTournament, EventTournamentDeref } from '@/models/tournament';
import { useTournamentStore } from '@/stores/tournament.store';
import { useUserStore } from '@/stores/user.store';
import {
  acceptRules, minLength, required,
} from '@/support/locales/errors.fr';

const { id, isPrivate } = defineProps<{
  id: number;
  isPrivate?: boolean;
}>();

const { user } = useUserStore();

const tournamentStore = useTournamentStore();

const {
  registerTeam, registerPlayerOrManager, getTournamentFull, addRegistrationToCart, getPrivateTournament,
} = tournamentStore;
const { tournament, soloGame, privateTournamentsList } = storeToRefs(tournamentStore);

const enableManager = computed(() => !isPrivate && (tournament.value as EventTournament).enable_manager);
const roles = computed(() => {
  const rolesArray = ['player', 'substitute'];
  if (enableManager.value) {
    rolesArray.push('manager');
  }
  return rolesArray;
});

const register_form = reactive({
  team: '',
  name_in_game: '',
  password: '',
  role: 'player',
  accept_rules: false,
});

const selected_team = computed(() => {
  if (isPrivate) {
    const res = (
      privateTournamentsList.value[id].teams as Team[]
    ).filter((team) => team.name === register_form.team);
    if (res.length === 1) {
      return res[0];
    }
  } else {
    const res = (tournament.value?.teams as Team[]).filter((team) => team.name === register_form.team);
    if (res.length === 1) {
      return res[0];
    }
  }
  return null;
});

const rules = computed(() => ({
  team: soloGame ? {} : { required },
  name_in_game: register_form.role !== 'manager' ? { required } : {},
  password: (() => {
    if (isPrivate) {
      return privateTournamentsList.value[id].password ? { required } : {};
    }
    return { required, minLengthValue: minLength(8) };
  })(),
  role: !isPrivate ? {
    required,
    validateRole: (role: string) => roles.value.includes(role),
  } : {},
  accept_rules: { acceptRules },
}));

const v$ = useVuelidate(rules, register_form);

const open_modal = ref(false);
const openTravelFormModal = ref(false);
const modal_payment = ref(false);

const register_team = async () => {
  const isValid = await v$.value.$validate();
  if (!isValid) return;

  if (soloGame.value) {
    register_form.team = register_form.name_in_game;
  }

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

  if (isPrivate) {
    open_modal.value = true;
  } else {
    openTravelFormModal.value = true;
  }
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

  if (isPrivate) {
    open_modal.value = true;
  } else {
    openTravelFormModal.value = true;
  }
};

const payment = async () => {
  addRegistrationToCart(tournament.value as EventTournament, register_form.role);
  modal_payment.value = true;
};

const create = ref(true);

const router = useRouter();
const { query } = useRoute();

try {
  if (isPrivate) {
    await getPrivateTournament(id);
  } else {
    await getTournamentFull(id);
  }
  if (tournament.value && 'registration_open' in tournament.value && Date.parse(tournament.value.registration_open ?? '') > Date.now()) {
    router.back();
  }
} catch (err: unknown) {
  router.back();
}

if ('team' in query) {
  const res = (tournament.value?.teams as Team[]).filter((val) => val.id === Number(query.team));
  if (res.length === 1) {
    create.value = false;
    register_form.team = res[0].name;
    if ('pwd' in query) {
      register_form.password = query.pwd as string;
    }
  }
}

const host = import.meta.env.VITE_WEBSITE_HOST as string;

const handleCloseTravelFormModal = () => {
  openTravelFormModal.value = false;
  open_modal.value = true;
};
</script>

<template>
  <img
    :src="tournament?.logo"
    alt=""
    class="c-background-image"
  >
  <div class="l-flex-column l-items-cross-center l-items-main-center u-full-height">
    <div
      class="l-flex-column l-items-cross-center l-items-main-center c-card-bg-2 u-p-4 u-m-text"
    >
      <h1 class="u-m-0">
        Inscription {{ tournament?.name }}
      </h1>
      <div class="l-flex-row u-mb-1">
        <button
          :class="{ active: create }"
          class="switch-btn"
          type="button"
          @click="create = true"
        >
          Créer une équipe
        </button>
        <button
          :class="{ active: !create }"
          class="switch-btn"
          type="button"
          @click="create = false"
        >
          Rejoindre une équipe
        </button>
      </div>
      <form
        id="register_form"
        class="u-full-width"
        @submit.prevent="create ? register_team() : register_player()"
      >
        <div
          :class="soloGame ? 'l-flex-column' : 'l-grid-2'"
          class="l-horizontal-gap-4 l-vertical-gap-2"
        >
          <div class="l-flex-column l-gap-2">
            <FormField
              v-if="create && !soloGame"
              :validations="v$.team"
              class="l-flex-column"
            >
              <label for="team">
                Nom de l'équipe
              </label>
              <input
                id="team"
                v-model="register_form.team"
                placeholder="Équipe 1"
                type="text"
                required
                @blur="v$.team.$touch"
              />
            </FormField>
            <FormField
              v-else-if="create && soloGame"
              :validations="v$.name_in_game"
              class="l-flex-column"
            >
              <label for="name_in_game">
                Pseudo en jeu
              </label>
              <input
                id="name_in_game"
                v-model="register_form.name_in_game"
                :disabled="register_form.role === 'manager'"
                placeholder="Pseudo"
                type="text"
                required
                @blur="v$.name_in_game.$touch"
              />
            </FormField>
            <FormField
              v-else
              :validations="v$.team"
              class="l-flex-column"
            >
              <label for="teams">
                Équipe
              </label>
              <select
                id="teams"
                v-model="register_form.team"
                required
              >
                <option value="" selected>
                  Sélectionner une équipe
                </option>
                <option v-for="(team, idx) in (tournament?.teams as Team[])" :key="idx" :value="team.name" :idx="idx">
                  {{ team.name }}
                </option>
              </select>
            </FormField>
            <FormField
              v-if="!(create && soloGame)"
              :validations="v$.name_in_game"
              class="l-flex-column"
            >
              <label for="name_in_game">
                Pseudo en jeu
              </label>
              <input
                id="name_in_game"
                v-model="register_form.name_in_game"
                :disabled="register_form.role === 'manager'"
                placeholder="Pseudo"
                type="text"
                required
                @blur="v$.name_in_game.$touch"
              />
            </FormField>
          </div>
          <div class="l-flex-column l-gap-2">
            <FormField
              v-if="
                isPrivate && privateTournamentsList[id].password
                  || !(isPrivate)
              "
              :validations="v$.password"
              class="l-flex-column"
            >
              <label for="pwd">
                {{ isPrivate ? 'Mot de passe du tournoi' : 'Mot de passe de l\'équipe' }}
              </label>
              <PasswordInput
                id="pwd"
                v-model="register_form.password"
                :on-blur="v$.password.$touch"
                :generate-password="!isPrivate && create"
                :required="true"
              />
            </FormField>
            <FormField
              v-if="
                !isPrivate
              "
              :validations="v$.role"
              class="l-flex-column"
            >
              <label for="role">
                Rôle dans l'équipe
              </label>
              <select
                id="role"
                v-model="register_form.role"
                required
              >
                <option value="player">
                  Joueur·euse
                </option>
                <option v-if="enableManager" value="manager">
                  Manager
                </option>
                <option value="substitute">
                  Remplaçant·e
                </option>
              </select>
            </FormField>
          </div>
        </div>
        <!-- <h2>Rappel du Règlement</h2>
        <ul class="list-inside list-disc">
          <li>Pas d'insulte</li>
          <li>Apporter son propre matériel <b>filaire </b></li>
        </ul> -->

        <FormField
          :validations="v$.accept_rules"
          class="l-flex-column"
        >
          <div
            class="l-flex-row u-full-width l-items-cross-center l-items-main-center l-gap-1"
          >
            <input
              id="check"
              v-model="register_form.accept_rules"
              type="checkbox"
              required
            />
            <label for="check"> J'accepte les <router-link :to="`/tournament/${isPrivate ? 'private/' : ''}${tournament?.id}/rules`" target="_blank" class="c-link">règles du tournoi <fa-awesome-icon class="c-inline-icon" icon="fa-arrow-up-right-from-square"/></router-link></label>
          </div>
        </FormField>

        <button
          class="c-btn-secondary"
          type="submit"
          :disabled="create && (tournament?.validated_teams ?? 0)
            >= (tournament?.max_team_thresholds[
              tournament?.max_team_thresholds.length - 1
            ] ?? 0)"
        >
          {{
            create ? ((tournament?.validated_teams ?? 0) >= (tournament?.max_team_thresholds[
              tournament?.max_team_thresholds.length - 1
            ] ?? 0) ? 'Inscriptions complètes' : 'Créer l\'équipe') : 'Rejoindre l\'équipe'
          }}
        </button>
      </form>
    </div>
  </div>

  <Modal v-if="open_modal">
    <template #title>
      <div v-if="create">
        Inscription de l'équipe {{ register_form.team }}
      </div>
      <div v-else>
        Inscription de {{ register_form.name_in_game }} dans l'équipe {{ selected_team?.name }}
      </div>
    </template>
    <template #body>
      <div v-if="create">
        L'inscription de votre équipe {{ register_form.team }} à bien été enregistrée. Il ne vous reste plus qu'à
        transmettre le lien suivant à vos coéquipiers⋅ères/managers⋅euses pour
        qu'ils puissent rejoindre votre équipe :
        <br><br>
        <a
          :href="`${host}/tournament/${tournament?.id}/register?team=${selected_team?.id}${register_form.password ? `&pwd=${register_form.password}` : ''}`"
          class="c-link"
        >
          {{ `${host}/tournament/${tournament?.id}/register?team=${selected_team?.id}${register_form.password ? `&pwd=${register_form.password}` : ''}` }}
        </a>
        <br><br>
        Vous pouvez dès à présent payer votre inscription ou bien revenir le faire plus tard.
      </div>
      <div v-else>
        Votre inscription dans l'équipe {{ selected_team?.name }} à bien été enregistrée.
        <br><br>
        Vous pouvez dès à présent payer votre inscription ou bien revenir le faire plus tard.
      </div>
    </template>
    <template #buttons>
      <router-link
        :to="`/tournament/${isPrivate ? 'private/' : ''}${tournament?.id}/teams`"
        class="c-btn-primary"
      >
        Continuer
      </router-link>
      <button
        v-if="!isPrivate"
        class="c-btn-secondary"
        type="button"
        @click="payment"
      >
        Continuer & payer
      </button>
    </template>
  </Modal>

  <!-- Simple modal with a loading text for the payment -->
  <Modal v-if="modal_payment">
    <template #title>
      Paiement
    </template>
    <template #body>
      Votre inscription a été ajoutée au panier.
      <br><br>
      Vous pouvez retrouver votre panier depuis votre compte.
    </template>
    <template #buttons>
      <button
        class="c-btn-bg-3"
        type="button"
        @click="modal_payment = false"
      >
        Rester sur cette page
      </button>
      <router-link
        class="c-btn-secondary"
        :to="`/cart`"
      >
        Aller au panier
      </router-link>
    </template>
  </Modal>

  <TravelFormModal
    v-if="openTravelFormModal"
    :event="(tournament as EventTournamentDeref).event.id"
    :tournament-id="(tournament as EventTournamentDeref).id"
    :close-modal="handleCloseTravelFormModal"
  />
</template>

<style scoped>
.switch-btn {
  color: var(--color-text-2);
  cursor: pointer;
  transition: color 0.2s;
  font-size: clamp(1.2rem, 3.5vw, 1.6rem);
  font-weight: bold;
  margin: 1rem;
}

.switch-btn:hover, .switch-btn.active {
  color: var(--color-text-1);
}
</style>

<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import { storeToRefs } from 'pinia';
import {
  computed, reactive, ref,
} from 'vue';
import placeholder from '@/assets/images/empty_pp.webp';
import FormField from '@/components/FormField.vue';
import Modal from '@/components/Modal.vue';
import PasswordInput from '@/components/PasswordInput.vue';
import TournamentMeCard from '@/components/TournamentMeCard.vue';
import type { PlayerRegistrationDeref, RegistrationDeref } from '@/models/registration';
import type { EventTournament } from '@/models/tournament';
import { useTournamentStore } from '@/stores/tournament.store';
import { useUserStore } from '@/stores/user.store';
import {
  email,
  minLength,
  required, sameAs,
} from '@/support/locales/errors.fr';

const userStore = useUserStore();
const tournamentStore = useTournamentStore();
const {
  user, role, inscriptions, ongoing_match, cart,
} = storeToRefs(userStore);
const { fetch_user_inscription_full, patch_user } = userStore;
const { addRegistrationToCart, get_ticket_pdf } = tournamentStore;

await fetch_user_inscription_full();

// Register form validation
const data_name = reactive({
  first_name: '',
  last_name: '',
});
const rules_name = computed(() => ({
  first_name: { required },
  last_name: { required },
}));
const v$_name = useVuelidate(rules_name, data_name);

const data_email = reactive({
  email: '',
});
const rules_email = computed(() => ({
  email: { required, email },
}));
const v$_email = useVuelidate(rules_email, data_email);

const data_password = reactive({
  new_password: '',
  password_validation: '',
  current_password: '',
});
const rules_password = computed(() => ({
  new_password: { required, minLengthValue: minLength(8) },
  password_validation: { required, sameAsPassword: sameAs(computed(() => data_password.new_password)) },
  current_password: { required },
}));
const v$_password = useVuelidate(rules_password, data_password);

const focus = ref('');

const title = ref('Test title');

const modal_payment = ref(false);

const showModal = ref(false);
const openModal = () => {
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};
const validateModal = async () => {
  let data = {};
  let isValid;
  switch (focus.value) {
    case 'name':
      isValid = await v$_name.value.$validate();
      if (!isValid) return;
      data = data_name;
      break;
    case 'email':
      isValid = await v$_email.value.$validate();
      if (!isValid) return;
      data = data_email;
      break;
    case 'password':
      isValid = await v$_password.value.$validate();
      if (!isValid) return;
      data = data_password;
      break;
    default:
      return;
  }
  await patch_user(data);
  closeModal();
};

const editField = (field: string) => {
  switch (field) {
    case 'name':
      title.value = 'Changer de Prénom et Nom';
      focus.value = 'name';
      break;
    case 'email':
      title.value = 'Changer d\'email';
      focus.value = 'email';
      break;
    case 'password':
      title.value = 'Changer son mot de passe';
      focus.value = 'password';
      break;
    default:
      return;
  }
  openModal();
};
</script>

<template>
  <div class="u-m-main me-grid l-gap-2">
    <div id="profile" class="l-flex-column l-items-cross-center c-card-bg-2 u-full-width">
      <h2 class="u-text-center">
        Mon compte
      </h2>
      <img
        :src="user.image ? user.image : placeholder"
        alt="Image de profil"
        class="profile"
      />
      <div class="u-text-left u-big-text">
        Pseudo : <em>{{ user.username }}</em>
        <br>
        Prénom et Nom : <em>{{ user.first_name }} {{ user.last_name }}</em>
        <fa-awesome-icon
          class="c-image-btn c-inline-icon"
          icon="fa-solid fa-pencil"
          @click="editField('name')"
          @keydown="editField('name')"
        />
        <br>
        Email : <em>{{ user.email }}</em>
        <fa-awesome-icon
          class="c-image-btn c-inline-icon"
          icon="fa-solid fa-pencil"
          @click="editField('email')"
          @keydown="editField('email')"
        />
        <br>
        Mot de passe : <em class="u-color-text-2">**********</em>
        <fa-awesome-icon
          class="c-image-btn c-inline-icon"
          icon="fa-solid fa-pencil"
          @click="editField('password')"
          @keydown="editField('password')"
        />
        <br>
        Rôle : <em :class="{ ['u-color-secondary-1']: role === 'dev' }">{{ role === 'joueur' ? 'joueur·euse' : role }}</em>
      </div>
      <div
        v-if="cart.length > 0"
        class="l-flex-row l-items-cross-center c-card-bg-3"
      >
        <div class="u-big-text u-text-left">
          Vous avez <b>{{ cart.length }}</b> article{{ cart.length !== 1 ? 's' : '' }} dans votre panier.
        </div>
        <router-link
          class="c-btn-secondary"
          to="/cart"
        >
          Voir le panier
        </router-link>
      </div>
      <!-- <button
        @click="delete_account()" class="c-btn-error"
      >
        Supprimer son compte
      </button> -->
      <TournamentMeCard v-if="ongoing_match !== null" :ongoing-match="ongoing_match"/>
    </div>
    <div id="team">
      <h1 class="u-m-1 u-text-center">
        Mes Équipes
      </h1>
      <div class="l-flex-column l-items-cross-center">
        <div v-if="Object.keys(inscriptions.unpaid).length" class="c-card-error l-flex-row l-items-cross-center l-items-main-center u-py-1 u-m-1 u-big-text">
          <fa-awesome-icon icon="fa-solid fa-warning"/>
          <div v-if="Object.keys(inscriptions.unpaid).length === 1">
            Vous avez une inscription non payée
          </div>
          <div v-else>
            Vous avez des inscriptions non payées
          </div>
        </div>
      </div>
      <div v-if="(inscriptions.ongoing as [string, PlayerRegistrationDeref | RegistrationDeref][])?.length > 0" class="u-mt-2">
        <h2 class="u-m-2">
          Édition Actuelle
        </h2>
        <div class="l-grid-2 l-gap-2">
          <div
            v-for="inscription in (inscriptions.ongoing as [string, PlayerRegistrationDeref | RegistrationDeref][])"
            :key="inscription[1].id"
            class="c-card-bg-2 u-p-0 u-pb-2 l-flex-column l-items-main-center u-full-width u-full-height"
          >
            <div class="l-grow">
              <img
                :src="inscription[1].team.tournament.logo"
                alt="image du tournoi"
                class="c-thumbnail"
              />
            </div>
            <div
              v-if="inscription[1].ticket"
              class="c-text-btn-secondary u-m-0 u-mx-2 u-color-text-2"
              @click="inscription[1].ticket && get_ticket_pdf(inscription[1].ticket)"
              @keydown="inscription[1].ticket && get_ticket_pdf(inscription[1].ticket)"
            >
              Télecharger son billet
            </div>
            <router-link
              class="c-text-btn-secondary u-m-0 u-mx-2 u-color-text-2"
              :to="`/tournament/${inscription[1].team.tournament.id}/rules`"
            >
              Règlement du tournoi
            </router-link>
            <b class="u-big-text u-mx-2">
              {{ inscription[1].team.name }}
            </b>
            <div class="l-flex-row l-grow l-items-main-center l-items-cross-center l-gap-2 u-mx-2">
              <router-link
                class="c-btn-primary"
                :to="`/tournament/${inscription[1].team.tournament.id}/team/${inscription[1].team.id}`"
              >
                {{ (inscription[1].team.players[0] === user.id || inscription[0] === "manager") ? 'Gérer l\'équipe' : 'Voir l\'équipe' }}
              </router-link>
              <div
                v-if="(inscriptions.unpaid as Record<string, boolean>)[inscription[1].id]"
                class="c-btn-secondary"
                @click.prevent="
                  (
                    modal_payment = true,
                    addRegistrationToCart(
                      inscription[1].team.tournament as unknown as EventTournament, inscription[0],
                    )
                  )"
                @keydown.prevent="
                  (
                    modal_payment = true,
                    addRegistrationToCart(
                      inscription[1].team.tournament as unknown as EventTournament, inscription[0],
                    )
                  )"
              >
                Terminer l'inscription
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="(inscriptions.past as [string, PlayerRegistrationDeref | RegistrationDeref][])?.length > 0" class="u-mt-2">
        <h2 class="u-m-2">
          Autres Éditions
        </h2>
        <div class="l-grid-2 l-gap-2">
          <div
            v-for="inscription in (inscriptions.past as [string, PlayerRegistrationDeref | RegistrationDeref][])"
            :key="inscription[1].id"
            class="c-card-bg-2 u-p-0 u-pb-2 l-flex-column l-grow l-items-main-center u-full-width"
          >
            <img
              :src="inscription[1].team.tournament.logo"
              alt="image du tournoi"
              class="c-thumbnail"
            />
            <router-link
              class="c-text-btn-secondary u-m-0 u-mx-2 u-color-text-2"
              :to="`/tournament/${inscription[1].team.tournament.id}/rules`"
            >
              Règlement du tournoi
            </router-link>
            <div class="u-big-text u-mx-2">
              {{ inscription[1].team.tournament.event.name }} - <b>{{ inscription[1].team.name }}</b>
            </div>
            <router-link
              class="c-btn-primary"
              :to="`/tournament/${inscription[1].team.tournament.id}/team/${inscription[1].team.id}`"
            >
              {{ (inscription[1].team.players[0] === user.id || inscription[0] === 'manager') ? 'Gérer l\'équipe' : 'Voir l\'équipe' }}
            </router-link>
          </div>
        </div>
      </div>
      <div v-if="(inscriptions.private_regs as [string, PlayerRegistrationDeref | RegistrationDeref][])?.length > 0" class="u-mt-2">
        <h2 class="u-m-2">
          Tournois secondaires
        </h2>
        <div class="l-grid-2 l-gap-2">
          <div
            v-for="inscription in (
              inscriptions.private_regs as [string, PlayerRegistrationDeref | RegistrationDeref][]
            )"
            :key="inscription[1].id"
            class="c-card-bg-2 u-p-0 u-pb-2 l-flex-column l-grow l-items-main-center u-full-width"
          >
            <img
              :src="inscription[1].team.tournament.logo"
              alt="image du tournoi"
              class="c-thumbnail"
            />
            <router-link
              class="c-text-btn-secondary u-m-0 u-mx-2 u-color-text-2"
              :to="`/tournament/private/${inscription[1].team.tournament.id}/rules`"
            >
              Règlement du tournoi
            </router-link>
            <b class="u-big-text u-mx-2">
              {{ inscription[1].team.tournament.name }}
            </b>
            <router-link
              class="c-btn-primary"
              :to="`/tournament/private/${inscription[1].team.tournament.id}/team/${inscription[1].team.id}`"
            >
              {{ (inscription[1].team.players[0] === user.id || inscription[0] === "manager") ? 'Gérer l\'équipe' : 'Voir l\'équipe' }}
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Modal v-if="showModal" @close="closeModal">
    <template #title>
      {{ title }}
    </template>
    <template #body>
      <form id="patch-user" @submit.prevent="validateModal">
        <FormField
          v-if="focus === 'name'"
          :validations="v$_name.first_name"
        >
          <label for="prenom">
            Nouveau Prénom
          </label>
          <input
            id="prenom"
            v-model="data_name.first_name"
            aria-label="Nouveau Prénom"
            placeholder="John"
            required
            type="text"
            @blur="v$_name.first_name.$touch"
          />
        </FormField>
        <FormField
          v-if="focus === 'name'"
          :validations="v$_name.last_name"
        >
          <label for="nom">
            Nouveau Nom
          </label>
          <input
            id="nom"
            v-model="data_name.last_name"
            aria-label="Nouveau Nom"
            placeholder="Doe"
            required
            type="text"
            @blur="v$_name.last_name.$touch"
          />
        </FormField>

        <FormField
          v-if="focus === 'email'"
          :validations="v$_email.email"
        >
          <label for="email">
            Nouvel email
          </label>
          <input
            id="email"
            v-model="data_email.email"
            aria-label="Email"
            placeholder="john-doe@gmail.com"
            required
            type="text"
            @blur="v$_email.email.$touch"
          />
        </FormField>

        <FormField
          v-if="focus === 'password'"
          :validations="v$_password.current_password"
        >
          <label for="current_password">
            Mot de passe actuel
          </label>
          <PasswordInput
            id="current_password"
            v-model="data_password.current_password"
            aria-label="mot de passe actuel"
            placeholder="Mot de passe actuel"
            required
            :on-blur="v$_password.current_password.$touch"
          />
        </FormField>
        <FormField
          v-if="focus === 'password'"
          :validations="v$_password.new_password"
        >
          <label for="new_password">
            Nouveau mot de passe
          </label>
          <PasswordInput
            id="new_password"
            v-model="data_password.new_password"
            aria-label="Nouveau mot de passe"
            placeholder="Nouveau mot de passe"
            required
            :on-blur="v$_password.new_password.$touch"
          />
        </FormField>
        <FormField
          v-if="focus === 'password'"
          :validations="v$_password.password_validation"
        >
          <label for="repeat_password">
            Confirmer le nouveau mot de passe
          </label>
          <PasswordInput
            id="repeat_password"
            v-model="data_password.password_validation"
            aria-label="Confirmer le nouveau mot de passe"
            placeholder="Confirmer le nouveau mot de passe"
            required
            :on-blur="v$_password.password_validation.$touch"
          />
        </FormField>
        <!-- hidden submit button with tailwind-->
        <button class="u-hidden" type="submit"/>
      </form>
    </template>
    <template #buttons>
      <button
        class="c-btn-bg-3"
        type="button"
        @click="closeModal"
      >
        Annuler
      </button>
      <button
        class="c-btn-secondary"
        type="submit"
        @click="validateModal"
      >
        Valider
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
</template>

<style scoped>
@media (max-width: 70rem) {
  .me-grid {
    display: grid;
    grid-template-columns: 1fr;
  }
}

@media (min-width: 70rem) {
  .me-grid {
    display: grid;
    grid-template-columns: 25rem 1fr;
  }
}

.profile {
  width: 5rem;
  height: 5rem;
  border-radius: 9999px;
  background-color: var(--color-bg-3);
}
</style>

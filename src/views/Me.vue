<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import { storeToRefs } from 'pinia';
import {
  computed, reactive, ref,
} from 'vue';
import placeholder from '@/assets/images/logo_home.png';
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
  <div class="u-mx-2 l-flex-column md:flex-row">
    <div id="profile" class="mb-3 l-items-cross-center md:w-2/6 c-card-bg-2">
      <h1 class="m-3 u-text-center text-4xl u-bold">
        Mon compte
      </h1>
      <div class="myr-2 place-center l-flex-column justify-between md:place-items-center md:justify-items-center">
        <div class="u-my-1 l-flex-column place-items-center l-justify-center md:flex-row">
          <div class="u-m-1 flex place-items-center l-justify-center">
            <a>
              <img
                :src="user.image ? user.image : placeholder"
                alt="image de profile"
                class="u-m-1 max-h-full w-16 max-w-full rounded-full c-image-btn"
              />
            </a>
          </div>
          <div>
            <p class="text-xl">
              Pseudo : <em>{{ user.username }}</em>
            </p>
            <p class="text-xl">
              Prénom et Nom : <em>{{ user.first_name }} {{ user.last_name }}</em>
              <fa-awesome-icon
                class="u-ml-1 c-image-btn"
                icon="fa-solid fa-pencil"
                size="2xs"
                @click="editField('name')"
                @keydown="editField('name')"
              />
            </p>
            <p class="text-xl">
              Email : <em>{{ user.email }}</em>
              <fa-awesome-icon
                class="u-ml-1 c-image-btn"
                icon="fa-solid fa-pencil"
                size="2xs"
                @click="editField('email')"
                @keydown="editField('email')"
              />
            </p>
            <p class="text-xl">
              Mot de passe : <em>**********</em>
              <fa-awesome-icon
                class="u-ml-1 c-image-btn"
                icon="fa-solid fa-pencil"
                size="2xs"
                @click="editField('password')"
                @keydown="editField('password')"
              />
            </p>
            <div class="flex place-items-center l-justify-center">
              <p class="text-xl">
                Rôle :
              </p>
              <div class="text-md u-p-1 m-1 flex w-16 justify-around u-rounded u-bg-bg-3">
                <svg
                  v-if="role === 'dev'"
                  class="size-6"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                {{ role === 'joueur' ? 'joueur·euse' : role }}
              </div>
            </div>
          </div>
        </div>
        <div
          v-if="cart.length > 0"
          class="u-m-1 flex l-items-cross-center justify-between c-card-bg-3"
        >
          <div>
            <h2 class="text-xl u-text-left">
              Vous avez <b>{{ cart.length }}</b> article{{ cart.length !== 1 ? 's' : '' }} dans votre panier
            </h2>
          </div>
          <router-link
            class="c-btn-secondary"
            to="/cart"
          >
            Voir le panier
          </router-link>
        </div>
        <!--div class="myr-2 ml-1">
          <button
          @click="delete_account()" class="center rounded transition duration-150 ease-in-out u-p-1 u-bold
           text-white bg-red-600 hover:ring hover:ring-pink-500" style="display: flex; align-items: center;">
           Supprimer son compte</button>
        </div-->
      </div>
      <TournamentMeCard v-if="ongoing_match !== null" :ongoing-match="ongoing_match"/>
    </div>
    <div id="team" class="md:w-4/6">
      <h1 class="m-3 u-text-center text-4xl u-bold">
        Mes Équipes
      </h1>
      <!--div>
        <div class="bg-red-900 rounded-xl u-text-center u-m-1 text-xl" v-if="Object.keys(inscriptions.unpaid).length">
          <h2 class="mx-5 text-xl" v-if="Object.keys(inscriptions.unpaid).length === 1">
            <fa-awesome-icon size="xs" icon="fa-solid fa-warning" />  Vous avez une inscription non payée
            <fa-awesome-icon size="xs" icon="fa-solid fa-warning" /> </h2>
          <h2 class="mx-5 text-xl" v-else>
            <fa-awesome-icon size="xs" icon="fa-solid fa-warning" />  Vous avez des inscriptions non payées
            <fa-awesome-icon size="xs" icon="fa-solid fa-warning" /> </h2>
        </div>
      </div-->
      <div v-if="(inscriptions.ongoing as [string, PlayerRegistrationDeref | RegistrationDeref][])?.length > 0" class="u-m-2">
        <h1 class="u-m-2 text-xl">
          Edition Actuelle
        </h1>
        <div class="m-1 grid gap-3 md:grid-cols-3">
          <div
            v-for="inscription in (inscriptions.ongoing as [string, PlayerRegistrationDeref | RegistrationDeref][])"
            :key="inscription[1].id"
            :class="{ /*[`bg-red-900`]: inscriptions.unpaid[inscription.team.id]*/ }"
            class="c-card-bg-2"
          >
            <div
              class="l-flex-column l-grow l-items-main-center"
            >
              <b class="text-xl">
                {{ inscription[1].team.name }}
              </b>
            </div>
            <div
              :class="{ ['hover:cursor-pointer']: inscription[1].ticket }"
              @click="inscription[1].ticket && get_ticket_pdf(inscription[1].ticket)"
              @keydown="inscription[1].ticket && get_ticket_pdf(inscription[1].ticket)"
            >
              <img
                :src="inscription[1].team.tournament.logo"
                alt="image du tournoi"
                class="size-32 max-w-full overflow-hidden u-rounded"
                style="width: 100%; object-fit: cover;"
              />
              <div
                v-if="inscription[1].ticket"
                class="l-flex-column l-grow l-items-main-center"
              >
                <p class="text-xs">
                  Télecharger son billet
                </p>
              </div>
            </div>
            <div class="hidden flex-col md:block">
              <router-link
                class="u-color-text-2"
                :to="`/tournament/${inscription[1].team.tournament.id}/rules`"
              >
                Règlement du tournoi
              </router-link>
            </div>
            <div class="block">
              <div class="l-flex-row l-grow l-items-main-center items-stretch l-items-main-center">
                <router-link
                  class="c-btn-primary"
                  :to="`/tournament/${inscription[1].team.tournament.id}/team/${inscription[1].team.id}`"
                >
                  <div>
                    {{ (inscription[1].team.players[0] === user.id || inscription[0] === "manager") ? 'Gérer l\'équipe' : 'Voir l\'équipe' }}
                  </div>
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
                  <div>
                    Terminer l'inscription
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="(inscriptions.past as [string, PlayerRegistrationDeref | RegistrationDeref][])?.length > 0" class="u-m-2">
        <h1 class="text-xl">
          Autres Editions
        </h1>
        <div class="m-1 grid gap-3 md:grid-cols-3">
          <router-link
            v-for="inscription in (inscriptions.past as [string, PlayerRegistrationDeref | RegistrationDeref][])"
            :key="inscription[1].id"
            :to="`/tournament/${inscription[1].team.tournament.id}/team/${inscription[1].team.id}`"
            class="container flex max-w-xs flex-col-reverse break-words bg-cyan-900 u-text-center"
          >
            <div class="my-1 hidden md:block">
              <div class="m-1 l-flex-column h-8 l-grow l-items-main-center">
                <div>
                  <router-link
                    class="center rounded bg-green-600 u-p-1 u-bold text-white transition duration-150 ease-in-out hover:ring hover:ring-pink-500"
                    :to="`/tournament/${inscription[1].team.tournament.id}/team/${inscription[1].team.id}`"
                  >
                    {{ (inscription[1].team.players[0] === user.id || inscription[0] === 'manager') ? 'Gérer l\'équipe' : 'Voir l\'équipe' }}
                  </router-link>
                </div>
              </div>
            </div>
            <div class="hidden flex-col md:block">
              <router-link
                class="mt-auto text-zinc-400"
                :to="`/tournament/${inscription[1].team.tournament.id}/rules`"
              >
                Règlement du tournoi
              </router-link>
            </div>
            <img
              :src="inscription[1].team.tournament.logo"
              alt="image du tournoi"
              class="size-32 max-w-full overflow-hidden"
              style="width: 100%; object-fit: cover;"
            />
            <div class="m-1 l-flex-column l-grow l-items-main-center">
              <p class="text-xl">
                {{ inscription[1].team.name }}
              </p>
            </div>
          </router-link>
        </div>
      </div>
      <div v-if="(inscriptions.private_regs as [string, PlayerRegistrationDeref | RegistrationDeref][])?.length > 0" class="u-m-2">
        <h1 class="text-xl">
          Tournois secondaires
        </h1>
        <div class="m-1 grid gap-3 md:grid-cols-3">
          <div
            v-for="inscription in (
              inscriptions.private_regs as [string, PlayerRegistrationDeref | RegistrationDeref][]
            )"
            :key="inscription[1].id"
            :class="{ /*[`bg-red-900`]: inscriptions.unpaid[inscription.team.id]*/ }"
            class="container flex max-w-xs flex-col-reverse break-words bg-cyan-900 u-text-center"
          >
            <div class="block">
              <div class="l-flex-column l-grow l-items-main-center">
                <div class="u-m-1 l-flex-row items-stretch l-items-main-center l-gap-1">
                  <router-link
                    class="center flex l-grow l-items-cross-center l-items-main-center rounded bg-green-600 u-p-1 u-bold text-white transition duration-150 ease-in-out hover:cursor-pointer hover:ring hover:ring-pink-500"
                    :to="`/tournament/private/${inscription[1].team.tournament.id}/team/${inscription[1].team.id}`"
                  >
                    <div>
                      {{ (inscription[1].team.players[0] === user.id || inscription[0] === "manager") ? 'Gérer l\'équipe' : 'Voir l\'équipe' }}
                    </div>
                  </router-link>
                </div>
              </div>
            </div>
            <div class="hidden flex-col md:block">
              <router-link
                class="mt-auto text-zinc-400"
                :to="`/tournament/${inscription[1].team.tournament.id}/rules`"
              >
                Règlement du tournoi
              </router-link>
            </div>
            <img
              :src="inscription[1].team.tournament.logo"
              alt="image du tournoi"
              class="size-32 max-w-full overflow-hidden"
              style="width: 100%; object-fit: cover;"
            />
            <div
              class="m-1 l-flex-column l-grow l-items-main-center"
            >
              <p class="text-xl">
                {{ inscription[1].team.tournament.name }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Modal v-if="showModal" @close="closeModal">
    <template #icon>
      <div/>
    </template>
    <template #title>
      <h3 id="modal-title" class="text-white-900 text-base font-semibold leading-6">
        {{ title }}
      </h3>
    </template>
    <template #body>
      <form id="patch-user" class="u-mt-1" @submit.prevent="validateModal">
        <div v-if="focus === 'name'" id="name">
          <FormField
            v-slot="context"
            :validations="v$_name.first_name"
            class="u-m-1 l-flex-column"
            label="Nouveau Prénom"
          >
            <input
              v-model="data_name.first_name"
              :class="{ error: context.invalid }"
              aria-label="Nouveau Prénom"
              class="border-2 bg-theme-bg"
              placeholder="John"
              required
              type="text"
              @blur="v$_name.first_name.$touch"
            />
          </FormField>
          <FormField v-slot="context" :validations="v$_name.last_name" class="u-m-1 l-flex-column" label="Nouveau Nom">
            <input
              v-model="data_name.last_name"
              :class="{ error: context.invalid }"
              aria-label="Nouveau Nom"
              class="border-2 bg-theme-bg"
              placeholder="Doe"
              required
              type="text"
              @blur="v$_name.last_name.$touch"
            />
          </FormField>
        </div>

        <div v-if="focus === 'email'" id="email">
          <FormField v-slot="context" :validations="v$_email.email" class="u-m-1 l-flex-column" label="Email">
            <input
              v-model="data_email.email"
              :class="{ error: context.invalid }"
              aria-label="Email"
              class="border-2 bg-theme-bg"
              placeholder="john-doe@gmail.com"
              required
              type="text"
              @blur="v$_email.email.$touch"
            />
          </FormField>
        </div>

        <div v-if="focus === 'password'" id="password">
          <FormField
            v-slot="context"
            :validations="v$_password.new_password"
            class="u-m-1 l-flex-column"
            label="Nouveau mot de passe"
          >
            <PasswordInput
              v-model="data_password.new_password"
              :error="context.invalid"
              aria-label="Nouveau mot de passe"
              placeholder="Nouveau mot de passe"
              required
              :on-blur="v$_password.new_password.$touch"
            />
          </FormField>
          <FormField
            v-slot="context"
            :validations="v$_password.password_validation"
            class="u-m-1 l-flex-column"
            label="Confirmer le mot de passe"
          >
            <PasswordInput
              v-model="data_password.password_validation"
              :error="context.invalid"
              aria-label="Confirmer le mot de passe"
              placeholder="Confirmer le mot de passe"
              required
              :on-blur="v$_password.password_validation.$touch"
            />
          </FormField>
          <FormField
            v-slot="context"
            :validations="v$_password.current_password"
            class="u-m-1 l-flex-column"
            label="Mot de passe actuel"
          >
            <PasswordInput
              v-model="data_password.current_password"
              :error="context.invalid"
              aria-label="mot de passe actuel"
              placeholder="Mot de passe actuel"
              required
              :on-blur="v$_password.current_password.$touch"
            />
          </FormField>
        </div>
        <!-- hidden submit button with tailwind-->
        <button class="hidden" type="submit"/>
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
    <template #icon>
      <div/>
    </template>
    <template #title>
      <h3 id="open_modal-title" class="text-white-900 text-base font-semibold leading-6">
        Paiement
      </h3>
    </template>
    <template #body>
      <div class="u-p-2 u-text-justify">
        Votre inscription a été ajoutée au panier
        <br>
        Vous pouvez retrouver votre panier depuis votre compte
      </div>
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

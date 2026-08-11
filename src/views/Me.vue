<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import { storeToRefs } from 'pinia';
import {
  computed, reactive, ref,
} from 'vue';
import { useI18n } from 'vue-i18n';
import placeholder from '@/assets/images/empty_pp.webp';
import FormField from '@/components/FormField.vue';
import Modal from '@/components/Modal.vue';
import PasswordInput from '@/components/PasswordInput.vue';
import MeTournamentCard from '@/components/Tournament/MeTournamentCard.vue';
import TournamentMeCard from '@/components/TournamentMeCard.vue';
import type { PlayerRegistrationDeref, RegistrationDeref } from '@/models/registration';
import type { EventTournament } from '@/models/tournament';
import { useTournamentStore } from '@/stores/tournament.store';
import { useUserStore } from '@/stores/user.store';
import {
  email,
  minLength,
  required, sameAs,
} from '@/support/locales/errors';

const userStore = useUserStore();
const { t } = useI18n();
const tournamentStore = useTournamentStore();
const {
  user, role, inscriptions, ongoing_match, cart,
} = storeToRefs(userStore);
const { fetch_user_inscription_full, patch_user } = userStore;
const { addRegistrationToCart } = tournamentStore;

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

const title = ref('');

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
      title.value = t('views.me.changeName');
      focus.value = 'name';
      break;
    case 'email':
      title.value = t('views.me.changeEmail');
      focus.value = 'email';
      break;
    case 'password':
      title.value = t('views.me.changePassword');
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
    <div id="profile" class="l-flex-column l-cross-center c-card-bg-2 u-full-width">
      <h2 class="u-text-center">
        {{ $t('views.me.account') }}
      </h2>
      <img
        :src="user.image ? user.image : placeholder"
        :alt="$t('views.me.profileImageAlt')"
        class="profile"
      />
      <div class="u-text-left u-big-text">
        {{ $t('views.me.username') }}{{ $t('common.colon') }}<em>{{ user.username }}</em>
        <br>
        {{ $t('views.me.fullName') }}{{ $t('common.colon') }}<em>{{ user.first_name }} {{ user.last_name }}</em>
        <button
          type="button"
          :title="$t('views.me.changeName')"
          class="c-image-btn c-inline-icon"
          @click="editField('name')"
        >
          <fa-awesome-icon
            icon="fa-pencil"
          />
        </button>
        <br>
        {{ $t('views.me.email') }}{{ $t('common.colon') }}<em>{{ user.email }}</em>
        <button
          type="button"
          :title="$t('views.me.changeEmail')"
          class="c-image-btn c-inline-icon"
          @click="editField('email')"
        >
          <fa-awesome-icon
            icon="fa-pencil"
          />
        </button>
        <br>
        {{ $t('views.me.password') }}{{ $t('common.colon') }}<em class="u-color-text-2">**********</em>
        <button
          type="button"
          :title="$t('views.me.changePassword')"
          class="c-image-btn c-inline-icon"
          @click="editField('password')"
        >
          <fa-awesome-icon
            icon="fa-pencil"
          />
        </button>
        <br>
        {{ $t('views.me.role') }}{{ $t('common.colon') }}<em :class="{ ['u-color-secondary-1']: role === 'dev' }">{{ role === 'joueur' ? $t('views.me.player') : role }}</em>
      </div>
      <div
        v-if="cart.length > 0"
        class="l-flex-row l-cross-center c-card-bg-3"
      >
        <div class="u-big-text u-text-left">
          {{ $t('views.me.cartItems', { count: cart.length }) }}
        </div>
        <router-link
          class="c-btn-secondary"
          to="/cart"
        >
          {{ $t('views.me.viewCart') }}
        </router-link>
      </div>
      <!-- <button
        @click="delete_account()" class="c-btn-error"
      >
        Supprimer le compte
      </button> -->
      <TournamentMeCard v-if="ongoing_match !== null" :ongoing-match="ongoing_match"/>
    </div>
    <div id="team">
      <h1 class="u-m-1 u-text-center">
        {{ $t('views.me.myTeams') }}
      </h1>
      <div class="l-flex-column l-cross-center">
        <div v-if="Object.keys(inscriptions.unpaid).length" class="c-card-error l-flex-row l-cross-center l-main-center u-py-1 u-m-1 u-big-text">
          <fa-awesome-icon icon="fa-warning"/>
          <div>
            {{ $t('views.me.unpaidRegistration', Object.keys(inscriptions.unpaid).length) }}
          </div>
        </div>
      </div>
      <div v-if="(inscriptions.ongoing as [string, PlayerRegistrationDeref | RegistrationDeref][])?.length > 0" class="u-mt-2">
        <h2 class="u-m-2">
          {{ $t('views.me.currentEdition') }}
        </h2>
        <div class="l-grid-2 l-gap-2">
          <MeTournamentCard
            v-for="inscription in (inscriptions.ongoing as [string, PlayerRegistrationDeref | RegistrationDeref][])"
            :key="inscription[1].id"
            :inscription
            current
            @finish-inscription="(
              modal_payment = true,
              addRegistrationToCart(
                inscription[1].team.tournament as unknown as EventTournament, inscription[0],
              )
            )"
          />
        </div>
      </div>
      <div v-if="(inscriptions.past as [string, PlayerRegistrationDeref | RegistrationDeref][])?.length > 0" class="u-mt-2">
        <h2 class="u-m-2">
          {{ $t('views.me.otherEditions') }}
        </h2>
        <div class="l-grid-2 l-gap-2">
          <MeTournamentCard
            v-for="inscription in (inscriptions.past as [string, PlayerRegistrationDeref | RegistrationDeref][])"
            :key="inscription[1].id"
            :inscription
          />
        </div>
      </div>
      <div v-if="(inscriptions.private_regs as [string, PlayerRegistrationDeref | RegistrationDeref][])?.length > 0" class="u-mt-2">
        <h2 class="u-m-2">
          {{ $t('views.me.secondaryTournaments') }}
        </h2>
        <div class="l-grid-2 l-gap-2">
          <MeTournamentCard
            v-for="inscription in (
              inscriptions.private_regs as [string, PlayerRegistrationDeref | RegistrationDeref][]
            )"
            :key="inscription[1].id"
            :inscription
            private
          />
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
            {{ $t('views.me.newFirstName') }}
          </label>
          <input
            id="prenom"
            v-model="data_name.first_name"
            :aria-label="$t('views.me.newFirstName')"
            :placeholder="$t('views.me.firstNamePlaceholder')"
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
            {{ $t('views.me.newLastName') }}
          </label>
          <input
            id="nom"
            v-model="data_name.last_name"
            :aria-label="$t('views.me.newLastName')"
            :placeholder="$t('views.me.lastNamePlaceholder')"
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
            {{ $t('views.me.newEmail') }}
          </label>
          <input
            id="email"
            v-model="data_email.email"
            :aria-label="$t('views.me.email')"
            :placeholder="$t('views.me.emailPlaceholder')"
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
            {{ $t('views.me.currentPassword') }}
          </label>
          <PasswordInput
            id="current_password"
            v-model="data_password.current_password"
            :aria-label="$t('views.me.currentPassword')"
            :placeholder="$t('views.me.currentPassword')"
            required
            :on-blur="v$_password.current_password.$touch"
          />
        </FormField>
        <FormField
          v-if="focus === 'password'"
          :validations="v$_password.new_password"
        >
          <label for="new_password">
            {{ $t('views.me.newPassword') }}
          </label>
          <PasswordInput
            id="new_password"
            v-model="data_password.new_password"
            :aria-label="$t('views.me.newPassword')"
            :placeholder="$t('views.me.newPassword')"
            required
            :on-blur="v$_password.new_password.$touch"
          />
        </FormField>
        <FormField
          v-if="focus === 'password'"
          :validations="v$_password.password_validation"
        >
          <label for="repeat_password">
            {{ $t('views.me.confirmNewPassword') }}
          </label>
          <PasswordInput
            id="repeat_password"
            v-model="data_password.password_validation"
            :aria-label="$t('views.me.confirmNewPassword')"
            :placeholder="$t('views.me.confirmNewPassword')"
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
        {{ $t('views.me.cancel') }}
      </button>
      <button
        class="c-btn-secondary"
        type="submit"
        @click="validateModal"
      >
        {{ $t('views.me.validate') }}
      </button>
    </template>
  </Modal>

  <!-- Simple modal with a loading text for the payment -->
  <Modal v-if="modal_payment">
    <template #title>
      {{ $t('views.me.payment') }}
    </template>
    <template #body>
      {{ $t('views.me.registrationAddedToCart') }}
      <br><br>
      {{ $t('views.me.findCartFromAccount') }}
    </template>
    <template #buttons>
      <button
        class="c-btn-bg-3"
        type="button"
        @click="modal_payment = false"
      >
        {{ $t('views.me.stayOnPage') }}
      </button>
      <router-link
        class="c-btn-secondary"
        :to="`/cart`"
      >
        {{ $t('views.me.goToCart') }}
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

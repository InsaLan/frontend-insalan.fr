<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import {
  email, minLength, required, sameAs,
} from '@vuelidate/validators';
import { storeToRefs } from 'pinia';
import {
  computed, onMounted, reactive, ref,
} from 'vue';
import placeholder from '@/assets/images/logo_home.png';
import FormField from '@/components/FormField.vue';
import Modal from '@/components/Modal.vue';
import { useUserStore } from '@/stores/user.store';

const userStore = useUserStore();
const { user, role, inscriptions } = storeToRefs(userStore);
const { fetch_user_inscription_full, patch_user } = userStore;

onMounted(async () => {
  await fetch_user_inscription_full();
});

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
  <div class="ml-1 flex flex-col md:flex-row">
    <div id="profile" class="items-center md:w-2/6">
      <h1 class="m-3 text-center text-4xl font-bold">
        Mon compte
      </h1>
      <div class="myr-2 flex flex-col place-items-center justify-items-center md:place-items-start md:justify-items-start">
        <div class="my-2 flex flex-col place-items-center justify-items-center md:flex-row">
          <div class="m-2 flex place-items-center justify-items-center">
            <a>
              <img
                :src="user.image ? user.image : placeholder"
                alt="image de profile"
                class="m-2 max-h-full w-16 max-w-full rounded-full hover:blur-sm"
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
                class="ml-2 hover:cursor-pointer hover:text-blue-600"
                icon="fa-solid fa-pencil"
                size="2xs"
                @click="editField('name')"
                @keydown="editField('name')"
              />
            </p>
            <p class="text-xl">
              Email : <em>{{ user.email }}</em>
              <fa-awesome-icon
                class="ml-2 hover:cursor-pointer hover:text-blue-600"
                icon="fa-solid fa-pencil"
                size="2xs"
                @click="editField('email')"
                @keydown="editField('email')"
              />
            </p>
            <p class="text-xl">
              Mot de passe : <em>**********</em>
              <fa-awesome-icon
                class="ml-2 hover:cursor-pointer hover:text-blue-600"
                icon="fa-solid fa-pencil"
                size="2xs"
                @click="editField('password')"
                @keydown="editField('password')"
              />
            </p>
            <div class="flex place-items-center justify-items-center">
              <p class="text-xl">
                Role :
              </p>
              <div class="text-md m-1 flex w-16 justify-around rounded bg-blue-700 p-1">
                <svg
                  v-if="role === 'dev'"
                  class="h-6 w-6"
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
                {{ role }}
              </div>
            </div>
          </div>
        </div>
        <!--div class="myr-2 ml-1">
          <button
          @click="delete_account()" class="center rounded transition duration-150 ease-in-out p-2 font-bold
           text-white bg-red-600 hover:ring hover:ring-pink-500" style="display: flex; align-items: center;">
           Supprimer son compte</button>
        </div-->
      </div>
    </div>
    <div class="hidden h-auto w-[2px] bg-white sm:block"/>
    <div id="team" class="md:w-4/6">
      <h1 class="m-3 text-center text-4xl font-bold">
        Mes Équipes
      </h1>
      <!--div>
        <div class="bg-red-900 rounded-xl text-center m-2 text-xl" v-if="Object.keys(inscriptions.unpaid).length">
          <h2 class="mx-5 text-xl" v-if="Object.keys(inscriptions.unpaid).length === 1">
            <fa-awesome-icon size="xs" icon="fa-solid fa-warning" />  Vous avez une inscription non payée
            <fa-awesome-icon size="xs" icon="fa-solid fa-warning" /> </h2>
          <h2 class="mx-5 text-xl" v-else>
            <fa-awesome-icon size="xs" icon="fa-solid fa-warning" />  Vous avez des inscriptions non payées
            <fa-awesome-icon size="xs" icon="fa-solid fa-warning" /> </h2>
        </div>
      </div-->
      <div v-if="inscriptions.ongoing?.length > 0" class="m-4">
        <h1 class="text-xl">
          Edition Actuelle
        </h1>
        <div class="m-1 grid gap-3 md:grid-cols-3">
          <a
            v-for="inscription in inscriptions.ongoing"
            :key="inscription[1].id"
            :class="{ /*[`bg-red-900`]: inscriptions.unpaid[inscription.team.id]*/ }"
            :href="`/tournament/${inscription[1].team.tournament.id }?s=teams`"
            class="container flex max-w-xs flex-col-reverse break-words bg-cyan-900 text-center"
          >
            <div class="my-1 hidden md:block">
              <div class="m-1 flex h-8 flex-1 flex-col justify-center">
                <div>
                  <a
                    :class="{ [`bg-red-600`]: inscriptions.unpaid[inscription[1].team.id], [`bg-green-600`]: !inscriptions.unpaid[inscription[1].team.id] }"
                    class="center rounded p-2 font-bold text-white transition duration-150 ease-in-out hover:ring hover:ring-pink-500"
                    :href="`/tournament/${inscription[1].team.tournament.id }?s=teams`"
                  >
                    {{ inscriptions.unpaid[inscription[1].team.id] ? 'Terminer l\'inscription' : (inscription[1].team.players[0] === user.id || inscription[0] === "manager") ? 'Gérer l\'équipe' : 'Voir l\'équipe' }}
                  </a>
                </div>
              </div>
            </div>
            <div class="hidden flex-col md:block">
              <a
                class="mt-auto text-zinc-400"
                :href="`/tournament/${inscription[1].team.tournament.id }?s=rules`"
              >Règlement du tournoi</a>
            </div>
            <img
              :src="inscription[1].team.tournament.logo"
              alt="image du tournoi"
              class="h-32 w-32 max-w-full overflow-hidden"
              style="width: 100%; object-fit: cover;"
            />
            <div class="m-1 flex flex-1 flex-col justify-center">
              <p class="text-xl">{{ inscription[1].team.name }}</p>
            </div>
          </a>
        </div>
      </div>
      <div v-if="inscriptions.past?.length > 0" class="m-4">
        <h1 class="text-xl">
          Autres Editions
        </h1>
        <div class="m-1 grid gap-3 md:grid-cols-3">
          <a
            v-for="inscription in inscriptions.past"
            :key="inscription[1].id"
            :href="`/tournament/${inscription[1].team.tournament.id }?s=teams`"
            class="container flex max-w-xs flex-col-reverse break-words bg-cyan-900 text-center"
          >
            <div class="my-1 hidden md:block">
              <div class="m-1 flex h-8 flex-1 flex-col justify-center">
                <div>
                  <a
                    class="center rounded bg-green-600 p-2 font-bold text-white transition duration-150 ease-in-out hover:ring hover:ring-pink-500"
                    :href="`/tournament/${inscription[1].team.tournament.id }?s=teams`"
                  >
                    {{ (inscription[1].team.players[0] === user.id || inscription[0] === 'manager') ? 'Gérer l\'équipe' : 'Voir l\'équipe' }}
                  </a>
                </div>
              </div>
            </div>
            <div class="hidden flex-col md:block">
              <a
                class="mt-auto text-zinc-400"
                :href="`/tournament/${inscription[1].team.tournament.id }?s=rules`"
              >
                Règlement du tournoi
              </a>
            </div>
            <img
              :src="inscription[1].team.tournament.logo"
              alt="image du tournoi"
              class="h-32 w-32 max-w-full overflow-hidden"
              style="width: 100%; object-fit: cover;"
            />
            <div class="m-1 flex flex-1 flex-col justify-center">
              <p class="text-xl">{{ inscription[1].team.name }}</p>
            </div>
          </a>
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
      <form id="patch-user" class="mt-2" @submit.prevent="validateModal">
        <div v-if="focus === 'name'" id="name">
          <FormField
            v-slot="context"
            :validations="v$_name.first_name"
            class="m-2 flex flex-col"
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
          <FormField v-slot="context" :validations="v$_name.last_name" class="m-2 flex flex-col" label="Nouveau Nom">
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
          <FormField v-slot="context" :validations="v$_email.email" class="m-2 flex flex-col" label="Email">
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
            class="m-2 flex flex-col"
            label="Nouveau mot de passe"
          >
            <input
              v-model="data_password.new_password"
              :class="{ error: context.invalid }"
              aria-label="Nouveau mot de passe"
              class="border-2 bg-theme-bg"
              placeholder="Nouveau mot de passe"
              required
              type="password"
              @blur="v$_password.new_password.$touch"
            />
          </FormField>
          <FormField
            v-slot="context"
            :validations="v$_password.password_validation"
            class="m-2 flex flex-col"
            label="Confirmer le mot de passe"
          >
            <input
              v-model="data_password.password_validation"
              :class="{ error: context.invalid }"
              aria-label="Confirmer le mot de passe"
              class="border-2 bg-theme-bg"
              placeholder="Confirmer le mot de passe"
              required
              type="password"
              @blur="v$_password.password_validation.$touch"
            />
          </FormField>
          <FormField
            v-slot="context"
            :validations="v$_password.current_password"
            class="m-2 flex flex-col"
            label="Mot de passe actuel"
          >
            <input
              v-model="data_password.current_password"
              :class="{ error: context.invalid }"
              aria-label="mot de passe actuel"
              class="border-2 bg-theme-bg"
              placeholder="Mot de passe actuel"
              required
              type="password"
              @blur="v$_password.current_password.$touch"
            />
          </FormField>
        </div>
        <!-- hidden submit button with tailwind-->
        <button class="hidden" type="submit"/>
      </form>
    </template>
    <template #buttons>
      <button
        class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
        type="submit"
        @click="validateModal"
      >
        Valider
      </button>
      <button
        class="inline-flex w-full justify-center rounded-md bg-gray-500 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-300 sm:mt-0 sm:w-auto"
        type="button"
        @click="closeModal"
      >
        Annuler
      </button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import {
  computed, reactive, ref,
} from 'vue';
import { useContentStore } from '@/stores/content.store';
import { useUserStore } from '@/stores/user.store';
import {
  acceptGCU, email, minLength, required, sameAs,
} from '@/support/locales/errors.fr';

import Content from './Content.vue';
import FormField from './FormField.vue';
import Modal from './Modal.vue';
import PasswordInput from './PasswordInput.vue';

const contentStore = useContentStore();
const { getContent } = contentStore;

const modal_cgu = ref(false);
const show_modal_cgu = (event: MouseEvent | KeyboardEvent) => {
  if (getContent('cgu')) {
    event.preventDefault();
    modal_cgu.value = true;
  }
};

const { signin } = useUserStore();
// Register form validation
const register_form = reactive({
  username: '',
  email: '',
  password: '',
  password_confirm: '',
  accept_cgu: false,
  decoy: '',
});

const rules = computed(() => ({
  username: { required },
  email: { required, email },
  password: { required, minLengthValue: minLength(8) },
  password_confirm: {
    required,
    sameAsPassword: sameAs(computed(() => register_form.password)),
  },
  accept_cgu: { acceptGCU },
}));
const v$ = useVuelidate(rules, register_form);

const register_user = async () => {
  const isValid = await v$.value.$validate();
  if (!isValid) return;

  if (register_form.decoy === '') {
    await signin(register_form.email, register_form.username, register_form.password, register_form.password_confirm);
  } else {
    await signin(
      register_form.email,
      register_form.username,
      register_form.password,
      register_form.password_confirm,
      register_form.decoy,
    );
  }
};

</script>

<template>
  <div class="flex basis-1/2 flex-col items-center rounded-lg border-2 border-solid border-theme-bg hover:border-sky-500">
    <h1 class="text-center text-4xl text-white">
      S'enregistrer
    </h1>

    <form class="my-5" @submit.prevent="register_user">
      <FormField v-slot="context" :validations="v$.email" class="flex flex-col">
        <label for="email">
          Email
        </label>
        <input
          id="email"
          v-model="register_form.email"
          :class="{ error: context.invalid }"
          class="border-2 bg-theme-bg"
          placeholder="foo@insalan.fr"
          required
          type="text"
          @blur="v$.email.$touch()"
        />
      </FormField>
      <FormField v-slot="context" :validations="v$.username" class="flex flex-col">
        <label for="username_register">
          Nom d'utilisateur·rice
        </label>
        <input
          id="username_register"
          v-model="register_form.username"
          :class="{ error: context.invalid }"
          class="border-2 bg-theme-bg"
          placeholder="John doe"
          required
          type="text"
          @blur="v$.username.$touch()"
        />
      </FormField>
      <div class="hidden">
        <label for="username_register">username</label>
        <input
          id="username_register"
          v-model="register_form.decoy"
          type="text"
        />
      </div>
      <FormField v-slot="context" :validations="v$.password" class="flex flex-col" required>
        <label for="password_register">
          Mot de passe
        </label>
        <PasswordInput
          id="password_register"
          v-model="register_form.password"
          :error="context.invalid"
          :on-blur="v$.password.$touch"
        />
      </FormField>
      <FormField v-slot="context" :validations="v$.password_confirm" class="flex flex-col">
        <label for="repeat">
          Répéter mot de passe
        </label>
        <PasswordInput
          id="repeat"
          v-model="register_form.password_confirm"
          :error="context.invalid"
          required
          :on-blur="v$.password_confirm.$touch"
        />
      </FormField>
      <FormField v-slot="context" :validations="v$.accept_cgu" class="flex flex-col" required>
        <div class="flex flex-row">
          <input
            id="accept"
            v-model="register_form.accept_cgu"
            :class="{ error: context.invalid }"
            class="mr-1 mt-1 border-2 bg-theme-bg"
            type="checkbox"
          >
          <label class="text-white" for="accept">J'accepte les <a
            class="text-gray-400 underline decoration-dashed"
            href="#"
            @click="show_modal_cgu"
            @keydown.enter="show_modal_cgu"
          >CGU</a> de l'InsaLan</label>
        </div>
      </FormField>
      <div class="flex flex-col items-center">
        <button class="form-btn" type="submit">
          Créer un compte
        </button>
      </div>
    </form>
  </div>

  <Modal v-if="modal_cgu" :close-on-click="true" :close-on-escape="true" @close="modal_cgu = false">
    <template #icon>
      <a
        class="text-gray-400 hover:text-gray-500"
        role="button"
        tabindex="0"
        aria-label="Close"
        @click="modal_cgu = false"
        @keydown.enter="modal_cgu = false"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="size-6 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </a>
    </template>
    <template #title>
      <h3 class="text-lg font-medium leading-6">
        Conditions générales d'utilisation
      </h3>
    </template>
    <template #body>
      <div class="max-h-[50vh] overflow-y-auto">
        <Content name="cgu"/>
      </div>
    </template>
    <template #buttons>
      <button
        class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
        type="button"
        @click="modal_cgu = false"
      >
        Fermer
      </button>
    </template>
  </Modal>
</template>

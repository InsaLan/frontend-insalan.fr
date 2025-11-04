<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import { computed, reactive, ref } from 'vue';
import { useUserStore } from '@/stores/user.store';
import { email, required } from '@/support/locales/errors.fr';

import FormField from './FormField.vue';
import Modal from './Modal.vue';
import PasswordInput from './PasswordInput.vue';

const { ask_reset_password, login } = useUserStore();

// Register form validation
const login_form = reactive({
  username: '',
  password: '',
});

const rules = computed(() => ({
  username: { required },
  password: { required },
}));

const v$ = useVuelidate(rules, login_form);

const login_user = async () => {
  const isValid = await v$.value.$validate();
  if (!isValid) return;
  await login(login_form.username, login_form.password);
};

const modal_open = ref(false);

const data = reactive({
  email: '',
});
const rules_modal = computed(() => ({
  email: { required, email },
}));
const v$_modal = useVuelidate(rules_modal, data);

const closeModal = () => {
  modal_open.value = false;
};

const validateModal = async () => {
  const isValid = await v$_modal.value.$validate();
  if (!isValid) return;
  await ask_reset_password(data.email);
  closeModal();
};

const openModal = () => {
  modal_open.value = true;
};

</script>

<template>
  <div class="flex basis-1/2 flex-col items-center rounded-lg border-2 border-solid border-theme-bg hover:border-sky-500">
    <h1 class="text-center text-4xl text-white">
      Se connecter
    </h1>
    <form id="login" class="my-2" @submit.prevent="login_user">
      <FormField v-slot="context" :validations="v$.username" class="flex flex-col">
        <label for="username">
          Nom d'utilisateur·trice
        </label>
        <input
          id="username"
          v-model="login_form.username"
          :class="{ error: context.invalid }"
          class="border-2 bg-theme-bg"
          placeholder="John doe"
          type="text"
          @blur="v$.username.$touch"
        />
      </FormField>
      <FormField v-slot="context" :validations="v$.password" class="flex flex-col">
        <label for="password">
          Mot de passe
        </label>
        <PasswordInput
          id="password"
          v-model="login_form.password"
          :error="context.invalid"
          :on-blur="v$.password.$touch"
        />
      </FormField>
      <div class="flex flex-col items-center">
        <button class="form-btn" type="submit">
          Se connecter
        </button>
      </div>
    </form>
    <button class="p-1 hover:cursor-pointer hover:text-blue-800" type="button" @click="openModal()">
      Mot de passe oublié ?
    </button>
  </div>

  <Modal v-if="modal_open" @close="closeModal">
    <template #icon>
      <div/>
    </template>
    <template #title>
      <h3 id="modal-title" class="text-white-900 text-base font-semibold leading-6">
        Mot de passe oublié ?
      </h3>
    </template>
    <template #body>
      <form id="password-reset" class="mt-2" @submit.prevent="validateModal">
        <FormField v-slot="context" :validations="v$_modal.email" class="m-2 flex flex-col">
          <label for="email">
            Email
          </label>
          <input
            id="email"
            v-model="data.email"
            :class="{ error: context.invalid }"
            class="border-2 bg-theme-bg"
            placeholder="John-doe@gmail.com"
            required
            type="text"
            @blur="v$_modal.email.$touch"
          />
        </FormField>
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

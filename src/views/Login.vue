<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import { computed, reactive, ref } from 'vue';
import FormField from '@/components/FormField.vue';
import Modal from '@/components/Modal.vue';
import PasswordInput from '@/components/PasswordInput.vue';
import { useUserStore } from '@/stores/user.store';
import { email, required } from '@/support/locales/errors.fr';

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
  <div class="l-flex-column l-items-cross-center u-m-body">
    <div class="l-flex-column l-items-cross-center c-card-bg-2 u-p-4">
      <div class="l-flex-column l-items-cross-center u-mb-2">
        <h1 class="c-title u-m-0">
          Se connecter
        </h1>
        <router-link
          to="/register"
        >
          <div
            class="l-flex-row l-items-cross-center c-text-btn u-m-0"
          >
            Je n'ai pas de compte
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              class="u-ml-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="3"
                d="M9 19l7-7-7-7"
              />
            </svg>
          </div>
        </router-link>
      </div>
      <form id="login" @submit.prevent="login_user">
        <FormField v-slot="context" :validations="v$.username" class="l-flex-column">
          <label for="username">
            Nom d'utilisateur·rice
          </label>
          <input
            id="username"
            v-model="login_form.username"
            :class="{ error: context.invalid }"
            placeholder="John doe"
            type="text"
            @blur="v$.username.$touch"
          />
        </FormField>
        <FormField v-slot="context" :validations="v$.password" class="l-flex-column">
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
        <button class="c-btn-primary u-mt-2" type="submit">
          Se connecter
        </button>
        <button class="c-text-btn" type="button" @click="openModal()">
          Mot de passe oublié ?
        </button>
      </form>
    </div>

    <Modal v-if="modal_open" @close="closeModal">
      <template #icon>
        <div/>
      </template>
      <template #title>
        <h3 id="modal-title">
          Mot de passe oublié ?
        </h3>
      </template>
      <template #body>
        <form id="password-reset" class="u-mt-1" @submit.prevent="validateModal">
          <FormField v-slot="context" :validations="v$_modal.email" class="u-m-1 l-flex-column">
            <label for="email">
              Email
            </label>
            <input
              id="email"
              v-model="data.email"
              :class="{ error: context.invalid }"
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
  </div>
</template>

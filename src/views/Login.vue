<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import {
  computed, onMounted, reactive, ref,
} from 'vue';
import { useRouter } from 'vue-router';
import FormField from '@/components/FormField.vue';
import Modal from '@/components/Modal.vue';
import PasswordInput from '@/components/PasswordInput.vue';
import { useUserStore } from '@/stores/user.store';
import { email, required } from '@/support/locales/errors';

const { ask_reset_password, login, isConnected } = useUserStore();

const router = useRouter();

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

onMounted(async () => {
  if (isConnected) {
    await router.push('/me');
  }
});
</script>

<template>
  <div class="l-flex-column l-cross-center l-main-center u-full-height u-m-text">
    <div class="l-flex-column l-cross-center c-card-bg-2 u-p-4">
      <div class="l-flex-column l-cross-center u-mb-2">
        <h1 class="u-m-0">
          {{ $t('content.views.Login.login') }}
        </h1>
        <router-link
          to="/register"
        >
          <div
            class="l-flex-row l-cross-center c-text-btn u-m-0"
          >
            {{ $t('content.views.Login.noAccount') }}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="c-inline-icon"
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
        <FormField :validations="v$.username">
          <label for="username">
            {{ $t('content.views.Login.username') }}
          </label>
          <input
            id="username"
            v-model="login_form.username"
            placeholder="johndoe"
            type="text"
            @blur="v$.username.$touch"
          />
        </FormField>
        <FormField :validations="v$.password">
          <label for="password">
            {{ $t('content.views.Login.password') }}
          </label>
          <PasswordInput
            id="password"
            v-model="login_form.password"
            :placeholder="$t('content.views.Login.password')"
            :on-blur="v$.password.$touch"
          />
        </FormField>
        <button class="c-btn-primary u-mt-2" type="submit">
          {{ $t('content.views.Login.submit') }}
        </button>
        <button class="c-text-btn" type="button" @click="openModal()">
          {{ $t('content.views.Login.forgotPasswordQuestion') }}
        </button>
      </form>
    </div>

    <Modal v-if="modal_open" @close="closeModal">
      <template #title>
        {{ $t('content.views.Login.forgotPassword') }}
      </template>
      <template #body>
        <form id="password-reset" @submit.prevent="validateModal">
          <FormField :validations="v$_modal.email">
            <label for="email">
              {{ $t('content.views.Login.email') }}
            </label>
            <input
              id="email"
              v-model="data.email"
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
          {{ $t('content.views.Login.cancel') }}
        </button>
        <button
          class="c-btn-secondary"
          type="submit"
          @click="validateModal"
        >
          {{ $t('content.views.Login.validate') }}
        </button>
      </template>
    </Modal>
  </div>
</template>

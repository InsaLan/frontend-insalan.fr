<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import {
  computed, onMounted, reactive, ref,
} from 'vue';
import { useRouter } from 'vue-router';
import Content from '@/components/Content.vue';
import FormField from '@/components/FormField.vue';
import Modal from '@/components/Modal.vue';
import PasswordInput from '@/components/PasswordInput.vue';
import { useContentStore } from '@/stores/content.store';
import { useUserStore } from '@/stores/user.store';
import {
  acceptGCU, email, minLength, required, sameAs,
} from '@/support/locales/errors.fr';

const contentStore = useContentStore();
const { getContent } = contentStore;

const modal_cgu = ref(false);
const show_modal_cgu = (event: MouseEvent | KeyboardEvent) => {
  if (getContent('cgu')) {
    event.preventDefault();
    modal_cgu.value = true;
  }
};

const router = useRouter();

const { signin, isConnected } = useUserStore();
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
          {{ $t('content.views.Login.signin') }}
        </h1>
        <router-link
          to="/login"
        >
          <div
            class="l-flex-row l-cross-center c-text-btn u-m-0"
          >
            {{ $t('content.views.Login.alreadyExists') }}
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
      <form @submit.prevent="register_user">
        <div class="l-grid-2 l-horizontal-gap-4 l-vertical-gap-2">
          <div class="l-flex-column l-gap-2">
            <FormField :validations="v$.email">
              <label for="email">
                {{ $t('content.views.Login.email') }}
              </label>
              <input
                id="email"
                v-model="register_form.email"
                placeholder="foo@insalan.fr"
                required
                type="text"
                @blur="v$.email.$touch()"
              />
            </FormField>
            <FormField :validations="v$.username">
              <label for="username_register">
                {{ $t('content.views.Login.username') }}
              </label>
              <input
                id="username_register"
                v-model="register_form.username"
                placeholder="johndoe"
                required
                type="text"
                @blur="v$.username.$touch()"
              />
            </FormField>
            <div hidden>
              <label for="username_register">username</label>
              <input
                id="username_register"
                v-model="register_form.decoy"
                type="text"
              />
            </div>
          </div>
          <div class="l-flex-column l-gap-2">
            <FormField :validations="v$.password" required>
              <label for="password_register">
                {{ $t('content.views.Login.password') }}
              </label>
              <PasswordInput
                id="password_register"
                v-model="register_form.password"
                :on-blur="v$.password.$touch"
              />
            </FormField>
            <FormField :validations="v$.password_confirm">
              <label for="repeat">
                {{ $t('content.views.Login.passwordConfirm') }}
              </label>
              <PasswordInput
                id="repeat"
                v-model="register_form.password_confirm"
                required
                :on-blur="v$.password_confirm.$touch"
              />
            </FormField>
          </div>
        </div>
        <FormField :validations="v$.accept_cgu" class="l-flex-row l-main-center l-cross-center" required>
          <input
            id="accept"
            v-model="register_form.accept_cgu"
            class="u-mr-1"
            type="checkbox"
          >
          <i18n-t keypath="content.views.Login.acceptCgu" tag="label" for="accept">
            <a
              class="c-link"
              href="#"
              @click="show_modal_cgu"
              @keydown.enter="show_modal_cgu"
            >{{ $t('content.views.Login.cgu') }}</a>
          </i18n-t>
        </FormField>
        <button class="c-btn-primary" type="submit">
          {{ $t('content.views.Login.signin') }}
        </button>
      </form>
    </div>

    <Modal v-if="modal_cgu" @close="modal_cgu = false">
      <template #title>
        {{ $t('content.views.Login.cgu') }}
      </template>
      <template #body>
        <Content name="cgu"/>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import {
  computed, reactive, ref,
} from 'vue';
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
  <div class="l-flex-column l-items-cross-center u-m-body">
    <div class="l-flex-column l-items-cross-center c-card-bg-2 u-p-4">
      <div class="l-flex-column l-items-cross-center u-mb-2">
        <h1 class="c-title u-m-0">
          S'enregistrer
        </h1>
        <router-link
          to="/login"
        >
          <div
            class="l-flex-row l-items-cross-center c-text-btn u-m-0"
          >
            J'ai déjà un compte
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
      <form @submit.prevent="register_user">
        <div class="l-grid-2 l-horizontal-gap-4 l-vertical-gap-2">
          <div class="l-flex-column l-gap-2">
            <FormField v-slot="context" :validations="v$.email" class="l-flex-column">
              <label for="email">
                Email
              </label>
              <input
                id="email"
                v-model="register_form.email"
                :class="{ error: context.invalid }"
                placeholder="foo@insalan.fr"
                required
                type="text"
                @blur="v$.email.$touch()"
              />
            </FormField>
            <FormField v-slot="context" :validations="v$.username" class="l-flex-column">
              <label for="username_register">
                Nom d'utilisateur·rice
              </label>
              <input
                id="username_register"
                v-model="register_form.username"
                :class="{ error: context.invalid }"
                placeholder="John doe"
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
            <FormField v-slot="context" :validations="v$.password" class="l-flex-column" required>
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
            <FormField v-slot="context" :validations="v$.password_confirm" class="l-flex-column">
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
          </div>
        </div>
        <FormField v-slot="context" :validations="v$.accept_cgu" class="l-flex-row l-items-main-center l-items-cross-center" required>
          <input
            id="accept"
            v-model="register_form.accept_cgu"
            :class="{ error: context.invalid }"
            class="u-mr-1"
            type="checkbox"
          >
          <label for="accept">J'accepte les <a
            class="c-link"
            href="#"
            @click="show_modal_cgu"
            @keydown.enter="show_modal_cgu"
          >CGU</a> de l'InsaLan</label>
        </FormField>
        <button class="c-btn-primary" type="submit">
          Créer un compte
        </button>
      </form>
    </div>

    <Modal v-if="modal_cgu" :close-on-click="true" :close-on-escape="true" @close="modal_cgu = false">
      <template #icon>
        <a
          class="c-image-btn"
          role="button"
          tabindex="0"
          aria-label="Close"
          @click="modal_cgu = false"
          @keydown.enter="modal_cgu = false"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
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
        Conditions générales d'utilisation
      </template>
      <template #body>
        <div class="l-overflow-auto max-height-60vh">
          <Content name="cgu"/>
        </div>
      </template>
      <template #buttons>
        <button
          class="c-btn-secondary"
          type="button"
          @click="modal_cgu = false"
        >
          Fermer
        </button>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.max-height-60vh {
  max-height: 60vh;
}
</style>

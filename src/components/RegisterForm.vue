<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import {
  email, helpers, minLength, required, sameAs,
} from '@vuelidate/validators';
import { computed, reactive } from 'vue';
import { useUserStore } from '@/stores/user.store';

import FormField from './FormField.vue';

const { signin } = useUserStore();
const acceptGCU = helpers.withParams(
  { type: 'acceptGcu' },
  (value) => value === true,
);
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
const v$ = useVuelidate(rules, register_form, { $autoDirty: true });

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
          Nom d'utilisateur
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
        <input v-model="register_form.decoy" type="text"/>
      </div>
      <FormField v-slot="context" :validations="v$.password" class="flex flex-col" required>
        <label for="password_register">
          Mot de passe
        </label>
        <input
          id="password_register"
          v-model="register_form.password"
          :class="{ error: context.invalid }"
          class="border-2 bg-theme-bg"
          placeholder="Mot de passe"
          type="password"
          @blur="v$.password.$touch"
        />
      </FormField>
      <FormField v-slot="context" :validations="v$.password_confirm" class="flex flex-col">
        <label for="repeat">
          Répéter mot de passe
        </label>
        <input
          id="repeat"
          v-model="register_form.password_confirm"
          :class="{ error: context.invalid }"
          class="border-2 bg-theme-bg"
          placeholder="Mot de passe"
          required
          type="password"
          @blur="v$.password_confirm.$touch"
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
          >CGU</a> de l'insalan</label>
        </div>
      </FormField>
      <div class="flex flex-col items-center">
        <button class="form-btn" type="submit">
          Créer un compte
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import {
  email, helpers, minLength, required, sameAs,
} from '@vuelidate/validators';
import { computed, reactive } from 'vue';

import { useUserStore } from '../stores/user.store';
import FormField from './FormField.vue';

const { signin } = useUserStore();
const acceptGCU = helpers.withParams(
  { type: 'acceptGcu' },
  (value) => value == true,
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
    await signin(register_form.email, register_form.username, register_form.password, register_form.password_confirm);
  }
};

</script>

<template>
  <div class="flex basis-1/2 flex-col items-center rounded-lg hover:border-2 hover:border-solid hover:border-sky-500">
    <h1 class="text-center text-4xl text-white">
      S'enregistrer
    </h1>

    <form class="my-5">
      <FormField v-slot="context" label="Email" :validations="v$.email" class="flex flex-col">
        <input v-model="register_form.email" required :class="{ error: context.invalid }" class="border-2 bg-theme-bg" type="text" placeholder="foo@insalan.fr" @blur="v$.email.$touch()"/>
      </FormField>
      <FormField v-slot="context" label="Nom d'utilisateur" class="flex flex-col" :validations="v$.username">
        <input v-model="register_form.username" required :class="{ error: context.invalid }" class="border-2 bg-theme-bg" placeholder="john doe" type="text" @blur="v$.username.$touch()"/>
      </FormField>
      <div class="hidden">
        <label for="username">username</label>
        <input v-model="register_form.decoy" type="text"/>
      </div>
      <FormField v-slot="context" required label="Mot de passe" :validations="v$.password" class="flex flex-col">
        <input v-model="register_form.password" :class="{ error: context.invalid }" class="border-2 bg-theme-bg" type="password" placeholder="Mot de passe" @blur="v$.password.$touch"/>
      </FormField>
      <FormField v-slot="context" label="Répéter mot de passe" :validations="v$.password_confirm" class="flex flex-col">
        <input v-model="register_form.password_confirm" required :class="{ error: context.invalid }" class="border-2 bg-theme-bg" type="password" placeholder="Mot de passe" @blur="v$.password_confirm.$touch"/>
      </FormField>
      <FormField v-slot="context" required :validations="v$.accept_cgu" class="flex flex-col">
        <div class="flex flex-row">
          <input v-model="register_form.accept_cgu" class="mr-1 mt-1 border-2 bg-theme-bg" type="checkbox">
          <label class="text-white" for="accept">J'accepte les <a class="text-gray-400 underline decoration-dashed" href="#">CGU</a> de l'insalan</label>
        </div>
      </FormField>
    </form>
    <button type="button" class="form-btn" @click="register_user">
      Creer un compte
    </button>
  </div>
</template>

<style scoped>

</style>

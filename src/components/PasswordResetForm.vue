<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import {
  helpers, minLength, required, sameAs,
} from '@vuelidate/validators';
import { computed, reactive } from 'vue';

import { useUserStore } from '../stores/user.store';
import FormField from './FormField.vue';

const { reset_password } = useUserStore();

const props = defineProps<{
  idname: string;
  idtoken: string;
}>();
console.log(props);

const acceptGCU = helpers.withParams(
  { type: 'acceptGcu' },
  (value) => value === true,
);
// Register form validation
const data = reactive({
  password: '',
  password_confirm: '',
});

const rules = computed(() => ({
  password: { required, minLengthValue: minLength(8) },
  password_confirm: {
    required,
    sameAsPassword: sameAs(computed(() => data.password)),
  },
}));
const v$ = useVuelidate(rules, data);

const register_user = async () => {
  const isValid = await v$.value.$validate();
  if (!isValid) return;
  await reset_password(props.idname, props.idtoken, data.password, data.password_confirm);
};

</script>

<template>
  <div class="mb-5 flex basis-1/2 flex-col items-center rounded-lg hover:border-solid">
    <h1 class="text-center text-4xl text-white">
      Réinitialiser votre mot de passe
    </h1>
    <form class="my-5">
      <FormField v-slot="context" required label="Nouveau mot de passe" :validations="v$.password" class="flex flex-col">
        <input v-model="data.password" :class="{ error: context.invalid }" class="border-2 bg-theme-bg" type="password" placeholder="Mot de passe" @blur="v$.password.$touch"/>
      </FormField>
      <FormField v-slot="context" label="Répéter le mot de passe" :validations="v$.password_confirm" class="flex flex-col">
        <input v-model="data.password_confirm" required :class="{ error: context.invalid }" class="border-2 bg-theme-bg" type="password" placeholder="Mot de passe" @blur="v$.password_confirm.$touch"/>
      </FormField>
    </form>
    <button type="button" class="form-btn" @click="register_user">
      Valider
    </button>
  </div>
</template>

<style scoped>

</style>

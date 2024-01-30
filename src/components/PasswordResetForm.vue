<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import {
  minLength, required, sameAs,
} from '@vuelidate/validators';
import { computed, reactive } from 'vue';
import { useUserStore } from '@/stores/user.store';

import FormField from './FormField.vue';
import PasswordInput from './PasswordInput.vue';

const { reset_password } = useUserStore();

const props = defineProps<{
  idname: string;
  idtoken: string;
}>();
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
    <form id="password-reset" class="my-5 flex flex-col" @submit.prevent="register_user">
      <FormField v-slot="context" :validations="v$.password" class="flex flex-col" required>
        <label for="password">
          Nouveau mot de passe
        </label>
        <PasswordInput
          id="password"
          v-model="data.password"
          :error="context.invalid"
          :on-blur="v$.password.$touch"
        />
      </FormField>
      <FormField v-slot="context" :validations="v$.password_confirm" class="flex flex-col" required>
        <label for="repeat">
          Répéter le mot de passe
        </label>
        <PasswordInput
          id="repeat"
          v-model="data.password_confirm"
          :error="context.invalid"
          placeholder="Mot de passe"
          required
          :on-blur="v$.password_confirm.$touch"
        />
      </FormField>
      <div class="flex justify-center">
        <button class="form-btn" type="submit">
          Valider
        </button>
      </div>
    </form>
  </div>
</template>

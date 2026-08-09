<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import { computed, reactive } from 'vue';
import FormField from '@/components/FormField.vue';
import PasswordInput from '@/components/PasswordInput.vue';
import { useUserStore } from '@/stores/user.store';
import {
  minLength, required, sameAs,
} from '@/support/locales/errors.fr';

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
  <div class="l-flex-column l-cross-center u-m-text">
    <div class="l-flex-column l-cross-center c-card-bg-2 u-p-4">
      <h1 class="u-m-0">
        {{ $t('content.views.ResetPassword.title') }}
      </h1>
      <form id="password-reset" class="l-flex-column" @submit.prevent="register_user">
        <FormField :validations="v$.password" required>
          <label for="password">
            {{ $t('content.views.ResetPassword.newPassword') }}
          </label>
          <PasswordInput
            id="password"
            v-model="data.password"
            :on-blur="v$.password.$touch"
          />
        </FormField>
        <FormField :validations="v$.password_confirm" required>
          <label for="repeat">
            {{ $t('content.views.ResetPassword.repeatPassword') }}
          </label>
          <PasswordInput
            id="repeat"
            v-model="data.password_confirm"
            :placeholder="$t('content.views.ResetPassword.passwordPlaceholder')"
            required
            :on-blur="v$.password_confirm.$touch"
          />
        </FormField>
        <button class="c-btn-secondary" type="submit">
          {{ $t('content.views.ResetPassword.submit') }}
        </button>
      </form>
    </div>
  </div>
</template>

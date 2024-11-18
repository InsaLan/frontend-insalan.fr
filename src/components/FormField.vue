<script setup lang="ts">
import type { BaseValidation, ErrorObject } from '@vuelidate/core';
import { computed } from 'vue';
import errors_fr from '@/support/locales/errors.fr';

interface TypedErrorObject extends ErrorObject {
  readonly $params: Record<string, string>;
}

const props = withDefaults(defineProps<{
  validations: BaseValidation;
  label?: string;
}>(), {
  label: 'label',
});

const invalid = computed(() => props.validations.$error);
const errors = computed(() => {
  const localized_err: string[] = [];

  (props.validations.$errors as TypedErrorObject[]).forEach((e) => {
    localized_err.push(errors_fr.rules[e.$params.type as keyof typeof errors_fr.rules]);
  });

  return localized_err[0];
});
</script>
<template>
  <div>
    <slot :errors="errors" :invalid="invalid"/>
    <span v-if="invalid" class="bg-red-500 text-center">{{ errors }}</span>
  </div>
</template>

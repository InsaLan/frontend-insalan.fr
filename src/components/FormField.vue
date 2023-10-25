<script setup lang="ts">
import { computed } from 'vue';

import errors_fr from '../support/locales/errors.fr.ts';

const props = defineProps({
  validations: {
    required: true,
    type: Object,
  },
  label: {
    required: false,
    type: String,
    default: 'label',
  },
});

const invalid = computed(() => props.validations.$error);
const errors = computed(() => {
  const localized_err: String[] = [];

  props.validations.$errors.map((e) => {
    localized_err.push(errors_fr.rules[e.$params.type]);
  });

  return localized_err[0];
});
</script>
<template>
  <div>
    <label for="label">{{ label }}</label>
    <slot :errors="errors" :invalid="invalid"/>
    <span v-if="invalid" class="bg-red-500 text-center">{{ errors }}</span>
  </div>
</template>

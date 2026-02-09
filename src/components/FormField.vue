<script setup lang="ts">
import type { BaseValidation } from '@vuelidate/core';
import { computed } from 'vue';

const props = defineProps<{
  validations: BaseValidation;
}>();

const invalid = computed(() => props.validations.$error);
const errors = computed(() => props.validations.$errors.at(0));
</script>
<template>
  <div :class="$attrs.class || 'l-flex-column'">
    <slot :errors="errors" :invalid="invalid"/>
    <span v-if="invalid" class="c-card-error-1 u-p-0 u-text-center u-full-width">{{ errors?.$message }}</span>
  </div>
</template>

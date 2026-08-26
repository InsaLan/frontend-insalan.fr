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
  <div :class="$attrs.class || 'field-layout'">
    <slot :errors="errors" :invalid="invalid"/>
    <span v-if="invalid" class="c-card-error u-p-0 u-px-1 u-text-center u-full-width">{{ errors?.$message }}</span>
  </div>
</template>

<style scoped>
.field-layout {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field-layout:has(input[type='checkbox']) {
  flex-direction: row-reverse;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}
</style>

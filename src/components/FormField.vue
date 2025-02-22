<script setup lang="ts">
import type { BaseValidation } from '@vuelidate/core';
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  validations: BaseValidation;
  label?: string;
}>(), {
  label: 'label',
});

const invalid = computed(() => props.validations.$error);
const errors = computed(() => props.validations.$errors.at(0));
</script>
<template>
  <div>
    <slot :errors="errors" :invalid="invalid"/>
    <span v-if="invalid" class="bg-red-500 text-center">{{ errors?.$message }}</span>
  </div>
</template>

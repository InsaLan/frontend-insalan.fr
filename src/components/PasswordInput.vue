<script setup lang="ts">
import { ref } from 'vue';

const showPassword = ref(false);

interface Props {
  id?: string;
  error: boolean;
  placeholder?: string;
  ariaLabel?: string;
  required?: boolean;
  onBlur: () => void;
  modelValue: string;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const onInput = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
};

const onClick = (): void => {
  showPassword.value = !showPassword.value;
};
</script>

<template>
  <div
    :class="{ error }"
    class="l-flex-row"
  >
    <input
      :id="id"
      :value="modelValue"
      :type="showPassword ? 'text' : 'password'"
      class="min-w-0 grow border-0 bg-theme-bg focus:ring-0"
      :placeholder="placeholder || 'Mot de passe'"
      :aria-label="ariaLabel || 'Mot de passe'"
      :required="required"
      @input="onInput"
      @blur="onBlur"
    />
    <button type="button" class="mx-3 w-6 c-image-btn" @click="onClick">
      <fa-awesome-icon
        :icon="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"
        title="Afficher le mot de passe"
      />
    </button>
  </div>
</template>

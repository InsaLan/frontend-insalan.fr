<script setup lang="ts">
import { ref } from 'vue';

const showPassword = ref(false);

interface Props {
  id?: string;
  placeholder?: string;
  ariaLabel?: string;
  required?: boolean;
  generatePassword?: boolean;
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

const onViewToggle = (): void => {
  showPassword.value = !showPassword.value;
};

const onGeneratePassword = (): void => {
  const symboles = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = new Uint8Array(10);
  crypto.getRandomValues(values);
  let generatedPassword = '';
  values.forEach((v) => { generatedPassword += symboles[v % 62]; });

  showPassword.value = true;
  emit('update:modelValue', generatedPassword);
};
</script>

<template>
  <div
    class="l-flex-row l-items-cross-center"
  >
    <div class="password-field l-flex-row l-items-cross-center">
      <input
        :id="id"
        :value="modelValue"
        :type="showPassword ? 'text' : 'password'"
        :placeholder="placeholder || 'Mot de passe'"
        :aria-label="ariaLabel || 'Mot de passe'"
        :required="required"
        @input="onInput"
        @blur="onBlur"
      />

      <div class="password-actions l-flex-row l-items-cross-center">
        <button
          v-if="generatePassword && generatePassword === true"
          type="button"
          class="action-btn c-image-btn"
          title="Generer un mot de passe"
          @click="onGeneratePassword"
        >
          <fa-awesome-icon
            class="icon"
            icon="fa-solid fa-arrows-rotate"
          />
        </button>

        <button
          type="button"
          class="action-btn c-image-btn"
          title="Afficher le mot de passe"
          @click="onViewToggle"
        >
          <fa-awesome-icon
            class="icon"
            :icon="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.password-field {
  position: relative;
  width: 100%;
}

.password-field input {
  box-sizing: border-box;
  width: 100%;
  padding-right: 5.75rem;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
}

.icon {
  display: block;
  width: 1.2rem;
  height: auto;
}

.password-actions {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  gap: 0.35rem;
}
</style>

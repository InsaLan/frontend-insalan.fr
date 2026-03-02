<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  id?: string;
  placeholder?: string;
  label?: string;
  modelValue: string[];
}>();

const newElement = ref('');

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void;
}>();

const addElement = () => {
  if (!newElement.value) return;

  emit('update:modelValue', [
    ...props.modelValue,
    ...newElement.value.split(',').map((el) => el.trim()).filter((el) => el),
  ]);
  newElement.value = '';
};

const removeEl = (index: number) => {
  emit('update:modelValue', props.modelValue.filter((_, i) => i !== index));
};

const editEl = (index: number) => {
  newElement.value = props.modelValue[index];
  removeEl(index);
};
</script>

<template>
  <div v-if="modelValue.length" class="u-my-1 l-flex-row l-wrap l-gap-1">
    <div v-for="(el, i) in modelValue" :key="i" class="l-flex-row c-btn-bg-3 nopad">
      <button
        type="button"
        class="l-flex-row l-items-cross-center u-pl-1"
        title="Modifier"
        @click="editEl(i)"
      >
        <p class="truncate">
          {{ el }}
        </p>
      </button>
      <button
        type="button"
        class="u-px-1"
        title="Supprimer"
        @click="removeEl(i)"
      >
        <fa-awesome-icon class="xmark" icon="fa-xmark"/>
      </button>
    </div>
  </div>
  <div class="l-flex-row l-items-cross-center">
    <input
      :id="id"
      v-model="newElement"
      type="text"
      :aria-label="label"
      :placeholder="placeholder"
      @keydown.enter="addElement"
    />
    <button
      type="button"
      title="Ajouter"
      class="u-mx-2 c-image-btn"
      :disabled="newElement ? false : true"
      @click="addElement"
    >
      <fa-awesome-icon class="check" icon="fa-check"/>
    </button>
  </div>
</template>

<style scoped>
.xmark {
  color: var(--color-text-1);
  transition: color .2s;
}

.xmark:hover {
  color: var(--color-error-1);
  transition: color .2s;
}

.check {
  width: 1.2rem;
  height: 1.2rem;
}

.nopad {
  padding: .2rem;
}
</style>

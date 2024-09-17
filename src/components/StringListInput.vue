<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  id?: string;
  placeholder?: string;
  label?: string;
  error: boolean;
  modelValue: string[];
}>();

const a = ref('');

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void;
}>();

const addElement = () => {
  if (!a.value) return;

  emit('update:modelValue', [...props.modelValue, a.value]);
  a.value = '';
};

const removeEl = (index: number) => {
  emit('update:modelValue', props.modelValue.filter((_, i) => i !== index));
};

const editEl = (index: number) => {
  a.value = props.modelValue[index];
  removeEl(index);
};
</script>

<template>
  <div :class="{ 'border-red-500': error }" class="border-2 border-gray-500 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600">
    <div v-if="modelValue.length" class="m-1 flex flex-wrap gap-1">
      <div v-for="(el, i) in modelValue" :key="i" class="flex overflow-hidden rounded bg-cyan-900">
        <button
          type="button"
          class="flex items-center px-1 hover:bg-cyan-800"
          title="Modifier"
          @click="editEl(i)"
        >
          {{ el }}
        </button>
        <button
          type="button"
          class="flex items-center px-1 hover:bg-cyan-800"
          title="Supprimer"
          @click="removeEl(i)"
        >
          <fa-awesome-icon icon="fa-xmark"/>
        </button>
      </div>
    </div>
    <div class="flex items-center">
      <input
        :id="id"
        v-model="a"
        type="text"
        :aria-label="label"
        class="grow border-0 bg-theme-bg focus:ring-0"
        :placeholder="placeholder"
        @keydown.enter="addElement"
      />
      <button
        type="button"
        title="Ajouter"
        class="mx-3 w-6 rounded"
        :class="{ 'text-gray-500': !a }"
        @click="addElement"
      >
        <fa-awesome-icon icon="fa-check"/>
      </button>
    </div>
  </div>
</template>

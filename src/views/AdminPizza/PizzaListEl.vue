<script setup lang="ts">
import type { Pizza } from '@/models/pizza';

defineProps<{
  pizza: Pizza;
  onEdit: (pizza: Pizza) => void;
  onDelete: (pizza: Pizza) => void;
}>();
</script>

<template>
  <div
    :key="pizza.id"
    class="grid-layout grid gap-2 rounded bg-cyan-900 p-2 hover:bg-cyan-800"
  >
    <img
      v-if="pizza.image"
      :src="pizza.image"
      :alt="pizza.name + ' image'"
      class="aspect-video w-20 border-r border-white object-cover pr-2"
    >
    <div
      v-if="!pizza.image"
      class="flex aspect-video w-20 items-center justify-center border-r border-white pr-2"
    >
      <fa-awesome-icon icon="fa-pizza-slice" class="h-8 w-8"/>
    </div>
    <div class="flex items-center overflow-x-hidden border-r border-white pr-2">
      <p class="overflow-x-hidden text-ellipsis whitespace-nowrap">
        {{ pizza.name }}
      </p>
    </div>
    <div class="hidden items-center overflow-x-hidden border-r border-white pr-2 sm:flex">
      <p class="overflow-x-hidden text-ellipsis whitespace-nowrap">
        {{ pizza.ingredients.join(', ') }}
      </p>
    </div>
    <div class="hidden items-center overflow-x-hidden border-r border-white pr-2 lg:flex">
      <p class="overflow-x-hidden text-ellipsis whitespace-nowrap">
        {{ pizza.allergens.join(', ') }}
      </p>
    </div>
    <div class="flex items-center gap-2">
      <button
        type="button"
        class="h-8 w-8 rounded bg-green-600 hover:bg-green-500"
        title="Modifier"
        @click="onEdit(pizza)"
      >
        <fa-awesome-icon icon="fa-pen-to-square"/>
      </button>
      <button
        type="button"
        class="h-8 w-8 rounded bg-red-600 hover:bg-red-500"
        title="Supprimer"
        @click="onDelete(pizza)"
      >
        <fa-awesome-icon icon="fa-trash-can"/>
      </button>
    </div>
  </div>
</template>

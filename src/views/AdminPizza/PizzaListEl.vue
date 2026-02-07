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
    class="grid-layout grid l-gap-1 rounded bg-cyan-900 u-p-1 hover:bg-cyan-800"
  >
    <img
      v-if="pizza.image"
      :src="pizza.image"
      :alt="`${pizza.name} image`"
      class="aspect-video w-20 border-r border-white object-cover u-pr-1"
    >
    <div
      v-if="!pizza.image"
      class="flex aspect-video w-20 l-items-cross-center l-items-main-center border-r border-white u-pr-1"
    >
      <fa-awesome-icon icon="fa-pizza-slice" class="size-8"/>
    </div>
    <div class="flex l-items-cross-center overflow-x-hidden border-r border-white u-pr-1">
      <p class="overflow-x-hidden text-ellipsis whitespace-nowrap">
        {{ pizza.name }}
      </p>
    </div>
    <div class="hidden l-items-cross-center overflow-x-hidden border-r border-white u-pr-1 sm:flex">
      <p class="overflow-x-hidden text-ellipsis whitespace-nowrap">
        {{ pizza.ingredients.join(', ') }}
      </p>
    </div>
    <div class="hidden l-items-cross-center overflow-x-hidden border-r border-white u-pr-1 lg:flex">
      <p class="overflow-x-hidden text-ellipsis whitespace-nowrap">
        {{ pizza.allergens.join(', ') }}
      </p>
    </div>
    <div class="flex l-items-cross-center l-gap-1">
      <button
        type="button"
        class="size-8 rounded bg-green-600 hover:bg-green-500"
        title="Modifier"
        @click="onEdit(pizza)"
      >
        <fa-awesome-icon icon="fa-pen-to-square"/>
      </button>
      <button
        type="button"
        class="size-8 rounded bg-red-600 hover:bg-red-500"
        title="Supprimer"
        @click="onDelete(pizza)"
      >
        <fa-awesome-icon icon="fa-trash-can"/>
      </button>
    </div>
  </div>
</template>

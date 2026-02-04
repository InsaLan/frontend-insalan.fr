<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import type { Pizza } from '@/models/pizza';
import { usePizzaStore } from '@/stores/pizza.store';

const pizzaStore = usePizzaStore();

const props = defineProps<{
  id: number;
}>();

const { pizzaList } = storeToRefs(pizzaStore);
const pizza = computed<Pizza | undefined>(() => pizzaList.value[props.id]);

</script>
<template>
  <div class="grid c-card-bg-2-nopad u-pb-2">
    <!-- TODO: Fix image not sticking to the top -->
    <img
      :alt="`Image de ${pizza?.name}`"
      :src="pizza?.image"
      class="max-w-screen aspect-video h-48 u-full-width text-clip object-cover u-rounded"
    />
    <div class="l-flex-column u-full-width l-items-cross-center u-px-2">
      <div class="u-mb-1 w-3/4">
        <p class="u-text-center text-2xl u-bold">
          {{ pizza?.name }}
        </p>
      </div>
      <div class="flex">
        <p class="u-text-center">
          <span class="font-black">Ingrédients :</span> {{ pizza?.ingredients.join(', ') }}<br>
          <span class="font-black">Allergènes :</span> {{ pizza?.allergens.join(', ') }}
        </p>
      </div>
    </div>
  </div>
</template>

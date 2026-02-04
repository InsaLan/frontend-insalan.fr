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
  <div class="grid c-card-bg-2-nopad pb-4">
    <!-- TODO: Fix image not sticking to the top -->
    <img
      :alt="`Image de ${pizza?.name}`"
      :src="pizza?.image"
      class="max-w-screen aspect-video h-48 w-full text-clip object-cover u-rounded"
    />
    <div class="l-flex-column w-full l-items-cross-center px-4">
      <div class="mb-2 w-3/4">
        <p class="text-center text-2xl u-bold">
          {{ pizza?.name }}
        </p>
      </div>
      <div class="flex">
        <p class="text-center">
          <span class="font-black">Ingrédients :</span> {{ pizza?.ingredients.join(', ') }}<br>
          <span class="font-black">Allergènes :</span> {{ pizza?.allergens.join(', ') }}
        </p>
      </div>
    </div>
  </div>
</template>

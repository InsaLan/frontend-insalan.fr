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
  <div class="c-card-bg-2-nopad u-pb-2 l-flex-column l-items-cross-center">
    <!-- TODO: Fix image not sticking to the top -->
    <img
      :alt="`Image de ${pizza?.name}`"
      :src="pizza?.image"
      class="pizza-thumbnail u-full-width u-rounded"
    />
    <div class="l-flex-column l-items-cross-center l-items-main-center u-full-width u-px-2 l-grow">
      <p class="u-mb-1 u-text-center u-big-text u-bold">
        {{ pizza?.name }}
      </p>
      <p class="u-text-center">
        <b>Ingrédients :</b> {{ pizza?.ingredients.join(', ') }}<br>
        <b>Allergènes :</b> {{ pizza?.allergens.join(', ') }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.pizza-thumbnail {
  aspect-ratio: 16 / 9;
  height: 12rem;
  object-fit: cover;
}
</style>

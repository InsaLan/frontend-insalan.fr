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
  <div class="grid place-items-center gap-2 bg-cyan-900 shadow-lg">
    <img
      :alt="`Image de ${pizza?.name}`"
      :src="pizza?.image"
      class="max-w-screen aspect-video h-48 w-full text-clip object-cover"
    />
    <p class="text-2xl">
      {{ pizza?.name }}
    </p>
    <p class="text-center">
      Ingrédients : {{ pizza?.ingredients.join(', ') }} <br> Allergènes : {{ pizza?.allergens.join(', ') }}
    </p>
  </div>
</template>

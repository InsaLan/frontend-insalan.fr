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
  <div class="grid place-items-center bg-cyan-900 shadow-lg">
    <img
      :alt="`Image de ${pizza?.name}`"
      :src="pizza?.image"
      class="max-w-screen aspect-video h-48 w-full text-clip object-cover"
    />
    <div class="w-[75%] border-b-2">
      <p class="text-center text-2xl font-bold">
        {{ pizza?.name }}
      </p>
    </div>
    <p class="text-center">
      Ingrédients : {{ pizza?.ingredients.join(', ') }} <br> Allergènes : {{ pizza?.allergens.join(', ') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import Content from '@/components/Content.vue';
import PizzaCard from '@/components/PizzaCard.vue';
import { usePizzaStore } from '@/stores/pizza.store';

const pizzaStore = usePizzaStore();
const { pizzaList } = storeToRefs(pizzaStore);

const { fetchAllPizzas } = pizzaStore;

await fetchAllPizzas();
</script>

<template>
  <Content name="Restauration"/>
  <section>
    <div class="title my-2 text-white">
      Pizza
    </div>
    <div class="mb-12 grid w-full gap-4 px-4 md:grid-cols-2 xl:grid-cols-4">
      <PizzaCard
        v-for="pizza in pizzaList"
        :id="pizza.id"
        :key="pizza.id"
      />
    </div>
  </section>
</template>

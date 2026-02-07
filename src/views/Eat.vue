<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import Content from '@/components/Content.vue';
import PizzaCard from '@/components/PizzaCard.vue';
import { usePizzaStore } from '@/stores/pizza.store';
import { frenchFormatFromDate } from '@/utils';

const pizzaStore = usePizzaStore();
const { timeslotList, pizzaList } = storeToRefs(pizzaStore);

const { fetchAllPizzas, fetchNextTimeslots } = pizzaStore;

const sortedTimeslotList = computed(() => Object.values(timeslotList.value).sort((pizza1, pizza2) => {
  const time1 = new Date(pizza1.delivery_time).getTime();
  const time2 = new Date(pizza2.delivery_time).getTime();
  return time1 - time2;
}));

const pizzas = computed(() => {
  if (sortedTimeslotList.value.length === 0) {
    return pizzaList.value;
  }

  return Object.values(pizzaList.value)
    .filter((pizza) => sortedTimeslotList.value[0].pizza.includes(pizza.id));
});

await fetchAllPizzas();
await fetchNextTimeslots();
</script>

<template>
  <Content class="u-m-body u-mb-4 l-flex-column l-gap-4 u-text-indent" name="Restauration"/>
  <section v-if="sortedTimeslotList.length" class="u-m-body u-mb-4">
    <h1 class="c-title u-mb-4">
      Prochains créneaux
    </h1>
    <p>
      Les prochains créneaux sont :
    </p>
    <ul class="list-disc">
      <li v-for="timeslot in sortedTimeslotList" :key="timeslot.id" class="ml-16">
        Créneau {{ frenchFormatFromDate(new Date(timeslot.delivery_time)) }}
      </li>
    </ul>
  </section>
  <section>
    <h1 class="c-title u-mb-4">
      Pizzas {{ sortedTimeslotList.length ? 'du Prochain Créneau' : '' }}
    </h1>
    <div class="u-full-width l-gap-2 u-px-2 l-grid-3">
      <PizzaCard
        v-for="pizza in pizzas"
        :id="pizza.id"
        :key="pizza.id"
      />
    </div>
  </section>
</template>

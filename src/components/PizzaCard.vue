<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import type { Pizza } from '@/models/pizza';
import { usePizzaStore } from '@/stores/pizza.store';

const pizzaStore = usePizzaStore();

const props = defineProps<{
  id: number;
  onEdit?: (pizza: Pizza) => void;
  onDelete?: (pizza: Pizza) => void;
}>();

const { pizzaList } = storeToRefs(pizzaStore);
const pizza = computed<Pizza | undefined>(() => pizzaList.value[props.id]);

</script>
<template>
  <div class="c-card-bg-2 u-p-0 u-pb-2 l-flex-column l-cross-center u-full-height u-full-width">
    <img
      :alt="$t('components.pizzaCard.imageAlt', { name: pizza?.name })"
      :src="pizza?.image"
      class="pizza-thumbnail u-full-width u-rounded"
    />
    <div class="l-flex-row l-cross-center u-full-width u-px-2 l-grow l-gap-1">
      <div class="l-flex-column l-cross-center l-main-center u-full-width l-grow">
        <p class="u-mb-1 u-text-center u-big-text u-bold">
          {{ pizza?.name }}
        </p>
        <p class="u-text-center">
          <strong>{{ $t('components.pizzaCard.ingredients') }}{{ $t('common.colon') }}</strong> {{ pizza?.ingredients.join(', ') }}<br>
          <strong>{{ $t('components.pizzaCard.allergens') }}{{ $t('common.colon') }}</strong> {{ pizza?.allergens.join(', ') }}
        </p>
      </div>
      <div v-if="onEdit || onDelete" class="l-flex-column l-gap-1 u-big-text l-cross-center">
        <button
          v-if="onEdit"
          type="button"
          class="c-image-btn"
          :title="$t('components.pizzaCard.edit')"
          @click="onEdit?.(pizza!)"
        >
          <fa-awesome-icon icon="fa-pen-to-square"/>
        </button>
        <button
          v-if="onDelete"
          type="button"
          class="c-image-btn u-color-error-1"
          :title="$t('components.pizzaCard.delete')"
          @click="onDelete?.(pizza!)"
        >
          <fa-awesome-icon icon="fa-trash-can"/>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pizza-thumbnail {
  aspect-ratio: 16 / 9;
  object-fit: cover;
}
</style>

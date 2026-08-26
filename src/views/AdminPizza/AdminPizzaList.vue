<script setup lang="ts">

import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import PizzaModal from '@/components/AdminPizza/PizzaModal.vue';
import Modal from '@/components/Modal.vue';
import PizzaCard from '@/components/PizzaCard.vue';
import type { Pizza } from '@/models/pizza';
import { usePizzaStore } from '@/stores/pizza.store';

const pizzaStore = usePizzaStore();
const { t } = useI18n();
const { pizzaList } = storeToRefs(pizzaStore);
const {
  addPizza,
  deletePizza,
  fetchAllPizzas,
  patchPizza,
} = pizzaStore;

const formatSearch = (str: string) => str.replace(/\s+/g, '').toLowerCase();

const pizzaSearch = ref('');
const formattedPizzaSearch = computed(() => formatSearch(pizzaSearch.value));

const pizzaToEdit = ref<Pizza | null>(null);
const pizzaToDelete = ref<Pizza | null>(null);
const showCreatePizzaModal = ref(false);

const handlePizzaEditModalValidate = async (
  name: string,
  ingredients: string[],
  allergens: string[],
  image: File | null,
) => {
  if (!pizzaToEdit.value) return false;

  return patchPizza(pizzaToEdit.value.id, name, ingredients, allergens, image);
};

const handlePizzaEditModalClose = () => {
  pizzaToEdit.value = null;
};

const handlePizzaCreateModalValidate = (
  name: string,
  ingredients: string[],
  allergens: string[],
  image: File | null,
) => addPizza(name, ingredients, allergens, image);

const handlePizzaCreateModalClose = () => {
  showCreatePizzaModal.value = false;
};

const handleEditPizza = (pizza: Pizza) => {
  pizzaToEdit.value = pizza;
};

const handleRemovePizza = (pizza: Pizza) => {
  pizzaToDelete.value = pizza;
};

const closeDeleteConfirmModal = () => {
  pizzaToDelete.value = null;
};

const confirmDeletePizza = async () => {
  if (!pizzaToDelete.value) return;

  await deletePizza(pizzaToDelete.value.id);
  closeDeleteConfirmModal();
};

await fetchAllPizzas();
</script>

<template>
  <h1>
    {{ t('adminPizza.listTitle') }}
  </h1>
  <div class="u-m-2 l-flex-row l-gap-1 l-cross-center">
    <button
      type="button"
      class="c-btn-primary"
      @click="showCreatePizzaModal = true"
    >
      {{ t('adminPizza.addPizza') }}
    </button>
    <div class="l-grow"/>
    <form>
      <input
        id="pizza-search"
        v-model="pizzaSearch"
        :aria-label="t('adminPizza.search')"
        type="text"
        :placeholder="t('adminPizza.search')"
      >
    </form>
  </div>
  <div class="u-mb-2 u-px-2 u-full-width l-gap-2 l-grid-4">
    <PizzaCard
      v-for="pizza in pizzaList"
      :id="pizza.id"
      :key="pizza.id"
      :class="{ 'u-hidden': !formatSearch(pizza.name).includes(formattedPizzaSearch) }"
      :on-edit="handleEditPizza"
      :on-delete="handleRemovePizza"
    />
  </div>

  <PizzaModal
    v-if="pizzaToEdit"
    :title="t('adminPizza.editPizza')"
    :pizza="pizzaToEdit"
    :validate="handlePizzaEditModalValidate"
    @close="handlePizzaEditModalClose"
  />

  <PizzaModal
    v-if="showCreatePizzaModal"
    :title="t('adminPizza.createPizza')"
    :validate="handlePizzaCreateModalValidate"
    @close="handlePizzaCreateModalClose"
  />

  <Modal v-if="pizzaToDelete" @close="closeDeleteConfirmModal">
    <template #title>
      {{ t('adminPizza.deletePizzaTitle') }}
    </template>
    <template #body>
      <p>
        {{ t('adminPizza.deletePizzaQuestion', { name: pizzaToDelete.name }) }}
        <br/>
        <br/>
        <em>{{ t('adminPizza.deletePizzaWarning') }}</em>
      </p>
    </template>
    <template #buttons>
      <button
        class="c-btn-bg-3"
        type="button"
        @click="closeDeleteConfirmModal"
      >
        {{ t('common.cancel') }}
      </button>
      <button
        class="c-btn-secondary"
        type="submit"
        @click="confirmDeletePizza"
      >
        {{ t('common.validate') }}
      </button>
    </template>
  </Modal>
</template>

<style scoped>
.grid-layout {
  grid-template-columns: auto 1fr 72px;
}

/* sm */
@media (min-width: 640px) {
  .grid-layout {
    grid-template-columns: auto 1fr 1fr 72px;
  }
}

/* md */
@media (min-width: 768px) {
  .grid-layout {
    grid-template-columns: auto 1fr 2fr 72px;
  }
}

/* lg */
@media (min-width: 1024px) {
  .grid-layout {
    grid-template-columns: auto 1fr 2fr 1fr 72px;
  }
}

/* xl */
@media (min-width: 1280px) {
  .grid-layout {
    grid-template-columns: auto 1fr 3fr 1fr 72px;
  }
}
</style>

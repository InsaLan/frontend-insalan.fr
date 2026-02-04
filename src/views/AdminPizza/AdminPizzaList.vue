<script setup lang="ts">

import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import Modal from '@/components/Modal.vue';
import type { Pizza } from '@/models/pizza';
import { usePizzaStore } from '@/stores/pizza.store';
import PizzaListEl from '@/views/AdminPizza/PizzaListEl.vue';
import PizzaModal from '@/views/AdminPizza/PizzaModal.vue';

const pizzaStore = usePizzaStore();
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
  <h1 class="c-title">
    Liste des Pizzas
  </h1>
  <div class="m-4 mb-6 mt-0 flex justify-between gap-4">
    <button
      type="button"
      class="rounded bg-green-600 p-2 hover:bg-green-500"
      @click="showCreatePizzaModal = true"
    >
      Ajouter une nouvelle pizza
    </button>
    <form>
      <input
        id="pizza-search"
        v-model="pizzaSearch"
        aria-label="Rechercher"
        type="text"
        placeholder="Rechercher"
        class="border-2 bg-theme-bg"
      >
    </form>
  </div>
  <div class="mb-6 flex flex-col gap-2 px-4">
    <div class="grid-layout grid gap-2 rounded bg-cyan-900 p-2">
      <div class="flex w-20 items-center overflow-x-hidden border-r border-white pr-2">
        <p class="overflow-x-hidden text-ellipsis whitespace-nowrap">
          Image
        </p>
      </div>
      <div class="flex items-center overflow-x-hidden border-r border-white pr-2">
        <p class="overflow-x-hidden text-ellipsis whitespace-nowrap">
          Nom
        </p>
      </div>
      <div class="hidden items-center overflow-x-hidden border-r border-white pr-2 sm:flex">
        <p class="overflow-x-hidden text-ellipsis whitespace-nowrap">
          Ingrédients
        </p>
      </div>
      <div class="hidden items-center overflow-x-hidden border-r border-white pr-2 lg:flex">
        <p class="overflow-x-hidden text-ellipsis whitespace-nowrap">
          Allergènes
        </p>
      </div>
    </div>
    <PizzaListEl
      v-for="pizza in pizzaList"
      :key="pizza.id"
      :class="{ hidden: !formatSearch(pizza.name).includes(formattedPizzaSearch) }"
      :pizza="pizza"
      :on-edit="handleEditPizza"
      :on-delete="handleRemovePizza"
    />
  </div>

  <PizzaModal
    v-if="pizzaToEdit"
    title="Modifier une pizza"
    :pizza="pizzaToEdit"
    :validate="handlePizzaEditModalValidate"
    :close="handlePizzaEditModalClose"
  />

  <PizzaModal
    v-if="showCreatePizzaModal"
    title="Créer une pizza"
    :validate="handlePizzaCreateModalValidate"
    :close="handlePizzaCreateModalClose"
  />

  <Modal v-if="pizzaToDelete">
    <template #icon>
      <div/>
    </template>
    <template #title>
      <div/>
      <h3 id="modal-title" class="text-white-900 text-base font-semibold leading-6">
        Supprimer une pizza
      </h3>
    </template>
    <template #body>
      <p class="mt-2 max-w-sm">
        Voulez-vous supprimer la pizza <span class="c-underline">{{ pizzaToDelete.name }}</span> ?
        <br/>
        <br/>
        Ne supprimez pas une pizza qui pourrait être commandée dans un créneau en cours.
      </p>
    </template>
    <template #buttons>
      <button
        class="c-btn-bg-3"
        type="button"
        @click="closeDeleteConfirmModal"
      >
        Annuler
      </button>
      <button
        class="c-btn-secondary"
        type="submit"
        @click="confirmDeletePizza"
      >
        Valider
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

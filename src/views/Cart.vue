<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import Content from '@/components/Content.vue';
import Modal from '@/components/Modal.vue';
import { useUserStore } from '@/stores/user.store';

const userStore = useUserStore();
const {
  cart,
} = storeToRefs(userStore);
const { pay_cart, clear_cart } = userStore;

const totalPrice = computed(() => cart.value.reduce((acc, item) => acc + item.price, 0));
const hasReadTerms = ref(false);

const modal_cgv = ref(false);

</script>

<template>
  <div class="c-card-bg-2 mx-auto max-w-2xl">
    <div class="p2">
      <h1 class="mb-6 text-3xl c-bold">
        Votre panier
      </h1>

      <div v-if="cart.length === 0" class="py-8 text-center">
        <p class="text-xl">
          Votre panier est vide.
        </p>
      </div>

      <ul v-else class="flex flex-col gap-2 border-t border-white p-2">
        <li
          v-for="item in cart"
          :key="item.product"
          class="flex items-center justify-between"
        >
          <div>
            <h2 class="text-lg font-semibold">
              - {{ item.name }}
            </h2>
          </div>
          <p class="text-lg c-bold">
            {{ item.price.toFixed(2) }} €
          </p>
        </li>
      </ul>

      <div v-if="cart.length > 0" class="border-t border-white pt-6">
        <div class="flex items-center justify-between text-xl c-bold">
          <span>Total:</span>
          <span>{{ totalPrice.toFixed(2) }} €</span>
        </div>
      </div>

      <!-- Terms and conditions of sale -->
      <div
        v-if="cart.length > 0"
        class="u-mt-4 c-card-bg-3-custom-gap-1 flex items-center"
      >
        <input
          id="terms"
          v-model="hasReadTerms"
          class="mr-2"
          type="checkbox"
        />
        <label for="terms">
          J'ai lu et j'accepte
        </label>
        <div
          class="c-link"
          @click="modal_cgv = true"
          @keydown.enter="modal_cgv = true"
        >
          les conditions générales de vente.
        </div>
      </div>

      <div class="mt-8 flex justify-between gap-4">
        <button
          class="c-btn-error"
          type="button"
          :disabled="cart.length === 0"
          @click="clear_cart"
        >
          Vider le panier
        </button>
        <button
          class="c-btn-primary"
          :class="{ 'cursor-not-allowed bg-gray-400 hover:bg-gray-400': cart.length === 0 || !hasReadTerms }"
          type="button"
          :disabled="cart.length === 0 || !hasReadTerms"
          @click="pay_cart"
        >
          Payer
        </button>
      </div>
    </div>
  </div>

  <Modal v-if="modal_cgv" :close-on-click="true" :close-on-escape="true" @close="modal_cgv = false">
    <template #icon>
      <a
        class="text-gray-400 hover:text-gray-500"
        role="button"
        tabindex="0"
        aria-label="Close"
        @click="modal_cgv = false"
        @keydown.enter="modal_cgv = false"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="size-6 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </a>
    </template>
    <template #title>
      <h3 class="text-lg font-medium leading-6">
        Conditions générales de vente
      </h3>
    </template>
    <template #body>
      <div class="max-h-[50vh] overflow-y-auto">
        <Content name="cgv" class="u-mx-4"/>
      </div>
    </template>
    <template #buttons>
      <button
        class="c-btn-bg-3"
        type="button"
        @click="modal_cgv = false"
      >
        Fermer
      </button>
    </template>
  </Modal>
</template>

<style scoped>
.c-card-bg-3-custom-gap-1 {
  border-radius: var(--radius);
  place-items: center;
  gap: 0.25rem;
  padding: 1rem 1.5rem 1rem 1.5rem;
  background-color: var(--color-bg-3);
}
</style>

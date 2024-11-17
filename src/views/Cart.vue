<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useUserStore } from '@/stores/user.store';

const userStore = useUserStore();
const {
  cart,
} = storeToRefs(userStore);
const { pay_cart, clear_cart } = userStore;

const totalPrice = computed(() => cart.value.reduce((acc, item) => acc + item.price, 0));

</script>

<template>
  <div class="min-h-screen p-8 text-white">
    <div class="mx-auto max-w-2xl overflow-hidden rounded-lg bg-cyan-900 shadow-lg">
      <div class="p-6">
        <h1 class="mb-6 text-3xl font-bold">
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
            <p class="text-lg font-bold">
              {{ item.price.toFixed(2) }} €
            </p>
          </li>
        </ul>

        <div v-if="cart.length > 0" class="border-t border-white pt-6">
          <div class="flex items-center justify-between text-xl font-bold">
            <span>Total:</span>
            <span>{{ totalPrice.toFixed(2) }} €</span>
          </div>
        </div>

        <div class="mt-8 flex justify-between">
          <button
            class="rounded bg-red-600 px-4 py-2 font-bold text-white transition-colors duration-200 hover:bg-red-700"
            type="button"
            :disabled="cart.length === 0"
            @click="clear_cart"
          >
            Vider le panier
          </button>
          <button
            class="rounded bg-green-600 px-4 py-2 font-bold text-white transition-colors duration-200 hover:bg-green-700"
            type="button"
            :disabled="cart.length === 0"
            @click="pay_cart"
          >
            Payer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

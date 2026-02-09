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
  <div class="l-flex-columns l-items-cross-center u-m-text">
    <div class="c-card-bg-2 u-p-4">
      <h2 class="u-m-0 u-mb-2">
        Votre panier
      </h2>

      <div v-if="cart.length === 0" class="u-py-4 u-text-center u-big-text">
        Votre panier est vide.
      </div>

      <ul v-else class="l-flex-column l-gap-1 u-p-1">
        <li
          v-for="item in cart"
          :key="item.product"
          class="l-flex-row l-items-cross-center c-card-bg-3 u-big-text u-m-0"
        >
          <div>{{ item.name }}</div>
          <div class="l-grow"/>
          <b>{{ item.price.toFixed(2) }} €</b>
        </li>
      </ul>

      <div v-if="cart.length > 0" class="u-pt-2 u-text-right u-big-text">
        Total: <b>{{ totalPrice.toFixed(2) }} €</b>
      </div>

      <!-- Terms and conditions of sale -->
      <div
        v-if="cart.length > 0"
        class="u-mt-4 l-gap-1 l-flex-row l-items-cross-center l-items-main-end"
      >
        <input
          id="terms"
          v-model="hasReadTerms"
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

      <div class="l-flex-row l-items-main-end u-mt-4 l-gap-2">
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
          type="button"
          :disabled="cart.length === 0 || !hasReadTerms"
          @click="pay_cart"
        >
          Payer
        </button>
      </div>
    </div>
  </div>

  <Modal v-if="modal_cgv" @close="modal_cgv = false">
    <template #title>
      Conditions générales de vente
    </template>
    <template #body>
      <Content name="cgv"/>
    </template>
  </Modal>
</template>

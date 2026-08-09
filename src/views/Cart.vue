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
  <div class="l-flex-column l-cross-center u-m-text u-full-height l-main-center">
    <div class="c-card-bg-2 u-full-width">
      <h2 class="u-m-1 u-mb-2">
        {{ $t('content.views.Cart.title') }}
      </h2>

      <div class="u-px-2 l-flex-column">
        <div v-if="cart.length === 0" class="u-py-4 u-text-center u-big-text">
          {{ $t('content.views.Cart.empty') }}
        </div>

        <ul v-else class="l-flex-column l-gap-1 u-py-1">
          <li
            v-for="item in cart"
            :key="item.product"
            class="l-flex-row l-cross-center c-card-bg-3 u-big-text u-m-0 u-full-width"
          >
            <div>{{ item.name }}</div>
            <div class="l-grow"/>
            <strong>{{ item.price.toFixed(2) }} €</strong>
          </li>
        </ul>

        <div v-if="cart.length > 0" class="u-pt-2 u-text-right u-big-text">
          {{ $t('content.views.Cart.total') }} <strong>{{ totalPrice.toFixed(2) }} €</strong>
        </div>

        <!-- Terms and conditions of sale -->
        <div
          v-if="cart.length > 0"
          class="u-mt-4 l-gap-1 l-flex-row l-cross-center l-main-end"
        >
          <input
            id="terms"
            v-model="hasReadTerms"
            type="checkbox"
          />
          <i18n-t keypath="content.views.Cart.terms" tag="label" for="terms">
            <a
              class="c-link"
              href="#"
              @click="modal_cgv = true"
              @keydown.enter="modal_cgv = true"
            >les conditions générales de vente</a>.
          </i18n-t>
        </div>
      </div>

      <div class="l-flex-row l-main-end u-mt-4 l-gap-2">
        <button
          class="c-btn-error"
          type="button"
          :disabled="cart.length === 0"
          @click="clear_cart"
        >
          {{ $t('content.views.Cart.emptyCart') }}
        </button>
        <button
          class="c-btn-primary"
          type="button"
          :disabled="cart.length === 0 || !hasReadTerms"
          @click="pay_cart"
        >
          {{ $t('content.views.Cart.checkout') }}
        </button>
      </div>
    </div>
  </div>

  <Modal v-if="modal_cgv" @close="modal_cgv = false">
    <template #title>
      {{ $t('content.views.Cart.cgv') }}
    </template>
    <template #body>
      <Content name="cgv"/>
    </template>
  </Modal>
</template>

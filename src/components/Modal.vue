<script setup lang="ts">
import { getCurrentInstance } from 'vue';

const instance = getCurrentInstance();

// To make the modal closable, simply add an @close event listener to the component.

const closable = !!instance?.vnode.props?.onClose;

const emit = defineEmits(['close']);

const close = () => {
  if (closable) {
    emit('close');
  }
};
</script>

<template>
  <div class="wrapper l-flex-column l-items-cross-center l-items-main-center u-p-2" aria-modal="true" role="dialog" tabindex="0" @keyup.esc="close">
    <div class="backdrop l-absolute-position" @click="close" @keyup="close"/>

    <div class="modal-card c-card-bg-2 l-relative-position l-flex-column l-gap-2 u-full-width">
      <div class="l-flex-row l-items-cross-center l-gap-2 u-full-width u-text-left u-pl-2">
        <slot name="icon"/>
        <h2 class="l-grow u-m-1 u-mr-2">
          <slot name="title">
            Default title
          </slot>
        </h2>
        <button v-if="closable" type="button" class="close-button c-image-btn u-m-2" aria-label="Close" @click="close" @keyup.enter="close">
          <svg xmlns="http://www.w3.org/2000/svg" style="height:1.8rem; fill:var(--color-text-2);" viewBox="0 0 24 24">
            <path d="M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"/>
          </svg>
        </button>
      </div>

      <div class="u-full-width u-px-2 body">
        <slot name="body">
          <p>Default body content.</p>
        </slot>
      </div>

      <div class="l-flex-row l-items-main-end l-gap-2 u-full-width">
        <slot name="buttons"/>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  position: fixed;
  inset: 0;
  z-index: 60;
}

.backdrop {
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  transition: opacity 0.2s;
}

.modal-card {
  max-width: 50rem;
}

.body {
  max-height: 50vh;
  overflow-y: auto;
}

.close-button {
  align-self: flex-start;
}
</style>

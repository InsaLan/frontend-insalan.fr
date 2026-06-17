<script setup lang="ts">
import { getCurrentInstance, onMounted, onUnmounted } from 'vue';

const instance = getCurrentInstance();

// To make the modal closable, simply add an @close event listener to the component.

const closable = !!instance?.vnode.props?.onClose;

const emit = defineEmits(['close']);

const close = () => {
  if (closable) {
    window.setTimeout(() => {
      emit('close');
      document.body.style.overflow = '';
    }, 200);

    const backdrop = document.querySelector('.backdrop');
    const modalCard = document.querySelector('.modal-card');

    backdrop?.classList.add('closing');
    modalCard?.classList.add('closing');
  }
};

onMounted(() => {
  document.body.style.overflow = 'hidden';
});

onUnmounted(() => {
  document.body.style.overflow = '';
});
</script>

<template>
  <div class="wrapper l-flex-column l-cross-center l-main-center u-p-2" aria-modal="true" role="dialog" tabindex="0" @keyup.esc="close">
    <div class="backdrop l-absolute-position" @click="close" @keyup="close"/>

    <div class="modal-card c-card-bg-2 l-relative-position l-flex-column l-gap-2 u-full-width">
      <div class="l-flex-row l-cross-center l-gap-2 u-full-width u-text-left u-pl-1">
        <slot name="icon"/>
        <h2 class="l-grow u-m-1 u-mr-2">
          <slot name="title">
            Default title
          </slot>
        </h2>
        <button v-if="closable" type="button" title="Fermer" class="close-button c-image-btn u-m-2" aria-label="Close" @click="close" @keyup.enter="close">
          <fa-awesome-icon class="xmark" icon="fa-xmark"/>
        </button>
      </div>

      <div class="u-full-width u-px-2 body">
        <slot name="body">
          <p>Default body content.</p>
        </slot>
      </div>

      <div class="l-flex-row l-main-end l-gap-2 u-full-width">
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

.backdrop.closing {
  opacity: 0;
}

.modal-card {
  max-width: 50rem;
  max-height: calc(100vh - 2rem);
}

.body {
  max-height: 60vh;
  overflow-y: auto;
}

.close-button {
  align-self: flex-start;
}

.xmark {
  height: 1.5rem;
  width: 1.5rem;
  color: var(--color-text-2);
}

.modal-card {
  animation: fade-in .2s ease-out;
  transition: opacity 0.2s;
}

@keyframes fade-in {
  from {
    transform: translateY(-5px);
    opacity: 0;
  }
  to {
    transform: translateY(0px);
    opacity: 1;
  }
}

.modal-card.closing {
  animation: fade-out .2s ease forwards;
}

@keyframes fade-out {
  from {
    transform: translateY(0px);
    opacity: 1;
  }
  to {
    transform: translateY(5px);
    opacity: 0;
  }
}
</style>

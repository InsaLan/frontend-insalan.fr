<script setup lang="ts">
import { onMounted } from 'vue';
import Error from '@/components/Error.vue';
import Footer from '@/components/Footer.vue';
import Navigation from '@/components/Navigation.vue';
import Toast from '@/components/Toast.vue';
import { useContentStore } from '@/stores/content.store';
import { useErrorStore } from '@/stores/error.store';
import { useToastStore } from '@/stores/toast.store';

const errorStore = useErrorStore();
const { flush_errors } = errorStore;

const toastStore = useToastStore();
const { dismiss } = toastStore;

const contentStore = useContentStore();
const { fetchStatic } = contentStore;

onMounted(async () => {
  flush_errors();
  dismiss();
  await fetchStatic();
});

</script>

<template>
  <Navigation/>
  <Error/>
  <Toast/>
  <div class="flex-1">
    <routerView/>
  </div>
  <Footer/>
</template>

<style>
.title {
  font-size: 2em;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title::after, .title::before {
  display: block;
  min-width: calc(35vw - 3em);
  height: 0.1em;
  content: '';
  background-color: #fff;
}

.title::before {
  margin-right: 1em;
}

.title::after {
  margin-left: 1em;
}
</style>

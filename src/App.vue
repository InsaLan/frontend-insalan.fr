<script setup lang="ts">
import { onMounted } from 'vue';
import Error from '@/components/Error.vue';
import Footer from '@/components/Footer.vue';
import Navigation from '@/components/Navigation.vue';
import Toast from '@/components/Toast.vue';
import { useContentStore } from '@/stores/content.store';
import { useErrorStore } from '@/stores/error.store';
import { useToastStore } from '@/stores/toast.store';
import { useUserStore } from '@/stores/user.store';

const errorStore = useErrorStore();
const { flush_errors } = errorStore;

const toastStore = useToastStore();
const { dismiss } = toastStore;

const contentStore = useContentStore();
const { fetchStatic } = contentStore;

const userStore = useUserStore();
const { handle_session_cookie_expiration } = userStore;

onMounted(async () => {
  await handle_session_cookie_expiration();
  flush_errors();
  dismiss();
  await fetchStatic();
});

</script>

<template>
  <Navigation/>
  <Error/>
  <Toast/>
  <div class="flex flex-1 flex-col">
    <Suspense><routerView/></Suspense>
  </div>
  <Footer v-if="!$route.path.startsWith('/admin/')"/>
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
  flex-grow: 1;
  margin-left: 1rem;
  margin-right: 1rem;
  height: 0.1em;
  content: '';
  background-color: #fff;
}
</style>

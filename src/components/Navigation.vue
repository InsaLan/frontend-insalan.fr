<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { useUserStore } from '../stores/user.store';

const items = [
  { url: '/public', text: 'Public' },
  { url: '/tournament', text: 'Tournois' },
  { url: '/info', text: 'Informations pratiques' },
  { url: '/eat', text: 'Restauration' },
] as const;
const mobile_items = [
  { url: '/', text: 'Accueil' },
  { url: '/public', text: 'Public' },
  { url: '/tournament', text: 'Tournois' },
  { url: '/info', text: 'Informations pratiques' },
  { url: '/eat', text: 'Restauration' },

] as const;
const userStore = useUserStore();
const { logout } = userStore;
const { isConnected, user } = storeToRefs(userStore);
const router = useRouter();
const logout_user = () => {
  router.push('/');
  logout();
};
const burger_menu = ref(false);
</script>
<template>
  <nav class="sticky top-0 z-10 h-24  bg-theme-bg">
    <div id="desktop" class="hidden justify-around border-b-2 border-white md:flex">
      <router-link class="my-2" to="/">
        <img class="h-[69px] w-[69px]" src="../assets/images/logo_home.png" alt="Logo InsaLan"/>
      </router-link>
      <div class="my-auto">
        <router-link v-for="(item, i) in items" :key="i" class="mx-2 font-bold text-white transition duration-150 ease-in-out hover:text-blue-800" :to="{ path: item.url }">
          {{ item.text }}
        </router-link>
      </div>
      <div v-if="!isConnected" class="my-auto">
        <router-link to="/register" class="block rounded bg-blue-800 p-2 font-bold text-white transition duration-150 ease-in-out hover:ring hover:ring-pink-500">
          Se connecter/S'inscrire
        </router-link>
      </div>
      <div v-else class="my-auto">
        <router-link class="mx-4 font-bold text-white transition duration-150 ease-in-out hover:text-blue-800" to="/me">
          Mon compte
        </router-link>

        <button type="button" class="rounded bg-blue-800 p-2 font-bold text-white transition duration-150 ease-in-out hover:ring hover:ring-pink-500" @click="logout_user()">
          Se deconnecter
        </button>
      </div>
    </div>
    <div class="border-b-2 border-white md:hidden">
      <div id="top" class="flex justify-between">
        <router-link class="my-2 h-16 w-16" to="/">
          <img class="min-h-[48px] min-w-[48px]" src="../assets/images/logo_home.png" alt="Logo InsaLan"/>
        </router-link>
        <div class="center flex">
          <div class="flex gap-4">
            <div v-if="!isConnected" class="my-auto">
              <router-link to="/register" class="block rounded bg-blue-800 p-2 text-xs font-bold text-white transition duration-150 ease-in-out hover:ring hover:ring-pink-500 md:text-base">
                Se connecter/S'inscrire
              </router-link>
            </div>
            <div v-else class="my-auto">
              <router-link class="mx-4 font-bold text-white transition duration-150 ease-in-out hover:text-blue-800" to="/me">
                Mon compte
              </router-link>
              <button type="button" class="rounded bg-blue-800 p-2 font-bold text-white transition duration-150 ease-in-out hover:ring hover:ring-pink-500" @click="logout_user()">
                Se deconnecter
              </button>
            </div>
            <button type="button" class="m-auto mr-2 h-8 w-8 rounded text-center text-gray-400 ring-2 ring-gray-400 hover:text-white" @click="burger_menu = !burger_menu">
              <svg v-if="!burger_menu" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="{1.5}" stroke="currentColor" class="m-auto h-6 w-6 stroke-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="m-auto h-6 w-6 stroke-2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div class="flex flex-col bg-theme-bg">
        <div v-if="burger_menu" class="flex flex-col text-white">
          <router-link v-for="(item, i) in items" :key="i" class="mx-2 py-5 text-center font-bold text-white transition duration-150 ease-in-out hover:text-blue-800" :to="{ path: item.url }">
            {{ item.text }}
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>

</style>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useContentStore } from '@/stores/content.store';
import { useUserStore } from '@/stores/user.store';

import Content from './Content.vue';

const contentStore = useContentStore();
const { getContent } = contentStore;

const items = [
  { url: '/association', text: 'Association' },
  { url: '/tournament', text: 'Tournois' },
  { url: '/info', text: 'Informations pratiques' },
  { url: '/eat', text: 'Restauration' },
  { url: '/schedule', text: 'Planning' },
] as const;
const mobile_items = [
  { url: '/', text: 'Accueil' },
  { url: '/association', text: 'Association' },
  { url: '/tournament', text: 'Tournois' },
  { url: '/info', text: 'Informations pratiques' },
  { url: '/eat', text: 'Restauration' },
  { url: '/schedule', text: 'Planning' },
] as const;

const apiUrl = import.meta.env.VITE_API_URL;

const userStore = useUserStore();
const { logout } = userStore;
const { isConnected, role, user } = storeToRefs(userStore);

const router = useRouter();

const logout_user = async () => {
  await router.push('/');
  await logout();
};

const burger_menu = ref(false);
</script>
<template>
  <nav class="sticky top-0 z-50 h-24  bg-theme-bg">
    <div id="desktop" class="hidden justify-around border-b-2 h-full border-white xl:flex items-center">
      <router-link to="/">
        <img alt="Logo InsaLan" class="h-[4.5rem] w-[4.5rem]" src="@/assets/images/logo_home.png"/>
      </router-link>
      <div>
        <router-link
          v-for="(item, i) in items"
          :key="i"
          :to="{ path: item.url }"
          class="mx-2 text-[clamp(1rem,2vw,1.25rem)] font-bold text-white transition duration-150 ease-in-out hover:text-blue-800"
          >
          {{ item.text }}
        </router-link>
      </div>
      <div v-if="!isConnected">
        <router-link
          class="block rounded bg-blue-800 p-2 text-[clamp(1rem,2vw,1.25rem)] font-bold text-white transition duration-150 ease-in-out hover:ring hover:ring-pink-500"
          to="/register"
        >
          Se connecter/S'inscrire
        </router-link>
      </div>
      <div v-else>
        <router-link
          v-if="user?.groups.includes('Equipe Bouffe')"
          class="mx-4 font-bold text-white transition duration-150 ease-in-out hover:text-blue-800"
          to="/admin/pizza/list"
        >
          Liste des Pizzas
        </router-link>
        <router-link
          v-if="user?.groups.includes('Equipe Bouffe')"
          class="mx-4 font-bold text-white transition duration-150 ease-in-out hover:text-blue-800"
          to="/admin/pizza"
        >
          Menu pizza
        </router-link>
        <a
          v-if="role === 'dev' || role === 'staff'"
          class="mx-4 font-bold text-white transition duration-150 ease-in-out hover:text-blue-800"
          :href="`${apiUrl}/admin/`"
          target="_blank"
          rel="noopener noreferrer"
        >
          Panel Admin
        </a>
        <router-link class="mx-4 text-[clamp(1rem,2vw,1.25rem)] font-bold text-white transition duration-150 ease-in-out hover:text-blue-800" to="/me">
          Mon compte
        </router-link>

        <button
          class="rounded bg-blue-800 p-2 text-[clamp(1rem,2vw,1.25rem)] font-bold text-white transition duration-150 ease-in-out hover:ring hover:ring-pink-500"
          type="button"
          @click="logout_user()"
        >
          Se déconnecter
        </button>
      </div>
    </div>
    <div class="border-b-2 border-white xl:hidden min-h-full">
      <div id="top" class="flex justify-between items-center h-[calc(6rem_-_2px)]">
        <router-link to="/">
          <img alt="Logo InsaLan" class="h-[4.5rem] w-[4.5rem]" src="@/assets/images/logo_home.png"/>
        </router-link>
        <div class="center flex gap-4 p-5 items-center">
          <div v-if="!isConnected">
            <router-link
              class="block rounded bg-blue-800 p-2 text-[clamp(0.9rem,2vw,1.25rem)] font-bold text-white transition duration-150 ease-in-out hover:ring hover:ring-pink-500 md:text-base"
              to="/register"
            >
              Se connecter/S'inscrire
            </router-link>
          </div>
          <div v-else class="flex gap-2 items-center">
            <router-link
              class="p-2 text-[clamp(0.9rem,2vw,1.25rem)] font-bold text-white transition duration-150 ease-in-out hover:text-blue-800"
              to="/me"
            >
              Mon compte
            </router-link>
            <button
              class="rounded bg-blue-800 p-2 text-[clamp(0.9rem,2vw,1.25rem)] font-bold text-white transition duration-150 ease-in-out hover:ring hover:ring-pink-500"
              type="button"
              @click="logout_user()"
            >
              Se déconnecter
            </button>
          </div>
          <button
            class="h-8 w-8 rounded text-center text-gray-400 ring-2 ring-gray-400 hover:text-white"
            type="button"
            @click="burger_menu = !burger_menu"
          >
            <svg
              v-if="!burger_menu"
              class="m-auto h-6 w-6 stroke-2"
              fill="none"
              stroke="currentColor"
              stroke-width="{1.5}"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg
              v-else
              class="m-auto h-6 w-6 stroke-2"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      <div v-if="burger_menu" class="flex flex-col text-white bg-theme-bg">
        <a
          v-if="role === 'dev' || role === 'staff'"
          class="mx-2 py-5 text-center font-bold text-white transition duration-150 ease-in-out hover:text-blue-800"
          :href="`${apiUrl}/admin/`"
          target="_blank"
          rel="noopener noreferrer"
        >
          Panel Admin
        </a>
        <router-link
          v-if="role === 'dev' || role === 'staff'"
          class="mx-2 py-5 text-center font-bold text-white transition duration-150 ease-in-out hover:text-blue-800"
          :to="{ path: '/admin/scan' }"
        >
          Scan billets
        </router-link>

        <router-link
          v-for="(item, i) in mobile_items"
          :key="i"
          :to="{ path: item.url }"
          class="mx-2 py-5 text-center font-bold text-white transition duration-150 ease-in-out hover:text-blue-800"
          @click="burger_menu = !burger_menu"
        >
          {{ item.text }}
        </router-link>
      </div>
    </div>
  </nav>
  <div v-if="getContent('alert') && !$route.path.startsWith('/admin/')" class="m-1 flex flex-col items-center rounded-lg border-2 border-red-700 bg-red-800">
    <div class="m-1">
      <Content name="alert"/>
    </div>
  </div>
</template>

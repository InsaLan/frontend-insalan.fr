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
  <div id="navcontainer" class="sticky top-4 z-[51] m-4 xl:mx-12">
    <nav id="navigation" class="c-card-bg-2">
      <div id="desktop" class="hidden h-full items-center justify-around xl:flex">
        <router-link to="/">
          <img alt="Logo InsaLan" class="size-[4.5rem] c-image-btn" src="@/assets/images/logo_home.png"/>
        </router-link>
        <div>
          <router-link
            v-for="(item, i) in items"
            :key="i"
            :to="{ path: item.url }"
            :class="$route.path === item.url ? 'c-underline c-text-btn-secondary' : 'c-text-btn-secondary'"
          >
            {{ item.text }}
          </router-link>
        </div>
        <div v-if="!isConnected">
          <router-link
            class="c-btn-primary"
            to="/register"
          >
            Se connecter/S'inscrire
          </router-link>
        </div>
        <div
          v-else
          class="flex items-center gap-4"
        >
          <div
            v-if="role === 'dev' || role === 'staff'"
            class="group relative mx-4 transition duration-150 ease-in-out"
          >
            <div
              class="c-text-btn-secondary"
            >
              Admin
              <fa-awesome-icon
                class="ml-2 u-color-text-2 group-hover:rotate-180"
                icon="fa-chevron-up"
              />
            </div>
            <div
              class="c-card-bg-3 absolute hidden min-w-48 flex-col group-hover:flex"
            >
              <div
                v-if="user?.groups.includes('Equipe Bouffe')"
                class="flex flex-col"
              >
                <div
                  class="c-bold u-color-text-2"
                >
                  Team Bouffe :
                </div>
                <router-link
                  class="c-text-btn-secondary"
                  to="/admin/pizza/export/list"
                >
                  Liste des exports
                </router-link>
                <router-link
                  class="c-text-btn-secondary"
                  to="/admin/pizza/list"
                >
                  Liste des Pizzas
                </router-link>
                <router-link
                  class="c-text-btn-secondary"
                  to="/admin/pizza"
                >
                  Menu pizza
                </router-link>
              </div>
              <div
                v-if="role === 'dev' || role === 'staff'"
                class="flex flex-col"
              >
                <div
                  class="c-bold u-color-text-2"
                >
                  Backend :
                </div>
                <a
                  class="c-text-btn-secondary"
                  :href="`${apiUrl}/admin/`"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Panel Admin
                </a>
              </div>
            </div>
          </div>
          <router-link
            to="/me"
            :class="$route.path === '/me' ? 'c-underline c-text-btn-secondary' : 'c-text-btn-secondary'"
          >
            Mon compte
          </router-link>

          <button
            class="c-btn-primary"
            type="button"
            @click="logout_user()"
          >
            Se déconnecter
          </button>
        </div>
      </div>
      <div class="min-h-full xl:hidden">
        <div id="top" class="flex h-[calc(6rem_-_2px)] items-center justify-between">
          <router-link to="/">
            <img alt="Logo InsaLan" class="size-[4.5rem] c-image-btn" src="@/assets/images/logo_home.png"/>
          </router-link>
          <div class="center flex items-center gap-4 p-5">
            <div v-if="!isConnected">
              <router-link
                class="c-btn-primary"
                to="/register"
              >
                Se connecter/S'inscrire
              </router-link>
            </div>
            <div v-else class="flex items-center gap-2">
              <router-link
                class="c-text-btn-secondary"
                to="/me"
              >
                Mon compte
              </router-link>
              <button
                class="c-btn-primary"
                type="button"
                @click="logout_user()"
              >
                Se déconnecter
              </button>
            </div>
            <button
              class="c-text-btn size-8 text-center"
              type="button"
              @click="burger_menu = !burger_menu"
            >
              <svg
                v-if="!burger_menu"
                class="m-auto size-8 stroke-2"
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
                class="m-auto size-8 stroke-2"
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
        <div v-if="burger_menu" class="flex max-h-[calc(100vh_-_6rem)] flex-col overflow-scroll u-bg-bg-2">
          <a
            v-if="role === 'dev' || role === 'staff'"
            class="u-mx-1 u-py-2 c-text-btn-secondary text-center"
            :href="`${apiUrl}/admin/`"
            target="_blank"
            rel="noopener noreferrer"
          >
            Panel Admin
          </a>
          <router-link
            v-if="role === 'dev' || role === 'staff'"
            class="u-mx-1 u-py-2 c-text-btn-secondary text-center"
            :to="{ path: '/admin/scan' }"
          >
            Scan billets
          </router-link>

          <router-link
            v-for="(item, i) in mobile_items"
            :key="i"
            :to="{ path: item.url }"
            class="u-mx-1 u-py-2 c-text-btn-secondary text-center"
            @click="burger_menu = !burger_menu"
          >
            {{ item.text }}
          </router-link>
        </div>
      </div>
    </nav>
    <div v-if="getContent('alert') && !$route.path.startsWith('/admin/')" class="c-card-error-1-nopad u-mt-1 flex flex-col items-center u-rounded p1">
      <Content name="alert"/>
    </div>
  </div>
</template>

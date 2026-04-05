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
const isClosingMenu = ref(false);

const toggleBurgerMenu = () => {
  if (burger_menu.value) {
    isClosingMenu.value = true;
    document.body.style.overflow = '';
    window.setTimeout(() => {
      burger_menu.value = false;
      isClosingMenu.value = false;
    }, 300);
  } else {
    burger_menu.value = true;
    document.body.style.overflow = 'hidden';
  }
};
</script>
<template>
  <div
    v-if="burger_menu"
    :class="['backdrop', 'l-absolute-position', { closing: isClosingMenu }]"
    @click="toggleBurgerMenu"
    @keyup="toggleBurgerMenu"
  />

  <div id="navcontainer" class="navcontainer u-my-2 u-m-main">
    <nav id="navigation" class="navcard c-card-bg-2 u-full-width">
      <div id="desktop" class="desktop-only u-full-height l-flex-row l-items-cross-center">
        <router-link to="/">
          <img alt="Logo InsaLan" class="logo c-image-btn" src="@/assets/images/logo_home.png"/>
        </router-link>
        <div class="l-flex-row">
          <router-link
            v-for="(item, i) in items"
            :key="i"
            :to="{ path: item.url }"
            :class="$route.path === item.url ? 'u-underline c-text-btn-secondary' : 'c-text-btn-secondary'"
          >
            {{ item.text }}
          </router-link>
        </div>
        <div v-if="!isConnected">
          <router-link
            class="c-btn-primary"
            to="/login"
          >
            S'identifier
          </router-link>
        </div>
        <div
          v-else
          class="l-flex-row l-items-cross-center l-gap-2"
        >
          <div
            v-if="role === 'dev' || role === 'staff'"
            class="admin-group l-relative-position u-mr-2"
          >
            <div
              class="u-big-text"
            >
              Admin
              <fa-awesome-icon
                class="u-ml-1 u-color-text-2 admin-group-rotate"
                icon="fa-chevron-up"
              />
            </div>
            <div
              class="admin-panel c-card-bg-3 l-absolute-position l-flex-column admin-group-show u-text-left"
            >
              <div
                v-if="user?.groups.includes('Equipe Bouffe')"
                class="l-flex-column u-full-width"
              >
                <div
                  class="u-bold u-color-text-2"
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
                class="l-flex-column u-full-width"
              >
                <div
                  class="u-bold u-color-text-2"
                >
                  Backend :
                </div>
                <a
                  class="c-text-btn-secondary"
                  :href="`${apiUrl}/admin/`"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Panel Admin <fa-awesome-icon class="c-inline-icon" icon="fa-arrow-up-right-from-square"/>
                </a>
              </div>
            </div>
          </div>
          <router-link
            to="/me"
            :class="$route.path === '/me' ? 'u-underline c-text-btn-secondary' : 'c-text-btn-secondary'"
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
      <div
        :class="[
          'not-desktop-only',
          { burgered: burger_menu },
        ]"
      >
        <div id="top" class="l-flex-row l-items-cross-center">
          <router-link to="/">
            <img alt="Logo InsaLan" class="logo c-image-btn u-mx-1" src="@/assets/images/logo_home.png"/>
          </router-link>
          <div class="l-grow"/>
          <div class="l-flex-row l-items-cross-center l-gap-2 u-p-1 u-ml-1">
            <div v-if="!isConnected">
              <router-link
                class="c-btn-primary"
                to="/login"
              >
                S'identifier
              </router-link>
            </div>
            <div v-else class="l-flex-row l-items-cross-center l-gap-1">
              <router-link
                class="c-text-btn-secondary u-text-center"
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
              class="c-text-btn menu-btn u-text-center"
              type="button"
              @click="toggleBurgerMenu()"
            >
              <svg
                v-if="!burger_menu || isClosingMenu"
                class="menu-btn"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg
                v-else
                class="menu-btn"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
        <div
          v-if="burger_menu"
          :class="['animated-burger', 'l-flex-column', 'l-overflow-auto', { closing: isClosingMenu }]"
        > <!-- TODO: fix: this pushes the whole page down when expanding -->
          <a
            v-if="role === 'dev' || role === 'staff'"
            class="u-mx-1 u-py-1 c-text-btn-secondary u-text-center"
            :href="`${apiUrl}/admin/`"
            target="_blank"
            rel="noopener noreferrer"
          >
            Panel Admin <fa-awesome-icon class="c-inline-icon" icon="fa-arrow-up-right-from-square"/>
          </a>
          <router-link
            v-if="role === 'dev' || role === 'staff'"
            class="u-mx-1 u-py-1 c-text-btn-secondary u-text-center"
            :to="{ path: '/admin/scan' }"
          >
            Scan billets
          </router-link>

          <router-link
            v-for="(item, i) in mobile_items"
            :key="i"
            :to="{ path: item.url }"
            class="u-mx-1 u-py-1 c-text-btn-secondary u-text-center"
            @click="toggleBurgerMenu()"
          >
            {{ item.text }}
          </router-link>
        </div>
      </div>
    </nav>
    <div v-if="getContent('alert') && !$route.path.startsWith('/admin/')" class="c-card-error u-full-width u-mt-1 l-flex-column l-items-cross-center u-px-2 u-py-1">
      <Content name="alert"/>
    </div>
  </div>
</template>

<style scoped>
.navcontainer {
  position: sticky;
  top: calc(var(--base-margin) * 2);
  z-index: 51;
}

.navcard {
  max-height: calc(100dvh - (var(--base-margin) * 4));
}

.animated-burger {
  animation: burger-open 0.3s ease forwards;
}

.animated-burger.closing {
  animation: burger-close 0.3s ease forwards;
}

@keyframes burger-open {
  from {
    max-height: 0;
    opacity: 0;
    overflow: hidden;
  }
  to {
    max-height: calc(100dvh - (var(--base-margin) * 8));
    opacity: 1;
    overflow: auto;
  }
}

@keyframes burger-close {
  from {
    max-height: calc(100dvh - (var(--base-margin) * 8));
    opacity: 1;
    overflow: auto;
  }
  to {
    max-height: 0;
    opacity: 0;
    overflow: hidden;
  }
}

.backdrop {
  inset: 0;
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.4);
  transition: opacity 0.3s ease;
  z-index: 50;
}

.backdrop.closing {
  opacity: 0;
}

.logo {
  height: 4.5rem;
  width: auto;
}

.menu-btn {
  height: 2rem;
  width: auto;
}

.desktop-only {
  justify-content: space-around;
}

@media (max-width: 1280px) {
  .desktop-only {
    display: none;
  }

  .not-desktop-only {
    display: block;
  }

  .burgered {
    max-height: calc(100dvh - (var(--base-margin) * 8));
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}

@media (min-width: 1281px) {
  .desktop-only {
    display: flex;
  }

  .not-desktop-only {
    display: none;
  }
}

.admin-group-show {
  display: none;
}

.admin-group:hover .admin-group-show {
  display: flex;
}

.admin-group-rotate {
  transition: transform 0.3s;
}

.admin-group:hover .admin-group-rotate {
  transform: rotate(180deg);
}

.admin-panel {
  min-width: 12rem;
}
</style>

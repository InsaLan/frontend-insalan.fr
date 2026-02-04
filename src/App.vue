<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import Footer from '@/components/Footer.vue';
import NameConfirmationModal from '@/components/NameConfirmationModal.vue';
import Navigation from '@/components/Navigation.vue';
import Notification from '@/components/Notification.vue';
import { useContentStore } from '@/stores/content.store';
import { useUserStore } from '@/stores/user.store';

const contentStore = useContentStore();
const { fetchStatic } = contentStore;

const userStore = useUserStore();
const { handle_session_cookie_expiration } = userStore;

const topOffset = ref(0);

const updateTopOffset = () => {
  const navContainer = document.getElementById('navcontainer');
  if (navContainer) {
    const style = getComputedStyle(navContainer);
    const marginTop = parseFloat(style.marginTop);
    const marginBottom = parseFloat(style.marginBottom);
    topOffset.value = -(navContainer.offsetHeight + marginTop + marginBottom);
  }
};

onMounted(async () => {
  await handle_session_cookie_expiration();
  await fetchStatic();
  updateTopOffset();
  window.addEventListener('resize', updateTopOffset);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateTopOffset);
});
</script>

<template>
  <Navigation/>
  <NameConfirmationModal/>
  <Notification/>
  <div class="flex-1" :style="$route.path === '/' ? { marginTop: `${topOffset}px` } : {}">
    <RouterView v-slot="{ Component }">
      <template v-if="Component">
        <Suspense timeout="0">
          <component :is="Component"/>
          <template #fallback>
            <div class="center flex-1">
              <div class="text-big">
                Chargement...
              </div>
              <div role="status" aria-hidden="true" class="c-spinner"/>
            </div>
          </template>
        </Suspense>
      </template>
    </RouterView>
  </div>
  <Footer v-if="!$route.path.startsWith('/admin/')"/>
</template>

<style scoped layer="override">
.flex-1 {
  display: flex;
  flex-direction: column;
  flex: 1 1 0;
}

.center {
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  width: 100%;
}

.text-big {
  font-size: 1.5rem;
  line-height: 2rem;
}
</style>

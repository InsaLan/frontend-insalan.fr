<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { Event } from '@/models/event';
import { useContentStore } from '@/stores/content.store';

const contentStore = useContentStore();
const { getConstant } = contentStore;

const trailer_embed = 'https://www.youtube.com/embed/Bxi-4XEANbE?autoplay=1&mute=1&loop=1&controls=0&modestbranding=1&playsinline=1&rel=0&enablejsapi=1&playlist=Bxi-4XEANbE&end=36';

interface Props {
  event?: Event;
}

const props = defineProps<Props>();

const eventText = computed(() => {
  if (props.event === undefined) {
    return getConstant('message_remerciement');
  }

  const { date_start, date_end } = props.event;

  if (date_start.getFullYear() === date_end.getFullYear()) {
    if (date_start.getMonth() === date_end.getMonth()) {
      return `${date_start.getDate()} - ${date_end.getDate()} ${date_start.toLocaleString('default', { month: 'long' })} ${date_start.getFullYear()}`;
    }
    return `${date_start.getDate()} ${date_start.toLocaleString('default', { month: 'long' })} - ${date_end.getDate()} ${date_end.toLocaleString('default', { month: 'long' })} ${date_start.getFullYear()}`;
  }
  return `${date_start.getDate()} ${date_start.toLocaleString('default', { month: 'long' })} ${date_start.getFullYear()} - ${date_end.getDate()} ${date_end.toLocaleString('default', { month: 'long' })} ${date_end.getFullYear()}`;
});

const topOffset = ref(0);

onMounted(() => {
  const navContainer = document.getElementById('navcontainer');
  if (navContainer) {
    const style = getComputedStyle(navContainer);
    const marginTop = parseFloat(style.marginTop);
    const marginBottom = parseFloat(style.marginBottom);
    topOffset.value = navContainer.offsetHeight + marginTop + marginBottom;
  }
});

const scrollPastHero = () => {
  window.scrollTo({
    top: (document.getElementById('main_page')?.offsetTop || 0) - topOffset.value,
    behavior: 'smooth',
  });
};
</script>

<template>
  <div id="hero" class="l-relative-position l-flex-column l-items-cross-center l-items-main-center h-screen">
    <div class="l-absolute-position l-flex-row u-full-width u-full-height l-items-cross-center l-items-main-center rounded-bottom">
      <iframe
        :src="trailer_embed"
        allowfullscreen
        class="video"
        title="Trailer InsaLan"
        inert
      />
    </div>
    <div
      class="u-mx-2 l-relative-position l-flex-column l-items-cross-center"
      :style="{ top: `${topOffset * 0.35}px` }"
    >
      <img alt="logo InsaLan" class="logo" src="../assets/images/logo_wide.png">
      <h1 class="u-color-always-light u-bold u-text-center u-huge-text">
        {{ eventText }}
      </h1>
      <div id="next" class="u-mt-2 hero-btn" @click="scrollPastHero()" @keydown="scrollPastHero()">
        <svg
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 7.4700333,13.132492 12,17.662458 m 0,0 4.529966,-4.529966 M 12,17.662458 V 6.3375415"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped layer="override">
.h-screen {
  height: 100vh;
}

.video {
  aspect-ratio: 16 / 9;
  min-height: 100%;
  flex-grow: 1;
  object-fit: cover;
  filter: blur(8px);
}

.rounded-bottom {
  border-bottom-left-radius: var(--radius);
  border-bottom-right-radius: var(--radius);
  overflow: hidden;
}

.logo {
  width: 42rem;
}

@media (prefers-reduced-motion: no-preference) {
  .logo {
    /* transition: width 0.6s;
    animation: expand 2s ease; */
    animation: boing 0.9s ease;
  }

  /* @keyframes expand {
    0% {
      width: 0;
    }
    50% {
      width: 50rem;
    }
    100% {
      width: 42rem;
    }
  } */

  .logo:hover {
    /* width: 46rem;
    transition: width 0.6s; */
    animation: windUp 0.5s ease;
    animation-fill-mode: forwards;
  }

  @keyframes windUp {
    0% {
    transform: scale3d(1, 1, 1);
    }

    100% {
    transform: scale3d(1.25, 0.95, 1);
    }
  }

  @keyframes boing {
    0% {
    /* transform: scale3d(1.25, 0.75, 1); */
    }

    14% {
    transform: scale3d(0.75, 1.25, 1);
    }

    29% {
    transform: scale3d(1.15, 0.85, 1);
    }

    50% {
    transform: scale3d(0.95, 1.05, 1);
    }

    64% {
    transform: scale3d(1.05, 0.95, 1);
    }

    100% {
    transform: scale3d(1, 1, 1);
    }
  }
}

.hero-btn {
  width: 5rem;
  height: 5rem;
  cursor: pointer;
  border-radius: 9999px;
  transition: background-color 0.2s;
  background-color: var(--color-secondary-1);
  color: var(--color-light-text-1);
}

.hero-btn:hover {
  background-color: var(--color-secondary-2);
  color: var(--color-dark-text-1);
}
</style>

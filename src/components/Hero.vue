<script setup lang="ts">
import { computed } from 'vue';
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

const scrollPastHero = () => {
  window.scrollTo({
    top: (document.getElementById('main_page')?.offsetTop || 0) - (document.getElementById('navigation')?.offsetHeight || 0),
    behavior: 'smooth',
  });
};
</script>

<template>
  <div id="hero" class="relative flex h-[calc(100vh_-_6rem)] items-center justify-center">
    <div class="absolute -z-10 flex size-full items-center justify-center overflow-hidden">
      <iframe
        :src="trailer_embed"
        allowfullscreen
        class="aspect-video min-h-full grow object-cover blur-md"
        frameborder="0"
        title="Trailer InsaLan"
      />
    </div>
    <div class="flex flex-col items-center">
      <img alt="logo InsaLan" class="w-[32rem]" src="../assets/images/logo_wide.png">
      <h1 class="text-shadow text-center text-6xl font-bold text-white">
        {{ eventText }}
      </h1>
      <div id="next" class="m-auto mt-4 size-20 cursor-pointer rounded-full bg-red-500" @click="scrollPastHero()" @keydown="scrollPastHero()">
        <svg
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

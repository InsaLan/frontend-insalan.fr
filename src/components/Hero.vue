<script setup lang="ts">
import { onMounted } from 'vue';
import { useContentStore } from '@/stores/content.store';

const contentStore = useContentStore();
const { getConstant, fetchStatic } = contentStore;

onMounted(async () => {
  await fetchStatic();
});

const trailer_embed = 'https://www.youtube.com/embed/Bxi-4XEANbE?autoplay=1&mute=1&loop=1&color=white&controls=0&modestbranding=1&playsinline=1&rel=0&enablejsapi=1&playlist=Bxi-4XEANbE';
</script>

<template>
  <div class="h-f w-h relative -top-24">
    <div class="youtube-container">
      <iframe
        :src="trailer_embed"
        allowfullscreen
        class="object-cover blur-md"
        frameborder="0"
        title="Trailer insalan"
      />
    </div>
    <div class="w-f hover-title  absolute left-2/4 top-60 -translate-x-2/4">
      <img alt="logo insalan" class="w-[32rem]" src="../assets/images/logo_wide.png">
      <h1 class="text-center text-2xl font-bold text-white">
        {{ getConstant('date_insalan') }}
      </h1>
      <div id="next" class="m-auto mt-4 h-20 w-20 cursor-pointer rounded-full bg-red-500">
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

<style scope>
.youtube-container {
  overflow: hidden;
  width: 100%;
  /* No clicking/hover effects */
  pointer-events: none;
  /* Keep it the right aspect-ratio */
  aspect-ratio: 16/9;

  iframe {
    /* Extend it beyond the viewport... */
    width: 300%;
    height: 100%;
    /* ...and bring it back again */
    margin-left: -100%;
  }
}
</style>

<script setup lang="ts">
import XLogo from '@/assets/images/XLogo.vue';

const buildYear = BUILD_YEAR;
</script>

<template>
  <div class="l-flex-row page-corners u-full-width">
    <svg
      viewBox="0 0 100 100"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:svg="http://www.w3.org/2000/svg"
      class="u-full-height"
    >
      <g>
        <path
          style="fill:var(--color-bg-2);fill-opacity:1;stroke-width:0;stroke-linejoin:round"
          d="M 0,0 C 0,50 50,100 100,100 100,100 0,100 0,100 0,100 0,0 0,0 Z"
          sodipodi:nodetypes="zzcz"
        />
      </g>
    </svg>
    <svg
      viewBox="0 0 100 100"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:svg="http://www.w3.org/2000/svg"
      class="u-full-height"
    >
      <g>
        <path
          style="fill:var(--color-bg-2);fill-opacity:1;stroke-width:0;stroke-linejoin:round"
          d="m 100,0 c 0,50 -50,100 -100,100 0,0 100,0 100,0 z"
          sodipodi:nodetypes="zzcz"
        />
      </g>
    </svg>
  </div>
  <section class="u-bg-bg-2 footer-grid">
    <div class="reseaux u-m-1 l-flex-column l-items-cross-center l-items-main-center l-justify-center">
      <h1 class="reseaux-text u-text-center u-big-text">
        Réseaux
      </h1>
      <div class="l-flex-row u-full-width l-items-cross-center l-items-main-center l-gap-1">
        <a class="icon-size c-image-btn" href="https://www.instagram.com/insalan_officiel" target="_blank" rel="noopener noreferrer">
          <img src="/src/assets/images/instagram.svg" alt="Logo Instagram">
        </a>
        <a class="icon-size c-image-btn u-color-text-1" href="https://twitter.com/insalan" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter) InsaLan">
          <XLogo/>
        </a>
        <a class="icon-size c-image-btn" href="https://www.facebook.com/insalan/" target="_blank" rel="noopener noreferrer">
          <img src="/src/assets/images/facebook.svg" alt="Logo Facebook">
        </a>
        <a class="icon-size c-image-btn" href="https://discord.com/invite/eWEzRpjmj4" target="_blank" rel="noopener noreferrer">
          <img src="/src/assets/images/discord.svg" alt="Logo Discord">
        </a>
      </div>
    </div>
    <div class="centre l-flex-column l-items-main-center">
      <div class="u-my-1 l-flex-column l-items-main-center u-text-center">
        <p>
          Sitemap
        </p>
        <p>
          InsaLan 2023 - {{ buildYear }}
        </p>
        <p>
          Code & design: équipe Dev
        </p>
      </div>
    </div>
    <div class="insa u-my-1 u-mr-2 l-flex-row l-items-cross-center l-items-main-center l-justify-center">
      <a href="https://aeir.insa-rennes.fr" target="_blank" rel="noopener noreferrer">
        <img
          alt="Logo de l'AEIR"
          src="/src/assets/images/logo_aeir.png"
          class="insa-logos"
        />
      </a>
      <a class="u-ml-1" href="https://insa-rennes.fr" target="_blank" rel="noopener noreferrer">
        <img
          alt="Logo de l'INSA"
          src="/src/assets/images/logo_insa.png"
          class="insa-logos"
        />
      </a>
    </div>
  </section>
</template>

<style scoped>
.page-corners {
  height: var(--radius);
  justify-content: space-between;
}

.footer-grid {
  display: grid;
}

@media (min-width: 768px) {
  .footer-grid {
    grid-template-rows: repeat(1, 1fr);;
    grid-template-columns: repeat(12, 1fr);
  }

  .reseaux {
    grid-column: span 3;
    grid-row-start: 1;
  }
}

@media (max-width: 768px) {
  .footer-grid {
    grid-template-rows: repeat(2, 1fr);;
    grid-template-columns: repeat(2, 1fr);
  }

  .reseaux {
    grid-row-start: 2;
  }

  .reseaux-text {
    display: none;
  }
}

.insa {
  grid-column: span 3;
}

.centre {
  grid-column: span 6;
}

.icon-size {
  width: 3.5rem;
}

.insa-logos {
  display: block;
  height: auto;
  max-height: 4rem;
  max-width: 100%;
}
</style>

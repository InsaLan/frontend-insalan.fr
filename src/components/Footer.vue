<script setup lang="ts">
const buildYear = BUILD_YEAR;
</script>

<template>
  <div class="rounded-corners"/>
  <section class="grid-row-2 u-bg-bg-2 grid grid-cols-2 md:grid-cols-12 md:grid-rows-1">
    <div class="row-start-2 u-m-1 l-flex-column l-items-cross-center l-items-main-center justify-items-center md:col-span-3 md:row-start-1">
      <h1 class="hidden u-text-center text-xl md:block">
        Réseaux
      </h1>
      <div class="l-flex-row u-full-width l-items-cross-center l-items-main-center l-gap-1">
        <a class="icon-size c-image-btn" href="https://www.instagram.com/insalan_officiel" target="_blank" rel="noopener noreferrer">
          <img src="/src/assets/images/instagram.svg" alt="Logo Instagram">
        </a>
        <a class="icon-size c-image-btn" href="https://twitter.com/insalan" target="_blank" rel="noopener noreferrer">
          <img src="/src/assets/images/x.svg" alt="Logo Instagram">
        </a>
        <a class="icon-size c-image-btn" href="https://www.facebook.com/insalan/" target="_blank" rel="noopener noreferrer">
          <img src="/src/assets/images/facebook.svg" alt="Logo Instagram">
        </a>
        <a class="icon-size c-image-btn" href="https://discord.com/invite/eWEzRpjmj4" target="_blank" rel="noopener noreferrer">
          <img src="/src/assets/images/discord.svg" alt="Logo Instagram">
        </a>
      </div>
    </div>
    <div class="col-span-6 l-flex-column l-items-main-center">
      <div class="u-my-1 l-flex-column l-items-main-center">
        <div class="grid">
          <h1 class="u-text-center">
            Sitemap
          </h1>
        </div>
        <div class="grid">
          <p class="u-text-center">
            InsaLan 2023 - {{ buildYear }}
          </p>
          <p class="u-text-center">
            Code & design: équipe Dev
          </p>
        </div>
      </div>
    </div>
    <div class="col-span-3 u-my-1 u-mr-2 l-flex-row l-items-cross-center l-items-main-center justify-items-center">
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
.rounded-corners {
  position: relative;
  width: 100%;
  height: var(--radius);
  background-color: var(--color-bg-2);
}

.rounded-corners::after {
  content: "";
  position: absolute;
  inset: 0;
  background-color: var(--color-bg-1);
  border-bottom-left-radius: var(--radius);
  border-bottom-right-radius: var(--radius);
  box-sizing: border-box;
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

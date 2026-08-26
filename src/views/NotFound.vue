<template>
  <div class="u-m-text l-flex-column l-cross-center">
    <h1>
      404
    </h1>
    <h2 class="u-big-text u-mb-2">
      {{ $t('views.error.title404') }}
    </h2>
    <p>
      {{ $t('views.error.description404') }}
    </p>
    <div class="u-my-4 l-flex-column l-cross-center">
      <router-link
        to="/"
        class="c-btn-primary"
      >
        {{ $t('views.error.backToHome') }}
      </router-link>
    </div>
  </div>
</template>

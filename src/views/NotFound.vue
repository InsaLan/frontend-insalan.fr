<template>
  <div class="u-m-body">
    <h1 class="c-title">
      404
    </h1>
    <h2 class="invalid">
      Page Invalide
    </h2>
    <div>
      <p class="m1">
        La page que vous cherchez n'existe pas ou a été supprimée. Si vous pensez que ce message est une erreur,
        n'hésitez pas à nous contacter.
      </p>
    </div>
    <div class="u-my-4 center-btn">
      <router-link
        to="/"
        class="c-btn-primary"
      >
        Page d'accueil
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.invalid {
  text-align: center;
  font-size: 1.5em;
}

.center-btn {
  display: flex;
  justify-content: center;
}
</style>

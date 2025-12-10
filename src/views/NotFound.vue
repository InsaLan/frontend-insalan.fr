<template>
  <div class="mbody">
    <h1 class="title">
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
    <div class="my4 center-btn">
      <router-link
        to="/"
        class="btn-primary"
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

<template>
  <div class="flex h-64 flex-row items-center justify-items-center">
    <div class="flex w-screen flex-col items-center justify-items-center">
      <h1 class="title">
        404
      </h1>
      <h2 class="text-center text-2xl">
        Page Invalide
      </h2>
      <div>
        <p class="m-2 text-justify">
          La page que vous cherchez n'existe pas ou a été supprimée. Si vous pensez que ce message est une erreur,
          n'hésitez pas à nous contacter
        </p>
      </div>
      <router-link class="m-2" to="/">
        <button
          class="rounded bg-blue-800 p-2 font-bold text-white transition duration-150 ease-in-out hover:ring hover:ring-pink-500"
          type="button"
        >
          Page d'accueil
        </button>
      </router-link>
    </div>
  </div>
</template>

<template>
    <div class="flex flex-row items-center justify-items-center h-64">
        <div class="flex flex-col items-center justify-items-center w-screen">
            <h1 class="title">404</h1>
            <h2 class="text-2xl text-center">Page Invalide</h2>
            <div>
                <p class="text-justify m-2">La page que vous cherchez n'existe pas ou a été supprimée. Si vous pensez que ce message est une erreur, n'hésitez pas à nous contacter</p>
            </div>
            <router-link to="/" class="m-2"><button class="rounded transition duration-150 ease-in-out p-2 font-bold text-white bg-blue-800 hover:ring hover:ring-pink-500">Page d'accueil</button></router-link>
        </div>
    </div>
</template>

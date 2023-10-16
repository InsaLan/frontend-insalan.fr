<script setup lang="ts">
import axios from "axios"
import { useUserStore} from '../stores/user.store';
import { storeToRefs } from 'pinia';
const userStore = useUserStore()
const { user, role, isConnected, inscriptions } = storeToRefs(userStore)
//let response = await axios.get(`/user/confirm/${user.value.name}`)
//Call API -> stock result -> en focntion : Page vérif | Page erreur
</script>

<template>
        <!-- Cas fonctionnel -->
    <div>
        <div>
            <p class=" text-center text-5xl md:m-8"> Création de compte </p>
            <p class=" text-center text-2xl md:m-10"> Votre adresse Email a été vérifiée</p>
            <p class=" text-center text-2xl md:m-8"> Vous pouvez désormais vous connecter</p>
        </div>

        <div class="flex items-center justify-center m-25">
            <img alt="Logo Insalan XVIII" class="image-center" src="/src/assets/images/logo_home.png"/>
        </div>
    </div>
    <!-- Cas où erreur verif -->
    <div>
        <div>
            <p class=" text-center text-5xl md:m-8"> Création de compte </p>
            <p class=" text-center text-2xl md:m-10"> Echec vérification</p>
            <p class=" text-center text-2xl md:m-8"> Aled</p>
        </div>

        <div class="flex items-center justify-center m-25">
            <img alt="Logo Insalan XVIII" class="image-center" src="/src/assets/images/logo_home.png"/>
        </div>
    </div>
</template>
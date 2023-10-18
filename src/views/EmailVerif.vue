<script setup lang="ts">
import axios from "axios"
import { useUserStore} from '../stores/user.store';
import { storeToRefs } from 'pinia';
const userStore = useUserStore()
const {verifMail} = userStore
const { MailVerified } = storeToRefs(userStore)

//In index.ts, we take idname and idtoken from URL
const props = defineProps(['idname','idtoken']) 

//Url must be /insalan.fr/verification/name/token to be sure to work even if he validates on a device not connected (like a phone)

let response = verifMail(props.idname,props.idtoken)
// If the name and token are the right ones, boolean value Mailverified is set on true, else in any other case (problem if token, lack of token etc)
// Html just need to check this value to show the right data to the user
</script>

<template>
        <!-- Cas fonctionnel -->
    <div v-if="MailVerified">
        <div>
            <p class=" text-center text-5xl md:m-8"> Création de compte </p>
            <p class=" text-center text-2xl md:m-10"> Votre adresse Email a été vérifiée</p>
            <p class=" text-center text-2xl md:m-8"> Vous pouvez désormais vous connecter</p>
            <p class="text-center text-2xl md:m-6" ><router-link class="hover:text-blue-800" to="/me">Mon compte</router-link></p>
        </div>

        <div class="flex items-center justify-center m-25">
            <img alt="Logo Insalan XVIII" class="image-center" src="/src/assets/images/logo_home.png"/>
        </div>
    </div>
    <!-- Cas où erreur verif -->
    <div v-else>
        <div>
            <p class=" text-center text-5xl md:m-8"> Création de compte </p>
            <p class=" text-center text-2xl md:m-10"> Echec vérification</p>
            <p class=" text-center text-2xl md:m-8"> L'adresse a déjà été vérifié ou le lien est invalide</p>
            <p class=" text-center text-2xl md:m-8"> Revenir à :</p>
            <p class="text-center text-3xl md:m-6" ><router-link class="hover:text-blue-800" to="/me">Mon compte</router-link></p>
        </div>

        <div class="flex items-center justify-center m-32">
            <img alt="Logo Insalan XVIII" class="image-center" src="/src/assets/images/logo_home.png"/>
        </div>
    </div>
</template>
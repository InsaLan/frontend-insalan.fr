<script setup lang="ts">
import axios from "axios"
import { useUserStore} from '../stores/user.store';
import { storeToRefs } from 'pinia';
import { onMounted } from "vue";
const userStore = useUserStore()
const {verifMail} = userStore
const { MailVerified } = storeToRefs(userStore)

//On récup les id depuis l'URL (CF index.ts)
const props = defineProps(['idname','idtoken']) 

//Url must be /insalan.fr/verification/name/token to be sure to work even if he validates on a device not connected (like a phone)

let response = verifMail(props.idname,props.idtoken)

console.log("Response : ",response)
console.log(MailVerified)

//Call API -> stock result -> en focntion : Page vérif | Page erreur
</script>

<template>
        <!-- Cas fonctionnel -->
    <div v-if="MailVerified">
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
    <div v-else>
        <div>
            <p class=" text-center text-5xl md:m-8"> Création de compte </p>
            <p class=" text-center text-2xl md:m-10"> Echec vérification</p>
            <p class=" text-center text-2xl md:m-8"> Welp, réessayez ?</p>
        </div>

        <div class="flex items-center justify-center m-25">
            <img alt="Logo Insalan XVIII" class="image-center" src="/src/assets/images/logo_home.png"/>
        </div>
    </div>
</template>
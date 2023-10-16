<script setup lang="ts">
import axios from "axios"
import { useUserStore} from '../stores/user.store';
import { storeToRefs } from 'pinia';
const userStore = useUserStore()
const { user, role, isConnected, inscriptions } = storeToRefs(userStore)
const props = defineProps(['idname','idtoken']) 
//Url must be /insalan.fr/verification/name/token to be sure to work even if he validates on a device not connected (like a phone)
let response = 0
console.log("feur")
try {
    let result = await axios.get(`/user/confirm/${props.idname}/${props.idtoken}`)
    response = result.data.value
} catch (err) {
    console.log("Token invalides")
}//Call API -> stock result -> en focntion : Page vérif | Page erreur
</script>

<template>
        <!-- Cas fonctionnel -->
    <div v-if="response===200">
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
    //</div>
</template>
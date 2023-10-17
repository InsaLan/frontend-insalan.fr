<script setup lang="ts">
import axios from "axios"
import { useUserStore} from '../stores/user.store';
import { storeToRefs } from 'pinia';
import { onMounted } from "vue";
const userStore = useUserStore()
const { user, role, isConnected, inscriptions } = storeToRefs(userStore)
const props = defineProps(['idname','idtoken']) 
console.log("Test : props")
console.log(props.idname)
console.log("Value props :")
console.log(props)

//Url must be /insalan.fr/verification/name/token to be sure to work even if he validates on a device not connected (like a phone)
let fctAPI = onMounted(async() => {
    try {
        if (props.idname!=undefined && props.idtoken!=undefined){
            let result = await axios.get(`/user/confirm/${props.idname}/${props.idtoken}`)
            return result.data.value 
        }
        else {
            console.log("Aucune spécification de Token")
            return 0
        }
    } catch (err) {
        console.log("Token invalides")
        return 0
    }
})

let response=200

//Call API -> stock result -> en focntion : Page vérif | Page erreur
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
    </div>
</template>
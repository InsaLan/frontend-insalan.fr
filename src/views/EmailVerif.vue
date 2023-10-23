<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';
import { useUserStore } from '@/stores/user.store';

const userStore = useUserStore();
const { verifMail } = userStore;
const { MailVerified } = storeToRefs(userStore);

// In index.ts, we take idname and idtoken from URL
const props = defineProps<{
  idname: string;
  idtoken: string;
}>();

onMounted(async () => {
  // Url must be /insalan.fr/verification/name/token
  // to be sure to work even if he validates on a device not connected (like a phone)
  await verifMail(props);

  // If the name and token are the right ones, boolean value MailVerified is set on true.
  // Else in any other case (problem if token, lack of token etc.)
  // Html just need to check this value to show the right data to the user
});
</script>

<template>
  <!-- Cas fonctionnel -->
  <div v-if="MailVerified">
    <div>
      <p class=" mb-6 text-center text-3xl md:m-8 md:text-5xl">
        - Création de compte -
      </p>
      <p class=" mb-4 text-center  text-xl md:m-10 md:text-2xl">
        <em class="text-cyan-300">{{ props.idname }}</em>, votre adresse Email a été vérifiée
      </p>
      <p class=" text-center md:m-8 md:text-2xl">
        Vous pouvez désormais vous connecter à
        <router-link class="hover:text-cyan-300" to="/me">
          votre compte !
        </router-link>
      </p>
      <p class="m-8 text-center text-2xl md:m-6">
        <router-link class="border border-white p-4 hover:text-cyan-300 md:border-4" to="/me">
          Mon compte
        </router-link>
      </p>
    </div>

    <div class="m-6 flex items-center justify-center md:m-32">
      <img
        alt="Logo Insalan XVIII"
        class="image-center m-6 w-20 justify-center md:max-h-full md:w-max md:max-w-full"
        src="@/assets/images/logo_home.png"
      />
    </div>
  </div>
  <!-- Cas où erreur verif -->
  <div v-else>
    <div>
      <p class=" mb-6 text-center text-3xl md:m-8 md:text-5xl">
        - Création de compte -
      </p>
      <p class=" mb-4 text-center  text-2xl md:m-10 md:text-2xl">
        Échec vérification
      </p>
      <p class=" text-center md:m-8 md:text-2xl">
        L'adresse a déjà été vérifiée ou le lien est invalide
      </p>
      <p class=" m-4 text-center md:m-8 md:text-2xl">
        Revenir à :
      </p>
      <p class="m-6 text-center text-2xl md:m-6">
        <router-link class="border-4 border-white p-4 hover:text-cyan-300" to="/register">
          Créer un compte
        </router-link>
      </p>
    </div>

    <div class="m-6 flex items-center justify-center md:m-32">
      <img
        alt="Logo Insalan XVIII"
        class="image-center m-6 w-20 justify-center md:max-h-full md:w-max md:max-w-full"
        src="@/assets/images/logo_home.png"
      />
    </div>
  </div>
</template>

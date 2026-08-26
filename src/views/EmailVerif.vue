<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/stores/user.store';

const userStore = useUserStore();
const { verifMail } = userStore;
const { MailVerified } = storeToRefs(userStore);

// In index.ts, we take idname and idtoken from URL
const props = defineProps<{
  idname: string;
  idtoken: string;
}>();

// Url must be /insalan.fr/verification/name/token
// to be sure to work even if he validates on a device not connected (like a phone)
const { username } = await verifMail(props);

// If the name and token are the right ones, boolean value MailVerified is set on true.
// Else in any other case (problem if token, lack of token etc.)
// Html just need to check this value to show the right data to the user
</script>

<template>
  <!-- Cas fonctionnel -->
  <div v-if="MailVerified" class="u-m-text u-text-center u-big-text">
    <h1>
      Création de compte
    </h1>
    <em class="u-color-secondary-1">{{ username }}</em>, votre adresse e-mail a été vérifiée !
    <br><br>
    Vous pouvez désormais vous connecter à votre compte !
    <router-link class="c-btn-primary" to="/me">
      Mon compte
    </router-link>
  </div>
  <!-- Cas où erreur verif -->
  <div v-else class="u-m-text u-text-center u-big-text">
    <h1>
      Création de compte
    </h1>
    Échec de la vérification
    <br><br>
    L'adresse a déjà été vérifiée ou le lien est invalide.
    <br><br>
    Revenir à :
    <router-link class="c-btn-primary" to="/register">
      Créer un compte
    </router-link>
  </div>
</template>

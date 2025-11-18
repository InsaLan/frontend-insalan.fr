<script setup lang="ts">
import { onMounted } from 'vue';
import { useUserStore } from '@/stores/user.store';

const userStore = useUserStore();
const { clear_cart } = userStore;

enum ReturnType {
  RETURN = 'return',
  REFUSED = 'refused',
}
enum ReturnState {
  SUCCEEDED = 'succeeded',
  REFUSED = 'refused',
}
const props = defineProps<{
  status: { type: ReturnType; code?: string; error?: string };
}>();

onMounted(async () => {
  if (props.status.type === ReturnType.RETURN && props.status.code === ReturnState.SUCCEEDED) {
    clear_cart();
  }
  await userStore.fetchUser();
});

</script>

<template>
  <div v-if="status.type === ReturnType.RETURN" class="grid h-48 place-items-center">
    <div v-if="status.code === ReturnState.REFUSED">
      <h1 class="mb-6 text-3xl md:m-8 md:text-5xl">
        ❌ Votre paiement a été refusé.
      </h1>
    </div>
    <div v-else-if="status.code === ReturnState.SUCCEEDED" class="grid place-items-center">
      <h1 class="mb-6 text-3xl md:m-8 md:text-5xl">
        🎉 Votre paiement a été accepté
      </h1>
      <RouterLink to="/me" class="rounded bg-blue-800 p-2 font-bold text-white transition duration-150 ease-in-out hover:ring hover:ring-pink-500 md:p-6">
        <p class="text-xl">
          Retour vers le profil
        </p>
      </RouterLink>
    </div>
    <div v-else class="grid place-items-center">
      <h1 class="mb-6 text-3xl md:m-8 md:text-5xl">
        🛸 Erreur inconnue
      </h1>
    </div>
  </div>
  <div v-else-if="status.type === ReturnType.REFUSED" class="grid place-items-center">
    <h1 class="mb-6 text-3xl md:m-8 md:text-5xl">
      Une erreur est survenue
    </h1>
    <p>{{ status.error }}</p>
  </div>
  <div v-else class="grid place-items-center">
    <h1 class="text-2xl">
      🛸 Erreur inconnue
    </h1>
  </div>
  <div class="m-6 flex items-center justify-center md:m-32">
    <img
      alt="Logo Insalan XVIII"
      class="image-center m-6 w-20 justify-center md:max-h-full md:w-max md:max-w-full"
      src="@/assets/images/logo_home.png"
    />
  </div>
</template>

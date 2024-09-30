<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useTournamentStore } from '@/stores/tournament.store';

const props = defineProps<{
  id: number;
  selectedSection?: string;
}>();

const tournamentStore = useTournamentStore();
const { getTournamentFull } = tournamentStore;
const { tournament } = storeToRefs(tournamentStore);

// const open_drop = ref(false);
// const drop_label = ref('Informations');

interface TournamentDetailSection {
  title: string;
  is_available: boolean;
  is_selected: boolean;
}

const selected_section = ref<string>('info');

const sections = computed<Record<string, TournamentDetailSection[]>>(() => ({
  info: { title: 'Informations', is_available: true },
  teams: { title: 'Équipes', is_available: true },
  groups: { title: 'Poules', is_available: tournament.value?.groups.length > 0 || false },
  swiss: { title: 'Système Suisse', is_available: tournament.value?.swissRounds.length > 0 || false },
  brackets: { title: 'Arbres', is_available: tournament.value?.brackets.length > 0 || false },
  planning: { title: 'Planning', is_available: true },
  rules: { title: 'Règlement', is_available: true },
}));

const router = useRouter();

try {
  await getTournamentFull(props.id);
} catch (err: unknown) {
  router.go(-1);
}
</script>

<template>
  <div v-if="tournament?.is_announced" class="min-h-[calc(100vh_-_6rem)]">
    <div class="sticky top-24 min-w-full bg-[#2c292d]">
      <div class="text-center text-6xl font-bold text-white">
        {{ tournament?.name }}
      </div>

      <nav class="mt-2 flex justify-center bg-gray-500 py-4 ">
        <div class="flex w-2/3 justify-between xl:w-3/5">
          <template v-for="(section, key) in sections" :key="key">
            <router-link
              v-if="section.is_available"
              :to="key"
              :class="{ 'underline decoration-[#63d1ff] decoration-4 underline-offset-8': key === selected_section }"
              class="text-xl"
              @click="selected_section = key"
            >
              {{ section.title }}
            </router-link>
          </template>
        </div>
      </nav>
    </div>
    {{ sections }}

    <RouterView v-slot="{ Component }">
      <component
        :is="Component"
        :tournament="tournament"
      />
    </RouterView>
  </div>
  <div v-else class="mt-6 text-center text-4xl">
    Le tournoi que vous cherchez n'a pas encore été annoncé, revenez plus tard !
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTournamentStore } from '@/stores/tournament.store';

const props = defineProps<{
  id: number;
}>();

const tournamentStore = useTournamentStore();
const { getTournamentFull, getTournamentTeams } = tournamentStore;
const { tournament } = storeToRefs(tournamentStore);

const open_dropdown = ref(false);
const dropdown_icon = computed(() => (open_dropdown.value ? 'angle-up' : 'angle-down'));

interface TournamentDetailSection {
  title: string;
  is_available: boolean;
  is_selected: boolean;
}

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
const route = useRoute();

const selected_section = ref<string>(route.path.split('/').at(-1));

try {
  await getTournamentFull(props.id);
  getTournamentTeams();
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

      <nav class="mt-2 flex justify-center gap-16 bg-gray-500 py-4">
        <button
          type="button"
          class="text-xl underline decoration-[#63d1ff] decoration-4 underline-offset-8 md:hidden"
          @click="open_dropdown = !open_dropdown"
        >
          {{ sections[selected_section].title }}
          <fa-awesome-icon
            class="absolute mx-2 my-[0.6rem]"
            :icon="['fas', dropdown_icon]"
            size="2xs"
          />
        </button>
        <div
          :class="{ 'flex border-y-2 border-white': open_dropdown, hidden: !open_dropdown }"
          class="absolute z-10 max-h-[60vh] w-screen translate-y-10 flex-col items-center gap-2 overflow-scroll bg-gray-500 py-3 md:static md:z-0 md:flex md:w-auto md:translate-y-0 md:flex-row md:gap-10 md:overflow-visible md:py-0"
        >
          <template v-for="(section, key) in sections" :key="key">
            <router-link
              v-if="section.is_available"
              :to="key"
              :class="{ 'underline decoration-[#63d1ff] decoration-4 underline-offset-8': key === selected_section }"
              class="text-xl"
              @click="selected_section = key; open_dropdown = false"
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

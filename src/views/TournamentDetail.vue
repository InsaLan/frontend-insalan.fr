<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { TournamentDeref } from '@/models/tournament';
import { useTournamentStore } from '@/stores/tournament.store';
import { useUserStore } from '@/stores/user.store';

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
}

const userStore = useUserStore();
const { role } = storeToRefs(userStore);

const sections = computed<Record<string, TournamentDetailSection>>(() => ({
  info: { title: 'Informations', is_available: true },
  teams: { title: 'Équipes', is_available: true },
  seatings: { title: 'Placement', is_available: true },
  groups: { title: 'Poules', is_available: (tournament.value as TournamentDeref)?.groups.length > 0 || false },
  swiss: { title: 'Système Suisse', is_available: (tournament.value as TournamentDeref)?.swissRounds.length > 0 || false },
  brackets: { title: 'Arbres', is_available: (tournament.value as TournamentDeref)?.brackets.length > 0 || false },
  planning: { title: 'Planning', is_available: true },
  rules: { title: 'Règlement', is_available: true },
}));

const router = useRouter();
const route = useRoute();

const admin_mode = computed(() => route.path.includes('admin'));

const selected_section = computed<string>(() => {
  let sec = 'info';
  Object.keys(sections.value).forEach((e) => {
    if (route.path.includes(e)) {
      sec = e;
    }
  });

  return sec;
});

try {
  await getTournamentFull(props.id);
  getTournamentTeams();
} catch (err: unknown) {
  router.go(-1);
}

const admin_switch = computed(() => {
  if (admin_mode.value) {
    return (route.name as string).replace('admin_', '').split('-').at(0);
  }

  return (route.name as string).replace('tournament_', 'tournament_admin_').split('-').at(0);
});
</script>

<template>
  <div v-if="tournament?.is_announced" class="flex min-h-[calc(100vh_-_6rem)] flex-col">
    <div class="z-50 sticky top-24 bg-[#2c292d]">
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
              :to="{ name: `tournament_${admin_mode ? 'admin_' : ''}${key}` }"
              :class="{ 'underline decoration-[#63d1ff] decoration-4 underline-offset-8': key === selected_section }"
              class="text-xl"
              @click="open_dropdown = false"
            >
              {{ section.title }}
            </router-link>
          </template>
        </div>
        <router-link
          v-if="role === 'dev' || role === 'staff'"
          :to="{ name: admin_switch }"
          :class="{
            'bg-red-800 hover:bg-red-700': !admin_mode,
            'bg-blue-800 hover:bg-blue-700': admin_mode,
          }"
          type="button"
          class="-my-2 rounded p-2 text-xl font-bold text-white transition duration-150 ease-in-out md:absolute md:right-5 md:-mt-2"
        >
          {{ admin_mode ? 'Mode Normal' : 'Mode Admin' }}
        </router-link>
      </nav>
    </div>

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

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { EventTournamentDeref } from '@/models/tournament';
import { useTournamentStore } from '@/stores/tournament.store';
import { useUserStore } from '@/stores/user.store';
import { setMeta } from '@/utils';

const props = defineProps<{
  id: number;
}>();

const tournamentStore = useTournamentStore();
const { getTournamentFull, getTournamentTeams, getPrivateTournaments } = tournamentStore;
const { tournament, privateTournamentsList } = storeToRefs(tournamentStore);

const open_dropdown = ref(false);

interface TournamentDetailSection {
  title: string;
  is_available: boolean;
}

const userStore = useUserStore();
const { isConnected, user } = storeToRefs(userStore);

const sections = computed<Record<string, TournamentDetailSection>>(() => ({
  info: { title: 'Informations', is_available: true },
  teams: { title: 'Équipes', is_available: true },
  seatings: { title: 'Placement', is_available: 'seatslots' in (tournament.value as EventTournamentDeref) },
  groups: { title: 'Poules', is_available: (tournament.value as EventTournamentDeref)?.groups.length > 0 || false },
  swiss: { title: 'Ronde Suisse', is_available: (tournament.value as EventTournamentDeref)?.swissRounds.length > 0 || false },
  brackets: { title: 'Arbres', is_available: (tournament.value as EventTournamentDeref)?.brackets.length > 0 || false },
  planning: { title: 'Planning', is_available: 'planning' in (tournament.value as EventTournamentDeref) },
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

if (Object.keys(privateTournamentsList.value).length === 0) {
  await getPrivateTournaments();
}

if (props.id in privateTournamentsList.value) {
  tournament.value = privateTournamentsList.value[props.id];
} else {
  try {
    await getTournamentFull(props.id);
    getTournamentTeams();
  } catch (err: unknown) {
    router.go(-1);
  }
}

const admin_switch = computed(() => {
  if (admin_mode.value) {
    return (route.name as string).replace('admin_', '').split('-').at(0);
  }

  return (route.name as string).replace('tournament_', 'tournament_admin_').split('-').at(0);
});

onMounted(() => {
  if (tournament.value) {
    setMeta('og:title', `Tournoi ${tournament.value.name} - InsaLan`);
  } else {
    setMeta('og:title', 'Tournoi - InsaLan');
  }
  setMeta('og:description', 'Tournoi de l\'InsaLan');
});
</script>

<template>
  <div
    v-if="tournament && (!('is_announced' in tournament) || tournament?.is_announced)"
    class="flex min-h-[calc(100vh_-_6rem)] flex-col"
  >
    <div class="sticky top-24 z-50 bg-[#2c292d]">
      <div class="py-2 text-center text-6xl font-bold text-white">
        {{ tournament?.name }}
      </div>

      <nav class="mt-2 flex justify-center gap-10 bg-gray-500 py-4 sm:gap-16">
        <button
          type="button"
          class="text-xl underline decoration-[#63d1ff] decoration-4 underline-offset-8 lg:hidden"
          @click="open_dropdown = !open_dropdown"
        >
          {{ sections[selected_section].title }}
          <fa-awesome-icon
            class="absolute mx-2 my-[0.6rem] transition duration-150 ease-in-out"
            icon="fa-solid fa-chevron-up"
            size="2xs"
            :class="{ 'rotate-180': open_dropdown }"
          />
        </button>
        <div
          :class="[open_dropdown ? 'flex border-y-2 border-white' : 'hidden']"
          class="absolute z-10 max-h-[60vh] w-screen translate-y-10 flex-col items-center gap-2 overflow-scroll bg-gray-500 py-3 lg:static lg:z-0 lg:flex lg:w-auto lg:-translate-x-16 lg:translate-y-0  lg:flex-row lg:gap-4 lg:overflow-visible lg:py-0 xl:gap-10"
        >
          <template v-for="(section, key) in sections" :key="key">
            <router-link
              v-if="section.is_available || (admin_mode && !['seatings', 'planning'].includes(key))"
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
          v-if="isConnected && (user.groups.includes('Equipe Tournois') || user.groups.includes('Equipe Anim'))"
          :to="{ name: admin_switch }"
          :class="{
            'bg-red-800': !admin_mode,
            'bg-blue-800': admin_mode,
          }"
          type="button"
          class="-my-2 rounded p-2 text-xl font-bold text-white transition duration-150 ease-in-out hover:ring hover:ring-pink-500 sm:absolute sm:right-5 sm:-mt-2"
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

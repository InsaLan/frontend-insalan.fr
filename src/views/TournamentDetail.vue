<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import TournamentBrackets from '@/components/TournamentBrackets.vue';
import TournamentGroups from '@/components/TournamentGroups.vue';
import TournamentInfo from '@/components/TournamentInfo.vue';
import TournamentPlanning from '@/components/TournamentPlanning.vue';
import TournamentRules from '@/components/TournamentRules.vue';
import TournamentSwiss from '@/components/TournamentSwiss.vue';
import TournamentTeams from '@/components/TournamentTeams.vue';
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
  knockouts: { title: 'Arbres', is_available: tournament.value?.brackets.length > 0 || false },
  planning: { title: 'Planning', is_available: true },
  rules: { title: 'Règlement', is_available: true },
}));

const select_section = (e: Event) => {
  const target = e.target as HTMLInputElement;
  selected_section.value = target.id;
  // Object.keys(sections).forEach((s) => {
  //   sections[s].is_selected = false;
  // });
  // sections[target.id].is_selected = true;
};

const router = useRouter();

if (props.selectedSection !== '') {
  if (!(props.selectedSection in sections.value)) {
    router.go(-1);
  }

  selected_section.value = props.selectedSection;
  // sections[props.selectedSection].is_selected = true;
}

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
        <div class="flex w-2/3 justify-between xl:w-1/2">
          <template v-for="(section, key) in sections" :key="key">
            <button
              v-if="section.is_available"
              :id="key"
              :class="{ 'underline decoration-[#63d1ff] decoration-4 underline-offset-8': key === selected_section }"
              type="button"
              class="text-xl"
              @click="select_section"
            >
              {{ section.title }}
            </button>
          </template>
        </div>
      </nav>
    </div>
    {{ sections }}

    <TournamentInfo v-if="selected_section === 'info'" :tournament="tournament"/>

    <TournamentTeams v-if="selected_section === 'teams'" :tournament="tournament"/>

    <TournamentGroups v-if="selected_section === 'groups'" :tournament="tournament"/>

    <TournamentSwiss v-if="selected_section === 'swiss'" :tournament="tournament"/>

    <TournamentBrackets v-if="selected_section === 'knockouts'" :tournament="tournament"/>

    <TournamentPlanning v-if="selected_section === 'planning'" :tournament="tournament"/>

    <TournamentRules v-if="selected_section === 'rules'" :tournament="tournament"/>
  </div>
  <div v-else class="mt-6 text-center text-4xl">
    Le tournoi que vous cherchez n'a pas encore été annoncé, revenez plus tard !
  </div>
</template>

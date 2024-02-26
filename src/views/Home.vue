<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import Content from '@/components/Content.vue';
import Hero from '@/components/Hero.vue';
import Partners from '@/components/Partners.vue';
import TournamentCard from '@/components/TournamentCard.vue';
import { useTournamentStore } from '@/stores/tournament.store';

const tournamentStore = useTournamentStore();
const { getOngoingEvents } = tournamentStore;
const { ongoingEvents } = storeToRefs(tournamentStore);
const event = computed(() => ongoingEvents.value?.at(-1));
const tournaments_id = computed(() => event.value?.tournaments);

await getOngoingEvents();
</script>

<template>
  <div>
    <section class="h-min">
      <Hero/>
    </section>
    <Content name="main_page"/>
    <section>
      <div class="title my-2 text-white">
        Tournois
      </div>
      <div v-if="!tournaments_id" class="flex justify-center">
        Aucun tournoi n'est en cours ou à venir pour le moment, revenez plus tard !
      </div>
      <div class="mb-4 grid w-full gap-4 px-4 md:grid-cols-2 xl:grid-cols-4">
        <TournamentCard
          v-for="tournament in tournaments_id"
          :id="tournament"
          :key="tournament"
        />
      </div>
      <div class="mb-4 flex justify-center">
        <router-link
          to="/archives"
          class="rounded bg-blue-800 p-2 text-[clamp(0.9rem,2vw,1.25rem)] font-bold text-white transition duration-150 ease-in-out hover:ring hover:ring-pink-500"
        >
          Voir les anciennes éditions
        </router-link>
      </div>
      <Content name="Horaire"/>
      <Content name="parti_public"/>
    </section>
    <Partners/>
  </div>
</template>

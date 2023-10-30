<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';
import Content from '@/components/Content.vue';
import Hero from '@/components/Hero.vue';
import Partners from '@/components/Partners.vue';
import TournamentCard from '@/components/TournamentCard.vue';
import { useTournamentStore } from '@/stores/tournament.store';

const tournamentStore = useTournamentStore();
const { fetchThisYear, fetchTournaments } = tournamentStore;
const { event } = storeToRefs(tournamentStore);

onMounted(async () => {
  await fetchThisYear();
  if (event.value.length > 0) {
    await fetchTournaments(event.value[0].tournaments as number[]);
  }
});

const { tournaments } = storeToRefs(tournamentStore);
</script>

<template>
  <div>
    <section class="w-screen" style="height: calc(100vh - 6rem);">
      <Hero/>
      <Content name="main_page"/>
    </section>
    <section>
      <div class="title my-2 text-white">
        Tournois
      </div>
      <div class="mb-12 grid gap-4 px-4 md:grid-cols-2 xl:w-full xl:grid-cols-4">
        <TournamentCard
          v-for="tournament in tournaments"
          :key="tournament.id"
          :tournament="tournament"
        />
      </div>
    </section>
    <Partners/>
  </div>
</template>

<style>

</style>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';
import Content from '@/components/Content.vue';
import Hero from '@/components/Hero.vue';
import Partners from '@/components/Partners.vue';
import TournamentCard from '@/components/TournamentCard.vue';
import { useTournamentStore } from '@/stores/tournament.store';

const tournamentStore = useTournamentStore();
const { getOngoingEvents } = storeToRefs(tournamentStore);
const tournaments_id = ref<number[]>([]);

onMounted(async () => {
  const events = (await getOngoingEvents.value).value;
  let event;
  if (events.size > 0) {
    event = [...events.values()].at(-1);
  }
  if (event !== undefined && event.tournaments !== undefined) {
    tournaments_id.value = event.tournaments as number[];
  }
});
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
          v-for="tournament in tournaments_id"
          :id="tournament"
          :key="tournament"
        />
      </div>
    </section>
    <Partners/>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import Content from '@/components/Content.vue';
import Hero from '@/components/Hero.vue';
import Partners from '@/components/Partners.vue';
import TournamentCard from '@/components/Tournament/TournamentCard.vue';
import { useTournamentStore } from '@/stores/tournament.store';

const tournamentStore = useTournamentStore();
const { getOngoingEvents } = tournamentStore;
const { ongoingEvents } = storeToRefs(tournamentStore);
const event = computed(() => ongoingEvents.value?.at(-1));
const tournaments_id = computed(() => event.value?.tournaments);

await getOngoingEvents();
</script>

<template>
  <section class="h-min">
    <Hero :event="event"/>
  </section>
  <Content id="main_page" name="main_page" class="u-m-body"/>
  <section>
    <div class="c-title u-my-1">
      Tournois
    </div>
    <div v-if="!tournaments_id" class="l-flex-column l-items-main-center">
      Aucun tournoi n'est en cours ou à venir pour le moment, revenez plus tard !
    </div>
    <div class="u-px-2 l-grid-4 u-mb-2">
      <TournamentCard
        v-for="tournament in tournaments_id"
        :id="tournament"
        :key="tournament"
      />
    </div>
    <div class="u-mb-4 l-flex-column l-items-main-center">
      <router-link
        to="/archives"
        class="c-btn-primary"
      >
        Voir les anciennes éditions
      </router-link>
    </div>
    <div class="l-grid-2 u-m-double-body l-gap-4">
      <Content name="Horaire"/>
      <Content name="parti_public"/>
    </div>
  </section>
  <Partners/>
</template>

<style scoped layer="override">
.h-min {
  height: min-content;
}
</style>

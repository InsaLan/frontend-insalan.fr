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
    <div v-if="!tournaments_id" class="flex-justify-center">
      Aucun tournoi n'est en cours ou à venir pour le moment, revenez plus tard !
    </div>
    <div class="u-px-2 tournament-grid tournament-grid-amount u-mb-2">
      <TournamentCard
        v-for="tournament in tournaments_id"
        :id="tournament"
        :key="tournament"
      />
    </div>
    <div class="u-mb-4 old-btn">
      <router-link
        to="/archives"
        class="c-btn-primary"
      >
        Voir les anciennes éditions
      </router-link>
    </div>
    <Content name="Horaire" class="u-m-body"/>
    <Content name="parti_public" class="u-m-body"/>
  </section>
  <Partners/>
</template>

<style scoped>
.h-min {
  height: min-content;
}

.flex-justify-center {
  display: flex;
  justify-content: center;
}

.old-btn {
  display: flex;
  justify-content: center;
}

.tournament-grid {
  display: grid;
  width: 100%;
  gap: calc(var(--base-margin) * 2);
}

@media (min-width: 768px) {
  .tournament-grid-amount {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1280px) {
  .tournament-grid-amount {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 2000px) {
  .tournament-grid-amount {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>

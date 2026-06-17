<script setup lang="ts">
import { storeToRefs } from 'pinia';
import TournamentCard from '@/components/Tournament/TournamentCard.vue';
import { useTournamentStore } from '@/stores/tournament.store';

const tournamentStore = useTournamentStore();
const { fetchAllEvents } = tournamentStore;
const { oldEvents } = storeToRefs(tournamentStore);

await fetchAllEvents();
</script>

<!-- TODO : fix weird flicker when refreshing -->
<template>
  <div class="u-m-main">
    <h1>
      Archives
    </h1>
    <div v-if="oldEvents?.length === 0" class="u-text-center">
      Aucune archive n'est disponible pour le moment, revenez plus tard !
    </div>
    <div class="l-flex-column l-gap-4">
      <div
        v-for="(event, index) in oldEvents"
        :key="event.id"
      >
        <h2 class="u-text-center u-mb-2">
          {{ event.name }} | {{ event.date_start.toLocaleDateString() }}
        </h2>
        <div
          class="u-mb-1 l-gap-2"
          :class="{
            rtl: index % 2 === 1,
            'main-grid': event.poster && event.tournaments && event.tournaments?.length > 0,
            'l-flex-column u-full-width l-cross-center': !event.poster || !event.tournaments || event.tournaments?.length === 0,
          }"
        >
          <img
            v-if="event.poster"
            :src="event.poster"
            class="u-full-width u-rounded"
            :class="{
              mwidth: event.tournaments && event.tournaments.length === 0,
            }"
            :alt="`Poster ${event.name}`"
          />
          <div
            v-if="event.tournaments && event.tournaments?.length > 0"
            class="u-mb-2 l-gap-2"
            :class="{
              'tourney-grid-no-poster': !event.poster,
              'tourney-grid-poster': event.poster,
            }"
          >
            <TournamentCard
              v-for="tournament in event.tournaments"
              :id="tournament"
              :key="tournament"
              :is-private="false"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 48rem) {
  .main-grid, .tourney-grid-poster, .tourney-grid-no-poster {
    display: grid;
    grid-template-columns: 1fr;
  }

  .mwidth {
    max-width: 100%;
  }
}

@media (min-width: 48rem) and (max-width: 70rem) {
  .main-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .tourney-grid-poster {
    display: grid;
    grid-template-columns: 1fr;
  }

  .tourney-grid-no-poster {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  .mwidth {
    max-width: 50%;
  }
}

@media (min-width: 70rem) and (max-width: 100rem) {
  .main-grid {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }

  .tourney-grid-poster {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  .tourney-grid-no-poster {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }

  .mwidth {
    max-width: 33%;
  }
}

@media (min-width: 100rem) and (max-width: 140rem) {
  .main-grid {
    display: grid;
    grid-template-columns: 1fr 3fr;
  }

  .tourney-grid-poster {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }

  .tourney-grid-no-poster {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
  }

  .mwidth {
    max-width: 25%;
  }
}

@media (min-width: 140rem) {
  .main-grid {
    display: grid;
    grid-template-columns: 1fr 4fr;
  }

  .tourney-grid-poster {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
  }

  .tourney-grid-no-poster {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
  }

  .mwidth {
    max-width: 20%;
  }
}

.rtl {
  direction: rtl;
}

.tourney-grid-no-poster > *, .tourney-grid-poster > * {
  direction: ltr;
}
</style>

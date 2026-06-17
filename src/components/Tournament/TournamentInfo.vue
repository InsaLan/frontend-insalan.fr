<script setup lang="ts">
import type { Game } from '@/models/game';
import type { EventTournamentDeref, PrivateTournament } from '@/models/tournament';
import { useContentStore } from '@/stores/content.store';
import { frenchFormatFromDate } from '@/utils';

const { md } = useContentStore();

defineProps<{
  tournament: EventTournamentDeref | PrivateTournament;
}>();
</script>

<template>
  <!-- TODO: fix image "snaps" -->
  <img
    :src="tournament.logo"
    class="c-background-image u-blurry"
    alt=""
  >

  <section id="info" class="u-mt-2 u-mb-2 l-flex-column l-cross-center u-full-height">
    <p v-if="tournament?.description !== ''" class="u-big-text u-m-text">
      {{ tournament?.description }}
    </p>

    <div
      v-if="'player_price_online' in tournament /* We can't just check instanceof for some dumb linter reason */
        && 'manager_price_online' in tournament
        && 'cashprizes' in tournament
        && 'casters' in tournament"
      class="u-full-width"
    >
      <h2 class="u-text-center">
        Cashprizes
      </h2>
      <div class="not-desktop-only">
        <div class="l-flex-row l-main-center u-huge-text u-text-center u-mx-1">
          <div class="l-flex-column l-cross-center">
            <div class="massive">
              🥇
            </div>
            {{ tournament?.cashprizes.length === 0 ? "À venir" : `${Number(tournament?.cashprizes[0])} €` }}
          </div>
        </div>
        <div class="l-flex-row even u-huge-text u-text-center l-gap-4">
          <div class="l-flex-column l-cross-center">
            <div class="massive">
              🥈
            </div>
            {{ tournament?.cashprizes.length === 0 ? "À venir" : `${Number(tournament?.cashprizes[1])} €` }}
          </div>
          <div class="l-flex-column l-cross-center">
            <div class="massive">
              🥉
            </div>
            {{ tournament?.cashprizes.length === 0 ? "À venir" : `${Number(tournament?.cashprizes[2])} €` }}
          </div>
        </div>
      </div>

      <div class="desktop-only u-full-width u-huge-text u-mb-4 u-mt-2 u-px-4">
        <div class="l-flex-column l-cross-center u-mt-4">
          <div class="massive">
            🥈
          </div>
          {{ tournament?.cashprizes.length === 0 ? "À venir" : `${Number(tournament?.cashprizes[1])} €` }}
        </div>
        <div class="l-flex-column l-cross-center">
          <div class="massive">
            🥇
          </div>
          {{ tournament?.cashprizes.length === 0 ? "À venir" : `${Number(tournament?.cashprizes[0])} €` }}
        </div>
        <div class="l-flex-column l-cross-center u-mt-4">
          <div class="massive">
            🥉
          </div>
          {{ tournament?.cashprizes.length === 0 ? "À venir" : `${Number(tournament?.cashprizes[2])} €` }}
        </div>
      </div>

      <div class="u-m-double-text u-mb-4">
        <h2 class="u-text-center">
          Format
        </h2>

        <div class="double-info u-text-center">
          <div class="very-big-text">
            <div v-if="(tournament?.game as Game).players_per_team === 1">
              <strong>{{ tournament?.max_team_thresholds[tournament?.current_threshold_index] }}</strong> joueur·euse·s
            </div>
            <div v-else>
              <strong>{{ tournament?.max_team_thresholds[tournament?.current_threshold_index] }}</strong> équipes de
              <strong>{{ (tournament?.game as Game).players_per_team }}</strong> joueur·euse·s
            </div>
          </div>

          <div class="c-card-bg-2 u-big-text">
            <h2 class="u-mt-0">
              Prix
            </h2>
            <div>
              Joueur·euse : {{ Number(tournament?.player_price_online) }}€
            </div>
            <div v-if="tournament?.enable_manager">
              Manager : {{ Number(tournament?.manager_price_online) }}€
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="tournament?.casters.length > 0"
        class="u-m-double-text"
      >
        <h2 class="u-text-center">
          Casters
        </h2>

        <div class="double-info">
          <div
            v-for="(caster, i) in tournament?.casters"
            :key="i"
            class="c-card-bg-2 u-p-0 u-m-1"
          >
            <div
              class="l-cross-center"
              :class="i % 2 === 1 ? 'caster-row-reverse' : 'l-flex-row'"
            >
              <img :src="caster.image" alt="" class="u-rounded caster-img"/>
              <div class="u-px-4 u-py-2 l-flex-column l-main-center l-gap-2">
                <h2 class="u-m-0">
                  {{ caster.name }}
                </h2>
                <a :href="caster.url" class="c-link u-normal-text">
                  {{ caster.url?.replace("https://", "").replace("http://", "").replace("www.", "") }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="u-text-center u-pt-2 u-my-4">
        {{ tournament?.event.name }}
      </div>
    </div>
    <div v-else class="l-grow">
      <p class="u-my-4 u-m-text">
        <em>
          Ce tournoi est un tournoi secondaire et n'est pas lié à une édition de l'InsaLan.
          Pour plus d'informations, veuillez demander à l'équipe Animation.
          <strong v-if="tournament?.password">
            L'inscription à ce tournoi est protégée par un mot de passe.
          </strong>
        </em>
      </p>

      <div class="u-big-text u-text-center u-m-text u-my-4">
        <fa-awesome-icon icon="fa-calendar-days"/>
        Début : <strong> {{ frenchFormatFromDate(new Date(tournament?.start)) }} </strong>
      </div>

      <div v-if="tournament?.rewards" class="u-big-text u-text-center u-m-text u-my-4">
        <fa-awesome-icon icon="fa-trophy"/>
        <!-- eslint-disable-next-line vue/no-v-html -->
        Récompenses : <strong v-html="tournament?.rewards.includes('\n') ? tournament?.rewards.includes('/>') || tournament?.rewards.includes('</') ? md.render(tournament?.rewards) : `<p style='white-space: pre-line;'>${tournament?.rewards}</p>` : md.renderInline(tournament?.rewards)"/>
      </div>
    </div>

    <p v-if="tournament?.description_bottom !== ''" class="u-m-text u-text-center u-pt-4">
      <em>{{ tournament?.description_bottom }}</em>
    </p>
  </section>
</template>

<style scoped>
.even {
  justify-content: space-evenly;
}

.massive {
  font-size: clamp(5rem, 10vw, 7rem);
}

@media (max-width: 56rem) {
  .double-info {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    align-items: center;
  }

  .caster-row-reverse {
    display: flex;
    flex-direction: row-reverse;
  }
}

@media (min-width: 56rem) {
  .double-info {
    display: flex;
    flex-direction: row;
    gap: 4rem;
    justify-content: space-evenly;
    align-items: center;
  }

  .caster-row-reverse {
    display: flex;
    flex-direction: row;
  }
}

.caster-img {
  width: 10rem;
  height: 10rem;
  object-fit: cover;
}

@media (max-width: 32rem) {
  .caster-img {
    width: 8rem;
  }
}

.very-big-text {
  font-size: 1.75rem;
}

@media (max-width: 1300px) {
  .desktop-only {
    display: none;
  }
}

@media (min-width: 1300px) {
  .desktop-only {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
  }

  .not-desktop-only {
    display: none;
  }
}
</style>

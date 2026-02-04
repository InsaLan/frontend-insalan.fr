<script setup lang="ts">
import type { Game } from '@/models/game';
import type { EventTournamentDeref, PrivateTournament } from '@/models/tournament';
import { useContentStore } from '@/stores/content.store';
import { frenchFormatFromDate } from '@/utils';

const { md } = useContentStore();

const props = defineProps<{
  tournament: EventTournamentDeref | PrivateTournament;
}>();
</script>

<template>
  <section
    id="info"
    :style="{ backgroundImage: `url(${props.tournament?.logo})` }"
    class="grid grow grid-rows-[min-content_1fr] l-items-cross-center bg-gray-500 bg-cover bg-center bg-blend-multiply"
  >
    <h2 class="font mx-auto w-3/4 u-py-2 u-text-center text-3xl u-bold">
      {{ tournament?.description }}
    </h2>

    <div
      v-if="
        'player_price_online' in tournament
          && 'manager_price_online' in tournament
          && 'cashprizes' in tournament
          && 'casters' in tournament
      "
      class="grid gap-7 lg:grid-cols-3"
    >
      <div class="l-flex-column u-full-width l-items-cross-center md:my-24">
        <h3 class="mb-6 text-4xl">
          Format
        </h3>
        <svg class="w-2/3 fill-white" viewBox="0 0 12 8" xmlns="http://www.w3.org/2000/svg">
          <desc>
            Z tetromino with tournament format information
          </desc>
          <polygon points="0,0 8,0 8,4 12,4 12,8 4,8 4,4 0,4" fill="#fd5e96"/>
          <rect fill="#d14d7b" x="0" y="3.5" width="4" height="0.5"/>
          <rect fill="#d14d7b" x="4" y="7.5" width="8" height="0.5"/>
          <text v-if="(tournament?.game as Game).players_per_team === 1" font-size="1" text-anchor="middle" x="4" y="2.25">
            {{ tournament?.max_team_thresholds[tournament?.current_threshold_index] }} joueur·euse·s
          </text>
          <text v-else font-size="1" text-anchor="middle" x="4" y="1.25">
            <tspan>{{ tournament?.max_team_thresholds[tournament?.current_threshold_index] }} équipes</tspan>
            <tspan text-anchor="middle" x="4" y="2.75">
              de {{ (tournament?.game as Game).players_per_team }} joueur·euse·s
            </tspan>
          </text>
          <text font-size="1" text-anchor="middle" x="8" :y="tournament?.enable_manager ? 5.25 : 6.25">
            {{ Number(tournament?.player_price_online) }}€ / joueur·euse
          </text>
          <text v-if="tournament?.enable_manager" font-size="1" text-anchor="middle" x="8" y="6.75">
            {{ Number(tournament?.manager_price_online) }}€ / manager
          </text>
        </svg>
      </div>

      <div class="l-flex-column u-full-width l-items-cross-center">
        <h3 class="mb-6 text-4xl">
          Cashprize
        </h3>
        <svg class="w-2/3 fill-white" viewBox="0 0 12 8" xmlns="http://www.w3.org/2000/svg">
          <desc>
            T tetromino with tournament cashprize information
          </desc>
          <polygon points="0,8 0,4 4,4 4,0 8,0 8,4 12,4 12,8" fill="#45cae0"/>
          <rect x="0" y="7.5" width="12" height="0.5" fill="#0aadbf"/>
          <text font-size="2" text-anchor="middle" x="6" y="2">
            🥇
          </text>
          <text font-size="1" text-anchor="middle" x="6" y="3.25">
            {{ tournament?.cashprizes.length === 0 ? "À venir" : `${Number(tournament?.cashprizes[0])} €` }}
          </text>
          <text font-size="2" text-anchor="middle" x="2" y="6">
            🥈
          </text>
          <text font-size="1" text-anchor="middle" x="2" y="7.25">
            {{ tournament?.cashprizes.length === 0 ? "À venir" : `${Number(tournament?.cashprizes[1])} €` }}
          </text>
          <text font-size="2" text-anchor="middle" x="10" y="6">
            🥉
          </text>
          <text font-size="1" text-anchor="middle" x="10" y="7.25">
            {{ tournament?.cashprizes.length === 0 ? "À venir" : `${Number(tournament?.cashprizes[2])} €` }}
          </text>
        </svg>
      </div>

      <div class="mb-12 l-flex-column u-full-width grow l-items-cross-center md:my-24">
        <h3 class="mb-6 text-4xl">
          Casters
        </h3>
        <svg class="w-1/2 fill-white" viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg">
          <desc>
            O tetromino with information on tournament's casters
          </desc>
          <rect x="0" y="0" width="8" height="8" fill="#B169BF"/>
          <rect x="0" y="7.5" width="8" height="0.5" fill="#844A8F"/>
          <g v-if="tournament?.casters.length === 0">
            <text font-size="1">
              <tspan x="4" y="3.5" text-anchor="middle">Aucun caster</tspan>
              <tspan x="4" y="5" text-anchor="middle">pour ce tournoi</tspan>
            </text>
          </g>
          <g v-else-if="tournament?.casters.length === 1">
            <a :href="tournament?.casters[0].url">
              <g v-if="tournament?.casters[0].image">
                <text font-size="1" textLength="3.5" text-anchor="middle" x="2" y="2.25">
                  {{ tournament?.casters[0].name }}
                </text>
                <!-- eslint-disable-next-line tailwindcss/migration-from-tailwind-2 -->
                <image :href="tournament?.casters[0].image" width="3.5" height="3" x="4.5" y="4.5"/>
              </g>
              <text v-else font-size="1" textLength="7.5" text-anchor="middle" x="4" y="4.25">
                {{ tournament?.casters[0].name }}
              </text>
            </a>
          </g>
          <g v-else-if="tournament?.casters.length === 2">
            <a :href="tournament?.casters[0].url">
              <text font-size="1" textLength="3.5" text-anchor="middle" x="2" y="2.25">
                {{ tournament?.casters[0].name }}
              </text>
              <!-- eslint-disable-next-line tailwindcss/migration-from-tailwind-2 -->
              <image :href="tournament?.casters[0].image" width="3.5" height="3" x="4.5"/>
            </a>
            <a :href="tournament?.casters[1].url">
              <text font-size="1" textLength="3.5" text-anchor="middle" x="6" y="6.25">
                {{ tournament?.casters[1].name }}
              </text>
              <!-- eslint-disable-next-line tailwindcss/migration-from-tailwind-2 -->
              <image :href="tournament?.casters[1].image" width="3.5" height="3" y="4.5"/>
            </a>
            <text font-size="1" text-anchor="middle" x="4" y="4.25">&</text>
          </g>
        </svg>
      </div>
    </div>
    <div
      v-else
      class="l-flex-column l-items-cross-center l-items-main-center u-p-2 md:p-6"
    >
      <div
        class="u-full-width max-w-md rounded-lg border-2 border-cyan-700 bg-gradient-to-br from-cyan-950 to-cyan-900 p-5 text-white shadow-lg"
      >
        <div class="u-mb-2 flex l-items-cross-center justify-between">
          <h3
            class="text-xl u-bold md:text-2xl"
          >
            Informations du tournoi
          </h3>
          <span class="rounded-full bg-cyan-800 u-p-1 u-text-center">
            <fa-awesome-icon
              class="text-yellow-500"
              icon="fa-trophy"
            />
          </span>
        </div>

        <div class="u-mb-2 rounded-md bg-cyan-800/50 u-px-2 py-3 text-cyan-100">
          <p class="mb-3 text-sm font-medium">
            Ce tournoi est un tournoi secondaire et n'est pas lié à une édition de l'InsaLan.
            Pour plus d'informations, veuillez demander à l'équipe Animation.
          </p>

          <div
            class="flex l-items-cross-center l-gap-1 text-xl"
          >
            <fa-awesome-icon
              icon="fa-calendar-days"
            />
            <span>Début:
              <b
                class="u-bold text-yellow-500"
              >
                {{ frenchFormatFromDate(new Date(tournament?.start)) }}
              </b>
            </span>
          </div>
        </div>

        <div
          v-if="tournament?.rewards"
          class="mb-3 rounded-md bg-gradient-to-r from-cyan-800/70 to-cyan-700/70 u-p-2 u-text-center"
        >
          <fa-awesome-icon
            class="text-4xl text-yellow-500"
            icon="fa-gift"
          />
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div class="text-2xl u-bold" v-html="md.render(tournament?.rewards)"/>
        </div>

        <div
          v-if="tournament?.password"
          class="flex l-items-cross-center l-items-main-center gap-1.5 text-xs text-cyan-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span>L'inscription à ce tournoi est protégée par un mot de passe</span>
        </div>
      </div>
    </div>

    <div class="u-mx-2 u-mb-1 flex l-items-main-center text-xs">
      {{ tournament?.description_bottom }}
    </div>
  </section>
</template>

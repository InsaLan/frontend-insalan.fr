<script setup lang="ts">
import type { Game } from '@/models/game';
import type { TournamentDeref } from '@/models/tournament';

const props = defineProps<{
  tournament: TournamentDeref;
}>();
</script>

<template>
  <section
    id="info"
    :style="{ backgroundImage: `url(${props.tournament?.logo})` }"
    class="grid grow grid-rows-[min-content_1fr] items-center bg-gray-500 bg-cover bg-center bg-blend-multiply"
  >
    <h2 class="font mx-auto w-3/4 py-4 text-center text-3xl font-bold">
      {{ tournament?.description }}
    </h2>

    <div class="grid gap-7 lg:grid-cols-3">
      <div class="flex w-full flex-col items-center md:my-24">
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
            {{ tournament?.maxTeam }} joueurs
          </text>
          <text v-else font-size="1" text-anchor="middle" x="4" y="1.25">
            <tspan>{{ tournament?.maxTeam }} équipes</tspan>
            <tspan text-anchor="middle" x="4" y="2.75">
              de {{ (tournament?.game as Game).players_per_team }} joueurs
            </tspan>
          </text>
          <text font-size="1" text-anchor="middle" x="8" y="5.25">
            {{ Number(tournament?.player_price_online) }}€ / joueur
          </text>
          <text font-size="1" text-anchor="middle" x="8" y="6.75">
            {{ Number(tournament?.manager_price_online) }}€ / manager
          </text>
        </svg>
      </div>

      <div class="flex w-full flex-col items-center">
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

      <div class="mb-12 flex w-full grow flex-col items-center md:my-24">
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

    <div class="mx-4 mb-2 flex justify-center text-xs">
      {{ tournament?.description_bottom }}
    </div>
  </section>
</template>

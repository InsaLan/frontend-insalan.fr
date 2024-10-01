<script setup lang="ts">
import KnockoutMatchCard from '@/components/KnockoutMatchCard.vue';
import { BracketType, type KnockoutMatch } from '@/models/bracket';
import type { TournamentDeref } from '@/models/tournament';
import { useTournamentStore } from '@/stores/tournament.store';

const props = defineProps<{
  tournament: TournamentDeref;
}>();

const tournamentStore = useTournamentStore();
const {
  get_col_style,
  get_matchs_per_round,
  knockout_match_results,
  get_winner_matchs_per_round,
  get_looser_matchs,
  get_validated_team_by_id,
  get_bracket_cols_count,
} = tournamentStore;
</script>

<template>
  <section id="brackets">
    <h1 v-if="props.tournament.brackets.length === 0" class="mt-6 text-center text-4xl">
      Les arbres ne sont pas disponibles.
    </h1>
    <div v-for="bracket in props.tournament.brackets" v-else :key="bracket.id">
      <h1 class="title">
        {{ bracket.name }}
      </h1>
      <div v-if="bracket.bracket_type === BracketType.SINGLE" :key="bracket.id" class="overflow-x-auto">
        <div class="grid items-center gap-10" :style="get_col_style(bracket)">
          <div v-for="(games, round_idx) in get_matchs_per_round(bracket.matchs)" :key="round_idx" class="flex h-full flex-col justify-around">
            <div v-for="game in games" :key="game.id" class="m-2 divide-y">
              <KnockoutMatchCard
                :team-per-match="props.tournament.game.team_per_match"
                :teams="knockout_match_results(game as KnockoutMatch)"
                :status="game.status"
              />
            </div>
          </div>
        </div>
      </div>
      <div v-if="bracket.bracket_type === BracketType.DOUBLE" :key="bracket.id" class="overflow-x-auto">
        <div class="grid h-full items-center gap-10" :style="get_col_style(bracket)">
          <div class="flex h-full flex-col justify-around">
            <div v-for="game in get_winner_matchs_per_round(bracket.matchs, bracket.depth)" :key="game.id" class="m-2 divide-y">
              <KnockoutMatchCard
                :team-per-match="props.tournament.game.team_per_match"
                :teams="knockout_match_results(game)"
                :status="game.status"
              />
            </div>
          </div>
          <div v-for="col_idx in get_bracket_cols_count(bracket) - 2" :key="col_idx" class="flex h-full flex-col">
            <div v-if="col_idx % 2" class="flex h-full flex-col justify-around">
              <div v-for="game in get_winner_matchs_per_round(bracket.matchs, bracket.depth - (col_idx - 1) / 2 - 1)" :key="game.id" class="m-2 divide-y">
                <KnockoutMatchCard
                  :team-per-match="props.tournament.game.team_per_match"
                  :teams="knockout_match_results(game)"
                  :status="game.status"
                />
              </div>
            </div>
          </div>
          <div v-if="bracket.winner !== null" class="w-40 bg-yellow-600 p-2">
            <h1 class="text-bold text-center text-2xl">
              Vainqueur
            </h1>
            <p class="text-center text-xl">
              {{ get_validated_team_by_id(bracket.winner)?.name }}
            </p>
          </div>
        </div>
        <div class="grid items-center gap-10" :style="get_col_style(bracket)">
          <div/>
          <div v-for="(games, round_idx) in get_looser_matchs(bracket.matchs)" :key="round_idx" class="flex h-full flex-col justify-around">
            <div v-for="game in games" :key="game.id" class="m-2 divide-y">
              <KnockoutMatchCard
                :team-per-match="props.tournament.game.team_per_match"
                :teams="knockout_match_results(game)"
                :status="game.status"
              />
            </div>
          </div>
          <div/>
        </div>
      </div>
    </div>
  </section>
</template>

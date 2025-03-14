<script setup lang="ts">
import MatchCard from '@/components/Tournament/MatchCard.vue';
import { BracketType } from '@/models/bracket';
import { MatchTypeEnum } from '@/models/match';
import type { TournamentDeref } from '@/models/tournament';
import { useTournamentStore } from '@/stores/tournament.store';

const { tournament } = defineProps<{
  tournament: TournamentDeref;
}>();

const tournamentStore = useTournamentStore();
const {
  get_col_style,
  get_matchs_per_round,
  get_winner_matchs_per_round,
  get_looser_matchs,
  get_validated_team_by_id,
  get_bracket_cols_count,
} = tournamentStore;

const bracket_round_title = (depth: number, round_idx: number) => {
  if (round_idx < depth - 2) {
    return `${2 ** (depth - round_idx)}ᵉ de finale`;
  }
  if (round_idx === depth - 2) {
    return 'Quarts de finale';
  }
  if (round_idx === depth - 1) {
    return 'Demi-finales';
  }
  if (round_idx === depth) {
    return 'Finale';
  }

  return '';
};
</script>

<template>
  <section id="brackets">
    <h1
      v-if="tournament.brackets.length === 0"
      class="mt-6 text-center text-4xl"
    >
      Les arbres ne sont pas disponibles.
    </h1>
    <div
      v-for="bracket in tournament.brackets"
      v-else
      :key="bracket.id"
      class="mb-5"
    >
      <h1 class="title">
        Arbre {{ bracket.name }}
      </h1>
      <div
        v-if="bracket.bracket_type === BracketType.SINGLE"
        :key="bracket.id"
        class="mx-4 overflow-x-auto"
      >
        <div
          class="grid items-center gap-x-10 gap-y-2"
          :style="get_col_style(bracket)"
        >
          <div
            v-for="round_idx in bracket.depth + 1"
            :key="round_idx"
            class="text-center text-xl"
          >
            {{ bracket_round_title(bracket.depth, round_idx) }}
          </div>
          <div
            v-for="(games, round_idx) in get_matchs_per_round(bracket.matchs)"
            :key="round_idx"
            class="flex h-full flex-col justify-around gap-4"
          >
            <div
              v-for="game in games"
              :key="game.id"
              class="m-2 divide-y"
            >
              <MatchCard
                :match="game"
                :match-type="{ type: MatchTypeEnum.BRACKET, id: game.bracket }"
                :team-per-match="tournament.game.team_per_match"
              />
            </div>
          </div>
          <div
            v-if="bracket.winner !== null"
            class="w-40 bg-yellow-600 p-2"
          >
            <h1
              class="text-bold text-center text-2xl"
            >
              Vainqueur
            </h1>
            <p
              class="text-center text-xl"
            >
              {{ get_validated_team_by_id(bracket.winner)?.name }}
            </p>
          </div>
        </div>
      </div>
      <div
        v-if="bracket.bracket_type === BracketType.DOUBLE"
        :key="bracket.id"
        class="mx-4 overflow-x-auto"
      >
        <h2
          class="ml-4 p-2 text-2xl"
        >
          Arbre principal
        </h2>
        <div
          class="grid h-full items-center gap-x-10 gap-y-2"
          :style="get_col_style(bracket)"
        >
          <div
            v-for="round_idx in 2 * bracket.depth + 1"
            :key="round_idx"
            class="text-center text-xl"
          >
            {{
              (round_idx === 1)
                ? bracket_round_title(bracket.depth, round_idx)
                : (round_idx % 2 === 0 && round_idx < 2 * bracket.depth)
                  ? bracket_round_title(bracket.depth, (round_idx + 2) / 2)
                  : (round_idx === 2 * bracket.depth)
                    ? 'Grande finale'
                    : ''
            }}
          </div>
          <div
            class="flex h-full flex-col justify-around gap-4"
          >
            <div
              v-for="game in get_winner_matchs_per_round(bracket.matchs, bracket.depth)"
              :key="game.id"
              class="m-2 divide-y"
            >
              <MatchCard
                :match="game"
                :match-type="{ type: MatchTypeEnum.BRACKET, id: game.bracket }"
                :team-per-match="tournament.game.team_per_match"
              />
            </div>
          </div>
          <div
            v-for="col_idx in get_bracket_cols_count(bracket) - 2"
            :key="col_idx"
            class="flex h-full flex-col"
          >
            <div
              v-if="col_idx % 2"
              class="flex h-full flex-col justify-around gap-4"
            >
              <div
                v-for="game in get_winner_matchs_per_round(bracket.matchs, bracket.depth - (col_idx - 1) / 2 - 1)"
                :key="game.id"
                class="m-2 divide-y"
              >
                <MatchCard
                  :match="game"
                  :match-type="{ type: MatchTypeEnum.BRACKET, id: game.bracket }"
                  :team-per-match="tournament.game.team_per_match"
                />
              </div>
            </div>
          </div>
          <div
            v-if="bracket.winner !== null"
            class="w-40 bg-yellow-600 p-2"
          >
            <h1
              class="text-bold text-center text-2xl"
            >
              Vainqueur
            </h1>
            <p
              class="text-center text-xl"
            >
              {{ get_validated_team_by_id(bracket.winner)?.name }}
            </p>
          </div>
        </div>

        <h2
          class="ml-4 p-2 text-2xl"
        >
          Arbre de repêchage
        </h2>

        <div
          class="grid items-center gap-x-10 gap-y-2"
          :style="get_col_style(bracket)"
        >
          <div
            v-for="round_idx in 2 * bracket.depth + 1"
            :key="round_idx"
            class="text-center text-xl"
          >
            {{
              (round_idx !== 1 && round_idx < 2 * bracket.depth - 1)
                ? `Tour ${round_idx - 1}`
                : (round_idx === 2 * bracket.depth - 1)
                  ? 'Finale'
                  : ''
            }}
          </div>
          <div/>
          <div
            v-for="(games, round_idx) in get_looser_matchs(bracket.matchs)"
            :key="round_idx"
            class="flex h-full flex-col justify-around gap-4"
          >
            <div
              v-for="game in games"
              :key="game.id"
              class="m-2 divide-y"
            >
              <MatchCard
                :match="game"
                :match-type="{ type: MatchTypeEnum.BRACKET, id: game.bracket }"
                :team-per-match="tournament.game.team_per_match"
              />
            </div>
          </div>
          <div/>
        </div>
      </div>
    </div>
  </section>
</template>

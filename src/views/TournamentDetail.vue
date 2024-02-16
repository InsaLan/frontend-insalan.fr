<script setup lang="ts">
import { storeToRefs } from 'pinia';
import {
  computed, onMounted, reactive, ref,
} from 'vue';
import { useRouter } from 'vue-router';
import Content from '@/components/Content.vue';
import GroupTable from '@/components/GroupTable.vue';
import KnockoutMatchCard from '@/components/KnockoutMatchCard.vue';
import SwissRoundTable from '@/components/SwissRoundTable.vue';
import TeamCard from '@/components/TeamCard.vue';
import {
  type Bracket, BracketSet, BracketType, type KnockoutMatch,
} from '@/models/bracket';
import type { Game } from '@/models/game';
import type { Group } from '@/models/group';
import { BestofType, type Match } from '@/models/match';
import type { SwissMatch } from '@/models/swiss';
import type { Team } from '@/models/team';
import type { Tournament } from '@/models/tournament';
import { useContentStore } from '@/stores/content.store';
import { groupBy, useTournamentStore } from '@/stores/tournament.store';

const props = defineProps<{
  id: number;
  section?: { s: string };
}>();

const { md, getContent } = useContentStore();

const tournamentStore = useTournamentStore();
const {
  getTournamentFull, getTournamentTeams, get_matchs_per_round, is_winning_team, get_validated_team_by_id, get_col_style, get_bracket_cols_count, get_group_by_id, get_winner_matchs_per_round,
} = tournamentStore;
const { tournament, tourney_teams } = storeToRefs(tournamentStore);
const open_drop = ref(false);
const drop_label = ref('Informations');
const trans = ref('translateX(0vw)');
const show_detail_group = ref<number>(0);
const sections = reactive<Record<string, [boolean, number]>>({
  info: [false, 0],
  teams: [false, 1],
  groups: [false, 2],
  brackets: [false, 3],
  planning: [false, 4],
  rules: [false, 5],
});

const select_tag = (e: Event) => {
  const target = e.target as HTMLInputElement;
  open_drop.value = false;
  drop_label.value = target.innerHTML;
  trans.value = `translateX(calc(-100vw * ${sections[target.id][1]}))`;
  Object.keys(sections).forEach((k) => {
    sections[k][0] = false;
  });
  sections[target.id][0] = true;
};

const get_looser_matchs = (matchs: KnockoutMatch[]) => {
  const looser_matchs = matchs.filter((match) => match.bracket_set === BracketSet.LOOSER);
  const round_matchs = groupBy(looser_matchs, 'round_number');
  return Object.values(round_matchs).reverse();
};

const knockout_match_results = (match: KnockoutMatch) => {
  const match_results = [] as Record<string, string | number | boolean | undefined>[];
  match.teams.forEach((team) => {
    const data = {} as Record<string, string | number | boolean | undefined>;
    data.name = get_validated_team_by_id(team)?.name;
    data.score = match.score[team];
    data.is_winner = is_winning_team(match, team);
    match_results.push(data);
  });

  return match_results;
};

const swiss_match_results = (matchs : SwissMatch[]) => {
  const round_matchs = groupBy(matchs, 'round_number');
  const res = {} as Record<string, Record<string, string | Record<string, string | number | boolean | undefined>[]>[]>;
  Object.entries(round_matchs).forEach(([round, matchs]) => {
    res[round] = [] as Record<string, string | Record<string, string | number | boolean | undefined>[]>[];
    matchs.forEach((match) => {
      const tmp = {} as Record<string, string | Record<string, string | number | boolean | undefined>[]>;
      tmp.teams = [] as Record<string, string | number | boolean | undefined>[];
      tmp.status = match.status;
      match.teams.forEach((team) => {
        const data = {} as Record<string, string | number | boolean | undefined>;
        data.name = get_validated_team_by_id(team)?.name;
        data.score = match.score[team];
        data.is_winner = is_winning_team(match, team);
        tmp.teams.push(data);
      });
      res[round].push(tmp);
    });
  });

  return res;
};

const router = useRouter();
try {
  await getTournamentFull(props.id);
  getTournamentTeams();
} catch (err: unknown) {
  router.go(-1);
}

onMounted(async () => {
  if (props.section !== undefined && props.section.s in sections) {
    sections[props.section.s][0] = true;
    drop_label.value = props.section.s;
    trans.value = `translateX(calc(-100vw * ${sections[props.section.s][1]}`;
  } else {
    sections.info[0] = true;
  }
});
</script>

<template>
  <div v-if="tournament?.is_announced" class="flex min-h-[calc(100vh_-_6rem)] flex-col items-center">
    <div class="sticky top-24 min-w-full bg-[#2c292d]">
      <div class="text-center text-6xl font-bold text-white">
        {{ tournament?.name }}
      </div>

      <nav class="mt-2 flex justify-center bg-gray-500 py-4">
        <button
          :class="{ 'after:translate-x-[5px] after:rotate-90 ': open_drop, 'after:-rotate-90': !open_drop }"
          class="text-xl after:inline-block after:w-4 after:origin-center after:content-['\2039'] md:hidden"
          type="button"
          @click="open_drop = !open_drop"
        >
          {{ drop_label }}
        </button> <!-- id="dropdown-btn"--> <!--@click="switch_tag"-->
        <div
          class="dropGrow absolute z-10 w-screen translate-y-10 flex-col items-center bg-gray-500 md:static md:z-0 md:flex md:w-2/3 md:translate-y-0 md:flex-row md:justify-between xl:w-1/2"
          :class="{ 'flex border-t-2 border-white': open_drop, hidden: !open_drop }"
        >
          <!--id="dropdown"-->
          <button
            id="info"
            :class="{ 'underline decoration-[#63d1ff] decoration-4 underline-offset-8': sections.info[0] }"
            class="my-2 text-xl md:my-0"
            type="button"
            @click="select_tag"
          >
            Informations
          </button> <!--href="#infos"-->
          <button
            id="teams"
            :class="{ 'underline decoration-[#63d1ff] decoration-4 underline-offset-8': sections.teams[0] }"
            class="my-2 text-xl md:my-0"
            type="button"
            @click="select_tag"
          >
            Équipes
          </button> <!--href="#teams"-->
          <button
            id="groups"
            type="button"
            class="my-2 text-xl md:my-0"
            :class="{ 'underline decoration-[#63d1ff] decoration-4 underline-offset-8': sections.groups[0] }"
            @click="select_tag"
          >
            Poules
          </button> <!--href="#groups"-->
          <button
            id="brackets"
            :class="{ 'underline decoration-[#63d1ff] decoration-4 underline-offset-8': sections.brackets[0] }"
            class="my-2 text-xl md:my-0"
            type="button"
            @click="select_tag"
          >
            Arbres
          </button> <!--href="#brackets"-->
          <button
            id="planning"
            :class="{ 'underline decoration-[#63d1ff] decoration-4 underline-offset-8': sections.planning[0] }"
            class="my-2 text-xl md:my-0"
            type="button"
            @click="select_tag"
          >
            Planning
          </button> <!--href="#planning"-->
          <button
            id="rules"
            :class="{ 'underline decoration-[#63d1ff] decoration-4 underline-offset-8': sections.rules[0] }"
            class="my-2 text-xl md:my-0"
            type="button"
            @click="select_tag"
          >
            Règlement
          </button> <!--href="#rules"-->
        </div>
      </nav>
    </div>

    <section
      id="infos"
      :style="{ backgroundImage: `url(${tournament?.logo})` }"
      class="grid grid-rows-[min-content_1fr] bg-gray-500 bg-cover bg-center bg-blend-multiply"
      :class="{ hidden: !sections.info[0] }"
    >
      <h2 class="font mx-auto my-4 w-3/4 text-center text-3xl font-bold">
        {{ tournament?.description }}
      </h2>

      <div class="grid gap-7 md:grid-cols-3">
        <div>
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
        </div>

        <div>
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
                {{ tournament?.cashprizes.length === 0 ? "À venir" : Number(tournament?.cashprizes[0]) + " €" }}
              </text>
              <text font-size="2" text-anchor="middle" x="2" y="6">
                🥈
              </text>
              <text font-size="1" text-anchor="middle" x="2" y="7.25">
                {{ tournament?.cashprizes.length === 0 ? "À venir" : Number(tournament?.cashprizes[1]) + " €" }}
              </text>
              <text font-size="2" text-anchor="middle" x="10" y="6">
                🥉
              </text>
              <text font-size="1" text-anchor="middle" x="10" y="7.25">
                {{ tournament?.cashprizes.length === 0 ? "À venir" : Number(tournament?.cashprizes[2]) + " €" }}
              </text>
            </svg>
          </div>
        </div>
        <div>
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
                    <image :href="tournament?.casters[0].image" class="overflow-clip" width="3.5" height="3" x="4.5" y="4.5"/>
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
                  <image :href="tournament?.casters[0].image" class="overflow-clip" width="3.5" height="3" x="4.5"/>
                </a>
                <a :href="tournament?.casters[1].url">
                  <text font-size="1" textLength="3.5" text-anchor="middle" x="6" y="6.25">
                    {{ tournament?.casters[1].name }}
                  </text>
                  <!-- eslint-disable-next-line tailwindcss/migration-from-tailwind-2 -->
                  <image :href="tournament?.casters[1].image" class="overflow-clip" width="3.5" height="3" y="4.5"/>
                </a>
                <text font-size="1" text-anchor="middle" x="4" y="4.25">&</text>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>

    <section id="teams" :class="{ hidden: !sections.teams[0] }">
      <h1 v-if="tournament?.teams.length === 0" class="mt-6 text-center text-4xl">
        Aucune équipe inscrite
      </h1>
      <div v-if="tourney_teams?.validated_teams.length > 0">
        <h1 class="title">
          Équipes validées
        </h1>
        <div class="grid gap-4 p-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <TeamCard v-for="team in tourney_teams.validated_teams" :key="team.id" :team="team"/>
        </div>
      </div>
      <div v-if="tourney_teams?.non_validated_teams.length > 0">
        <h1 class="title">
          Équipes en cours de validation
        </h1>
        <div class="grid gap-4 p-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <TeamCard v-for="team in tourney_teams.non_validated_teams" :key="team.id" :team="team"/>
        </div>
      </div>
    </section>

    <section id="groups" :class="{ hidden: !sections.groups[0] || show_detail_group }" class="flex content-center justify-center">
      <h1 v-if="tournament?.groups.length === 0 && tournament?.swissRounds.length === 0" class="mt-6 text-center text-4xl">
        Les poules ou les rondes suisse ne sont pas disponibles.
      </h1>
      <div v-if="tournament?.groups.length > 0" class="my-auto flex justify-center gap-20 flex-wrap">
        <div v-for="group in tournament?.groups" :key="group.id" class=" border-collapse border-slate-500 hover:ring hover:ring-slate-500 hover:ring-8" @click="show_detail_group = group.id">
          <GroupTable :teams="tourney_teams" :group="group"/>
        </div>
      </div>
      <div v-else-if="tournament?.swissRounds.length > 0" class="mt-6 flex h-full justify-center">
        <div v-for="swiss in tournament?.swissRounds" :key="swiss.id" class="mx-3 overflow-x-auto">
          <SwissRoundTable
            :rounds="swiss_match_results(swiss.matchs)"
            :team-per-match="tournament?.game.team_per_match"
            :round-count="2 * swiss.min_score - 1"
          />
        </div>
      </div>
    </section>

    <section v-if="get_group_by_id(tournament?.groups, show_detail_group) !== undefined" id="group" :class="{ hidden: show_detail_group === null || !sections.groups[0] }" class="flex flex-col p-4">
      <nav class="my-5 flex justify-center gap-3">
        <button type="button" class="w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto" @click="show_detail_group = 0">
          <fa-awesome-icon icon="fa-solid fa-arrow-left"/> Retour
        </button>
        <h1 class="text-center text-3xl font-black">
          {{ get_group_by_id(tournament?.groups, show_detail_group)?.name }}
        </h1>
      </nav>
      <div class="flex justify-center gap-3">
        <GroupTable class="max-w-96 max-h-96 w-1/2" :teams="tourney_teams" :group="get_group_by_id(tournament.groups, show_detail_group)"/>
        <div class="w-1/2">
          <div v-for="matchs in get_matchs_per_round(get_group_by_id(tournament.groups, show_detail_group)?.matchs)" v-if="get_group_by_id(tournament.groups, show_detail_group) !== undefined" :key="matchs.id">
            <h1 class="text-center text-3xl font-black">
              Round {{ matchs[0].round_number }}
            </h1>
            <div class="gap-4">
              <div v-for="game in matchs" :key="game.id" class="flex justify-center">
                <div class="mb-4 flex divide-x border-2 text-xl font-bold">
                  <div class="p-3">
                    {{ get_validated_team_by_id(game.teams[0])?.name }}
                  </div>
                  <div class="p-3">
                    {{ game.score[game.teams[0]] }}
                  </div>
                </div>
                <div v-if="game.teams.length == 2" class=" mb-4 flex divide-x border-2 text-xl font-bold">
                  <div class="p-3">
                    {{ game.score[game.teams[1]] }}
                  </div>
                  <div class="p-3">
                    {{ get_validated_team_by_id(game.teams[1])?.name }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="brackets" :class="{ hidden: !sections.brackets[0] }">
      <!-- TODO: refactor in component -->
      <h1 v-if="tournament?.brackets.length === 0" class="mt-6 text-center text-4xl">
        Les arbres ne sont pas disponibles.
      </h1>
      <div v-for="bracket in tournament.brackets" v-else :key="bracket.id">
        <h1 class="title">
          {{ bracket.name }}
        </h1>
        <div v-if="bracket.bracket_type === BracketType.SINGLE" :key="bracket.id" class="overflow-x-auto">
          <div class="grid items-center gap-10" :style="get_col_style(bracket)">
            <div v-for="(games, round_idx) in get_matchs_per_round(bracket.matchs)" :key="round_idx" class="flex flex-col justify-around">
              <div v-for="game in games" :key="game.id" class="m-2 divide-y">
                <KnockoutMatchCard
                  :team-per-match="tournament.game.team_per_match"
                  :teams="knockout_match_results(game as KnockoutMatch)"
                  :status="game.status"
                />
              </div>
            </div>
          </div>
        </div>
        <div v-if="bracket.bracket_type === BracketType.DOUBLE" :key="bracket.id" class="overflow-x-auto">
          <div class="grid items-center gap-10" :style="get_col_style(bracket)">
            <div class="flex flex-col justify-around">
              <div v-for="game in get_winner_matchs_per_round(bracket.matchs, bracket.depth)" :key="game.id" class="m-2 divide-y">
                <KnockoutMatchCard
                  :team-per-match="tournament.game.team_per_match"
                  :teams="knockout_match_results(game)"
                  :status="game.status"
                />
              </div>
            </div>
            <div v-for="col_idx in get_bracket_cols_count(bracket) - 2" :key="col_idx" class="flex flex-col justify-around">
              <div v-if="col_idx % 2">
                <div v-for="game in get_winner_matchs_per_round(bracket.matchs, bracket.depth - (col_idx - 1) / 2 - 1)" :key="game.id" class="m-2 divide-y">
                  <KnockoutMatchCard
                    :team-per-match="tournament.game.team_per_match"
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
            <div v-for="(games, round_idx) in get_looser_matchs(bracket.matchs)" :key="round_idx" class="flex flex-col justify-around">
              <div v-for="game in games" :key="game.id" class="m-2 divide-y">
                <KnockoutMatchCard
                  :team-per-match="tournament.game.team_per_match"
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

    <section id="planning" :class="{ hidden: !sections.planning[0] }">
      <div class="m-1 flex justify-center rounded bg-cyan-900 p-2">
        Les plannings peuvent varier en fonction de l'avancement des tournois et sont donnés à titre indicatif.
      </div>
      <div v-if="!getContent(tournament?.planning)" class="flex justify-center">
        Le planning n'est pas encore disponible, revenez plus tard !
      </div>
      <div class="flex justify-center">
        <div class="m-2 overflow-auto overscroll-y-auto">
          <content :name="tournament?.planning"/>
        </div>
      </div>
    </section>

    <section id="rules" :class="{ hidden: !sections.rules[0] }">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div class="mx-auto my-4 w-[min(1080px,90%)] text-justify" v-html="md.render(tournament?.rules)"/>
    </section>
  </div>

  <div v-else class="mt-6 text-center text-4xl">
    Le tournoi que vous cherchez n'a pas encore été annoncé, revenez plus tard !
  </div>
</template>

<style scoped>
section {
  flex-grow: 1;
  width: 100%;
  height: 100%;
  overflow-x: scroll;
}

a {
  @apply text-xl
}

@media (max-width: 768px)  {
  .dropGrow {
    animation: 300ms ease-in-out growDown;
    animation-direction: alternate;
  }

  @keyframes growDown {
    0% {
      transform: translateY(2.5rem) scaleY(0);
    }
    80% {
      transform: translateY(2.5rem) scaleY(1.1);
    }
    100% {
      transform: translateY(2.5rem) scaleY(1);
    }
  }
}
</style>

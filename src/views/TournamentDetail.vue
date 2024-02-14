<script setup lang="ts">
import { storeToRefs } from 'pinia';
import {
  computed, onMounted, reactive, ref,
} from 'vue';
import { useRouter } from 'vue-router';
import Content from '@/components/Content.vue';
import TeamCard from '@/components/TeamCard.vue';
import GroupTable from '@/components/GroupTable.vue';
import type { Game } from '@/models/game';
import type { Team } from '@/models/team';
import type { Tournament } from '@/models/tournament';
import type { Bracket } from '@/models/bracket';
import type { Match } from '@/models/match';
import type { Group } from '@/models/group';
import { useContentStore } from '@/stores/content.store';
import { useTournamentStore, groupBy } from '@/stores/tournament.store';
const props = defineProps<{
  id: number;
  section?: { s: string };
}>();

const { md, getContent } = useContentStore();

const tournamentStore = useTournamentStore();
const { getTournamentFull } = tournamentStore;
const { tournamentsList } = storeToRefs(tournamentStore);
const tournament = computed<Tournament | undefined>(() => tournamentsList.value[props.id]);
const teams = computed<Record<string, Team[]>>(() => (tournament.value?.teams as Team[]).reduce((ret, team) => {
  if (team.validated) {
    ret.validated_teams.push(team);
  } else {
    ret.non_validated_teams.push(team);
  }
  return ret;
}, { validated_teams: [] as Team[], non_validated_teams: [] as Team[] }));
const open_drop = ref(false);
const drop_label = ref('Informations');
const trans = ref('translateX(0vw)');
const show_detail_group = ref(null);
const sections = reactive<Record<string, [boolean, number]>>({
  info: [false, 0],
  teams: [false, 1],
  groups: [false, 2],
  brackets: [false, 3],
  planning: [false, 4],
  rules: [false, 5],
});

const get_validated_team_by_id = (id: number) => {
  return teams.value?.validated_teams.find(team => team.id === id);
};

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

const get_col_class = (bracket: Bracket) => {
  return `grid-cols-${Math.ceil(Math.log2(bracket.team_count)) + 1}`;
};

const is_winning_team = (obj: {[key: number]: number}, team_id: number) => {
  return parseInt(Object.keys(obj).reduce((a, b) => obj[a] > obj[b] ? a : b)) == team_id;
}
const get_matchs_per_round = (matchs: Match[]) => {
  const reversed_rounds = groupBy(matchs, "round_number");
  return Object.values(reversed_rounds).reverse();

};
/** 
const get_matchs_per_round_reverse = (matchs: Match[]) => {
  return groupBy(matchs, "round_number");

};
*/
const get_group_by_id = (groups: Group[], id: number) => {
  return groups.find(group => group.id === id);
};
const router = useRouter();
onMounted(async () => {

  try {
    await getTournamentFull(props.id);
  } catch (err: unknown) {
    router.go(-1);
  }
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
      <div v-if="teams.validated_teams.length > 0">
        <h1 class="title">
          Équipes validées
        </h1>
        <div class="grid gap-4 p-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <TeamCard v-for="team in teams.validated_teams" :key="team.id" :team="team"/>
        </div>
      </div>
      <div v-if="teams.non_validated_teams.length > 0">
        <h1 class="title">
          Équipes en cours de validation
        </h1>
        <div class="grid gap-4 p-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <TeamCard v-for="team in teams.non_validated_teams" :key="team.id" :team="team"/>
        </div>
      </div>
    </section>

    <section id="groups" :class="{ hidden: !sections.groups[0] || show_detail_group }">
      <h1 v-if="tournament?.groups.length === 0" class="mt-6 text-center text-4xl">
        Les poules ne sont pas disponibles.
      </h1>
      <div v-if="tournament?.groups.length > 0" class="mt-6 flex justify-center">
        <div @click="show_detail_group = group.id" class="mx-3" v-for="group in tournament.groups" :key="group.id">
          <GroupTable  :teams="teams" :group="group" />
        </div>
      </div>
    </section>


    <section v-if="get_group_by_id(tournament?.groups, show_detail_group) !== undefined" id="group" :class="{hidden: show_detail_group === null || !sections.groups[0]}" class="flex flex-col p-4">
      <nav class="flex gap-3 my-5 justify-center">   
        <button class="w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto text-center" @click="show_detail_group = null"><fa-awesome-icon icon="fa-solid fa-arrow-left" /> Retour </button>
        <h1 class="text-center text-3xl font-black">{{ get_group_by_id(tournament?.groups, show_detail_group).name }}</h1>
      </nav>
      <div class="flex justify-center gap-3">
        <GroupTable class="w-1/2 max-w-96 max-h-96" :teams="teams" :group="get_group_by_id(tournament?.groups, show_detail_group)" />
          <div class="w-1/2">
            <div v-for="match in get_matchs_per_round(get_group_by_id(tournament?.groups, show_detail_group).matchs)">
              <h1 class="text-3xl text-center font-black">Round {{ match[0].round_number }}</h1>
                <div class="gap-4">
                  <div class="flex justify-center" v-for="game in match">
                    <div class="text-xl font-bold flex border-2 divide-x mb-4">
                      <div class="p-3">{{ get_validated_team_by_id(game.teams[0]).name }}</div>
                      <div class="p-3">{{ game.score[game.teams[0]] }}</div>
                    </div>
                    <div v-if="game.teams.length == 2" class=" text-xl font-bold flex border-2 divide-x mb-4">
                      <div class="p-3">{{ game.score[game.teams[1]] }}</div>
                      <div class="p-3">{{ get_validated_team_by_id(game.teams[1]).name }}</div>
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
      <div v-else v-for="bracket in tournament.brackets"  >
        <h1 class="title"> {{ bracket.name}} </h1>
        <div class="grid items-center" :class="get_col_class(bracket)" :key="bracket.id"> 
        <div v-for="games in get_matchs_per_round(bracket.matchs)" :key="games.id">
          <div class="m-2 divide-y" v-for="game in games" :key="game.id">
              <div class="bg-slate-700 p-2 flex justify-between text-xl" v-for="team_id in game.teams" :key="team_id" :class="{'bg-slate-900': game.status =='ONGOING'}">
                   <div class="text-grey-500">{{ get_validated_team_by_id(team_id).name}}</div> <div v-if = "game.status == 'COMPLETED'" :class="is_winning_team(game.score, team_id) ? 'text-emerald-300' : 'text-white'" class="font-black text-3xl">{{ game.score[team_id] }}</div>
              </div>
          </div>
        </div>
        <div v-if="bracket.winner !== null" class="w-40 bg-yellow-600 p-2">
           <h1 class="text-bold text-center text-2xl">Vainqueur</h1>
          <p class="text-center text-xl">{{ get_validated_team_by_id(bracket.winner).name }}</p>
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

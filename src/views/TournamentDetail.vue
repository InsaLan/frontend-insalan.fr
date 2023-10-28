<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';
import type { Team } from '@/models/team';

import TeamCard from '../components/TeamCard.vue';
import { useTournamentStore } from '../stores/tournament.store';

const props = defineProps<{
  id: number;
}>();

const tournamentStore = useTournamentStore();
const { fetchTournamentFull } = tournamentStore;
const { tournament } = storeToRefs(tournamentStore);

onMounted(async () => {
  if (tournament.value?.id !== props.id || typeof (tournament.value?.event) === 'number') {
    await fetchTournamentFull(props.id);
  }
});

const open_drop = ref(false);
const drop_label = ref('Informations');
const trans = ref('translateX(0vw)');

const select_tag = (e: Event) => {
  open_drop.value = false;
  drop_label.value = (e.target as HTMLInputElement).innerHTML;
  trans.value = `translateX(calc(-100vw * ${Array.from((e.target as HTMLElement).parentElement?.children).indexOf(e.target as HTMLInputElement)}))`;
  // console.log(trans);
};
</script>

<template>
  <div class="flex h-min flex-col items-center 2xl:h-[calc(100vh_-_6rem)]">
    <div class="text-center text-6xl font-bold text-white">
      {{ tournament !== undefined ? tournament.name : '' }}
    </div>

    <nav class="mt-2 flex w-screen justify-center bg-gray-500 py-4">
      <button type="button" class="text-xl after:inline-block after:w-4 after:origin-center after:content-['\2039'] md:hidden" :class="{ 'after:translate-x-[5px]': open_drop, 'after:rotate-90': open_drop, 'after:-rotate-90': !open_drop }" @click="open_drop = !open_drop">
        {{ drop_label }}
      </button> <!-- id="dropdown-btn"--> <!--@click="switch_tag"-->
      <div class="absolute z-10 w-screen translate-y-8 flex-col items-center bg-gray-500 md:static md:z-0 md:flex md:w-2/3 md:translate-y-0 md:flex-row md:justify-between xl:w-1/2" :class="{ flex: open_drop, hidden: !open_drop }">
        <!--id="dropdown"-->
        <button type="button" @click="select_tag">
          Informations
        </button> <!--href="#infos"-->
        <button type="button" @click="select_tag">
          Équipes
        </button> <!--href="#teams"-->
        <button type="button" @click="select_tag">
          Poules
        </button> <!--href="#groups"-->
        <button type="button" @click="select_tag">
          Arbres
        </button> <!--href="#brackets"-->
        <button type="button" @click="select_tag">
          Planning
        </button> <!--href="#planning"-->
        <button type="button" @click="select_tag">
          Règlement
        </button> <!--href="#rules"-->
      </div>
    </nav>

    <div class="flex h-full min-h-min w-screen overflow-x-hidden">
      <div class="grid grid-cols-[repeat(6,100vw)]" :style="{ transform: trans }">
        <section id="infos" class="grid place-items-center gap-5 bg-gray-500 bg-cover bg-center bg-blend-multiply 2xl:grid-rows-[1fr_3fr]" :style="{ backgroundImage: 'url(' + tournament?.logo + ')' }">
          <h2 class="font my-8 w-9/12 text-center text-3xl font-bold">
            Viens prendre part à un tournoi palpitant et amusant. Lance toi dans la faille de l'invocateur
            avec tes coéquipiers pour tanter de remporter la victoire ou tout simplement vous amuser tous ensemble !
          </h2>

          <div class="grid h-full w-full place-items-center gap-7 2xl:grid-cols-3">
            <div class="text-3xl">
              24 équipes de 5 joueurs <br/>
              xx€ / joueur
            </div>

            <div class="flex h-full w-full flex-col items-center justify-around">
              <h3 class="text-4xl">
                Cashprise
              </h3>
              <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 30 15" class="mb-10 h-1/2 w-11/12">
                <rect x="0" y="7.5" width="10" height="7.5"/>
                <text x="5" y="14" font-size="6" fill="black" text-anchor="middle">2</text>
                <rect x="10" y="5" width="10" height="10"/>
                <text x="15" y="12" font-size="7" fill="black" text-anchor="middle">1</text>
                <rect x="20" y="9" width="10" height="6"/>
                <text x="25" y="14" font-size="6" fill="black" text-anchor="middle">3</text>
                <text x="5" y="7.3" font-size="3" fill="white" text-anchor="middle">500 €</text>
                <text x="15" y="4.8" font-size="3" fill="white" text-anchor="middle">1500 €</text>
                <text x="25" y="8.8" font-size="3" fill="white" text-anchor="middle">300 €</text>
              </svg>
            </div>

            <div class="flex h-full w-full flex-col items-center justify-around">
              <h3 class="text-4xl">
                Caster
              </h3>
              <div class="flex flex-col items-center">
                <img :src="tournament?.logo" alt="caster" class="aspect-square w-1/2 text-clip rounded-full">
                <span class="text-2xl">Adrien</span>
              </div>
            </div>
          </div>
        </section>

        <section id="teams">
          <div class="grid grid-cols-[repeat(auto-fit,minmax(330px,1fr))] gap-4 p-5">
            <!--md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 grid-cols-1-->
            <div v-if="tournament !== undefined">
              <TeamCard v-for="team in (tournament.teams as Team[])" :key="team.id" :team="team"/>
            </div>
            <!--<a href="#" class="flex flex-row justify-center items-center bg-red-500 rounded">
          <div class="text-center rounded bg-red-500">

            <fa-awesome-icon size="5x" icon="fa-solid fa-circle-plus" />
            <p class="text-center text-4xl">inscrire son équipe</p>
          </div>
        </a>
      -->
          </div>
        </section>

        <section id="groups"/>

        <section id="brackets"/>

        <section id="planning"/>

        <section id="rules"/>
      </div>
    </div>
  </div>
</template>

<style scoped>
section {
  width: 100%;
}

a {
  @apply text-xl
}
</style>

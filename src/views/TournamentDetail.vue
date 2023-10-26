<script setup lang="ts">
import { useTournamentStore } from '../stores/tournament.store'
import {storeToRefs } from 'pinia'
import TeamCard  from '../components/TeamCard.vue'
import { ref } from 'vue';
const tournamentStore = useTournamentStore()
const { fetchTournamentFull } = tournamentStore
const { tournament } = storeToRefs(tournamentStore)
const props = defineProps(['id'])

if (tournament.value.id != props.id || typeof(tournament.value.event) === 'number') {
	await fetchTournamentFull(props.id)
}
await fetchTournamentFull(props.id)

const open_drop = ref(false)
const drop_label = ref("Informations")
const trans = ref('translateX(0vw)')

const select_tag = (e: Event) => {
  open_drop.value = false
  drop_label.value = (e.target as HTMLInputElement).innerHTML
  trans.value = `translateX(calc(-100vw * ${Array.from((e.target as HTMLElement).parentElement?.children).indexOf(e.target as HTMLInputElement)}))`
  console.log(trans)
}
</script>

<template>
  <div class="flex flex-col items-center 2xl:h-[calc(100vh_-_6rem)] h-min">
    <div class="text-6xl text-center text-white font-bold">{{ tournament.name }}</div>

    <nav class="flex justify-center w-screen py-4 mt-2 bg-gray-500">
      <button class="md:hidden text-xl after:content-['\2039'] after:inline-block after:w-4 after:origin-center" @click="open_drop = !open_drop" :class="{'after:translate-x-[5px]': open_drop,'after:rotate-90': open_drop, 'after:-rotate-90': !open_drop}">{{ drop_label }}</button> <!-- id="dropdown-btn"--> <!--@click="switch_tag"-->
      <div class="bg-gray-500 md:flex md:justify-between w-screen md:w-2/3 xl:w-1/2 absolute translate-y-8 z-10 flex-col items-center md:flex-row md:static md:translate-y-0 md:z-0" :class="{flex: open_drop, hidden: !open_drop}"> <!--id="dropdown"-->
        <a @click="select_tag">Informations</a> <!--href="#infos"-->
        <a @click="select_tag">Équipes</a> <!--href="#teams"-->
        <a @click="select_tag">Poules</a> <!--href="#groups"-->
        <a @click="select_tag">Arbres</a> <!--href="#brackets"-->
        <a @click="select_tag">Planning</a> <!--href="#planning"-->
        <a @click="select_tag">Règlement</a> <!--href="#rules"-->
      </div>
    </nav>

    <div class="flex w-screen overflow-x-hidden min-h-min h-full">
    <div class="grid grid-cols-[repeat(6,100vw)]" :style="{transform: trans}">
      <section id="infos" class="grid gap-5 2xl:grid-rows-[1fr_3fr] place-items-center bg-gray-500 bg-blend-multiply bg-cover bg-center" :style="{'backgroundImage': 'url(' + tournament.logo + ')'}" >
        <h2 class="text-center text-3xl font-bold font my-8 w-9/12">Viens prendre part à un tournoi palpitant et amusant. Lance toi dans la faille de l'invocateur avec tes coéquipiers pour tanter de remporter la victoire ou tout simplement vous amuser tous ensemble !</h2>

        <div class="grid 2xl:grid-cols-3 w-full h-full place-items-center gap-7">
          <div class="text-3xl">
            24 équipes de 5 joueurs <br/>
            xx€ / joueur
          </div>

          <div class="w-full h-full flex flex-col items-center justify-around">
            <h3 class="text-4xl">Cashprise</h3>
            <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 30 15" class="w-11/12 h-1/2 mb-10">
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

          <div class="w-full h-full flex flex-col items-center justify-around">
            <h3 class="text-4xl">Caster</h3>
            <div class="flex flex-col items-center">
              <img :src="tournament.logo" alt="caster" class="aspect-square rounded-full overflow-clip w-1/2">
              <span class="text-2xl">Adrien</span>
            </div>
          </div>
        </div>
      </section>

      <section id="teams">
      <div class="grid grid-cols-[repeat(auto-fit,minmax(330px,1fr))] p-5 gap-4"> <!--md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 grid-cols-1-->
        <TeamCard v-for="team in tournament.teams" :team="team" :key="team"/>
        <!--<a href="#" class="flex flex-row justify-center items-center bg-red-500 rounded">
          <div class="text-center rounded bg-red-500">

            <fa-awesome-icon size="5x" icon="fa-solid fa-circle-plus" />
            <p class="text-center text-4xl">inscrire son équipe</p>
          </div>
        </a>
      -->
      </div>
      </section>

      <section id="groups">

      </section>

      <section id="brackets">

      </section>

      <section id="planning">

      </section>

      <section id="rules">

      </section>
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

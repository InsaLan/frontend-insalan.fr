<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import TeamCard from '@/components/TeamCard.vue';
import type { Team } from '@/models/team';
import type { Tournament } from '@/models/tournament';
import { useTournamentStore } from '@/stores/tournament.store';

const props = defineProps<{
  id: number;
  section?: { s: string };
}>();

const tournamentStore = useTournamentStore();
const { getTournamentFull } = storeToRefs(tournamentStore);
const tournament = ref<Tournament>();

const open_drop = ref(false);
const drop_label = ref('Informations');
const trans = ref('translateX(0vw)');
const selected_section = reactive<Record<string, boolean>>({
  info: false,
  teams: false,
  groups: false,
  brackets: false,
  planning: false,
  rules: false,
});

const select_tag = (e: Event) => {
  const target = e.target as HTMLInputElement;
  open_drop.value = false;
  drop_label.value = target.innerHTML;
  trans.value = `translateX(calc(-100vw * ${Array.from(target.parentElement!.children).indexOf(target)}))`;
  Object.keys(selected_section).forEach((k) => {
    selected_section[k] = false;
  });
  selected_section[target.id] = true;
};

const router = useRouter();
onMounted(async () => {
  try {
    tournament.value = await getTournamentFull.value(props.id);
  } catch (err: unknown) {
    router.go(-1);
  }
  if (props.section !== undefined && props.section.s in selected_section) {
    selected_section[props.section.s] = true;
    document.getElementById(props.section.s)?.click();
  } else {
    selected_section.info = true;
  }
});
</script>

<template>
  <div class="flex h-min flex-col items-center 2xl:h-[calc(100vh_-_6rem)]">
    <div class="text-center text-6xl font-bold text-white">
      {{ tournament?.name }}
    </div>

    <nav class="mt-2 flex w-screen justify-center bg-gray-500 py-4">
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
          :class="{ 'underline decoration-[#63d1ff] decoration-4 underline-offset-8': selected_section.info }"
          class="my-2 text-xl md:my-0"
          type="button"
          @click="select_tag"
        >
          Informations
        </button> <!--href="#infos"-->
        <button
          id="teams"
          :class="{ 'underline decoration-[#63d1ff] decoration-4 underline-offset-8': selected_section.teams }"
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
          :class="{ 'underline decoration-[#63d1ff] decoration-4 underline-offset-8': selected_section.groups }"
          @click="select_tag"
        >
          Poules
        </button> <!--href="#groups"-->
        <button
          id="brackets"
          :class="{ 'underline decoration-[#63d1ff] decoration-4 underline-offset-8': selected_section.brackets }"
          class="my-2 text-xl md:my-0"
          type="button"
          @click="select_tag"
        >
          Arbres
        </button> <!--href="#brackets"-->
        <button
          id="planning"
          :class="{ 'underline decoration-[#63d1ff] decoration-4 underline-offset-8': selected_section.planning }"
          class="my-2 text-xl md:my-0"
          type="button"
          @click="select_tag"
        >
          Planning
        </button> <!--href="#planning"-->
        <button
          id="rules"
          :class="{ 'underline decoration-[#63d1ff] decoration-4 underline-offset-8': selected_section.rules }"
          class="my-2 text-xl md:my-0"
          type="button"
          @click="select_tag"
        >
          Règlement
        </button> <!--href="#rules"-->
      </div>
    </nav>

    <div class="flex h-full min-h-min w-screen overflow-x-hidden">
      <div :style="{ transform: trans }" class="grid grid-cols-[repeat(6,100vw)]">
        <section
          id="infos"
          :style="{ backgroundImage: `url(${tournament?.logo})` }"
          class="grid place-items-center gap-5 bg-gray-500 bg-cover bg-center bg-blend-multiply 2xl:grid-rows-[1fr_3fr]"
        >
          <h2 class="font my-8 w-9/12 text-center text-3xl font-bold">
            Viens prendre part à un tournoi palpitant et amusant. Lance toi dans la faille de l'invocateur
            avec tes coéquipiers pour tenter de remporter la victoire ou tout simplement vous amuser tous ensemble !
          </h2>

          <div class="grid h-full w-full place-items-center gap-7 2xl:grid-cols-3">
            <div class="flex h-full w-full flex-col items-center justify-around">
              <h3 class="text-4xl">
                Format
              </h3>
              <div class="text-3xl">
                24 équipes de 5 joueurs <br/>
                xx€ / joueur
              </div>
            </div>

            <div class="flex h-full w-full flex-col items-center justify-around">
              <h3 class="text-4xl">
                Cashprize
              </h3>
              <svg class="mb-10 h-1/2 w-11/12" fill="white" viewBox="0 0 30 15" xmlns="http://www.w3.org/2000/svg">
                <rect height="7.5" width="10" x="0" y="7.5"/>
                <text fill="black" font-size="6" text-anchor="middle" x="5" y="14">2</text>
                <rect height="10" width="10" x="10" y="5"/>
                <text fill="black" font-size="7" text-anchor="middle" x="15" y="12">1</text>
                <rect height="6" width="10" x="20" y="9"/>
                <text fill="black" font-size="6" text-anchor="middle" x="25" y="14">3</text>
                <text fill="white" font-size="3" text-anchor="middle" x="5" y="7.3">500 €</text>
                <text fill="white" font-size="3" text-anchor="middle" x="15" y="4.8">1500 €</text>
                <text fill="white" font-size="3" text-anchor="middle" x="25" y="8.8">300 €</text>
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
            <TeamCard v-for="team in (tournament?.teams as Team[])" :key="team.id" :team="team"/>
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
</style>

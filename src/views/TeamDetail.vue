<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { PaymentStatus, type PlayerRegistration, type Registration } from '@/models/registration';
import type { Team } from '@/models/team';
import { useTournamentStore } from '@/stores/tournament.store';
import { useUserStore } from '@/stores/user.store';

const props = defineProps<{
  id: number;
  teamId: number;
}>();

const tournamentStore = useTournamentStore();
const userStore = useUserStore();

const {
  getTournamentFull, getTournamentTeams,
} = tournamentStore;
const { tournament } = storeToRefs(tournamentStore);
const { user } = storeToRefs(userStore);

const router = useRouter();

let selected_team: Team;

try {
  await getTournamentFull(props.id);
  getTournamentTeams();

  // Check if the team exists in the tournament
  if (!(tournament.value?.teams as Team[]).some((team: Team) => team.id === props.teamId)) {
    router.go(-1);
  }

  // Check if the player exists in the team
  if (
    // For each team
    !(tournament.value?.teams as Team[]).some(
      // If a player corresponds to the user
      (team: Team) => (team.players as Registration[]).some(
        (player) => team.id === props.teamId && player.user === user.value?.username,
      )
      // Or if a manager corresponds to the user
      || (team.managers as string[]).includes(user.value?.username)
      // Or if a substitute corresponds to the user
      || (team.substitutes as Registration[]).some(
        (substitute) => team.id === props.teamId && substitute.user === user.value?.username,
      ),
    )
  ) {
    // router.go(-1);
  }
  selected_team = (tournament.value?.teams as Team[]).find((team: Team) => team.id === props.teamId) as Team;
} catch (err: unknown) {
  router.go(-1);
}
</script>

<template>
  <div
    :style="{ backgroundImage: `url(${tournament?.logo})` }"
    class="flex flex-1 flex-col items-center border-2 border-black bg-cover bg-center text-center text-white bg-blend-multiply"
  >
    <h1
      class="title w-full"
    >
      {{ tournament?.name }}
    </h1>

    <div
      class="m-b-6 my-5 flex w-5/6 flex-col items-center justify-center rounded-2xl bg-[#144B61] md:w-3/4"
    >
      <div
        class="flex w-full flex-col justify-between border-b-2 border-black p-2 md:flex-row"
      >
        <div class="flex items-center overflow-hidden">
          <div
            class=" truncate text-3xl"
          >
            [{{ tournament?.game.short_name }}]
            {{ selected_team?.name }}
          </div>
          <img v-if="selected_team.validated" src="/src/assets/images/check_with_bg.svg" alt="Logo validé" class="m-2 inline-block h-6 w-6"/>
        </div>
        <button
          type="button"
          class="center rounded bg-green-600 p-2 font-bold transition duration-150 ease-in-out hover:ring hover:ring-pink-500"
        >
          Changer le nom
        </button>
      </div>
      <div
        class="flex w-full flex-col bg-[#116B8E]"
      >
        <div
          class="flex w-full flex-col justify-between border-b-2 border-black p-2"
        >
          <div
            class="underline"
          >
            Joueurs :
          </div>
          <ul
            class="grid list-disc p-2 md:grid-cols-2"
          >
            <li
              v-for="player in selected_team?.players as PlayerRegistration[]"
              :key="player.id"
              class="mx-2 text-justify"
            >
              <div class="flex items-center">
                <fa-awesome-icon
                  v-if="selected_team.captain === player.user"
                  class="m-1 h-4 w-4"
                  icon="fa-solid fa-chess-king"
                />
                <div>
                  {{ player.name_in_game }}
                </div>
                <img v-if="player.payment_status === PaymentStatus.PAID" src="/src/assets/images/check_with_bg.svg" alt="Logo validé" class="m-2 inline-block h-4 w-4"/>
                <fa-awesome-icon
                  v-else
                  class="m-1 h-4 w-4 text-red-600 hover:cursor-pointer hover:text-blue-600"
                  icon="fa-solid fa-hammer"
                />
              </div>
            </li>
          </ul>
        </div>
        <div
          class="flex w-full flex-col justify-between border-b-2 border-black p-2"
        >
          <div
            class="underline"
          >
            Managers :
          </div>
          <ul
            class="grid list-disc p-2 md:grid-cols-2"
          >
            <li
              v-for="manager in selected_team?.managers as String[]"
              :key="manager as string"
              class="mx-2 text-justify"
            >
              <div class="flex items-center">
                <div>
                  {{ manager }}
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div
          class="flex w-full flex-col justify-between border-b-2 border-black p-2"
        >
          <div
            class="underline"
          >
            Remplaçants :
          </div>
          <ul
            class="grid list-disc p-2 md:grid-cols-2"
          >
            <li
              v-for="substitute in selected_team?.substitutes as PlayerRegistration[]"
              :key="substitute.id"
              class="mx-2 text-justify"
            >
              <div class="flex items-center">
                <div>
                  {{ substitute.name_in_game }}
                </div>
                <img v-if="substitute.payment_status === PaymentStatus.PAID" src="/src/assets/images/check_with_bg.svg" alt="Logo validé" class="m-2 inline-block h-4 w-4"/>
                <fa-awesome-icon
                  v-else
                  class="m-1 h-4 w-4 text-red-600 hover:cursor-pointer hover:text-blue-600"
                  icon="fa-solid fa-hammer"
                />
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div
        class="flex w-full flex-col justify-between gap-2 border-t-2 border-black p-2 md:flex-row"
      >
        <button
          type="button"
          class="center rounded bg-red-600 p-2 font-bold transition duration-150 ease-in-out hover:ring hover:ring-pink-500"
        >
          Changer le mot de passe
        </button>
        <button
          type="button"
          class="center rounded bg-red-600 p-2 font-bold transition duration-150 ease-in-out hover:ring hover:ring-pink-500"
        >
          Ajouter un manager
        </button>
      </div>
    </div>
  </div>
</template>

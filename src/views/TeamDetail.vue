<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import FormField from '@/components/FormField.vue';
import Modal from '@/components/Modal.vue';
import { PaymentStatus, type PlayerRegistration, type PlayerRegistrationDeref } from '@/models/registration';
import type { Team } from '@/models/team';
import type { TournamentDeref } from '@/models/tournament';
import { useTournamentStore } from '@/stores/tournament.store';
import { useUserStore } from '@/stores/user.store';

const props = defineProps<{
  id: number;
  teamId: number;
}>();

const tournamentStore = useTournamentStore();
const userStore = useUserStore();

const {
  getTournamentFull, getTournamentTeams, patch_registration,
} = tournamentStore;
const { tournament } = storeToRefs(tournamentStore);
// const { fetch_user_inscription_full, patch_user, send_score } = userStore;
const { inscriptions } = storeToRefs(userStore);

const team_registration = inscriptions.value?.ongoing.find((inscription) => inscription[1].team.id === props.teamId);

const router = useRouter();

let selected_team: Team;

const showModalNameInGame = ref(false);

const data_name_in_game = computed(() => ({
  name_in_game: '',
  RegId: 0,
  regtype: '',
}));
const rules_name_in_game = computed(() => ({
  name_in_game: { required },
}));
const v$_name_in_game = useVuelidate(rules_name_in_game, data_name_in_game);
const changeNameInGame = (teamId: number, lastNameInGame: string, regtype: string) => {
  data_name_in_game.value.name_in_game = lastNameInGame;
  data_name_in_game.value.RegId = teamId;
  data_name_in_game.value.regtype = regtype;

  showModalNameInGame.value = true;
};

const closeModalNameInGame = () => {
  showModalNameInGame.value = false;
};

const ValidateModalNameInGame = async () => {
  let data = {};
  const isValid = await v$_name_in_game.value.$validate();
  if (!isValid) return;
  data = {
    name_in_game: data_name_in_game.value.name_in_game,
  } as Record<string, string>;
  await patch_registration(data_name_in_game.value.regtype, data_name_in_game.value.RegId, data);
  closeModalNameInGame();
};

try {
  await getTournamentFull(props.id);
  getTournamentTeams();

  // Check if the team exists in the tournament
  if (!(tournament.value?.teams as Team[]).some((team: Team) => team.id === props.teamId)) {
    router.go(-1);
  }

  // Check if the player exists in the team
  if (!team_registration) {
    console.log('player is not in the team');
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
          v-if="
            (tournament as TournamentDeref)?.event.ongoing
              && (
                team_registration?.[0] === 'manager'
                || (
                  team_registration?.[0] === 'player'
                  && selected_team?.captain === (team_registration?.[1] as PlayerRegistrationDeref)?.name_in_game
                )
              )
          "
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
                  v-if="selected_team.captain === player.name_in_game"
                  class="m-1 h-4 w-4"
                  icon="fa-solid fa-crown"
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
        v-if="(tournament as TournamentDeref)?.event.ongoing"
        class="flex w-full flex-col justify-between gap-2 border-t-2 border-black p-2 md:flex-row"
      >
        <div
          class="flex w-full flex-col items-start"
        >
          <button
            v-if="
              (
                team_registration?.[0] === 'manager'
                || (
                  team_registration?.[0] === 'player'
                  && selected_team?.captain === (team_registration?.[1] as PlayerRegistrationDeref)?.name_in_game
                )
              )
            "
            type="button"
            class="center h-full w-full rounded bg-red-600 p-2 font-bold transition duration-150 ease-in-out hover:ring hover:ring-pink-500 md:w-auto"
          >
            Changer le mot de passe
          </button>
        </div>
        <div
          class="flex w-full max-w-[33%] flex-col items-center"
        >
          <div
            v-if="team_registration?.[0] === 'player' || team_registration?.[0] === 'substitute'"
            class="flex max-w-full items-center rounded bg-blue-700 transition duration-150 ease-in-out hover:cursor-pointer hover:ring hover:ring-pink-500"
            @click.prevent="changeNameInGame(
              team_registration?.[1].id,
              (team_registration?.[1] as PlayerRegistrationDeref).name_in_game,
              team_registration?.[0],
            )"
            @keydown.prevent="changeNameInGame(
              team_registration?.[1].id,
              (team_registration?.[1] as PlayerRegistrationDeref).name_in_game,
              team_registration?.[0],
            )"
          >
            <div class="m-2 overflow-hidden truncate">
              {{ (team_registration?.[1] as PlayerRegistrationDeref).name_in_game }}
            </div>
            <fa-awesome-icon
              class="m-2 hover:cursor-pointer"
              icon="fa-solid fa-pencil"
            />
          </div>
        </div>
        <div
          class="flex w-full flex-col items-end"
        >
          <button
            v-if="
              (team_registration?.[1]?.payment_status ?? null) !== PaymentStatus.PAID
            "
            type="button"
            class="center h-full w-full rounded bg-red-600 p-2 font-bold transition duration-150 ease-in-out hover:ring hover:ring-pink-500 md:w-auto"
          >
            Quitter l'équipe
          </button>
        </div>
      </div>
      <div
        v-else
        class="m-2 w-full"
      >
        Le tournoi est terminé et l'équipe ne peut plus être modifiée.
      </div>
    </div>
  </div>

  <Modal v-if="showModalNameInGame" @close="closeModalNameInGame">
    <template #icon>
      <div/>
    </template>
    <template #title>
      <h3 id="modal-title" class="text-white-900 text-base font-semibold leading-6">
        Changer votre nom en jeu
      </h3>
    </template>
    <template #body>
      <form id="patch-user" class="mt-2" @submit.prevent="ValidateModalNameInGame">
        <FormField
          v-slot="context"
          :validations="v$_name_in_game.name_in_game"
          class="m-2 flex flex-col"
          label="Nouveau Pseudo"
        >
          <input
            v-model="data_name_in_game.name_in_game"
            :class="{ error: context.invalid }"
            aria-label="Nouveau Pseudo"
            class="border-2 bg-theme-bg"
            placeholder="Nouveau Pseudo"
            required
            type="text"
          />
        </FormField>
        <!-- hidden submit button with tailwind-->
        <button class="hidden" type="submit"/>
      </form>
    </template>
    <template #buttons>
      <button
        class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
        type="submit"
        @click="ValidateModalNameInGame"
      >
        Valider
      </button>
      <button
        class="inline-flex w-full justify-center rounded-md bg-gray-500 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-300 sm:mt-0 sm:w-auto"
        type="button"
        @click="closeModalNameInGame"
      >
        Annuler
      </button>
    </template>
  </Modal>
</template>
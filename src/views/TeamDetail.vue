<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import FormField from '@/components/FormField.vue';
import Modal from '@/components/Modal.vue';
import Seating from '@/components/SeatingPlan.vue';
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
  getTournamentFull, getTournamentTeams, patch_registration, patch_team, leave_team,
} = tournamentStore;
const { fetch_user_inscription_full } = userStore;
const { tournament, soloGame } = storeToRefs(tournamentStore);
// const { fetch_user_inscription_full, patch_user, send_score } = userStore;
const { inscriptions } = storeToRefs(userStore);

const team_registration = inscriptions.value?.ongoing.find((inscription) => inscription[1].team.id === props.teamId);

const router = useRouter();

const selected_team = computed(() => (tournament.value?.teams as Team[]).find(
  (team: Team) => team.id === props.teamId,
) as Team);

try {
  await getTournamentFull(props.id);
  getTournamentTeams();

  await fetch_user_inscription_full();

  // Check if the team exists in the tournament
  if (!(tournament.value?.teams as Team[]).some((team: Team) => team.id === props.teamId)) {
    router.go(-1);
  }

  // Check if the player exists in the team
  if (!team_registration) {
    router.go(-1);
  }
} catch (err: unknown) {
  router.go(-1);
}

// rename registration name in game
const showModalNameInGame = ref(false);

const data_name_in_game = ref({
  name_in_game: (team_registration?.[1] as unknown as PlayerRegistration)?.name_in_game ?? '',
});
const rules_name_in_game = computed(() => ({
  name_in_game: { required },
}));
const v$_name_in_game = useVuelidate(rules_name_in_game, data_name_in_game);

const closeModalNameInGame = () => {
  showModalNameInGame.value = false;
};

const ValidateModalNameInGame = async () => {
  const current_name = (team_registration?.[1] as unknown as PlayerRegistration)?.name_in_game;

  let data = {};
  const isValid = await v$_name_in_game.value.$validate();
  if (!isValid) return;
  data = {
    name_in_game: data_name_in_game.value.name_in_game,
  } as Record<string, string>;
  await patch_registration(
    team_registration?.[0] ?? '',
    team_registration?.[1].id ?? -1,
    data,
  );

  // edit current team name in game
  selected_team.value.captain = data_name_in_game.value.name_in_game;
  (selected_team.value.players as PlayerRegistration[]).forEach((player) => {
    if (player.name_in_game === current_name) {
      player.name_in_game = data_name_in_game.value.name_in_game;
    }
  });
  (selected_team.value.substitutes as PlayerRegistration[]).forEach((sub) => {
    if (sub.name_in_game === current_name) {
      sub.name_in_game = data_name_in_game.value.name_in_game;
    }
  });

  closeModalNameInGame();
};

// rename team
const showModalTeamName = ref(false);

const data_team_name = ref({
  name: selected_team.value.name,
});
const rules_team_name = computed(() => ({
  name: { required },
}));
const v$_team_name = useVuelidate(rules_team_name, data_team_name);

const closeModalTeamName = () => {
  showModalTeamName.value = false;
};

const ValidateModalTeamName = async () => {
  const isValid = await v$_team_name.value.$validate();
  if (!isValid) return;
  const data = {
    name: data_team_name.value.name,
  } as Record<string, string>;

  await patch_team(
    selected_team.value.id,
    data,
  );

  closeModalTeamName();
};

// change team password
const showModalTeamPassword = ref(false);

const data_team_password = ref({
  password: '',
});
const rules_team_password = computed(() => ({
  password: { required },
}));
const v$_team_password = useVuelidate(rules_team_password, data_team_password);

const closeModalTeamPassword = () => {
  showModalTeamPassword.value = false;
};

const ValidateModalTeamPassword = async () => {
  const isValid = await v$_team_password.value.$validate();
  if (!isValid) return;
  const data = {
    password: data_team_password.value.password,
  } as Record<string, string>;

  await patch_team(
    selected_team.value.id,
    data,
  );

  closeModalTeamPassword();
};

// leave team
const showModalLeaveTeam = ref(false);

// Kick player
const showModalKickPlayer = ref(false);

const kickregtype = ref('');
const kickregid = ref(0);

const kick_member = async (type: string, id: number) => {
  const data = {} as Record<string, unknown>;
  if (type === 'player') {
    // Get the list of player ids
    const player_id_list = (selected_team.value.players as PlayerRegistration[]).map((player) => player.id);

    // Remove the player from the list
    const index = player_id_list.indexOf(id);
    if (index > -1) {
      player_id_list.splice(index, 1);
    }

    // Update the team
    data.players = player_id_list;
  } else {
    // Get the list of substitute ids
    const substitute_id_list = (selected_team.value.substitutes as PlayerRegistration[]).map((sub) => sub.id);

    // Remove the substitute from the list
    const index = substitute_id_list.indexOf(id);
    if (index > -1) {
      substitute_id_list.splice(index, 1);
    }

    // Update the team
    data.substitutes = substitute_id_list;
  }

  await patch_team(
    selected_team.value.id,
    data,
  );
  showModalKickPlayer.value = false;
};
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
      class="my-5 mb-6 flex w-5/6 flex-col items-center justify-center rounded-2xl bg-[#144B61] md:w-3/4"
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
          <img v-if="selected_team.validated" src="/src/assets/images/check_with_bg.svg" alt="Logo validé" class="m-2 inline-block size-6"/>
        </div>
        <button
          v-if="
            !soloGame
              && (tournament as TournamentDeref)?.event.ongoing
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
          @click="showModalTeamName = true"
          @keydown.enter="showModalTeamName = true"
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
              class="mx-2 overflow-hidden text-justify"
            >
              <div class="flex items-center">
                <fa-awesome-icon
                  v-if="selected_team.captain === player.name_in_game"
                  class="m-1 size-4"
                  icon="fa-solid fa-crown"
                />
                <div class="truncate">
                  {{ player.name_in_game }}
                </div>
                <img v-if="player.payment_status === PaymentStatus.PAID" src="/src/assets/images/check_with_bg.svg" alt="Logo validé" class="m-2 inline-block size-4"/>
                <fa-awesome-icon
                  v-if="
                    player.payment_status !== PaymentStatus.PAID
                      && (
                        team_registration?.[0] === 'manager'
                        || (
                          team_registration?.[0] === 'player'
                          && selected_team?.captain === (
                            team_registration?.[1] as PlayerRegistrationDeref
                          )?.name_in_game
                          && player.name_in_game !== (
                            team_registration?.[1] as PlayerRegistrationDeref
                          )?.name_in_game
                        )
                      )
                  "
                  class="m-1 size-4 text-red-600 hover:cursor-pointer hover:text-blue-600"
                  icon="fa-solid fa-hammer"
                  @click="kickregtype = 'player'; kickregid = player.id; showModalKickPlayer = true"
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
              class="mx-2 overflow-hidden text-justify"
            >
              <div class="flex items-center">
                <div class="truncate">
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
              class="mx-2 overflow-hidden text-justify"
            >
              <div class="flex items-center">
                <div class="truncate">
                  {{ substitute.name_in_game }}
                </div>
                <img v-if="substitute.payment_status === PaymentStatus.PAID" src="/src/assets/images/check_with_bg.svg" alt="Logo validé" class="m-2 inline-block size-4"/>
                <fa-awesome-icon
                  v-if="
                    substitute.payment_status !== PaymentStatus.PAID
                      && (
                        team_registration?.[0] === 'manager'
                        || (
                          team_registration?.[0] === 'player'
                          && selected_team?.captain === (
                            team_registration?.[1] as PlayerRegistrationDeref
                          )?.name_in_game
                        )
                      )
                  "
                  class="m-1 size-4 text-red-600 hover:cursor-pointer hover:text-blue-600"
                  icon="fa-solid fa-hammer"
                  @click="kickregtype = 'substitute'; kickregid = substitute.id; showModalKickPlayer = true"
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
            class="center size-full rounded bg-red-600 p-2 font-bold transition duration-150 ease-in-out hover:ring hover:ring-pink-500 md:w-auto"
            @click="showModalTeamPassword = true"
            @keydown.enter="showModalTeamPassword = true"
          >
            Changer le mot de passe de l'équipe
          </button>
        </div>
        <div
          class="flex w-full flex-col items-center md:max-w-[33%]"
        >
          <div
            v-if="team_registration?.[0] === 'player' || team_registration?.[0] === 'substitute'"
            class="flex w-full max-w-full items-center justify-center rounded bg-blue-700 transition duration-150 ease-in-out hover:cursor-pointer hover:ring hover:ring-pink-500 md:w-auto"
            @click.prevent="showModalNameInGame = true"
            @keydown.prevent="showModalNameInGame = true"
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
              team_registration?.[1]?.payment_status !== PaymentStatus.PAID
            "
            type="button"
            class="center size-full rounded bg-red-600 p-2 font-bold transition duration-150 ease-in-out hover:ring hover:ring-pink-500 md:w-auto"
            @click="showModalLeaveTeam = true"
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

    <div
      class="mb-6 flex w-5/6 flex-col items-center justify-center overflow-hidden rounded-2xl bg-[#144B61] md:w-3/4"
    >
      <Seating
        :tournament="tournament as TournamentDeref"
        :team="selected_team"
      />
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

  <Modal v-if="showModalTeamName" @close="closeModalTeamName">
    <template #icon>
      <div/>
    </template>
    <template #title>
      <h3 id="modal-title" class="text-white-900 text-base font-semibold leading-6">
        Changer le nom de l'équipe
      </h3>
    </template>
    <template #body>
      <form id="patch-user" class="mt-2" @submit.prevent="ValidateModalTeamName">
        <FormField
          v-slot="context"
          :validations="v$_team_name.name"
          class="m-2 flex flex-col"
          label="Nouveau nom"
        >
          <input
            v-model="data_team_name.name"
            :class="{ error: context.invalid }"
            aria-label="Nouveau nom"
            class="border-2 bg-theme-bg"
            placeholder="Nouveau nom"
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
        @click="ValidateModalTeamName"
      >
        Valider
      </button>
      <button
        class="inline-flex w-full justify-center rounded-md bg-gray-500 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-300 sm:mt-0 sm:w-auto"
        type="button"
        @click="closeModalTeamName"
      >
        Annuler
      </button>
    </template>
  </Modal>

  <Modal v-if="showModalTeamPassword" @close="closeModalTeamPassword">
    <template #icon>
      <div/>
    </template>
    <template #title>
      <h3 id="modal-title" class="text-white-900 text-base font-semibold leading-6">
        Changer le mot de passe de l'équipe
      </h3>
    </template>
    <template #body>
      <form id="patch-user" class="mt-2" @submit.prevent="ValidateModalTeamPassword">
        <FormField
          v-slot="context"
          :validations="v$_team_password.password"
          class="m-2 flex flex-col"
          label="Nouveau mot de passe"
        >
          <input
            v-model="data_team_password.password"
            :class="{ error: context.invalid }"
            aria-label="Nouveau mot de passe"
            class="border-2 bg-theme-bg"
            placeholder="Nouveau mot de passe"
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
        @click="ValidateModalTeamPassword"
      >
        Valider
      </button>
      <button
        class="inline-flex w-full justify-center rounded-md bg-gray-500 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-300 sm:mt-0 sm:w-auto"
        type="button"
        @click="closeModalTeamPassword"
      >
        Annuler
      </button>
    </template>
  </Modal>

  <Modal v-if="showModalLeaveTeam" @close="showModalLeaveTeam = false">
    <template #icon>
      <div/>
    </template>
    <template #title>
      <h3 id="modal-title" class="text-white-900 text-base font-semibold leading-6">
        Quiter l'équipe
      </h3>
    </template>
    <template #body>
      <div>
        Êtes-vous sûr de vouloir quitter l'équipe ?
        <br/>
        Vous ne pourrez pas revenir dans l'équipe à moins d'être réinvité.
      </div>
    </template>
    <template #buttons>
      <button
        class="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto"
        type="submit"
        @click="leave_team(team_registration?.[0] || '', team_registration?.[1]?.id ?? 0); router.push('/me')"
      >
        Oui
      </button>
      <button
        class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:mt-0 sm:w-auto"
        type="button"
        @click="showModalLeaveTeam = false"
      >
        Non
      </button>
    </template>
  </Modal>

  <Modal v-if="showModalKickPlayer" @close="showModalKickPlayer = false">
    <template #icon>
      <div/>
    </template>
    <template #title>
      <h3 id="modal-title" class="text-white-900 text-base font-semibold leading-6">
        Kick un joueur
      </h3>
    </template>
    <template #body>
      <div>
        Êtes-vous sûr de vouloir kick "{{
          kickregtype === "player"
            ? (selected_team?.players as PlayerRegistration[]).find((player) => player.id === kickregid)?.name_in_game
            : (selected_team?.substitutes as PlayerRegistration[]).find((sub) => sub.id === kickregid)?.name_in_game
        }}" de l'équipe ?
      </div>
    </template>
    <template #buttons>
      <button
        class="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto"
        type="submit"
        @click="kick_member(kickregtype, kickregid)"
      >
        Oui
      </button>
      <button
        class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:mt-0 sm:w-auto"
        type="button"
        @click="showModalKickPlayer = false"
      >
        Non
      </button>
    </template>
  </Modal>
</template>

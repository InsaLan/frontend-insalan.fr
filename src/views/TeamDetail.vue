<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import FormField from '@/components/FormField.vue';
import Modal from '@/components/Modal.vue';
import PaymentStatusIcon from '@/components/PaymentStatusIcon.vue';
import Seating from '@/components/Tournament/SeatingPlan.vue';
import { PaymentStatus, type PlayerRegistration, type PlayerRegistrationDeref } from '@/models/registration';
import type { Team } from '@/models/team';
import type { EventTournamentDeref } from '@/models/tournament';
import { useTournamentStore } from '@/stores/tournament.store';
import { useUserStore } from '@/stores/user.store';
import { required } from '@/support/locales/errors.fr';

const props = defineProps<{
  isPrivate: boolean;
  id: number;
  teamId: number;
}>();

const tournamentStore = useTournamentStore();
const userStore = useUserStore();

const {
  getTournamentFull, getTournamentTeams, patch_registration, patch_team, leave_team, getPrivateTournament,
} = tournamentStore;
const { fetch_user_inscription_full } = userStore;
const { tournament, soloGame, privateTournamentsList } = storeToRefs(tournamentStore);
// const { fetch_user_inscription_full, patch_user, send_score } = userStore;
const { inscriptions } = storeToRefs(userStore);

const team_registration = computed(
  () => {
    const ongoing = inscriptions.value?.ongoing.find((inscription) => inscription[1].team.id === props.teamId);
    if (ongoing) {
      return ongoing;
    }
    const past = inscriptions.value?.past.find((inscription) => inscription[1].team.id === props.teamId);
    if (past) {
      return past;
    }
    const private_regs = inscriptions.value?.private_regs.find(
      (inscription) => inscription[1].team.id === props.teamId,
    );
    if (private_regs) {
      return private_regs;
    }
    return null;
  },
);

const router = useRouter();

const selected_team = computed(() => (
  tournament.value?.teams as Team[]
).find(
  (team: Team) => team.id === props.teamId,
) as Team);

try {
  if (props.isPrivate) {
    if (Object.keys(privateTournamentsList.value).length === 0) {
      await getPrivateTournament(props.id);
    }

    if (props.id in privateTournamentsList.value) {
      tournament.value = privateTournamentsList.value[props.id];
    }
  } else {
    await getTournamentFull(props.id);
    getTournamentTeams();

    await fetch_user_inscription_full();
  }

  // Check if the team exists in the tournament
  if (!(tournament.value?.teams as Team[]).some((team: Team) => team.id === props.teamId)) {
    router.go(-1);
  }

  // Check if the player exists in the team
  if (!team_registration.value) {
    router.go(-1);
  }
} catch (err: unknown) {
  router.go(-1);
}

// rename registration name in game
const showModalNameInGame = ref(false);

const data_name_in_game = ref({
  name_in_game: (team_registration.value?.[1] as unknown as PlayerRegistration)?.name_in_game ?? '',
});
const rules_name_in_game = computed(() => ({
  name_in_game: { required },
}));
const v$_name_in_game = useVuelidate(rules_name_in_game, data_name_in_game);

const closeModalNameInGame = () => {
  showModalNameInGame.value = false;
};

const ValidateModalNameInGame = async () => {
  const current_name = (team_registration.value?.[1] as unknown as PlayerRegistration)?.name_in_game;

  let data = {};
  const isValid = await v$_name_in_game.value.$validate();
  if (!isValid) return;
  data = {
    name_in_game: data_name_in_game.value.name_in_game,
  } as Record<string, string>;
  await patch_registration(
    team_registration.value?.[0] ?? '',
    team_registration.value?.[1].id ?? -1,
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
  <img
    :src="tournament?.logo"
    class="c-background-image"
    alt=""
  >
  <h1>
    {{ tournament?.name }}
  </h1>

  <div class="l-flex-column l-items-cross-center l-gap-2 u-mb-4 u-m-text">
    <div
      class="l-flex-column l-items-cross-center l-items-main-center c-card-bg-2 u-full-width"
    >
      <div
        class="l-flex-row u-full-width u-p-1"
      >
        <h2 class="l-flex-row l-items-cross-center">
          [{{ tournament?.game.short_name }}]
          {{ selected_team?.name }}
          <button
            v-if="
              !soloGame
                && (tournament && (!('event' in tournament) || (tournament as EventTournamentDeref)?.event.ongoing))
                && (
                  team_registration?.[0] === 'manager'
                  || (
                    team_registration?.[0] === 'player'
                    && selected_team?.captain === (team_registration?.[1] as PlayerRegistrationDeref)?.name_in_game
                  )
                )
            "
            type="button"
            title="Changer le nom de l'équipe"
            class="c-inline-icon c-image-btn"
            @click="showModalTeamName = true"
            @keydown.enter="showModalTeamName = true"
          >
            <fa-awesome-icon
              icon="fa-solid fa-pencil"
            />
          </button>
          <img v-if="selected_team.validated" src="/src/assets/images/check.svg" alt="Logo validé" class="c-inline-icon"/>
        </h2>
        <div class="l-grow"/>
        <button
          v-if="team_registration?.[0] === 'player' || team_registration?.[0] === 'substitute'"
          type="button"
          class="c-btn-bg-3 l-flex-row l-items-cross-center"
          @click="showModalNameInGame = true"
        >
          {{ (team_registration?.[1] as PlayerRegistrationDeref).name_in_game }}
          <fa-awesome-icon
            class="c-inline-icon u-mr-0"
            icon="fa-solid fa-pencil"
          />
        </button>
      </div>
      <div
        class="l-flex-column u-full-width"
      >
        <div
          class="l-flex-column u-full-width u-p-1"
        >
          <span class="u-big-text">Joueur·euse·s :</span>
          <div
            class="l-grid-3 u-p-1 l-gap-1"
          >
            <div
              v-for="player in selected_team?.players as PlayerRegistration[]"
              :key="player.id"
              class="c-card-bg-3 l-gap-0 u-full-width u-full-height l-flex-row l-items-cross-center"
            >
              {{ player.name_in_game }}
              <fa-awesome-icon
                v-if="selected_team.captain === player.name_in_game"
                class="c-inline-icon u-mr-0"
                icon="fa-solid fa-crown"
                title="Capitaine de l'équipe"
              />
              <PaymentStatusIcon :player="player as PlayerRegistration"/>
              <div class="l-grow"/>
              <button
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
                type="button"
                title="Expulser le·la joueur·euse"
                class="c-inline-icon c-image-btn u-mr-0"
                @click="kickregtype = 'player'; kickregid = player.id; showModalKickPlayer = true"
              >
                <fa-awesome-icon
                  icon="fa-solid fa-hammer"
                />
              </button>
            </div>
          </div>
        </div>
        <div
          v-if="!(props.id in privateTournamentsList) && selected_team?.managers.length !== 0"
          class="l-flex-column u-full-width u-p-1"
        >
          <span class="u-big-text">Managers :</span>
          <ul
            class="l-grid-3 u-p-1 l-gap-1"
          >
            <li
              v-for="manager in selected_team?.managers as String[]"
              :key="manager as string"
              class="c-card-bg-3 l-gap-0 u-full-width u-full-height l-flex-row l-items-cross-center"
            >
              {{ manager }}
            </li>
          </ul>
        </div>
        <div
          v-if="!(props.id in privateTournamentsList) && selected_team?.substitutes.length !== 0"
          class="l-flex-column u-full-width u-p-1"
        >
          <span class="u-big-text">Remplaçant·e·s :</span>
          <div
            class="l-grid-3 u-p-1 l-gap-1"
          >
            <div
              v-for="substitute in selected_team?.substitutes as PlayerRegistration[]"
              :key="substitute.id"
              class="c-card-bg-3 l-gap-0 u-full-width u-full-height l-flex-row l-items-cross-center"
            >
              {{ substitute.name_in_game }}
              <PaymentStatusIcon :player="substitute as PlayerRegistration"/>
              <button
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
                type="button"
                title="Expulser le·la joueur·euse"
                class="c-inline-icon c-image-btn u-mr-0"
                @click="kickregtype = 'substitue'; kickregid = substitute.id; showModalKickPlayer = true"
              >
                <fa-awesome-icon
                  icon="fa-solid fa-hammer"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="tournament && (!('event' in tournament) || (tournament as EventTournamentDeref)?.event.ongoing)"
        class="l-flex-row u-full-width l-items-main-end l-gap-2 u-p-1"
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
              && !(props.id in privateTournamentsList)
          "
          type="button"
          class="c-btn-bg-3"
          @click="showModalTeamPassword = true"
        >
          Changer le mot de passe de l'équipe
        </button>
        <button
          v-if="
            team_registration?.[1]?.payment_status !== PaymentStatus.PAID
          "
          type="button"
          class="c-btn-secondary"
          @click="showModalLeaveTeam = true"
        >
          Quitter l'équipe
        </button>
      </div>
      <div
        v-else
        class="u-mb-1 u-mx-1 u-full-width u-big-text u-text-center"
      >
        Le tournoi est terminé et l'équipe ne peut plus être modifiée.
      </div>
    </div>

    <div
      v-if="tournament && ('event' in tournament)"
      class="l-flex-column l-items-cross-center l-items-main-center c-card-bg-2 u-full-width"
    >
      <Seating
        :tournament="tournament as EventTournamentDeref"
        :team="selected_team"
      />
    </div>
  </div>

  <Modal v-if="showModalNameInGame" @close="closeModalNameInGame">
    <template #title>
      Changer votre nom en jeu
    </template>
    <template #body>
      <form id="patch-user" @submit.prevent="ValidateModalNameInGame">
        <FormField
          :validations="v$_name_in_game.name_in_game"
        >
          <label for="name_in_game">
            Nouveau Pseudo
          </label>
          <input
            id="name_in_game"
            v-model="data_name_in_game.name_in_game"
            aria-label="Nouveau Pseudo"
            placeholder="Nouveau Pseudo"
            required
            type="text"
          />
        </FormField>
        <button class="u-hidden" type="submit"/>
      </form>
    </template>
    <template #buttons>
      <button
        class="c-btn-bg-3"
        type="button"
        @click="closeModalNameInGame"
      >
        Annuler
      </button>
      <button
        class="c-btn-secondary"
        type="submit"
        @click="ValidateModalNameInGame"
      >
        Valider
      </button>
    </template>
  </Modal>

  <Modal v-if="showModalTeamName" @close="closeModalTeamName">
    <template #title>
      Changer le nom de l'équipe
    </template>
    <template #body>
      <form id="patch-user" @submit.prevent="ValidateModalTeamName">
        <FormField
          :validations="v$_team_name.name"
        >
          <label for="name">
            Nouveau nom
          </label>
          <input
            id="name"
            v-model="data_team_name.name"
            aria-label="Nouveau nom"
            placeholder="Nouveau nom"
            required
            type="text"
          />
        </FormField>
        <button class="u-hidden" type="submit"/>
      </form>
    </template>
    <template #buttons>
      <button
        class="c-btn-bg-3"
        type="button"
        @click="closeModalTeamName"
      >
        Annuler
      </button>
      <button
        class="c-btn-secondary"
        type="submit"
        @click="ValidateModalTeamName"
      >
        Valider
      </button>
    </template>
  </Modal>

  <Modal v-if="showModalTeamPassword" @close="closeModalTeamPassword">
    <template #title>
      Changer le mot de passe de l'équipe
    </template>
    <template #body>
      <form id="patch-user" @submit.prevent="ValidateModalTeamPassword">
        <FormField
          :validations="v$_team_password.password"
        >
          <label for="password">
            Nouveau mot de passe
          </label>
          <input
            v-model="data_team_password.password"
            aria-label="Nouveau mot de passe"
            placeholder="Nouveau mot de passe"
            required
            type="text"
          />
        </FormField>
        <button class="u-hidden" type="submit"/>
      </form>
    </template>
    <template #buttons>
      <button
        class="c-btn-bg-3"
        type="button"
        @click="closeModalTeamPassword"
      >
        Annuler
      </button>
      <button
        class="c-btn-secondary"
        type="submit"
        @click="ValidateModalTeamPassword"
      >
        Valider
      </button>
    </template>
  </Modal>

  <Modal v-if="showModalLeaveTeam" @close="showModalLeaveTeam = false">
    <template #title>
      Quitter l'équipe
    </template>
    <template #body>
      Êtes-vous sûr·e de vouloir quitter l'équipe ?
      <br/><br/>
      Vous ne pourrez pas revenir dans l'équipe à moins d'y être invité·e de nouveau.
    </template>
    <template #buttons>
      <button
        class="c-btn-bg-3"
        type="button"
        @click="showModalLeaveTeam = false"
      >
        Non
      </button>
      <button
        class="c-btn-secondary"
        type="submit"
        @click="leave_team(team_registration?.[0] || '', team_registration?.[1]?.id ?? 0); router.push('/me')"
      >
        Oui
      </button>
    </template>
  </Modal>

  <Modal v-if="showModalKickPlayer" @close="showModalKickPlayer = false">
    <template #title>
      Expulsion d'un joueur
    </template>
    <template #body>
      Êtes-vous sûr·e de vouloir expulser "{{
        kickregtype === "player"
          ? (selected_team?.players as PlayerRegistration[]).find((player) => player.id === kickregid)?.name_in_game
          : (selected_team?.substitutes as PlayerRegistration[]).find((sub) => sub.id === kickregid)?.name_in_game
      }}" de l'équipe ?
    </template>
    <template #buttons>
      <button
        class="c-btn-bg-3"
        type="button"
        @click="showModalKickPlayer = false"
      >
        Non
      </button>
      <button
        class="c-btn-secondary"
        type="submit"
        @click="kick_member(kickregtype, kickregid)"
      >
        Oui
      </button>
    </template>
  </Modal>
</template>

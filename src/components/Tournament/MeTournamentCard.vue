<script setup lang="ts">
import { storeToRefs } from 'pinia';
import type { PlayerRegistrationDeref, RegistrationDeref } from '@/models/registration';
import { useTournamentStore } from '@/stores/tournament.store';
import { useUserStore } from '@/stores/user.store';

const tournamentStore = useTournamentStore();

const userStore = useUserStore();

const { get_ticket_pdf } = tournamentStore;

const {
  user, inscriptions,
} = storeToRefs(userStore);

const props = defineProps<{
  inscription: [string, PlayerRegistrationDeref | RegistrationDeref];
  current?: boolean;
  private?: boolean;
}>();

const emit = defineEmits(['finishInscription']);
</script>

<template>
  <div class="c-card-bg-2 u-p-0 u-pb-2 l-flex-column l-main-center u-full-width u-full-height">
    <div class="l-grow">
      <img :src="inscription[1].team.tournament.logo" alt="image du tournoi" class="c-thumbnail"/>
    </div>
    <button
      v-if="current && inscription[1].ticket"
      type="button"
      class="c-text-btn-secondary u-m-0 u-mx-2 u-color-text-2"
      @click="inscription[1].ticket && get_ticket_pdf(inscription[1].ticket)"
    >
      Télecharger son billet
    </button>
    <router-link
      class="c-text-btn-secondary u-m-0 u-mx-2 u-color-text-2"
      :to="`/tournament/${private ? 'private/' : ''}${inscription[1].team.tournament.id}/rules`"
    >
      Règlement du tournoi
    </router-link>
    <strong class="u-big-text u-mx-2">
      <span v-if="!current && !private">{{ inscription[1].team.tournament.event.name }} - </span>
      {{ inscription[1].team.name }}
    </strong>
    <div class="l-flex-row l-grow l-main-center l-cross-center l-gap-2 u-mx-2">
      <router-link
        class="c-btn-primary"
        :to="`/tournament/${private ? 'private/' : ''}${inscription[1].team.tournament.id}/team/${inscription[1].team.id}`"
      >
        {{ (inscription[1].team.players[0] === user.id || inscription[0] === "manager") ? 'Gérer l\'équipe' : 'Voir l\'équipe' }}
      </router-link>
      <button
        v-if="(inscriptions.unpaid as Record<string, boolean>)[inscription[1].id] && props.current"
        type="button"
        class="c-btn-secondary"
        @click.prevent="() => emit('finishInscription')"
      >
        Terminer l'inscription
      </button>
    </div>
  </div>
</template>

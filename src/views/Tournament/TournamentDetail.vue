<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import type { EventTournamentDeref } from '@/models/tournament';
import { useTournamentStore } from '@/stores/tournament.store';
import { useUserStore } from '@/stores/user.store';

const { id, isPrivate } = defineProps<{
  id: number;
  isPrivate?: boolean;
}>();

const tournamentStore = useTournamentStore();
const { getTournamentFull, getTournamentTeams, getPrivateTournament } = tournamentStore;
const { tournament, eventsList } = storeToRefs(tournamentStore);

const open_dropdown = ref(false);

interface TournamentDetailSection {
  title: string;
  is_available: boolean;
}

const userStore = useUserStore();
const { isConnected, user } = storeToRefs(userStore);
const { t } = useI18n();

const sections = computed<Record<string, TournamentDetailSection>>(() => ({
  info: { title: t('views.tournamentDetail.informations'), is_available: true },
  teams: { title: t('views.tournamentDetail.teams'), is_available: true },
  seatings: { title: t('views.tournamentDetail.seatings'), is_available: 'seatslots' in (tournament.value as EventTournamentDeref) },
  stages: { title: t('views.tournamentDetail.stages'), is_available: true },
  planning: { title: t('views.tournamentDetail.planning'), is_available: 'planning_file' in (tournament.value as EventTournamentDeref) },
  rules: { title: t('views.tournamentDetail.rules'), is_available: true },
}));

const router = useRouter();
const route = useRoute();

const admin_mode = computed(() => route.path.includes('admin'));

const selected_section = computed<string>(() => {
  let sec = 'info';
  Object.keys(sections.value).forEach((e) => {
    if (route.path.includes(e)) {
      sec = e;
    }
  });

  return sec;
});

try {
  if (isPrivate) {
    await getPrivateTournament(id);
  } else {
    await getTournamentFull(id);
  }
  getTournamentTeams();
  await tournamentStore.getOngoingEvents();
} catch (err: unknown) {
  router.back();
}

const admin_switch = computed(() => {
  if (admin_mode.value) {
    return (route.name as string).replace('admin_', '').split('-').at(0);
  }

  return (route.name as string).replace('tournament_', 'tournament_admin_').split('-').at(0);
});

const event_ongoing = computed(() => {
  if (isPrivate) {
    return true;
  }

  if (tournament.value === undefined) {
    return false;
  }

  if ('event' in tournament.value) {
    let event_id;
    if (typeof tournament.value.event === 'number') {
      event_id = tournament.value.event;
    } else {
      event_id = tournament.value.event.id;
    }

    const event = eventsList.value[event_id];

    return event === undefined ? false : event.ongoing;
  }

  return false;
});
</script>

<template>
  <div
    v-if="tournament && (!('is_announced' in tournament) || tournament?.is_announced)"
    class="l-flex-column u-full-height"
  >
    <div class="l-flex-row l-main-center l-cross-center l-gap-4 u-m-main">
      <h1 class="u-my-1">
        {{ tournament?.name }}
      </h1>
      <router-link
        v-if="event_ongoing && (isPrivate || ('registration_close' in tournament && Date.parse(tournament.registration_close) > Date.now()))"
        :to="isPrivate ? `/tournament/private/${id}/register` : `/tournament/${id}/register`"
        class="c-btn-secondary"
      >
        {{ $t('views.tournamentDetail.register') }}
      </router-link>
    </div>

    <div class="top-bar u-m-main u-my-2">
      <nav class="l-flex-row l-main-center l-gap-4 c-card-bg-2 u-full-width">
        <button
          type="button"
          class="c-text-btn-secondary popup-btn"
          @click="open_dropdown = !open_dropdown"
        >
          {{ sections[selected_section].title }}
          <fa-awesome-icon
            class="c-inline-icon u-color-text-2"
            icon="fa-chevron-up"
            :class="{ 'rotate-180': open_dropdown }"
          />
        </button>
        <div
          class="navigation"
        >
          <template v-for="(section, key) in sections" :key="key">
            <router-link
              v-if="section.is_available || (admin_mode && !['seatings', 'planning'].includes(key))"
              :to="{ name: `tournament_${admin_mode ? 'admin_' : ''}${key}` }"
              :class="{ 'u-underline': key === selected_section }"
              class="c-text-btn-secondary"
              @click="open_dropdown = false"
            >
              {{ section.title }}
            </router-link>
          </template>
        </div>
        <div
          :class="[open_dropdown ? 'c-card-bg-2 navigation-popup l-flex-column' : 'u-hidden']"
        >
          <template v-for="(section, key) in sections" :key="key">
            <router-link
              v-if="section.is_available || (admin_mode && !['seatings', 'planning'].includes(key))"
              :to="{ name: `tournament_${admin_mode ? 'admin_' : ''}${key}` }"
              :class="{ 'u-underline': key === selected_section }"
              class="c-text-btn-secondary u-text-center"
              @click="open_dropdown = false"
            >
              {{ section.title }}
            </router-link>
          </template>
        </div>
        <router-link
          v-if="isConnected && (user.groups.includes('Equipe Tournois') || user.groups.includes('Equipe Anim'))"
          :to="{ name: admin_switch }"
          type="button"
          class="c-btn-bg-3"
        >
          {{ admin_mode ? $t('views.tournamentDetail.normalMode') : $t('views.tournamentDetail.adminMode') }}
        </router-link>
      </nav>
    </div>
    <RouterView v-slot="{ Component }">
      <component
        :is="Component"
        :tournament="tournament"
      />
    </RouterView>
  </div>
  <div v-else class="u-text-center u-big-text">
    {{ $t('views.tournamentDetail.notAnnounced') }}
  </div>
</template>

<style scoped>
.top-bar {
  position: sticky;
  top: calc(var(--top-offset, 8rem) - var(--base-margin));
  z-index: 40;
}

@media (min-width: 70rem) {
  .navigation {
    z-index: 10;
    display: flex;
    flex-direction: row;
  }

  .navigation-popup, .popup-btn {
    display: none;
  }
}

@media (max-width: 70rem) {
  .navigation {
    display: none;
  }

  .popup-btn {
    transition: 150ms ease-in-out;
  }

  .navigation-popup {
    position: absolute;
    top: 100%;
    width: 100%;
    margin-top: var(--base-margin);
    z-index: 10;
    display: flex;
    flex-direction: column;
  }
}

.rotate-180 {
  transform: rotate(180deg);
}
</style>

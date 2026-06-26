<script setup lang="ts">
import {
  computed, ref,
} from 'vue';
import Modal from '@/components/Modal.vue';
import type { Team, TeamDeref } from '@/models/team';
import type { EventTournamentDeref } from '@/models/tournament';
import { useTournamentStore } from '@/stores/tournament.store';

const tournamentStore = useTournamentStore();

const {
  patch_team,
} = tournamentStore;

const showModal = ref(false);
const selectedTeamSlot = ref<number | null>(null);

const props = defineProps<{
  tournament: EventTournamentDeref;
  team: Team | null;
}>();

const hoveredTeamSlot = ref<number | null>(null);
const hoveredTeamSlotName = ref<string | null>(null);

const minX = computed(() => {
  const seats = props.tournament?.event.seats;
  if (seats.length === 0) return 0;
  return Math.min(...seats.map((s) => s[0]));
});
const minY = computed(() => {
  const seats = props.tournament?.event.seats;
  if (seats.length === 0) return 0;
  return Math.min(...seats.map((s) => s[1]));
});
const maxX = computed(() => {
  const seats = props.tournament?.event.seats;
  if (seats.length === 0) return 0;
  return Math.max(...seats.map((s) => s[0]));
});
const maxY = computed(() => {
  const seats = props.tournament?.event.seats;
  if (seats.length === 0) return 0;
  return Math.max(...seats.map((s) => s[1]));
});

const getCoordinates = (index: number) => {
  const x = (index % (maxX.value - minX.value + 1)) + 2;
  const y = Math.floor(index / (maxX.value - minX.value + 1)) + minY.value;
  return [x, y] as [number, number];
};

const isEventSeat = (index: number) => {
  const [x, y] = getCoordinates(index);
  return props.tournament.event.seats.some(([sx, sy]) => sx === x && sy === y);
};

const isTournamentSeat = (index: number) => {
  const [x, y] = getCoordinates(index);
  return props.tournament.seatslots.some((slot) => slot.seats.some((seat) => seat.x === x && seat.y === y));
};

const isFocused = (index: number) => {
  const [x, y] = getCoordinates(index);
  // find the seatslot containing the hovered seat
  const slot = props.tournament.seatslots.find(
    (seatslot) => seatslot.seats.some((seat) => seat.x === x && seat.y === y),
  );

  return slot ? slot.id === hoveredTeamSlot.value : false;
};

const isTeamSeat = (index: number) => {
  const [x, y] = getCoordinates(index);
  // find the seatslot containing the hovered seat
  const slot = props.tournament.seatslots.find(
    (seatslot) => seatslot.seats.some((seat) => seat.x === x && seat.y === y),
  );
  if (!slot) return false;
  // find the team occupying the hovered seat
  const team = props.tournament.teams.find((t) => (t as unknown as TeamDeref).seat_slot === slot?.id);
  return team ? (team as unknown as TeamDeref).id === props.team?.id : false;
};

const isPicked = (index: number) => {
  const [x, y] = getCoordinates(index);
  // find the seatslot containing the hovered seat
  const slot = props.tournament.seatslots.find(
    (seatslot) => seatslot.seats.some((seat) => seat.x === x && seat.y === y),
  );
  if (!slot) return false;
  // find the team occupying the hovered seat
  const team = props.tournament.teams.find((t) => (t as unknown as TeamDeref).seat_slot === slot?.id);
  return !!team;
};

const handleHover = (index: number, e: Event) => {
  // get the coordinates of the hovered seat
  const [x, y] = getCoordinates(index);
  // find the seatslot containing the hovered seat
  const slot = props.tournament.seatslots.find(
    (seatslot) => seatslot.seats.some((seat) => seat.x === x && seat.y === y),
  );

  if (slot) {
    hoveredTeamSlot.value = slot.id;
    const team = props.tournament.teams.find((t) => (t as unknown as TeamDeref).seat_slot === slot.id);
    hoveredTeamSlotName.value = team ? (team as unknown as TeamDeref).name : null;

    // display the tooltip
    const tooltip = document.getElementById('tooltip');
    if (tooltip) {
      tooltip.style.left = `${(e as MouseEvent).clientX - 50}px`;
      tooltip.style.top = `${(e as MouseEvent).clientY + 10}px`;
      tooltip.classList.remove('u-hidden');
    }
  } else if (!slot) {
    hoveredTeamSlot.value = null;
    hoveredTeamSlotName.value = null;

    // hide the tooltip
    const tooltip = document.getElementById('tooltip');
    if (tooltip) {
      tooltip.classList.add('u-hidden');
    }
  }
};

const handleClick = (index: number) => {
  const [x, y] = getCoordinates(index);

  if (!isTournamentSeat(index)) return;

  // find the seatslot containing the hovered seat
  const slot = props.tournament.seatslots.find(
    (seatslot) => seatslot.seats.some((seat) => seat.x === x && seat.y === y),
  );
  if (slot) {
    // find the team occupying the hovered seat
    const team = props.tournament.teams.find((t) => (t as unknown as TeamDeref).seat_slot === slot.id);
    if (!team) {
      selectedTeamSlot.value = slot.id;
      showModal.value = true;
    }
  }
};

const validateModal = async () => {
  showModal.value = false;
  await patch_team(
    (props.team as Team)?.id,
    {
      seat_slot: selectedTeamSlot.value,
    },
  );
};

const closeModal = () => {
  showModal.value = false;
  selectedTeamSlot.value = null;
};

</script>

<template>
  <section id="seating" class="u-full-width">
    <div v-if="tournament?.event.seats.length !== 0" class="l-flex-column l-cross-center l-gap-2">
      <h2 class="u-text-center">
        Placement des équipes ({{ tournament.event.name }})
      </h2>
      <div
        class="u-full-width overflow-x-auto"
      >
        <div
          id="tooltip"
          class="tooltip u-hidden c-card-bg-3"
        >
          <div v-if="hoveredTeamSlotName" class="truncate">
            Équipe : <strong>
              {{ hoveredTeamSlotName }}
            </strong>
          </div>
          <template v-else>
            Places libres
          </template>
        </div>
        <div
          class="l-grid-arbitrary l-overflow-hidden u-mx-2"
          TournamentDeref
          :style="{
            gridTemplateColumns: `repeat(${maxX - minX + 1}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${maxY - minY + 1}, minmax(0, 1fr))`,
          }"
          @mouseleave="handleHover(-1, $event)"
          @focusout="handleHover(-1, $event)"
        >
          <div
            v-for="(_, index) in (maxY - minY + 1) * (maxX - minX + 1)"
            :key="index"
            @click="team ? handleClick(index) : handleHover(index, $event)"
            @keydown.enter="team ? handleClick(index) : handleHover(index, $event)"
            @mouseover="handleHover(index, $event)"
            @focusin="handleHover(index, $event)"
          >
            <div
              v-if="isEventSeat(index)"
              :aria-label="`Seat ${getCoordinates(index)[0]},${getCoordinates(index)[1]}`"
              :class="{
                'team-square': isTournamentSeat(index) && isTeamSeat(index),
                'taken-square': isTournamentSeat(index) && isPicked(index) && !isTeamSeat(index),
                'free-square': isTournamentSeat(index) && !isPicked(index) && !isTeamSeat(index),
                'unused-square': !isTournamentSeat(index),
                darken: isTournamentSeat(index) && isFocused(index),
              }"
            />
          </div>
        </div>
      </div>
      <div class="u-m-2 l-flex-column l-cross-center">
        <div
          class="l-cross-center l-gap-2 u-text-left"
          :class="{
            'l-grid-4': team,
            'l-grid-3': !team,
          }"
        >
          <div class="l-flex-row l-cross-center l-gap-1">
            <div class="smol unused-square"/>
            <span>Places utilisées pour les autres tournois</span>
          </div>
          <div class="l-flex-row l-cross-center l-gap-1">
            <div class="smol free-square"/>
            <span>Places libres du tournoi : {{ tournament.name }}</span>
          </div>
          <div v-if="team" class="l-flex-row l-cross-center l-gap-1">
            <div class="smol team-square"/>
            <span>Place actuelle de l'équipe</span>
          </div>
          <div class="l-flex-row l-cross-center l-gap-1">
            <div class="smol taken-square"/>
            <span>Places occupées du tournoi : {{ tournament.name }}</span>
          </div>
        </div>
      </div>
      <p
        v-if="!team"
      >
        Pour modifier votre placement, rendez-vous sur la page de votre équipe, accessible depuis
        <router-link
          to="/me"
          class="c-link"
        >
          Mon compte
        </router-link>
      </p>
    </div>
    <div v-else class="u-text-center u-my-4 u-big-text">
      Le plan de la salle n'est pas encore disponible, revenez plus tard !
    </div>
  </section>

  <Modal
    v-if="showModal"
  >
    <template #title>
      Sélection des places
    </template>
    <template #body>
      Êtes vous sûr·e de vouloir sélectionner ces places ?
      <br/><br/>
      Vous pourrez les modifier jusqu'à la fin des inscriptions.
    </template>
    <template #buttons>
      <button
        class="c-btn-bg-3"
        type="button"
        @click="closeModal"
      >
        Annuler
      </button>
      <button
        class="c-btn-secondary"
        type="submit"
        @click="validateModal"
      >
        Valider
      </button>
    </template>
  </Modal>
</template>

<style scoped>
.unused-square, .free-square, .taken-square, .team-square {
  aspect-ratio: 1;
  border-radius: 30%;
}

.unused-square {
  background-color: var(--color-bg-3);
}

.free-square {
  background-color: var(--color-text-2);
}

.taken-square {
  background-color: var(--color-secondary-1);
}

.team-square {
  background-color: var(--color-primary-1);
}

.smol {
  width: 2rem;
  height: 2rem;
}

.darken {
  filter: brightness(.7);
}

.tooltip {
  position: fixed;
  z-index: 1;
}
</style>

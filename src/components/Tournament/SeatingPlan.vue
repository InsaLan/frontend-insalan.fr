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

// compute the seating plan to get max X and Y
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
  const x = (index % (maxX.value + 1)) + 1;
  const y = Math.floor(index / (maxX.value + 1)) + 1;
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
  if (props.team && slot && slot.id === props.team?.seat_slot) return true;

  return slot ? slot.id === hoveredTeamSlot.value : false;
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
      tooltip.classList.remove('hidden');
    }
  } else if (!slot) {
    hoveredTeamSlot.value = null;
    hoveredTeamSlotName.value = null;

    // hide the tooltip
    const tooltip = document.getElementById('tooltip');
    if (tooltip) {
      tooltip.classList.add('hidden');
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
  <section id="seating" class="w-full">
    <div v-if="tournament?.event.seats.length !== 0" class="flex flex-col items-center justify-center">
      <div
        class="m-2 flex w-full flex-col items-center"
      >
        <h2 class="text-center text-2xl font-bold">
          Placement des équipes pour : {{ tournament.event.name }}
        </h2>
        <div
          class="w-full overflow-x-auto"
          :style="{
            maxWidth: `${(maxX + 1) * 32}px`,
          }"
        >
          <div
            id="tooltip"
            class="z-1 fixed hidden max-w-60 items-center justify-center overflow-hidden rounded-lg border border-black bg-gray-600 p-2 text-white"
          >
            <div v-if="hoveredTeamSlotName" class="truncate">
              Équipe : <strong class="text-blue-500">
                {{ hoveredTeamSlotName }}
              </strong>
            </div>
            <template v-else>
              Places libres
            </template>
          </div>
          <div
            class="grid overflow-hidden"
            TournamentDeref
            :style="{
              gridTemplateColumns: `repeat(${maxX + 1}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${maxY + 1}, minmax(0, 1fr))`,
              width: `${(maxX + 1) * 32}px`,
            }"
            @mouseleave="handleHover(-1, $event)"
            @focusout="handleHover(-1, $event)"
          >
            <div
              v-for="(_, index) in (maxY + 1) * (maxX + 1)"
              :key="index"
              :class="[
                'flex size-8 items-center justify-center text-xs',
              ]"
              @click="team ? handleClick(index) : handleHover(index, $event)"
              @keydown.enter="team ? handleClick(index) : handleHover(index, $event)"
              @mouseover="handleHover(index, $event)"
              @focusin="handleHover(index, $event)"
            >
              <template v-if="isEventSeat(index)">
                <template v-if="isTournamentSeat(index)">
                  <template v-if="isFocused(index)">
                    <img
                      src="@/assets/images/seat-selected.png"
                      :alt="`Seat ${getCoordinates(index)[0]},${getCoordinates(index)[1]}`"
                      class="size-8"
                    />
                  </template>
                  <template v-else>
                    <template v-if="isPicked(index)">
                      <img
                        src="@/assets/images/seat-taken.png"
                        :alt="`Seat ${getCoordinates(index)[0]},${getCoordinates(index)[1]}`"
                        class="size-8"
                      />
                    </template>
                    <template v-else>
                      <img
                        src="@/assets/images/seat-empty.png"
                        :alt="`Seat ${getCoordinates(index)[0]},${getCoordinates(index)[1]}`"
                        class="size-8"
                      />
                    </template>
                  </template>
                </template>
                <template v-else>
                  <img
                    src="@/assets/images/seat-event.png"
                    :alt="`Seat ${getCoordinates(index)[0]},${getCoordinates(index)[1]}`"
                    class="size-8"
                  />
                </template>
              </template>
              <template v-else>
                <div class="size-full"/>
              </template>
            </div>
          </div>
        </div>
        <div class="m-4 flex flex-col items-center text-sm">
          <div
            class="grid grid-cols-1 items-center gap-4"
            :class="{
              'sm:grid-cols-4': team,
              'sm:grid-cols-3': !team,
            }"
          >
            <div class="flex items-center gap-2">
              <img
                alt="Event Seat"
                src="@/assets/images/seat-empty.png"
                class="size-8 object-cover"
              />
              <span>Places libres du tournoi : {{ tournament.name }}</span>
            </div>
            <div v-if="team" class="flex items-center gap-2">
              <img
                alt="Event Seat"
                src="@/assets/images/seat-selected.png"
                class="size-8 object-cover"
              />
              <span>Place actuelle de l'équipe</span>
            </div>
            <div class="flex items-center gap-2">
              <img
                alt="Event Seat"
                src="@/assets/images/seat-taken.png"
                class="size-8 object-cover"
              />
              <span>Places occupées du tournoi : {{ tournament.name }}</span>
            </div>
            <div class="flex items-center gap-2">
              <img
                alt="Event Seat"
                src="@/assets/images/seat-event.png"
                class="size-8 object-cover"
              />
              <span>Places utilisées pour les autres tournois</span>
            </div>
          </div>
          <p
            v-if="!team"
            class="mt-2"
          >
            Pour modifier votre placement, rendez-vous sur la page de votre équipe, accessible depuis
            <router-link
              to="/me"
              class="text-blue-500 underline"
            >
              la page "Mon compte"
            </router-link>
          </p>
        </div>
      </div>
    </div>
    <div v-else class="flex justify-center">
      Le plan de la salle n'est pas encore disponible, revenez plus tard !
    </div>
  </section>

  <Modal
    v-if="showModal"
  >
    <template #title>
      <h3 id="modal-title" class="text-white-900 text-base font-semibold leading-6">
        Sélection des places
      </h3>
    </template>
    <template #body>
      <p class="mt-2">
        Êtes vous sûr de vouloir sélectionner ces places ?
        <br/>
        Vous pourrez les modifier jusqu'à la fin des inscription
      </p>
    </template>
    <template #buttons>
      <button
        class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
        type="submit"
        @click="validateModal"
      >
        Valider
      </button>
      <button
        class="inline-flex w-full justify-center rounded-md bg-gray-500 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-300 sm:mt-0 sm:w-auto"
        type="button"
        @click="closeModal"
      >
        Annuler
      </button>
    </template>
  </Modal>
</template>

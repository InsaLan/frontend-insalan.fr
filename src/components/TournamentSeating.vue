<script setup lang="ts">
import {
  computed, ref,
} from 'vue';
import type { TeamDeref } from '@/models/team';
import type { TournamentDeref } from '@/models/tournament';

const props = defineProps<{
  tournament: TournamentDeref;
}>();

const hoveredTeamSlot = ref<number | null>(null);
const hoveredTeamSlotName = ref<string | null>(null);

// compute the seating plan to get max X and Y
const maxX = computed(() => {
  const seats = props.tournament?.event.seats;
  if (!seats) return 0;
  return Math.max(...seats.map((s) => s[0]));
});
const maxY = computed(() => {
  const seats = props.tournament?.event.seats;
  if (!seats) return 0;
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
  const team = props.tournament.teams.find((t) => (t as unknown as TeamDeref).teamslot === slot?.id);
  return !!team;
};

const handleHover = (index: number) => {
  // get the coordinates of the hovered seat
  const [x, y] = getCoordinates(index);
  // find the seatslot containing the hovered seat
  const slot = props.tournament.seatslots.find(
    (seatslot) => seatslot.seats.some((seat) => seat.x === x && seat.y === y),
  );

  if (slot && slot.id !== hoveredTeamSlot.value) {
    hoveredTeamSlot.value = slot.id;
    const team = props.tournament.teams.find((t) => (t as unknown as TeamDeref).teamslot === slot.id);
    hoveredTeamSlotName.value = team ? (team as unknown as TeamDeref).name : null;

    // display the tooltip
    const tooltip = document.getElementById('tooltip');
    if (tooltip) {
      tooltip.style.left = `${(x - 2) * 32}px`;
      tooltip.style.top = `${(y) * 32}px`;
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

</script>

<template>
  <section id="seating">
    <div v-if="tournament?.event.seats" class="flex flex-col items-center justify-center">
      <div
        class="m-2 w-screen overflow-x-auto"
        :style="{
          maxWidth: `${(maxX + 1) * 32}px`,
        }"
      >
        <div
          class="p-4"
          :style="{
            width: `${(maxX + 1) * 32}px`,
          }"
        >
          <h2 class="mb-4 text-2xl font-bold">
            Placement des équipes pour : {{ tournament.event.name }}
          </h2>
          <div
            class="relative grid"
            :style="{
              gridTemplateColumns: `repeat(${maxX + 1}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${maxY + 1}, minmax(0, 1fr))`,
            }"
            @mouseleave="handleHover(-1)"
            @focusout="handleHover(-1)"
          >
            <div
              id="tooltip"
              class="absolute hidden max-w-60 items-center justify-center overflow-hidden rounded-lg border border-black bg-gray-600 p-2 text-white"
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
              v-for="(_, index) in (maxY + 1) * (maxX + 1)"
              :key="index"
              :class="[
                'flex size-8 items-center justify-center text-xs',
              ]"
              @click="handleHover(index)"
              @keydown.enter="handleHover(index)"
              @mouseover="handleHover(index)"
              @focusin="handleHover(index)"
            >
              <template v-if="isEventSeat(index)">
                <img
                  src="@/assets/images/seat.png"
                  :alt="`Seat ${getCoordinates(index)[0]},${getCoordinates(index)[1]}`"
                  class="z-[-1] size-8 cursor-pointer object-cover"
                  :class="
                    isTournamentSeat(index)
                      ? isFocused(index) ? 'hue-rotate-90' : isPicked(index) ? 'hue-rotate-180' : ''
                      : 'grayscale'
                  "
                />
              </template>
              <template v-else>
                <div class="z-[-1] size-full bg-gray-200"/>
              </template>
            </div>
          </div>
          <div class="mt-4 text-sm">
            <div class="flex items-center space-x-4">
              <div class="flex items-center gap-2">
                <img
                  alt="Event Seat"
                  src="@/assets/images/seat.png"
                  class="size-8 object-cover"
                />
                <span>Places libres du tournois {{ tournament.name }}</span>
              </div>
              <div class="flex items-center gap-2">
                <img
                  alt="Event Seat"
                  src="@/assets/images/seat.png"
                  class="size-8 object-cover hue-rotate-180"
                />
                <span>Places occupées du tournois {{ tournament.name }}</span>
              </div>
              <div class="flex items-center gap-2">
                <img
                  alt="Event Seat"
                  src="@/assets/images/seat.png"
                  class="size-8 object-cover grayscale"
                />
                <span>Places des autres Tournois</span>
              </div>
            </div>
            <p class="mt-2">
              Pour modifier votre placement, vous devez vous rendre sur la page de votre équipe, accessible depuis
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
    </div>
    <div v-else class="flex justify-center">
      Le plan de la salle n'est pas encore disponible, revenez plus tard !
    </div>
  </section>
</template>

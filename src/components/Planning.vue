<script setup lang="ts">
import axios from 'axios';
import {
  addDays, endOfDay, format, isWithinInterval, max, min, setHours, startOfDay, subDays,
} from 'date-fns';
import ICAL from 'ical.js';
import {
  computed, onMounted, ref, watch,
} from 'vue';
import { frenchDayFormatFromDate } from '@/utils';

interface Event {
  id: string;
  summary: string;
  start: Date;
  end: Date;
  description?: string;
}

const props = defineProps<{
  link: string;
}>();

const events = ref<Event[]>([]);
const currentDate = ref(new Date());
const focusedEvent = ref<string | null>(null);

const getTotalInterval = computed(() => {
  if (events.value.length === 0) {
    return 0;
  }
  const start = startOfDay(events.value[0].start);
  const end = endOfDay(events.value[events.value.length - 1].end);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
});

const nbDays = computed(() => {
  const maxDays = window.innerWidth < 640 ? 3 : 7;
  return Math.min(maxDays, getTotalInterval.value);
});

const colors = [
  'bg-blue-700',
  'bg-green-700',
  'bg-red-700',
  'bg-purple-700',
  'bg-pink-700',
  'bg-indigo-700',
  'bg-gray-700',
  'bg-emerald-700',
  'bg-fuchsia-700',
];

const fetchEvents = async () => {
  if (!props.link) {
    return;
  }

  const response = await axios.get(props.link);
  const { data } = response as { data: string };
  const jcalData = ICAL.parse(data) as unknown[];
  const comp = new ICAL.Component(jcalData);
  const vevents = comp.getAllSubcomponents('vevent');

  events.value = vevents.map((vevent) => {
    const event = new ICAL.Event(vevent);
    return {
      id: event.uid,
      summary: event.summary,
      start: event.startDate.toJSDate(),
      end: event.endDate.toJSDate(),
      description: event.description,
    };
  }).sort((a, b) => a.start.getTime() - b.start.getTime());

  // Set currentDate to the next event from now
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const nextEvent = events.value.find((event) => event.start > now);
  if (nextEvent) {
    currentDate.value = nextEvent.start;
  } else {
    currentDate.value = events.value[0].start;
  }
};

const visibleDays = computed<Date[]>(() => {
  const days: Date[] = [];
  for (let i = 0; i < nbDays.value; i += 1) {
    days.push(addDays(currentDate.value, i));
  }
  return days;
});

const canGoBack = computed(() => {
  const firstEventDate = events.value[0]?.start;
  return firstEventDate && subDays(currentDate.value, nbDays.value) >= startOfDay(firstEventDate);
});

const canGoForward = computed(() => {
  const lastEventDate = events.value[events.value.length - 1]?.end;
  return lastEventDate && addDays(currentDate.value, nbDays.value) <= endOfDay(lastEventDate);
});

const goBack = () => {
  currentDate.value = subDays(currentDate.value, nbDays.value);
};

const goForward = () => {
  currentDate.value = addDays(currentDate.value, nbDays.value);
};

const getEventsForDay = (day: Date) => events.value.filter(
  (event) => isWithinInterval(event.start, { start: startOfDay(day), end: endOfDay(day) })
    || isWithinInterval(event.end, { start: startOfDay(day), end: endOfDay(day) }),
);

const START_HOURE = 8; // Start displaying events at 8 am;

const getEventStyle = (event: Event, day: Date) => {
  const offset = 0.08;

  const dayStart = setHours(startOfDay(day), START_HOURE);
  const dayEnd = endOfDay(day);
  const eventStart = max([event.start, dayStart]);
  const eventEnd = min([event.end, dayEnd]);

  const totalMinutes = (24 - START_HOURE) * 60;
  const startMinutes = (eventStart.getHours() * 60 + eventStart.getMinutes()) - (60 * START_HOURE);
  const durationMinutes = (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60);

  // if there are multiple events at the same time, we need to adjust the width
  let width = 100;
  let left = 0;
  if (focusedEvent.value !== event.id) {
    const sameStartEvents = getEventsForDay(day).filter(
      (e) => e.start.getTime() === event.start.getTime(),
    );
    width = 100 / sameStartEvents.length;
    left = sameStartEvents.indexOf(event) * width;
  }

  return {
    top: `${(startMinutes / totalMinutes) * 100 + offset}%`,
    height: `${(durationMinutes / totalMinutes) * 100 - 2 * offset}%`,
    left: `${left}%`,
    width: `${width}%`,
  };
};

const timeSlots = computed(() => Array.from({ length: 24 - START_HOURE }, (_, i) => i + START_HOURE));

onMounted(fetchEvents);
watch(() => props.link, fetchEvents);
</script>

<template>
  <div class="event-schedule font-sans">
    <div v-if="events.length === 0" class="p-5 u-text-center">
      Le planning n'est pas encore disponible, revenez plus tard !
    </div>
    <div v-else class="calendar">
      <div
        v-if="canGoBack || canGoForward"
        class="mb-5 flex justify-between"
      >
        <button
          :disabled="!canGoBack"
          class="rounded bg-blue-500 u-px-2 u-py-1 text-black disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
          type="button"
          @click="goBack"
        >
          &lt; Jours précédents
        </button>
        <button
          :disabled="!canGoForward"
          class="rounded bg-blue-500 u-px-2 u-py-1 text-black disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
          type="button"
          @click="goForward"
        >
          Jours suivants &gt;
        </button>
      </div>
      <div>
        <div
          :class="`grid l-gap-2 grid-cols-${nbDays * 2 + 2}`"
        >
          <div class="flex u-full-width flex-col-reverse u-py-1">
            <div v-for="hour in timeSlots.slice().reverse()" :key="hour" class="flex h-[60px] items-start justify-end text-xs text-gray-500">
              <span class="u-mr-1">{{ hour.toString().padStart(2, '0') }}:00</span>
            </div>
          </div>
          <div v-for="day in visibleDays" :key="day.toISOString()" class="col-span-2 overflow-hidden rounded border border-gray-200">
            <h2 class="bg-gray-100 p-3 u-text-center text-sm u-bold text-black">
              {{ frenchDayFormatFromDate(day) }}
            </h2>
            <div class="l-relative-position border-t border-gray-200" :style="{ height: `${60 * (24 - START_HOURE)}px` }">
              <div
                v-for="hour in timeSlots"
                :key="hour"
                class="l-absolute-position inset-x-0 border-t border-gray-500"
                :style="{ top: `${((hour - START_HOURE) / (24 - START_HOURE)) * 100 - 0.04}%` }"
              />
              <button
                v-for="event in getEventsForDay(day)"
                :key="event.start.toISOString()"
                :class="[
                  'absolute l-flex-column cursor-pointer overflow-hidden rounded border border-black p-1 u-text-center text-xs text-white shadow-lg transition-transform duration-200 hover:z-10 hover:shadow-xl hover:ring hover:ring-blue-500 focus:z-10 focus:ring focus:ring-blue-500',
                  colors[
                    event.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
                    % colors.length
                  ],
                ]"
                :style="getEventStyle(event, day)"
                type="button"
                @focus="focusedEvent = event.id"
                @blur="focusedEvent = null"
                @mouseenter="focusedEvent = event.id"
                @mouseleave="focusedEvent = null"
              >
                <div class="u-bold">
                  {{ format(event.start, 'HH:mm') }} - {{ format(event.end, 'HH:mm') }}
                </div>
                <div class="mt-1">
                  {{ event.summary }}
                </div>
              </button>
            </div>
          </div>
          <div/>
        </div>
      </div>
    </div>
  </div>
</template>

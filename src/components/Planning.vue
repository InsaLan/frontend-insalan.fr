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
const columnGroups = ref<Event[][][]>([]);

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
  'oklch(0.8 0.1 0)',
  'oklch(0.8 0.1 45)',
  'oklch(0.8 0.1 90)',
  'oklch(0.8 0.1 135)',
  'oklch(0.8 0.1 180)',
  'oklch(0.8 0.1 225)',
  'oklch(0.8 0.1 270)',
  'oklch(0.8 0.1 315)',
];

const eventsOverlap = (e: Event, f: Event) => (e.start <= f.start && e.end > f.start)
  || (e.start >= f.start && e.start < f.end);

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

  // Find all groups of overlapping events
  const eventGroups: Event[][] = [];
  events.value.forEach((event) => {
    const overlappingGroup = eventGroups.find((group) => group.some(
      (e) => eventsOverlap(event, e),
    ));

    if (overlappingGroup) {
      overlappingGroup.push(event);
    } else {
      eventGroups.push([event]);
    }
  });

  // Place events into columns
  eventGroups.forEach((group) => {
    const columns: Event[][] = [];
    group.forEach((event) => {
      const column = columns.find((col) => !col.some(
        (e) => eventsOverlap(event, e),
      ));
      if (column) {
        column.push(event);
      } else {
        columns.push([event]);
      }
    });
    columnGroups.value.push(columns);
  });
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
  // const sameStartEvents = getEventsForDay(day).filter(
  //   (e) => eventsOverlap(event, e),
  // );
  // width = 100 / sameStartEvents.length;
  // left = sameStartEvents.indexOf(event) * width;
  columnGroups.value.forEach((columns) => {
    columns.forEach((column, columnIndex) => {
      if (column.includes(event)) {
        width = 100 / columns.length;
        left = columnIndex * width;
      }
    });
  });

  return {
    top: `${(startMinutes / totalMinutes) * 100 + offset * 0.75}%`,
    height: `${(durationMinutes / totalMinutes) * 100}%`,
    left: `${left}%`,
    width: `${width}%`,
    'background-color': colors[event.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length],
  };
};

const timeSlots = computed(() => Array.from({ length: 24 - START_HOURE }, (_, i) => i + START_HOURE));

onMounted(fetchEvents);
watch(() => props.link, fetchEvents);
</script>

<template>
  <div v-if="events.length === 0" class="l-flex-column u-full-height u-text-center u-big-text">
    <p>⌛ Le planning n'est pas encore disponible, revenez plus tard !</p>
  </div>
  <div v-else>
    <div
      v-if="canGoBack || canGoForward"
      class="l-flex-row u-full-width u-mb-2 l-items-main-center u-gap-4"
    >
      <button
        :disabled="!canGoBack"
        class="c-text-btn"
        type="button"
        @click="goBack"
      >
        &lt; Jours précédents
      </button>
      <button
        :disabled="!canGoForward"
        class="c-text-btn"
        type="button"
        @click="goForward"
      >
        Jours suivants &gt;
      </button>
    </div>
    <div>
      <div
        class="l-gap-2"
        :style="{ display: 'grid', 'grid-template-columns': `repeat(${nbDays * 2 + 2}, minmax(0,1fr))` }"
      >
        <div class="u-full-width u-py-1 times-container u-mr-1">
          <div v-for="hour in timeSlots.slice().reverse()" :key="hour" class="times u-small-text u-color-text-2">
            {{ hour.toString().padStart(2, '0') }}:00
          </div>
        </div>
        <div v-for="day in visibleDays" :key="day.toISOString()" class="u-rounded day u-bg-bg-2 l-overflow-hidden">
          <div class="u-bg-bg-3 u-p-2 u-text-center u-bold">
            {{ frenchDayFormatFromDate(day) }}
          </div>
          <div class="l-relative-position" :style="{ height: `${60 * (24 - START_HOURE)}px` }">
            <div
              v-for="hour in timeSlots"
              :key="hour"
              class="l-absolute-position u-full-width top-border"
              :style="{ top: `${((hour - START_HOURE) / (24 - START_HOURE)) * 100 - 0.04}%` }"
            />
            <div
              v-for="event in getEventsForDay(day)"
              :key="event.start.toISOString()"
              class="l-flex-column u-rounded u-text-center u-p-1 u-color-always-dark l-absolute-position u-small-text l-overflow-hidden"
              :style="getEventStyle(event, day)"
            >
              <div class="l-flex-column l-items-main-center event-text u-full-height">
                <div>
                  {{ format(event.start, 'HH:mm') }} - {{ format(event.end, 'HH:mm') }}
                </div>
                <div class="u-bold">
                  {{ event.summary }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.top-border {
  border-top-width: 2px;
  border-color: var(--color-bg-1);
}

.day {
  grid-column: span 2 / span 2;
}

.event-text {
  max-height: 44px;
}

.times-container {
  display: flex;
  flex-direction: column-reverse;
}

.times {
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  height: 60px;
}
</style>

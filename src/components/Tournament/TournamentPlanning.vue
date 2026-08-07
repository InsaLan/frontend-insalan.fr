<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import Planning from '@/components/Planning.vue';
import type { EventTournamentDeref } from '@/models/tournament';

const props = defineProps<{
  tournament: EventTournamentDeref;
}>();
const { t } = useI18n();

</script>

<template>
  <section id="planning">
    <div class="u-mb-2 u-m-text u-text-center u-color-text-2">
      {{ t('content.components.Tournament.TournamentPlanning.disclaimer') }}
    </div>
    <Planning :link="props.tournament?.planning_file"/>
  </section>
</template>

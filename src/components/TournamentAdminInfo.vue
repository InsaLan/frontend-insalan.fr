<script setup lang="ts">
import type { TournamentDeref } from '@/models/tournament';

defineProps<{
  tournament: TournamentDeref;
}>();
</script>

<template>
  {{ tournament }}
</template>

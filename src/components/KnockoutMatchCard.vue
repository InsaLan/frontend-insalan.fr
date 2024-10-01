<script setup lang="ts">

defineProps<{
  teamPerMatch: number;
  teams: Record<string, string | number | boolean | undefined>[];
  status: string;
}>();
</script>

<template>
  <div v-for="idx in teamPerMatch" :key="idx" class="flex items-center justify-between bg-slate-700 p-2 text-xl" :class="{ 'bg-slate-900': status == 'ONGOING' }">
    <div class="text-grey-500 truncate">
      {{ teams[idx - 1]?.name || "TBD" }}
    </div> <div v-if="status == 'COMPLETED'" :class="teams[idx - 1]?.is_winner ? 'text-emerald-300' : 'text-white'" class="text-2xl font-black">
      {{ teams[idx - 1]?.score }}
    </div>
    <div v-else class="text-2xl font-black">
      0
    </div>
  </div>
</template>

<script setup lang="ts">

defineProps<{
  teamPerMatch: number;
  teams: Record<string, string | number | boolean | undefined>[];
  status: string;
}>();
</script>

<template>
  <div v-for="idx in teamPerMatch" :key="idx" class="flex justify-between bg-slate-700 p-2 text-xl" :class="{ 'bg-slate-900': status == 'ONGOING' }"> <!-- max-w-lg min-w-[22rem]-->
    <div class="text-grey-500">
      {{ teams[idx - 1]?.name || "TBD" }}
    </div> <div v-if="status == 'COMPLETED'" :class="teams[idx - 1]?.is_winner ? 'text-emerald-300' : 'text-white'" class="text-3xl font-black">
      {{ teams[idx - 1]?.score }}
    </div>
    <div v-else class="text-3xl font-black">
      0
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';
import type { Partner } from '@/models/partner';

interface Props {
  partner: Partner;
}

const props = defineProps<Props>();
const { partner } = toRefs(props);
</script>

<template>
  <div :key="partner.id" class="container h-48 break-words bg-cyan-900 shadow-lg hover:bg-cyan-800">
    <a :href="partner.url" class="flex h-full flex-col items-center gap-2 p-2">
      <img :src="partner.logo" :alt="`logo de ${partner.name}`" class="flex-1 overflow-y-hidden object-contain"/>
      <p class="flex-none text-center">{{ partner.name }}</p>
    </a>
  </div>
</template>

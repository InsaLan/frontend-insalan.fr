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
  <a :key="partner.id" :href="partner.url" class="container h-48 c-btn-bg-2 flex flex-col items-center" target="_blank" rel="noopener noreferrer">
    <img :src="partner.logo" :alt="`logo de ${partner.name}`" class="flex-1 overflow-y-hidden object-contain"/>
    <p class="flex-none text-center">{{ partner.name }}</p>
  </a>
</template>

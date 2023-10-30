<script setup lang='ts'>
import axios from 'axios';
import { onMounted, ref } from 'vue';
import type { Partner } from '@/models/partner';

const partners = ref<Partner[]>([]);

onMounted(async () => {
  try {
    const partnerData = await axios.get<Partner[]>('/partners/');
    partners.value = partnerData.data;
  } catch (e) {
    /* empty */
  }
});
const placeholder = './src/assets/images/placeholder_tournament.webp';

</script>
<template>
  <div>
    <section>
      <div class="title text-white">
        Nos partenaires
      </div>
      <div class="mb-12 grid grid-cols-4 gap-3 px-4">
        <div v-for="partner in partners" :key="partner.id" class="container h-min max-w-sm break-words bg-cyan-900">
          <a :href="partner.url">
            <img :src="placeholder" alt="Partner logo"/>
            <p class="text-center">{{ partner.name }}</p>
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { onMounted, ref } from 'vue';
import type { Partner } from '@/models/partner';
import { PartnerType } from '@/models/partner';

import PartnerCard from './PartnerCard.vue';

const sponsors = ref<Partner[]>([]);
const partners = ref<Partner[]>([]);

onMounted(async () => {
  let partnerData;
  try {
    partnerData = await axios.get<Partner[]>('/partners/');
  } catch (error) {
    return;
  }
  sponsors.value = partnerData.data.filter((partner) => partner.partner_type === PartnerType.SPONSOR);
  partners.value = partnerData.data.filter((partner) => partner.partner_type === PartnerType.PARTNER);
});

</script>

<template>
  <section v-if="sponsors.length">
    <div class="c-title">
      Nos sponsors
    </div>
    <div class="l-grid-6 l-gap-2 u-px-2">
      <PartnerCard v-for="sponsor in sponsors" :key="sponsor.id" :partner="sponsor"/>
    </div>
  </section>
  <section v-if="partners.length">
    <div class="c-title">
      Nos partenaires
    </div>
    <div class="l-grid-6 l-gap-2 u-px-2">
      <PartnerCard v-for="partner in partners" :key="partner.id" :partner="partner"/>
    </div>
  </section>
</template>

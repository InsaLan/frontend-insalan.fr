<script setup lang="ts">
import Content from '@/components/Content.vue';
import Map from '@/components/Map.vue';

</script>

<template>
  <Content
    name="joueur_checklist"
    class="[&_li]:lg:mx-24 [&_p]:lg:mx-24"
  />
  <Content
    name="Discord"
    class="[&_li]:lg:mx-24 [&_p]:lg:mx-24"
  />
  <Content
    name="Contact"
    class="[&_li]:lg:mx-24"
  />
  <Map/>
</template>

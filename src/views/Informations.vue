<script setup lang="ts">
import Content from '@/components/Content.vue';
import Map from '@/components/Map.vue';

</script>

<template>
  <div class="l-grid-2 l-gap-4 u-m-double-body">
    <Content
      name="joueur_checklist"
    />
    <div>
      <Content
        name="Discord"
      />
      <Content
        name="Contact"
      />
    </div>
  </div>
  <Map/>
</template>

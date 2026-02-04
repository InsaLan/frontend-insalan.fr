<template>
  <h1 class="c-title">
    Où nous trouver
  </h1>
  <section class="u-mb-2 u-m-body section">
    <div class="map u-rounded">
      <l-map ref="map" v-model:zoom="zoom" :center="insalan_pos" :use-global-leaflet="false">
        <l-tile-layer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          layer-type="base"
          name="OpenStreetMap"
        />
        <l-marker :lat-lng="insalan_pos">
          <l-tooltip>InsaLan</l-tooltip>
        </l-marker>
      </l-map>
    </div>
  </section>
</template>

<script setup lang='ts'>
import {
  LMap,
  LMarker,
  LTileLayer,
  LTooltip,
} from '@vue-leaflet/vue-leaflet';
import { ref } from 'vue';

import 'leaflet/dist/leaflet.css';

const insalan_pos = [48.12229, -1.63653];
const zoom = ref(15);
</script>

<style scoped>
.section {
  align-items: center;
  display: flex;
  justify-content: center;
}

.map {
  height: 512px;
  width: 1500px;
  overflow: hidden;
  z-index: 0;
}
</style>

<template>
  <h1 class="c-title">
    Où nous trouver
  </h1>
  <div class="u-m-double-body u-mb-2 u-text-center u-flex-column l-items-cross-center">
    <Content name="Adresse"/>
  </div>
  <section class="u-mb-2 u-m-double-body l-flex-column l-items-main-center l-items-cross-center">
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

import Content from './Content.vue';

import 'leaflet/dist/leaflet.css';

const insalan_pos = [48.12229, -1.63653];
const zoom = ref(8);
</script>

<style scoped>
.map {
  height: 500px;
  width: min(100%,1500px);
  overflow: hidden;
  z-index: 0;
}
</style>

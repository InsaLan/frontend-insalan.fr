<template>
  <h1 class="title">
    Où nous trouver
  </h1>
  <section class="mb-4 flex justify-center">
    <div class="size-[512px] border-4">
      <l-map ref="map" v-model:zoom="zoom" :center="insalan_pos" :use-global-leaflet="false" class="z-0">
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

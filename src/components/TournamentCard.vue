<script setup lang="ts">
import {ref} from 'vue';
const team = ref(2)
const maxTeam = ref(32)

</script>
<template>
  <div class="flex">
  <img src="#" />
  <div>
    <p>{{team}}/{{maxTeam}} Equipes</p>
  </div>
  </div>
</template>
<style scoped>
</style>

<script setup lang="ts">
import Error from '@/components/Error.vue';
import Footer from '@/components/Footer.vue';
import Navigation from '@/components/Navigation.vue';
import Toast from '@/components/Toast.vue';
</script>

<template>
  <Navigation/>
  <Error/>
  <Toast/>
  <div class="flex-1">
    <routerView/>
  </div>
  <Footer/>
</template>

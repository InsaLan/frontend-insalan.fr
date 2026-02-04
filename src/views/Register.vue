<script setup lang="ts">
import LoginForm from '@/components/LoginForm.vue';
import RegisterForm from '@/components/RegisterForm.vue';
</script>

<template>
  <div class="l-flex-column min-h-screen gap-8 p-8 md:flex-row">
    <RegisterForm/>
    <LoginForm/>
  </div>
</template>

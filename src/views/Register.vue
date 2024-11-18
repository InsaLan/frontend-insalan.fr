<script setup lang="ts">
import LoginForm from '@/components/LoginForm.vue';
import RegisterForm from '@/components/RegisterForm.vue';
</script>

<template>
  <div class="flex min-h-screen flex-col p-8 md:flex-row">
    <RegisterForm/>
    <LoginForm/>
  </div>
</template>

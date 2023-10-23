<script setup lang="ts">
import PasswordResetForm from '@/components/PasswordResetForm.vue';

defineProps<{
  idname: string;
  idtoken: string;
}>();
</script>

<template>
  <PasswordResetForm :idname="idname" :idtoken="idtoken"/>
</template>

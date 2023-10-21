<script setup lang="ts">
const props = defineProps(['idname','idtoken']) 
import PasswordResetForm from '../components/PasswordResetForm.vue'

</script>
<template>
	<PasswordResetForm :idname="props.idname" :idtoken="props.idtoken" />
</template>

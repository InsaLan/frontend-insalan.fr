<script setup lang="ts">
import Navigation from './components/Navigation.vue'
import Footer from './components/Footer.vue'
import Error from './components/Error.vue'
import Toast from './components/Toast.vue'
import {ref} from 'vue'
</script>

<template>
<Navigation/>
<Error />
<Toast/>
<routerView>
</routerView>
</template>
<style scoped>

</style>

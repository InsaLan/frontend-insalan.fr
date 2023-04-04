<script setup lang="ts">
import Navigation from './components/Navigation.vue'
import SidePanel from './components/SidePanel.vue'
import {ref} from 'vue'
const panel = ref('')
const showLoginPanel = (type: string) => {
	setTimeout(() =>{panel.value=type}, 1)
}
const hidePanel = () => panel.value = ''
</script>

<template>
<SidePanel v-click-outside-element="hidePanel" :type="panel"/>
<Navigation @showSidePanel="showLoginPanel"/>
<routerView>
</routerView>
</template>

<style scoped>

</style>

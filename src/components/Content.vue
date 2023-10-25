<script setup lang="ts">
import { useContentStore } from '../stores/content.store'

interface Props {
    name: string
}

const props = defineProps<Props>()

const contentStore = useContentStore()
const { fetchStatic, getContent } = contentStore

fetchStatic()
</script>

<template>
    <div v-html="getContent(props.name)"></div>
</template>

<style scoped>
</style>

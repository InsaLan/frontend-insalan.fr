<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs }  from 'pinia'
import { useToastStore } from '../stores/toast.store'
const ToastStore = useToastStore()
const { msg, visible, toastType } = storeToRefs(ToastStore)
const { dismiss, setContent } = ToastStore
</script>
<template>
	<div v-if="visible" :class="toastType" class="hover:ring-2 flex left-1/2 w-min-[500px] fixed bottom-1 -ml-[250px] z-40 items-center w-full max-w-xs p-4 mb-4 text-white rounded-lg shadow">
		<div class="ml-3 text-sm font-normal">
			<p> {{ msg }}</p>
		</div>
		<button @click="dismiss" class="hover:ring-2  hover:ring-green-600 hover:bg-green-600 hover:text-white ml-auto -mx-1.5 -my-1.5  rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 " >
			<span class="sr-only">Close</span>
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="text-white w-5 h-5 stroke-2">
			  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" class="w-5 h-5"/>
			</svg>
		</button>
	</div>
</template>

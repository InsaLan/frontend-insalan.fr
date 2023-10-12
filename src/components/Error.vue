<script setup lang="ts">
	//TODO: Refactor to Toast component
import { useErrorStore } from '../stores/error.store'
import { storeToRefs } from 'pinia'
const props = defineProps(['context'])
const ErrorStore = useErrorStore()
const {flush_errors } = ErrorStore
const { errors, has_errors} = storeToRefs(ErrorStore)
</script>
<template>
	<div  v-if="has_errors"  class="hover:ring-2 hover:ring-red-950 flex left-1/2 w-min-[500px] fixed bottom-1 -ml-[250px] z-40 items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-red-400 dark:bg-red-800">
		<div class="ml-3 text-sm font-normal">
			<ul>
				<li v-for="error in errors"><em class="font-bold not-italic text-xl">{{error[0]}}</em><p v-for="msg in error[1]">{{msg}}</p></li>
			</ul>
		</div>
		<button @click="flush_errors" class=" hover:ring-2  hover:bg-red-600 hover:ring-red-600 hover:text-white ml-auto -mx-1.5 -my-1.5  rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 " >
			<span class="sr-only">Close</span>
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 stroke-2">
			  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" class="w-5 h-5"/>
			</svg>
		</button>
	</div>
</template>

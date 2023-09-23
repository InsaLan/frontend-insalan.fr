<script setup>
import { useErrorStore } from '../stores/error.store'
import { storeToRefs } from 'pinia'
const props = defineProps(['context'])
const ErrorStore = useErrorStore()
const {flush_errors } = ErrorStore
const { errors, has_errors} = storeToRefs(ErrorStore)
</script>
<template>
	<div  v-if="has_errors"  class="flex left-1/2 w-min-[500px] fixed bottom-1 -ml-[250px] z-40 items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-red-400 dark:bg-red-800">
		<div class="ml-3 text-sm font-normal">
			<ul>
				<li v-for="error in errors"><em class="font-bold not-italic text-xl">{{error[0]}}</em><p v-for="msg in error[1]">{{msg}}</p></li>
			</ul>
		</div>
		<button @click="flush_errors" type="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" >
			<span class="sr-only">Close</span>
			<svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
			    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
			</svg>
		</button>
	</div>
</template>

import { defineStore } from "pinia";
import { computed, ref } from 'vue';
import axios from "axios";
export const useErrorStore = defineStore('error', () => {
	let errors = ref({})
	const default_duration = 200
	function add_error(error){

		let data = []
		console.log(error.data.messages)
		errors.value = Object.entries(error.data.messages)
	}
	const flush_errors = () => {
		console.log("test")
		errors.value = {}
	}
	let has_errors = computed(() => {return Object.keys(errors.value).length > 0 })
	return { errors,
		 add_error,
		 flush_errors,
		 has_errors
	}
})

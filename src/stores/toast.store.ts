import { defineStore } from "pinia";
import { computed, ref } from 'vue';

type ToastStatus = "success" | "error" | "info"; 

export const useToastStore = defineStore('toast', () => {
	let msg = ref({})
	let visible = ref(false)
	let toastType: ToastStatus = ref("success")
	const setContent = (content: string, status: ToastStatus) => {
		msg.value = content
		toastType = status
		visible.value = true
	}
	const dismiss = () => {
		msg.value = ""
		visible.value = false
	}
	return { 
		msg,
		toastType,
		visible,
		setContent,
		dismiss
		
	}
})

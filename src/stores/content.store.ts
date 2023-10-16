import { defineStore } from "pinia";
import { ref, computed } from 'vue';
import axios from "axios";
import { useRouter } from "vue-router";
import { marked } from 'marked';

interface Content {
		name: String,
		content: String
}

export const useContentStore = defineStore('content', () => {
    let contents = ref([])
	let constants = ref({})
	const re = /\$\{(?<name>\w+)\}/gm //captures named group matching the pattern ${name}
	async function fetch_static() {
		const fetch_content = await axios.get("content/content/")
		const fetch_constant = await axios.get("content/constant/")
		constants.value = fetch_constant.data	
		const lookup_table = constants.value.reduce((obj, item) => ({
				...obj,
				[item.name]: item.value
		}), {})
		contents.value = fetch_content.data.map((content) => content.content.replace(re, (_, name: String) => lookup_table[name]))
		console.log(contents.value)

	}

    function get_content(name: String){
		return marked(contents.value.filter((content: Content) => content.name == name)[0].content) //returns the HTML from selected content
	}
	function get_constant(name: String){
		return constants.value.filter((constant) => constant.name == name)[0].content
	}
	return { fetch_static, get_content, get_constant }
})

<script setup>
import axios from "axios"
import { ref } from 'vue'
let partners = ref({})
axios.get("/partners/").then((data) => {
	partners.value = data.data.results
	console.log(data.data.results)
})

const placeholder = "./src/assets/images/placeholder_tournament.webp"


</script>
<template>
	<div>
	<section>
		<div class="title text-white"> Nos partenaires</div>
		<div class="px-4 grid grid-cols-4 gap-3 mb-12">
			<div class="container h-min max-w-sm break-words bg-cyan-900" v-for="partner in partners" >
			<a :href="partner.url">
				<img :src="placeholder" />
				<p class="text-center">{{partner.name }}</p>
			</a>
			</div>
		</div>
	</section>
	</div>
</template>

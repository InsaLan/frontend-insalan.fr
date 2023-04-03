<script setup lang="ts">
</script>

<template>
<div class="h-f w-h  -top-24 relative">
	<!-- get the video from the insalan drive in the folder "scene" -->
	<video class="-z-1 h-full w-full object-cover blur-md" src="../assets/videos/trailer.mp4" autoplay loop muted playsinline/>
	<div class="absolute top-60  left-2/4 -translate-x-2/4 w-f hover-title">
		<img class="w-[32rem]" src="../assets/images/logo_wide.png">
		<h1 class="text-white text-2xl font-bold text-center"> 11, 12 & 13 février 2023</h1>
		<div class="mt-4 cursor-pointer m-auto rounded-full w-20 h-20 bg-red-500" id="next">
			<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
			  <path d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"></path>
			</svg>
		</div>
	</div>
</div>
</template>

<style scoped>

</style>

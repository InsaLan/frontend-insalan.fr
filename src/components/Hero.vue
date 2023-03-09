<script setup lang="ts">
</script>

<template>
<div class="hero">
	<!-- get the video from the insalan drive in the folder "scene" -->
	<video src="../assets/videos/trailer.mp4" autoplay loop muted playsinline/>
	<div class="hover-title">
		<img src="../assets/images/logo_wide.png">
		<h1> 11, 12 & 13 février 2023</h1>
		<div id="next">
		<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
		  <path d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"></path>
		</svg>
		</div>
	</div>
</div>
</template>

<style scoped>
#next {
	margin-top: 4em;
	border: 0;
	cursor: pointer;
	border-radius:100%;
	width:110px;
	height:110px;
	background-color: #C33C54;
}

img {
	width: 40em;
}
.hero {
	position: relative;
	width: 100vw;
	height: 100vh;
	top:-5em;
	
}
.hero > video {
	filter: blur(8px);
	width: 100vw;
	height: 100vh;
	z-index: -1;
}
.hero > .hover-title {
	position: absolute;
	top: 20vh;
	left: 0;
	width: 100vw;
}
.hero > video {
		object-fit: cover;
}
</style>

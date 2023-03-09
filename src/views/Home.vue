<script setup lang="ts">
import Hero from '../components/Hero.vue' 
</script>

<template>
<Hero/>
<section id="info" class="content">
<div class="title"> This is the home page</div>
</section>
<section id="tournament" class="content">
</section>

</template>

<style scoped>
.title {
	font-size: 2em;
	font-weight: bold;
	display: flex;
	align-items: center;
	justify-content: center;
}
.title::after, .title::before {
	content: '';
	display: block;
	height: 0.1em;
	background-color: #fff;
	min-width: 35vw;
}
.title::before {
	margin-right: 1em;
}
.title::after {
	margin-left: 1em;
}
#info {
  background-color: #ff0000; 
}
.content {
	height: 100vh;
	width: 100vw;
}
</style>

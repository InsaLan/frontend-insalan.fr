<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { email, required, sameAs } from '@vuelidate/validators'
import FormField from '../components/FormField.vue'
import { useUserStore } from '../stores/user.store'
const { signin, login } = useUserStore()
import Error from '../components/Error.vue'
const mustBeTrue = (val) => val == true
// Register form validation
const login_form = reactive({
	username: '',
	password: ''
})

const rules = computed(()=>{
	return {
	username: { required },
	password: { required },
}})

const v$ = useVuelidate(rules, login_form)

const login_user = async () => {
	const isValid = await v$.value.$validate()
	console.log(isValid)
	if (!isValid) return 
	login(login_form.username, login_form.password)
}
</script>

<template>
	<div class="hover:border-solid hover:border-2 hover:border-sky-500 rounded-lg flex items-center flex-col basis-1/2">
		<h1 class="text-center text-4xl text-white">Se connecter</h1>
		<form class="my-2">
			<FormField v-slot="context" label="Nom d'utilisateur" :validations="v$.username" class="flex flex-col">
			<input :class="{error: context.invalid}" class="border-2 bg-theme-bg" v-model="login_form.username" type="text" placeholder="John doe" @blur="v$.username.$touch"/>
			</FormField>
			<FormField v-slot="context" label="Mot de passe" :validations="v$.password" class="flex flex-col">
				<input  :class="{error: context.invalid}" class="border-2 bg-theme-bg" v-model="login_form.password" type="password" placeholder="Mot de passe" @blur="v$.password.$touch"/>
			</FormField>
		</form>
		<button @click="login_user" class="form-btn">Se connecter</button>
		<a class="p-1 hover:text-blue-800" href="/reset-password">Mot de passe oublié?</a>
	</div>
</template>

<style scoped>

</style>

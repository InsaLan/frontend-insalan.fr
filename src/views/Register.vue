<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { email, required, sameAs } from '@vuelidate/validators'

import errors_fr from "../support/locales/errors.fr.ts"
import { useUserStore } from '../stores/user.store'
const { signin, login } = useUserStore()
import Error from '../components/Error.vue'
console.log(errors_fr.rules)
const mustBeTrue = (val) => val == true
// Register form validation
const register_form = reactive({
	username:'',
	email:'',
	password: '',
	password_confirm:'',
	accept_cgu: false,
	decoy: ''
})

const login_form = reactive({
	username: '',
	password: ''
})
const rules_register = computed(()=>{
	return {
	username: { required },
	email:{ required, email },
	password: { required },
	password_confirm: { required, 
			    sameAsPassword: sameAs(computed(() => register_form.password)),
						},
	accept_cgu: { sameAs: sameAs(computed(() => true )) }	
}})

const v$ = useVuelidate(rules_register, register_form)

const register_user = async () => {
	const isValid = await v$.value.$validate()
	if(!isValid) return

	signin(register_form.email, register_form.username, register_form.password, register_form.password_validation)
}

const login_user = async () => {
	login(login_form.username, login_form.password)
}
</script>

<template>
	<div class="flex p-8 h-screen">
		<div class="flex hover:bg-cyan-400 items-center flex-col basis-1/2">
			<h1 class="text-center text-4xl text-white">S'enregistrer</h1>
			
			<form class="my-5">
				<Error />	
				<div class="flex flex-col">
					<label  class="text-white" for="email">Email</label>
					<input class="border-2 bg-theme-bg" type="text" v-model="register_form.email" placeholder="foo@insalan.fr" @blur="v$.email.$touch"/>
					<span class="font-medium text-red-500" v-if="v$.username.$error"></span>
					</div>
				<div class="flex flex-col">
					<label class="text-white" for="16f78a7d6317f102bbd95fc9a4f3ff2e3249287690b8bdad6b7810f82b34ace3" >Nom d'utilisateur</label>
					<input  class="border-2 bg-theme-bg" placeholder="john doe" type="text" v-model="register_form.username" @blur="v$.username.$touch"/>
					<span class="font-medium text-red-500" v-if="v$.username.$error"></span>
				</div>
				<div class="hidden flex flex-col">
					<label for="username" >username</label>
					<input type="text" v-model="register_form.decoy" />
				</div>
				<div class="flex flex-col">
					<label  class="text-white" for="password">Mot de passe</label>
					<input class="border-2 bg-theme-bg" type="password" placeholder="Mot de passe" @blur="v$.password.$touch" v-model="register_form.password"/>
				</div>
				<div class="flex flex-col">
					<label  class="text-white" for="password_confirm">Repetition mot de passe</label>
					<input  class="border-2 bg-theme-bg" type="password" placeholder="Mot de passe"  @blur="v$.password_confirm.$touch" v-model="register_form.password_confirm"/>
					<span class="font-medium text-red-500" v-if="v$.password_confirm.$error">{{ v$.password_confirm.$errors[0].$message }}</span>
				</div>
				<div class="flex flex-col">
					<div class="flex flex-row">
						<input class="border-2 bg-theme-bg" type="checkbox" v-model="register_form.accept_cgu">
						<label class="text-white" for="accept">J'accepte les <a class="text-cyan-800" href="#">CGU</a> de l'insalan</label>
					</div>
					<span class="font-medium text-red-500" v-if="v$.accept_cgu.$error">{{ v$.accept_cgu.$errors[0].$message }}</span>
				</div>
			</form>
			<button @click="register_user" class="rounded-3xl bg-black text-white p-3 hover:bg-sky-700">Creer un compte</button>
			<a class="p-1 hover:text-blue-800" href="/user/reset">Mot de passe oublié?</a>
		</div>
		<div class="hover:bg-cyan-400 flex items-center flex-col basis-1/2">
			<h1 class="text-center text-4xl text-white">Se connecter</h1>
			<div class="" id="error">
				<ul>
				</ul>
			</div>
			<form class="my-2">
				<div class="flex flex-col">
					<label class="text-white" for="username">Nom d'utilisateur</label>
					<input class="border-2 bg-theme-bg" v-model="login_form.username" type="text" placeholder="John doe" />
				</div>
				<div class="flex flex-col">
					<label class="text-white" for="password">mot de passe</label>
					<input class="border-2 bg-theme-bg" v-model="login_form.password" type="password" />
				</div>
			
			</form>
			<button @click="login_user" class="rounded-3xl bg-black text-white mt-3 mx-auto p-3 hover:bg-sky-700">Se connecter</button>
		</div>
	</div>
</template>

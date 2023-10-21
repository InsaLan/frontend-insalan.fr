<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { email, required, sameAs } from '@vuelidate/validators'
import FormField from '../components/FormField.vue'
import { useUserStore } from '../stores/user.store'
import Modal from '../components/Modal.vue';
const { ask_reset_password, login } = useUserStore()
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

const modal_open = ref(false)

const data = reactive({
	email: '',
})
const rules_modal = computed(()=>{
	return {
	email: { required, email },
}})
const v$_modal = useVuelidate(rules_modal, data)

const validateModal = async () => {
	const isValid = await v$.value.$validate()
	if(!isValid) return
	ask_reset_password(data.email)
	closeModal()
	
}

const closeModal = () => {
	modal_open.value = false
}

const openModal = () => {
	modal_open.value = true
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
		<a class="p-1 hover:text-blue-800 hover:cursor-pointer" @click="openModal()">Mot de passe oublié?</a>
	</div>

	<Modal v-if="modal_open" @close="closeModal">
		<template v-slot:icon>
			<div></div>
		</template>
		<template v-slot:title>
			<h3 class="text-base font-semibold leading-6 text-white-900" id="modal-title">Mot de passe oublié ?</h3>
		</template>
		<template v-slot:body>
			<form class="mt-2">
				<FormField v-slot="context" label="Email" :validations="v$_modal.email" class="flex flex-col m-2">
					<input required :class="{error: context.invalid}" class="border-2 bg-theme-bg" v-model="data.email" type="text" placeholder="John-doe@gmail.com" @blur="v$_modal.email.$touch"/>
				</FormField>
			</form>
		</template>
		<template v-slot:buttons>
			<button 
				type="button" 
				class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
				@click="validateModal"
			>Valider
			</button>
			<button 
				type="button"
				class="inline-flex w-full justify-center rounded-md bg-gray-500 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-300 sm:mt-0 sm:w-auto"
				@click="closeModal"
			>Anuler</button>
		</template>
	</Modal>
</template>

<style scoped>

</style>

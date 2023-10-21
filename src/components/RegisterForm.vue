<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { email, required, sameAs, minLength, helpers } from '@vuelidate/validators'
import FormField from '../components/FormField.vue'
import { useUserStore } from '../stores/user.store'
const { signin } = useUserStore()
const acceptGCU = helpers.withParams(
{type: 'acceptGcu'},
(value) => value == true
)
// Register form validation
const register_form = reactive({
	username:'',
	email:'',
	password: '',
	password_confirm:'',
	accept_cgu: false,
	decoy: ''
})

const rules = computed(()=>{
	return {
	username: { required },
	email:{ required, email },
	password: { required, minLengthValue: minLength(8) },
	password_confirm: { required, 
			    sameAsPassword: sameAs(computed(() => register_form.password)),
						},
	accept_cgu: { acceptGCU }	
}})
const v$ = useVuelidate(rules, register_form, {autoDirty: true})

const register_user = async () => {
	const isValid = await v$.value.$validate()
	if(!isValid) return

	if(register_form.decoy == ''){
		signin(register_form.email, register_form.username, register_form.password, register_form.password_confirm)
	} else {
		
		signin(register_form.email, register_form.username, register_form.password, register_form.password_confirm)
	}
}

</script>

<template>
		<div class="flex hover:border-solid hover:border-2 hover:border-sky-500 rounded-lg items-center flex-col basis-1/2">
			<h1 class="text-center text-4xl text-white">S'enregistrer</h1>
			
			<form class="my-5">
				<FormField  label="Email" v-slot="context" :validations="v$.email" class="flex flex-col">
				<input  required :class="{error: context.invalid}" class="border-2 bg-theme-bg" type="text" v-model="register_form.email" placeholder="foo@insalan.fr" @blur="v$.email.$touch()" />
				</FormField>
				<FormField label="Nom d'utilisateur" v-slot="context" class="flex flex-col" :validations="v$.username">
					<input required :class="{error: context.invalid}" class="border-2 bg-theme-bg" placeholder="john doe" type="text" v-model="register_form.username" @blur="v$.username.$touch()" />
				</FormField>
				<div class="hidden flex flex-col">
					<label for="username" >username</label>
					<input type="text" v-model="register_form.decoy" />
				</div>
				<FormField required label="Mot de passe" v-slot="context" :validations="v$.password" class="flex flex-col">
					<input :class="{error: context.invalid}" class="border-2 bg-theme-bg" type="password" placeholder="Mot de passe" @blur="v$.password.$touch" v-model="register_form.password"/>
				</FormField>
				<FormField label="Répéter mot de passe" v-slot="context" :validations="v$.password_confirm" class="flex flex-col">
					<input  required :class="{error: context.invalid}" class="border-2 bg-theme-bg" type="password" placeholder="Mot de passe"  @blur="v$.password_confirm.$touch" v-model="register_form.password_confirm"/>
				</FormField>
				<FormField required v-slot="context" :validations="v$.accept_cgu" class="flex flex-col">
					<div class="flex flex-row">
						<input class="mt-1 mr-1 bg-theme-bg border-2" type="checkbox" v-model="register_form.accept_cgu">
						<label class="text-white" for="accept">J'accepte les <a class="text-gray-400 underline decoration-dashed" href="#">CGU</a> de l'insalan</label>
					</div>
				</FormField>
			</form>
			<button @click="register_user" class="form-btn">Creer un compte</button>
		</div>	
</template>

<style scoped>

</style>

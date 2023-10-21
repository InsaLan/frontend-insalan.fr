<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { email, required, sameAs, minLength, helpers } from '@vuelidate/validators'
import FormField from '../components/FormField.vue'
import { useUserStore } from '../stores/user.store'
const { reset_password } = useUserStore()

const props = defineProps(['idname','idtoken'])
console.log(props)

const acceptGCU = helpers.withParams(
{type: 'acceptGcu'},
(value) => value == true
)
// Register form validation
const data = reactive({
	password: '',
	password_confirm:'',
})

const rules = computed(()=>{
	return {
	password: { required, minLengthValue: minLength(8) },
	password_confirm: { required, 
			    sameAsPassword: sameAs(computed(() => data.password)),
						}
}})
const v$ = useVuelidate(rules, data)

const register_user = async () => {
	const isValid = await v$.value.$validate()
	if(!isValid) return
	reset_password(props.idname, props.idtoken, data.password, data.password_confirm)
}

</script>

<template>
		<div class="flex hover:border-solid rounded-lg items-center flex-col basis-1/2 mb-5">
			<h1 class="text-center text-4xl text-white">Réinitialiser votre mot de passe</h1>
			<form class="my-5">
				<FormField required label="Nouveau mot de passe" v-slot="context" :validations="v$.password" class="flex flex-col">
					<input :class="{error: context.invalid}" class="border-2 bg-theme-bg" type="password" placeholder="Mot de passe" @blur="v$.password.$touch" v-model="data.password"/>
				</FormField>
				<FormField label="Répéter le mot de passe" v-slot="context" :validations="v$.password_confirm" class="flex flex-col">
					<input  required :class="{error: context.invalid}" class="border-2 bg-theme-bg" type="password" placeholder="Mot de passe"  @blur="v$.password_confirm.$touch" v-model="data.password_confirm"/>
				</FormField>
			</form>
			<button @click="register_user" class="form-btn">Valider</button>
		</div>	
</template>

<style scoped>

</style>

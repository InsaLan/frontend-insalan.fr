<script setup lang="ts">
import { useUserStore} from '../stores/user.store';
import { storeToRefs } from 'pinia';
import { ref, reactive, computed } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { email, required, sameAs, minLength } from '@vuelidate/validators'
const userStore = useUserStore()
const { user, role, isConnected, inscriptions } = storeToRefs(userStore)
const { fetch_user_inscription_full, patch_user } = userStore
import Modal from '../components/Modal.vue';
import FormField from '../components/FormField.vue'

fetch_user_inscription_full(user.value.id)


// Register form validation
const data_pseudo = reactive({
	username: '',
})
const rules_pseudo = computed(()=>{
	return {
	username: { required },
}})
const v$_pseudo = useVuelidate(rules_pseudo, data_pseudo)

const data_email = reactive({
	email: '',
})
const rules_email = computed(()=>{
	return {
	email: { required, email },
}})
const v$_email = useVuelidate(rules_email, data_email)

const data_password = reactive({
	new_password: '',
	password_validation: '',
	current_password: '',
})
const rules_password = computed(()=>{
	return {
	new_password: { required, minLengthValue: minLength(8) },
	password_validation: { required, sameAsPassword: sameAs(computed(() => data_password.new_password)) },
	current_password: { required },
}})
const v$_password = useVuelidate(rules_password, data_password)

const focus = ref("")

const title = ref("Test title")
const form_fields = ref("")

const showModal = ref(false);
const openModal = () => {
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const validateModal = async () => {
	let data = {}
	let isValid;
	switch (focus.value) {
		case "pseudo":
			isValid = await v$_pseudo.value.$validate()
			if(!isValid) return
			data = data_pseudo
			break;
		case "email":
			isValid = await v$_email.value.$validate()
			if(!isValid) return
			data = data_email
			break;
		case "password":
		isValid = await v$_password.value.$validate()
			if(!isValid) return
			data = data_password
			break;
	}
	patch_user(data)
	closeModal()
}

const editField = (field: String) => {
	switch (field) {
		case "pseudo":
			title.value = "Changer de pseudo"
			focus.value = "pseudo"
			break;
		case "email":
			title.value = "Changer d'email"
			focus.value = "email"
			break;
		case "password":
			title.value = "Changer son mot de passe"
			focus.value = "password"
			break;
	}
	openModal()
}

const placeholder = "/src/assets/images/logo_home.png"
</script>

<template>
	<div class="flex md:flex-row flex-col ml-1">
		<div id="profile" class="md:w-1/4 items-center">
			<h1 class="text-center m-3 font-bold text-4xl">Mon compte </h1>
			<div class="myr-2 flex flex-col md:justify-items-start justify-items-center md:place-items-start place-items-center">
				<div class="my-2 flex md:flex-row flex-col justify-items-center place-items-center">
					<div class="m-2 flex justify-items-center place-items-center">
						<a href=""><img class="m-2 rounded-full max-w-full max-h-full w-16 hover:blur-sm" :src="user.image ? user.image : placeholder"/></a>
					</div>
					<div>
						<p class="text-xl">Pseudo : <em>{{user.username}}</em>
							<a class="hover:text-blue-600 hover:cursor-pointer" @click="editField('pseudo')">
								<fa-awesome-icon class="ml-2" size="2xs" icon="fa-solid fa-pencil" />
							</a>
						</p>
						<p class="text-xl">Email : <em>{{user.email}}</em>
							<a class="hover:text-blue-600 hover:cursor-pointer" @click="editField('email')">
								<fa-awesome-icon class="ml-2" size="2xs" icon="fa-solid fa-pencil" />
							</a>
						</p>
						<p class="text-xl">Mot de passe : <em>**********</em>
							<a class="hover:text-blue-600 hover:cursor-pointer" @click="editField('password')">
								<fa-awesome-icon class="ml-2" size="2xs" icon="fa-solid fa-pencil" />
							</a>
						</p>
						<div class="flex justify-items-center place-items-center"><p class="text-xl">Role : </p>
							<div class="m-1 pr-1 flex justify-around text-md bg-blue-700 rounded p-1 w-16">
								<svg v-if="role=='dev'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
									<path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
								</svg>
								{{role}}
							</div>
						</div>
					</div>
				</div>
				<!--div class="myr-2 ml-1">	
					<button @click="delete_account()" class="center rounded transition duration-150 ease-in-out p-2 font-bold text-white bg-red-600 hover:ring hover:ring-pink-500" style="display: flex; align-items: center;">Supprimer son compte</button>
				</div-->
			</div>
		</div>
		<div class="sm:visible collapse h-auto bg-white w-[2px]"></div>
		<div id="team" class="md:w-3/4">
			<h1 class="text-center m-3 font-bold text-4xl">Mes Equipes </h1>
			<!--div>
				<div class="bg-red-900 rounded-xl text-center m-2 text-xl" v-if="Object.keys(inscriptions.unpaid).length">
					<h2 class="mx-5 text-xl" v-if="Object.keys(inscriptions.unpaid).length == 1"><fa-awesome-icon size="xs" icon="fa-solid fa-warning" />  Vous avez une inscription non payée  <fa-awesome-icon size="xs" icon="fa-solid fa-warning" /> </h2>
					<h2 class="mx-5 text-xl" v-else><fa-awesome-icon size="xs" icon="fa-solid fa-warning" />  Vous avez des inscriptions non payées  <fa-awesome-icon size="xs" icon="fa-solid fa-warning" /> </h2>
				</div>
			</div-->
			<div class="m-4" v-if="inscriptions.ongoing.length > 0">
				<h1 class="text-xl">Edition Actuelle</h1>
				<div class="m-1 grid md:grid-cols-4 gap-3">
					<a class="container flex flex-col-reverse max-w-xs break-words bg-cyan-900 text-center" :class="{ /*[`bg-red-900`]: inscriptions.unpaid[inscription.team.id]*/ }" v-for="inscription in inscriptions.ongoing" :href="'/team/' + inscription.team.id + '/detail'">
						<div class="md:visible collapse my-1">
							<div class="h-8 flex flex-col flex-1 justify-center m-1">
								<div>
									<a
									href="" 
									:class="{[`bg-red-600`]: inscriptions.unpaid[inscription.team.id], [`bg-green-600`]: !inscriptions.unpaid[inscription.team.id]}" 
									class="center rounded transition duration-150 ease-in-out p-2 font-bold text-white hover:ring hover:ring-pink-500">
									{{ inscriptions.unpaid[inscription.team.id] ? "Terminer l'inscription" : inscription.team.players[0]==user.id ? "Gérer l'équipe" : "Voir l'équipe"}}
									</a>
								</div>
							</div>
						</div>
						<div class="md:visible collapse flex flex-col">
							<a href="" class="text-zinc-400 mt-auto">réglement du tournois</a>
						</div>
						<img class="h-32 max-w-full w-32 overflow-hidden" :src="inscription.team.tournament.logo" style="width: 100%; object-fit: cover;"/>
						<div class="flex flex-col flex-1 justify-center m-1">
							<p class="text-xl">{{inscription.team.name}}</p>
						</div>
					</a>
				</div>
			</div>
			<div class="m-4" v-if="inscriptions.past.length > 0">
				<h1 class="text-xl">Autres Editions</h1>
				<div class="m-1 grid md:grid-cols-4 gap-3">
					<a class="container flex flex-col-reverse max-w-xs break-words bg-cyan-900 text-center" v-for="inscription in inscriptions.past" :href="'/team/' + inscription.team.id + '/detail'">
						<div class="md:visible collapse my-1">
							<div class="h-8 flex flex-col flex-1 justify-center m-1">
								<div>
									<a
									href="" 
									class="bg-green-600 center rounded transition duration-150 ease-in-out p-2 font-bold text-white hover:ring hover:ring-pink-500">
									{{ inscription.team.players[0]==user.id ? "Gérer l'équipe" : "Voir l'équipe"}}
									</a>
								</div>
							</div>
						</div>
						<div class="md:visible collapse flex flex-col">
							<a href="" class="text-zinc-400 mt-auto">réglement du tournois</a>
						</div>
						<img class="h-32 max-w-full w-32 overflow-hidden" :src="inscription.team.tournament.logo" style="width: 100%; object-fit: cover;"/>
						<div class="flex flex-col flex-1 justify-center m-1">
							<p class="text-xl">{{inscription.team.name}}</p>
						</div>
					</a>
				</div>
			</div>
		</div>
	</div>

	<Modal v-if="showModal" @close="closeModal">
		<template v-slot:icon>
			<div></div>
		</template>
		<template v-slot:title>
			<h3 class="text-base font-semibold leading-6 text-white-900" id="modal-title">{{ title }}</h3>
		</template>
		<template v-slot:body>
			<form class="mt-2">
				<div id="pseudo" v-if="focus == 'pseudo'">
					<FormField v-slot="context" label="Nom d'utilisateur" :validations="v$_pseudo.username" class="flex flex-col m-2">
						<input required:class="{error: context.invalid}" class="border-2 bg-theme-bg" v-model="data_pseudo.username" type="text" placeholder="John doe" @blur="v$_pseudo.username.$touch"/>
					</FormField>
				</div>

				<div id="email" v-if="focus == 'email'">
					<FormField v-slot="context" label="Email" :validations="v$_email.email" class="flex flex-col m-2">
						<input required :class="{error: context.invalid}" class="border-2 bg-theme-bg" v-model="data_email.email" type="text" placeholder="John-doe@gmail.com" @blur="v$_email.email.$touch"/>
					</FormField>
				</div>

				<div id="password" v-if="focus == 'password'">
					<FormField v-slot="context" label="Nouveau mot de passe" :validations="v$_password.new_password" class="flex flex-col m-2">
						<input required :class="{error: context.invalid}" class="border-2 bg-theme-bg" v-model="data_password.new_password" type="password" placeholder="Mot de passe" @blur="v$_password.new_password.$touch"/>
					</FormField>
					<FormField v-slot="context" label="Confirmer le mot de passe" :validations="v$_password.password_validation" class="flex flex-col m-2">
						<input required :class="{error: context.invalid}" class="border-2 bg-theme-bg" v-model="data_password.password_validation" type="password" placeholder="Mot de passe" @blur="v$_password.password_validation.$touch"/>
					</FormField>
					<FormField v-slot="context" label="Mot de passe actuel" :validations="v$_password.current_password" class="flex flex-col m-2">
						<input required :class="{error: context.invalid}" class="border-2 bg-theme-bg" v-model="data_password.current_password" type="password" placeholder="Mot de passe" @blur="v$_password.current_password.$touch"/>
					</FormField>
				</div>
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

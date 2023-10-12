<script setup lang="ts">
import { computed } from "vue"
import errors_fr from "../support/locales/errors.fr.ts"
const props = defineProps({
	validations: {
			required: true,
			type: Object
		},
	label: {
		required: false,
		type:String
	}
});

const invalid = computed(() => {
	return props.validations.$error
})
const errors = computed(() => {
	let localized_err = []

	props.validations.$errors.map((e) => {
		localized_err.push(errors_fr.rules[e.$params.type])
		console.log(e)
	})

	return localized_err[0]
	
})
</script>
<template>
<div>
    <label for="label">{{label}}</label>
    <slot :errors="errors" :invalid="invalid" />
    <span v-if="invalid" class="text-center bg-red-500">{{errors}}</span>
</div>
</template>


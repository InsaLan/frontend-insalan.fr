<script setup>
import { computed } from "vue"
import { template, templateSettings } from "lodash"
import errors_fr from "../support/locales/errors.fr.ts"
templateSettings.interpolate = /{{([\s\S]+?)}}/g;

const props = defineProps({
	validations: {
			required: true,
			type: Object
		}
});

const invalid = computed(() => {
	return props.validations.$invalid
})
const errors = computed(() => {
	
})
</script>
<template>
    <slot :errors="errors" :invalid="invalid" />
</template>

<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import { storeToRefs } from 'pinia';
import {
  computed, reactive, ref, watch,
} from 'vue';
import { useUserStore } from '@/stores/user.store';
import { required } from '@/support/locales/errors.fr';

import FormField from './FormField.vue';
import Modal from './Modal.vue';

const userStore = useUserStore();

const {
  user,
} = storeToRefs(userStore);

// Register form validation
const name_form = reactive<{ first_name: string; last_name: string }>({
  first_name: user.value?.first_name ?? '',
  last_name: user.value?.last_name ?? '',
});

const rules = computed(() => ({
  first_name: { required },
  last_name: { required },
}));

const v$ = useVuelidate(rules, name_form);

const modal_open = ref(user.value && user.value.confirm_name);

watch(user, (newUser) => {
  modal_open.value = newUser?.confirm_name ?? false;
  name_form.first_name = newUser?.first_name ?? '';
  name_form.last_name = newUser?.last_name ?? '';
}, { deep: true });

const closeModal = () => {
  modal_open.value = false;
};

const validateModal = async () => {
  const isValid = await v$.value.$validate();
  if (!isValid) return;
  await userStore.patch_user({
    first_name: name_form.first_name,
    last_name: name_form.last_name,
    confirm_name: false,
  });
  closeModal();
};
</script>

<template>
  <Modal v-if="modal_open" @close="() => {}">
    <template #icon>
      <div/>
    </template>
    <template #title>
      <h3 id="modal-title" class="text-white-900 text-base font-semibold leading-6">
        Confirmez votre nom
      </h3>
    </template>
    <template #body>
      Nous avons besoin de votre nom pour vérifier votre identité à l'entrée
      <FormField v-slot="context" :validations="v$.first_name" class="flex flex-col">
        <label for="first_name">
          Prénom
        </label>
        <input
          id="first_name"
          v-model="name_form.first_name"
          :class="{ error: context.invalid }"
          class="border-2 bg-theme-bg"
          placeholder="Jean"
          type="text"
          @blur="v$.first_name.$touch"
        />
      </FormField>
      <FormField v-slot="context" :validations="v$.last_name" class="flex flex-col">
        <label for="last_name">
          Nom
        </label>
        <input
          id="last_name"
          v-model="name_form.last_name"
          :class="{ error: context.invalid }"
          class="border-2 bg-theme-bg"
          placeholder="Dupont"
          type="text"
          @blur="v$.last_name.$touch"
        />
      </FormField>
    </template>
    <template #buttons>
      <button
        class="c-btn-secondary"
        type="submit"
        @click="validateModal"
      >
        Confirmer
      </button>
    </template>
  </Modal>
</template>

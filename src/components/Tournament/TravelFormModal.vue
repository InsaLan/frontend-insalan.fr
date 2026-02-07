<script setup lang="ts">
import useVuelidate from '@vuelidate/core';
import { maxLength, minLength, required } from '@vuelidate/validators';
import { reactive, ref } from 'vue';
import { TRANSPORTATION_METHOD, type TransportationMethod } from '@/models/travelData';
import { useEcologyStore } from '@/stores/ecology.store';

import FormField from '../FormField.vue';
import Modal from '../Modal.vue';

interface Props {
  event: number;
  tournamentId: number;
  closeModal: () => void;
}

const { event, tournamentId, closeModal } = defineProps<Props>();

const { sendTravelData } = useEcologyStore();

const submittingForm = ref(false);

const form_data = reactive<{
  city: string;
  transportationMethod: TransportationMethod;
}>({
  city: '',
  transportationMethod: 'BIKE',
});

const form_rules = {
  city: { required, minLength: minLength(1), maxLength: maxLength(255) },
  transportationMethod: { required },
};

const v$ = useVuelidate(form_rules, form_data);

const handleSubmit = async () => {
  submittingForm.value = true;
  const isValid = await v$.value.$validate();
  if (!isValid) {
    submittingForm.value = false;
    return;
  }

  const success = await sendTravelData({
    tournament: tournamentId,
    city: form_data.city,
    transportation_method: form_data.transportationMethod,
    event,
  });

  if (success) closeModal();

  submittingForm.value = false;
};
</script>

<template>
  <Modal>
    <template #icon>
      <fa-awesome-icon class="m-auto color-correct-1" icon="fa-solid fa-leaf"/>
    </template>
    <template #title>
      <h3>
        Hello
      </h3>
    </template>
    <template #body>
      <p class="u-mt-1 max-w-2xl u-text-justify">
        Ce formulaire est facultatif, mais votre réponse nous serait très utile !
        En partageant <span class="u-bold">anonymement</span> votre ville de départ et le moyen
        de transport que vous comptez utiliser pour venir à la LAN, vous nous aidez à mieux
        estimer l’impact environnemental de l’évènement et à l’améliorer chaque année. Merci d’avance !
      </p>
      <form @submit.prevent="handleSubmit">
        <FormField v-slot="context" :validations="v$.city" class="u-mt-1 l-flex-column">
          <label for="city">Ville</label>
          <input
            id="city"
            v-model="form_data.city"
            type="text"
            name="city"
            placeholder="Nantes, Rennes, Paris..."
            required
            class="border-2 bg-theme-bg"
            :class="{ error: context.invalid }"
          />
        </FormField>
        <FormField v-slot="context" :validations="v$.transportationMethod" class="u-mt-1 l-flex-column">
          <label for="transportation_method">Méthode de transport</label>
          <select
            id="transportation_method"
            v-model="form_data.transportationMethod"
            name="transportation_method"
            class="border-2 bg-inherit"
            :class="{ error: context.invalid }"
            @blur="v$.transportationMethod.$touch"
          >
            <option
              v-for="transportation_method in Object.keys(TRANSPORTATION_METHOD) as TransportationMethod[]"
              :key="transportation_method"
              :value="transportation_method"
            >
              {{ TRANSPORTATION_METHOD[transportation_method] }}
            </option>
          </select>
        </FormField>
      </form>
    </template>
    <template #buttons>
      <button
        class="c-btn-bg-3"
        type="button"
        :disabled="submittingForm"
        @click="closeModal"
      >
        Ne pas répondre
      </button>
      <button
        class="c-btn-secondary"
        type="submit"
        :disabled="submittingForm"
        @click="handleSubmit"
      >
        {{ submittingForm ? 'Envoi...' : 'Envoyer' }}
      </button>
    </template>
  </Modal>
</template>

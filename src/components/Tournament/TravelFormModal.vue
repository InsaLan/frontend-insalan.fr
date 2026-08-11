<script setup lang="ts">
import useVuelidate from '@vuelidate/core';
import { maxLength, minLength, required } from '@vuelidate/validators';
import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
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
const { t } = useI18n();

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
      <fa-awesome-icon class="u-color-correct-1" icon="fa-leaf"/>
    </template>
    <template #title>
      {{ t('components.tournament.travelFormModal.title') }}
    </template>
    <template #body>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <p v-html="t('components.tournament.travelFormModal.body')"/>
      <form class="u-mt-2" @submit.prevent="handleSubmit">
        <FormField :validations="v$.city">
          <label for="city">{{ t('components.tournament.travelFormModal.city') }}</label>
          <input
            id="city"
            v-model="form_data.city"
            type="text"
            name="city"
            placeholder="Nantes, Rennes, Paris..."
            required
          />
        </FormField>
        <FormField :validations="v$.transportationMethod">
          <label for="transportation_method">{{ t('components.tournament.travelFormModal.transportMethod') }}</label>
          <select
            id="transportation_method"
            v-model="form_data.transportationMethod"
            name="transportation_method"
            @blur="v$.transportationMethod.$touch"
          >
            <option
              v-for="transportation_method in TRANSPORTATION_METHOD"
              :key="transportation_method"
              :value="transportation_method"
            >
              {{ t(`components.tournament.travelFormModal.transportationMethods.${transportation_method}`) }}
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
        {{ t('components.tournament.travelFormModal.skip') }}
      </button>
      <button
        class="c-btn-secondary"
        type="submit"
        :disabled="submittingForm"
        @click="handleSubmit"
      >
        {{ submittingForm ? t('components.tournament.travelFormModal.sending') : t('components.tournament.travelFormModal.send') }}
      </button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import useVuelidate from '@vuelidate/core';
import { computed, reactive, ref } from 'vue';
import FormField from '@/components/FormField.vue';
import Modal from '@/components/Modal.vue';
import StringListInput from '@/components/StringListInput.vue';
import type { Pizza } from '@/models/pizza';
import { required } from '@/support/locales/errors.fr';

const props = defineProps<{
  title: string;
  pizza?: Pizza;
  validate: (name: string, ingredients: string[], allergens: string[], image: File | null) => Promise<boolean>;
  close: () => void;
}>();

const dataPizza = reactive({
  name: props.pizza?.name || '',
  ingredients: props.pizza?.ingredients || [],
  allergens: props.pizza?.allergens || [],
});
const rules_pizza = computed(() => ({
  name: { required },
  ingredients: {},
  allergens: {},
}));
const v$_pizza = useVuelidate(rules_pizza, dataPizza);

const pizzaImage = ref<File | null>(null);

const validate = async () => {
  const isValid = await v$_pizza.value.$validate();
  if (!isValid) return;

  if (await props.validate(dataPizza.name, dataPizza.ingredients, dataPizza.allergens, pizzaImage.value)) {
    props.close();
  }
};

const handleImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files) return;

  [pizzaImage.value] = target.files;
};
</script>

<template>
  <Modal @close="console.log('close')">
    <template #icon>
      <div/>
    </template>
    <template #title>
      <h3 id="modal-title" class="text-white-900 text-base font-semibold leading-6">
        {{ title }}
      </h3>
    </template>
    <template #body>
      <form class="mt-2 w-80 sm:w-96" @submit.prevent="validate">
        <FormField v-slot="context" :validations="v$_pizza.name" class="l-flex-column">
          <label for="pizza-name">Nom</label>
          <input
            id="pizza-name"
            v-model="dataPizza.name"
            type="text"
            required
            class="border-2 bg-theme-bg"
            placeholder="Nom"
            :class="{ error: context.invalid }"
          />
        </FormField>
        <FormField v-slot="context" :validations="v$_pizza.ingredients" class="mt-2">
          <label for="pizza-ingredients">Ingrédients</label>
          <StringListInput
            id="pizza-ingredients"
            v-model="dataPizza.ingredients"
            label="Ingrédients"
            placeholder="Ajouter un ingrédients"
            :error="context.invalid"
          />
        </FormField>
        <FormField v-slot="context" :validations="v$_pizza.ingredients" class="mt-2">
          <label for="pizza-ingredients">Allergènes</label>
          <StringListInput
            id="pizza-allergens"
            v-model="dataPizza.allergens"
            label="Allergènes"
            placeholder="Ajouter un allergènes"
            :error="context.invalid"
          />
        </FormField>
        <div class="mt-2 l-flex-column">
          <label for="pizza-image">Image</label>
          <input
            id="pizza-image"
            class="border-2 border-gray-500 p-2"
            accept="image/*"
            :onchange="handleImageChange"
            type="file"
          />
        </div>
      </form>
    </template>
    <template #buttons>
      <button
        class="c-btn-bg-3"
        type="button"
        @click="props.close"
      >
        Annuler
      </button>
      <button
        class="c-btn-secondary"
        type="submit"
        @click="validate"
      >
        Valider
      </button>
    </template>
  </Modal>
</template>

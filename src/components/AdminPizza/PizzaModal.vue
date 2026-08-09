<script setup lang="ts">
import useVuelidate from '@vuelidate/core';
import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import FormField from '@/components/FormField.vue';
import Modal from '@/components/Modal.vue';
import StringListInput from '@/components/StringListInput.vue';
import type { Pizza } from '@/models/pizza';
import { required } from '@/support/locales/errors.fr';

const props = defineProps<{
  title: string;
  pizza?: Pizza;
  validate: (name: string, ingredients: string[], allergens: string[], image: File | null) => Promise<boolean>;
}>();
const { t } = useI18n();

const emit = defineEmits<{
  (e: 'close'): void;
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
    emit('close');
  }
};

const handleImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files) return;

  [pizzaImage.value] = target.files;
};
</script>

<template>
  <Modal @close="emit('close')">
    <template #title>
      {{ title }}
    </template>
    <template #body>
      <form @submit.prevent="validate">
        <FormField :validations="v$_pizza.name">
          <label for="pizza-name">{{ t('content.components.AdminPizza.PizzaModal.name') }}</label>
          <input
            id="pizza-name"
            v-model="dataPizza.name"
            type="text"
            required
            :placeholder="t('content.components.AdminPizza.PizzaModal.name')"
          />
        </FormField>
        <FormField :validations="v$_pizza.ingredients">
          <label for="pizza-ingredients">{{ t('content.components.AdminPizza.PizzaModal.ingredients') }}</label>
          <StringListInput
            id="pizza-ingredients"
            v-model="dataPizza.ingredients"
            :label="t('content.components.AdminPizza.PizzaModal.ingredients')"
            :placeholder="t('content.components.AdminPizza.PizzaModal.addIngredient')"
          />
        </FormField>
        <FormField :validations="v$_pizza.ingredients">
          <label for="pizza-ingredients">{{ t('content.components.AdminPizza.PizzaModal.allergens') }}</label>
          <StringListInput
            id="pizza-allergens"
            v-model="dataPizza.allergens"
            :label="t('content.components.AdminPizza.PizzaModal.allergens')"
            :placeholder="t('content.components.AdminPizza.PizzaModal.addAllergen')"
          />
        </FormField>
        <div class="l-flex-column">
          <label for="pizza-image">{{ t('content.components.AdminPizza.PizzaModal.image') }}</label>
          <input
            id="pizza-image"
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
        @click="emit('close')"
      >
        {{ t('content.common.cancel') }}
      </button>
      <button
        class="c-btn-secondary"
        type="submit"
        @click="validate"
      >
        {{ t('content.common.validate') }}
      </button>
    </template>
  </Modal>
</template>

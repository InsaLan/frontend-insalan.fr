<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { storeToRefs } from 'pinia';
import { computed, reactive, ref } from 'vue';
import Multiselect from 'vue-multiselect';
import FormField from '@/components/FormField.vue';
import Modal from '@/components/Modal.vue';
import { PAYMENT_METHODS } from '@/models/order';
import type { AdminTimeslotDeref } from '@/models/timeslot';
import { useErrorStore } from '@/stores/error.store';
import { usePizzaStore } from '@/stores/pizza.store';

// error store
const errorStore = useErrorStore();
const { add_error } = errorStore;

// pizza store
const pizzaStore = usePizzaStore();
const { pizzaList, timeslotList } = storeToRefs(pizzaStore);
const {
  fetchNextTimeslot,
  frenchFormatFromDate,
  fetchAdminDetailTimeslot,
  fetchAllPizzas,
  addOrder,
  patchOrder,
  addTimeslot,
  deleteTimeslot,
  exportOrders,
} = pizzaStore;

const extend = ref(false);
const selected = ref(0);

const pizza_search = ref('');
const order_search = ref('');

const selectedPaymentMethod = ref('default');
const selectedType = ref('public');

const ValidatePizza = async () => {
  // check if payment method is selected
  const paymentMethod = selectedPaymentMethod.value;
  if (paymentMethod === 'default') {
    add_error('Veuillez choisir un moyen de paiement');
    return;
  }

  // check selected timeslot and inputs
  const selectedTimeslot = timeslotList.value[selected.value];
  const pseudo = (document.getElementById('InputPseudo') as HTMLInputElement)?.value || '';
  if (!pseudo) {
    add_error('Veuillez renseigner un pseudo');
    return;
  }
  const pizza: number[] = [];
  const type = selectedType.value;

  // get all pizza selected
  if (selectedTimeslot) {
    const pizzaIds = selectedTimeslot.pizza;
    pizzaIds.forEach((pizzaId) => {
      const pizzaQuantityInput = document.getElementById(`pizzaQuantity-${pizzaId}`);
      if (pizzaQuantityInput) {
        const quantity = parseInt((pizzaQuantityInput as HTMLInputElement)?.value || '', 10);
        for (let i = 0; i < quantity; i += 1) {
          pizza.push(pizzaId);
        }
      }
    });
  }

  // add the order
  await addOrder(selected.value, pizza, pseudo, type, paymentMethod);

  // reset all input value
  const pizzaQuantityInputs = document.querySelectorAll('input[type="number"]');
  pizzaQuantityInputs.forEach((pizzaQuantityInput) => {
    (pizzaQuantityInput as HTMLInputElement).value = '0';
  });
  (document.getElementById('InputPseudo') as HTMLInputElement).value = '';
};

// Create timeslot form validation
let data_create = reactive({
  delivery_time: '',
  pizza_max: 0,
  start: '',
  end: '',
  public: true,
  player_price: 0,
  staff_price: 0,
  external_price: 0,
  pizza_selection: [] as { id: number; name: string }[],
});
const rules_create = computed(() => ({
  delivery_time: {
    required,
  },
  pizza_max: {
    required,
  },
  start: {
    required,
  },
  end: {
    required,
  },
  player_price: {
    required,
  },
  staff_price: {
    required,
  },
  external_price: {
    required,
  },
  pizza_selection: {
    required,
  },
}));
let v$_create = useVuelidate(rules_create, data_create);
const showModal = ref(false);

// Open timeslot creation modal
const openModal = () => {
  showModal.value = true;
  // set all input value to same as selected timeslot
  data_create = reactive({
    delivery_time: new Date(timeslotList.value[selected.value]?.delivery_time || Date.now()).toLocaleTimeString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }),
    pizza_max: timeslotList.value[selected.value]?.pizza_max || 0,
    start: new Date(timeslotList.value[selected.value]?.start || Date.now()).toLocaleTimeString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }),
    end: new Date(timeslotList.value[selected.value]?.end || Date.now()).toLocaleTimeString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }),
    public: true,
    player_price: timeslotList.value[selected.value]?.player_price || 0,
    staff_price: timeslotList.value[selected.value]?.staff_price || 0,
    external_price: timeslotList.value[selected.value]?.external_price || 0,
    pizza_selection: timeslotList.value[selected.value]?.pizza.map((pizzaId: number) => ({
      id: pizzaId,
      name: pizzaList.value[pizzaId]?.name,
    })) || [],
  });
  v$_create = useVuelidate(rules_create, data_create);
};

const showDeleteModal = ref(false);
const selectedDelete = ref(0);

const validateModal = async () => {
  if (!v$_create.value.$errors.length) {
    const pizzaIds = data_create.pizza_selection.map((pizzaItem) => pizzaItem.id);
    await addTimeslot(
      data_create.delivery_time.replace(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/, '$3-$2-$1T$4:$5:00'),
      data_create.start.replace(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/, '$3-$2-$1T$4:$5:00'),
      data_create.end.replace(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/, '$3-$2-$1T$4:$5:00'),
      data_create.pizza_max,
      data_create.public,
      data_create.player_price,
      data_create.staff_price,
      data_create.external_price,
      pizzaIds,
    );
    showModal.value = false;
    if (selected.value === 0) {
      selected.value = (Object.values(timeslotList.value) as { id: number }[])[0]?.id;
    }
  }
};

await fetchAllPizzas();
await fetchNextTimeslot();
await fetchAdminDetailTimeslot();
if (Object.keys(timeslotList.value).length !== 0) {
  selected.value = (Object.values(timeslotList.value) as { id: number }[])[0]?.id;
}
</script>
<template>
  <div v-if="timeslotList && Object.keys(timeslotList).length > 0" class="flex flex-1 flex-col">
    <div
      class="absolute z-10 flex w-screen rounded-xl text-center text-3xl hover:cursor-pointer"
      :class="{ 'bg-black': extend }"
      @click="extend = !extend"
      @keydown.enter="extend = !extend"
    >
      <div class="flex-1">
        <div
          v-for="timeslot in timeslotList"
          :key="timeslot.id"
          class="flex flex-row hover:cursor-pointer"
          :class="{ hidden: !extend }"
          @click="selected = timeslot.id"
          @keydown.enter="selected = timeslot.id"
        >
          <div class="m-2 flex-1">
            Créneau {{ frenchFormatFromDate(new Date(timeslot.delivery_time)) }}
            <fa-awesome-icon
              class="ml-2 text-red-500"
              icon="fa-trash-can"
              @click.stop="showDeleteModal = true; selectedDelete = timeslot.id"
            />
          </div>
        </div>
        <div class="flex flex-row hover:cursor-pointer" :class="{ hidden: !extend }">
          <div
            class="m-2 flex-1"
            @click="openModal"
            @keydown.enter="openModal"
          >
            Ajouter un créneau
            <fa-awesome-icon
              class="ml-2"
              icon="fa-circle-plus"
            />
          </div>
        </div>
      </div>
      <div>
        <div
          class="m-2
          hover:cursor-pointer"
        >
          <fa-awesome-icon
            v-if="extend"
            class="ml-2"
            icon="fa-chevron-up"
          />
          <fa-awesome-icon
            v-else
            class="ml-2"
            icon="fa-chevron-down"
          />
        </div>
      </div>
    </div>
    <div>
      <div
        class="flex w-screen rounded-xl bg-black text-center text-3xl"
      >
        <div class="m-2 flex-1">
          Créneau {{ frenchFormatFromDate(new Date(timeslotList[selected]?.delivery_time)) }}
        </div>
        <div
          class="m-2"
        >
          <fa-awesome-icon
            v-if="extend"
            class="ml-2"
            icon="fa-chevron-up"
          />
          <fa-awesome-icon
            v-else
            class="ml-2"
            icon="fa-chevron-down"
          />
        </div>
      </div>
    </div>
    <div class="m-2 flex flex-1 flex-col gap-5 md:flex-row" :class="{ blur: extend }">
      <div class="flex flex-1 flex-col">
        <div class="title my-2 text-center text-white">
          Liste des Pizzas disponibles
        </div>
        <form id="add_pizza" class="flex flex-1 flex-col gap-5">
          <div class="flex gap-2 rounded-2xl bg-gray-500 p-1 text-center text-black">
            <div class="flex flex-col">
              <fa-awesome-icon
                class="ml-2 flex-1"
                icon="fa-magnifying-glass"
              />
            </div>
            <div class="flex-1">
              <label for="searchPizza" class="sr-only">Rechercher une pizza</label>
              <input id="searchPizza" v-model="pizza_search" type="text" class="w-full rounded-xl border-2 border-black bg-gray-300 p-0 text-center" placeholder="Rechercher une pizza"/>
            </div>
          </div>
          <div class="grow overflow-y-auto bg-gray-300 text-center text-black md:h-px">
            <div v-for="pizza_id in timeslotList[selected]?.pizza" :key="pizza_id" class="flex flex-row justify-between">
              <div :class="{ hidden: !pizzaList[pizza_id]?.name.toLowerCase().includes(pizza_search.toLowerCase()) }" class="flex flex-1 border-b-2 border-black">
                <label :for="'pizzaQuantity-' + pizza_id" class="flex flex-1 flex-col justify-center">
                  {{ pizzaList[pizza_id]?.name }}: {{ pizzaList[pizza_id]?.ingredients.join(', ') }}
                </label>
                <input :id="'pizzaQuantity-' + pizza_id" type="number" class="w-20 border-0 bg-gray-300 text-center" :value="0" min="0"/>
              </div>
            </div>
          </div>
          <div class="flex flex-col rounded-2xl bg-gray-500 text-center md:flex-row">
            <div class="flex-1">
              <label for="paymentMethod" class="sr-only">Payment Method</label>
              <select id="paymentMethod" v-model="selectedPaymentMethod" class="m-2 rounded-xl bg-gray-300 p-0 pl-2 pr-8 text-left text-black">
                <option value="default" selected>
                  Choisir un moyen de paiement
                </option>
                <option v-for="(value, key) in PAYMENT_METHODS" :key="key" :value="key">
                  {{ value }}
                </option>
              </select>
            </div>
            <div class="flex-1">
              <label for="paymentMethod" class="sr-only">Type de commande</label>
              <select id="paymentMethod" v-model="selectedType" class="m-2 rounded-xl bg-gray-300 p-0 pl-2 pr-8 text-left text-black">
                <option value="public" selected>
                  publique
                </option>
                <option value="player">
                  Joueur
                </option>
                <option value="staff">
                  Staff
                </option>
              </select>
            </div>
            <div class="flex flex-1">
              <label for="InputPseudo" class="sr-only">Input Text</label>
              <input id="InputPseudo" type="text" class="m-2 flex-1 rounded-xl border-2 border-black bg-gray-300 p-0 text-center text-black" placeholder="Pseudo"/>
            </div>
            <div class="flex justify-center">
              <button type="submit" class="m-2 w-20 flex-1 rounded-xl bg-green-600 p-0 text-center text-white" @click.prevent="ValidatePizza">
                Ajouter
              </button>
            </div>
          </div>
        </form>
      </div>
      <div class="flex flex-1 flex-col">
        <div class="title my-2 rounded-xl text-center text-white" :class="{ 'bg-red-600': (timeslotList[selected] as AdminTimeslotDeref)?.orders.length >= timeslotList[selected]?.pizza_max }">
          Commandes : {{ (timeslotList[selected] as AdminTimeslotDeref)?.orders.length }} /
          {{ timeslotList[selected]?.pizza_max }}
          <fa-awesome-icon
            class="ml-2 hover:cursor-pointer"
            icon="fa-download"
            @click="exportOrders(selected)"
            @keydown.enter="exportOrders(selected)"
          />
        </div>
        <div class="flex flex-1 flex-col gap-5">
          <div class="flex gap-2 rounded-2xl bg-gray-500 p-1 text-center text-black">
            <div class="flex flex-col">
              <fa-awesome-icon
                class="ml-2 flex-1"
                icon="fa-magnifying-glass"
              />
            </div>
            <div class="flex-1">
              <label for="searchPizza" class="sr-only">Rechercher une commande</label>
              <input id="searchPizza" v-model="order_search" type="text" class="w-full rounded-xl border-2 border-black bg-gray-300 p-0 text-center" placeholder="Rechercher une commande"/>
            </div>
          </div>
          <div class="flex flex-1 flex-col">
            <div class="flex bg-gray-500 text-center text-2xl">
              <div class="flex-1">
                pseudo
              </div>
              <div class="flex-1">
                pizza
              </div>
              <div class="flex-1">
                récupéré
              </div>
            </div>
            <div class="flex grow flex-col overflow-y-auto bg-gray-300 text-black md:h-px">
              <div v-for="order in (timeslotList[selected] as AdminTimeslotDeref)?.orders" :key="order.id">
                <div v-if="order.user.toLowerCase().includes(order_search.toLowerCase())" class="align-center mx-2 my-1 flex flex-row justify-center rounded-xl bg-gray-200 text-center">
                  <div class="flex flex-1 items-center justify-center">
                    {{ order.user }}
                  </div>
                  <div class="flex-1 text-left">
                    {{ order.pizza?.map((pizzaId: number) => pizzaList[pizzaId]?.name).join(', ') }}
                  </div>
                  <div class="flex flex-1 flex-col items-center">
                    <label for="isTakenCheckbox-{{ order.id }}" class="flex flex-1 flex-col justify-center">
                      <input id="isTakenCheckbox-{{ order.id }}" type="checkbox" class="h-5 w-5 bg-gray-300" :value="order.delivered" :checked="order.delivered" @change="patchOrder(selected, order.id, !order.delivered)"/>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            class="flex flex-col rounded-2xl bg-gray-500 text-center md:flex-row"
            :class="{
              'bg-red-600': new Date(timeslotList[selected]?.end) < new Date(),
            }"
          >
            <div class="flex flex-1">
              <div
                class="m-1 flex flex-1 justify-center text-center text-2xl text-black"
                :class="{
                  invisible: new Date(timeslotList[selected]?.end) > new Date(),
                }"
              >
                L'heure de fin de commande est dépassée
                <div class="invisible border-2 border-red-600 p-4"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="">
    <div
      class="flex w-screen rounded-xl bg-black text-center text-3xl hover:cursor-pointer"
    >
      <div class="flex-1">
        <div class="flex flex-row hover:cursor-pointer">
          <div
            class="m-2 flex-1"
            @click="openModal"
            @keydown.enter="openModal"
          >
            Ajouter un créneau
            <fa-awesome-icon
              class="ml-2"
              icon="fa-circle-plus"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="mt-6 text-center text-4xl">
      Il n'y a pas de créneau de commande
    </div>
  </div>

  <Modal v-if="showModal" @close="showModal = false">
    <template #icon>
      <div/>
    </template>
    <template #title>
      <h3 id="modal-title" class="text-white-900 text-base font-semibold leading-6">
        Créer un créneau
      </h3>
    </template>
    <template #body>
      <form id="patch-user" class="mt-2 flex flex-col md:flex-row" @submit.prevent="validateModal">
        <div class="">
          <FormField
            v-slot="context"
            :validations="v$_create.delivery_time"
            class="m-2 flex flex-col"
            label="Date de livraison"
          >
            <label for="delivery_time">
              Date de livraison
            </label>
            <input
              v-model="data_create.delivery_time"
              aria-label="Date de livraison"
              class="border-2 bg-theme-bg"
              placeholder="2021-01-01 00:00"
              required
              type="text"
              :class="{ 'border-red-500': context.invalid }"
              @blur="v$_create.delivery_time.$touch"
            />
          </FormField>
          <FormField
            v-slot="context"
            :validations="v$_create.start"
            class="m-2 flex flex-col"
            label="Début de la commande"
          >
            <label for="start">
              Début de la commande
            </label>
            <input
              v-model="data_create.start"
              aria-label="Début de la commande"
              class="border-2 bg-theme-bg"
              placeholder="2021-01-01 00:00"
              required
              type="text"
              :class="{ 'border-red-500': context.invalid }"
              @blur="v$_create.delivery_time.$touch"
            />
          </FormField>
          <FormField
            v-slot="context"
            :validations="v$_create.end"
            class="m-2 flex flex-col"
            label="Fin de la commande"
          >
            <label for="end">
              Fin de la commande
            </label>
            <input
              v-model="data_create.end"
              aria-label="Fin de la commande"
              class="border-2 bg-theme-bg"
              placeholder="2021-01-01 00:00"
              required
              type="text"
              :class="{ 'border-red-500': context.invalid }"
              @blur="v$_create.delivery_time.$touch"
            />
          </formfield>
        </div>
        <div>
          <FormField
            v-slot="context"
            :validations="v$_create.player_price"
            class="m-2 flex flex-col"
            label="Prix pour les joueurs"
          >
            <label for="player_price">
              Prix pour les joueurs
            </label>
            <input
              v-model="data_create.player_price"
              aria-label="Prix pour les joueurs"
              class="border-2 bg-theme-bg"
              placeholder="0"
              required
              type="number"
              :class="{ 'border-red-500': context.invalid }"
              @blur="v$_create.player_price.$touch"
            />
          </FormField>
          <FormField
            v-slot="context"
            :validations="v$_create.staff_price"
            class="m-2 flex flex-col"
            label="Prix pour les staffs"
          >
            <label for="staff_price">
              Prix pour les staffs
            </label>
            <input
              v-model="data_create.staff_price"
              aria-label="Prix pour les staffs"
              class="border-2 bg-theme-bg"
              placeholder="0"
              required
              type="number"
              :class="{ 'border-red-500': context.invalid }"
              @blur="v$_create.staff_price.$touch"
            />
          </FormField>
          <FormField
            v-slot="context"
            :validations="v$_create.external_price"
            class="m-2 flex flex-col"
            label="Prix pour les externes"
          >
            <label for="external_price">
              Prix pour les externes
            </label>
            <input
              v-model="data_create.external_price"
              aria-label="Prix pour les externes"
              class="border-2 bg-theme-bg"
              placeholder="0"
              required
              type="number"
              :class="{ 'border-red-500': context.invalid }"
              @blur="v$_create.external_price.$touch"
            />
          </FormField>
        </div>
        <div>
          <FormField
            v-slot="context"
            :validations="v$_create.pizza_max"
            class="m-2 flex flex-col"
            label="Nombre de pizza maximum"
          >
            <label for="pizza_max">
              Nombre de pizza maximum
            </label>
            <input
              v-model="data_create.pizza_max"
              aria-label="Nombre de pizza maximum"
              class="border-2 bg-theme-bg"
              placeholder="0"
              required
              type="number"
              :class="{ 'border-red-500': context.invalid }"
              @blur="v$_create.pizza_max.$touch"
            />
          </FormField>
          <FormField
            v-slot="context"
            :validations="v$_create.pizza_selection"
            class="m-2 flex max-w-xs flex-col"
            label="Sélection de pizza"
          >
            <label for="pizza_selection">
              Sélection de pizza
            </label>
            <multiselect
              v-model="data_create.pizza_selection"
              :options="Object.values(pizzaList).map((pizza) => ({ id: pizza.id, name: pizza.name }))"
              :multiple="true"
              :close-on-select="false"
              :clear-on-select="false"
              :preserve-search="true"
              placeholder="Sélection de pizza"
              label="name"
              track-by="id"
              :preselect-first="false"
              :max-height="100"
              :class="{ 'border-red-500': context.invalid }"
              @blur="v$_create.pizza_selection.$touch"
            />
          </FormField>
        </div>
        <button class="hidden" type="submit"/>
      </form>
    </template>
    <template #buttons>
      <button
        class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
        type="submit"
        @click="validateModal"
      >
        Valider
      </button>
      <button
        class="inline-flex w-full justify-center rounded-md bg-gray-500 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-300 sm:mt-0 sm:w-auto"
        type="button"
        @click="showModal = false"
      >
        Annuler
      </button>
    </template>
  </Modal>

  <Modal v-if="showDeleteModal" @close="showDeleteModal = false">
    <template #icon>
      <div/>
    </template>
    <template #title>
      <h3 id="modal-title" class="text-white-900 text-base font-semibold leading-6">
        Supprimer un créneau
      </h3>
    </template>
    <template #body>
      <div class="m-2">
        Vous allez suppimer le créneau du {{
          frenchFormatFromDate(new Date(timeslotList[selectedDelete].delivery_time))
        }}
        <br/>
        ainsi que les {{ (timeslotList[selectedDelete] as AdminTimeslotDeref).orders.length }} commandes associées
        <br/>
        <br/>
        Ne supprimez pas un créneau terminé, les données seront perdues
      </div>
    </template>
    <template #buttons>
      <button
        class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
        type="submit"
        @click="
          showDeleteModal = false;
          if (Object.keys(timeslotList).length === 1) {
            selected = 0;
          } else if (selectedDelete === selected) {
            selected = Object.values(timeslotList).filter(timeslot => timeslot.id !== selectedDelete)[0]?.id;
          };
          extend = false;
          deleteTimeslot(timeslotList[selectedDelete].id);
        "
      >
        Valider
      </button>
      <button
        class="inline-flex w-full justify-center rounded-md bg-gray-500 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-300 sm:mt-0 sm:w-auto"
        type="button"
        @click="showDeleteModal = false"
      >
        Annuler
      </button>
    </template>
  </Modal>
</template>
<style src="vue-multiselect/dist/vue-multiselect.css"></style>

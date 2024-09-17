<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { storeToRefs } from 'pinia';
import { computed, reactive, ref } from 'vue';
import Multiselect from 'vue-multiselect';
import FormField from '@/components/FormField.vue';
import Modal from '@/components/Modal.vue';
import { type Payment, PAYMENT_METHODS } from '@/models/order';
import type { AdminTimeslotDeref } from '@/models/timeslot';
import { useErrorStore } from '@/stores/error.store';
import { usePizzaStore } from '@/stores/pizza.store';

const { add_error } = useErrorStore();

const pizzaStore = usePizzaStore();
const { pizzaList, timeslotList } = storeToRefs(pizzaStore);
const {
  fetchNextTimeslots,
  frenchFormatFromDate,
  fetchAdminDetailTimeslot,
  fetchAllPizzas,
  addOrder,
  patchOrder,
  addTimeslot,
  deleteTimeslot,
  exportOrders,
} = pizzaStore;

enum OrderType {
  PUBLIC = 'public',
  PLAYER = 'player',
  STAFF = 'staff',
}

const orderTypeToString = {
  [OrderType.PUBLIC]: 'Publique',
  [OrderType.PLAYER]: 'Joueur',
  [OrderType.STAFF]: 'Staff',
};

const extend = ref(false);
const selectedTimeslotId = ref(0);

const pizzaSearch = ref('');
const orderSearch = ref('');

const selectedPaymentMethod = ref<Payment | 'default'>('default');
const selectedOrderType = ref(OrderType.PUBLIC);

const pseudo = ref('');

const showConfirmationModal = ref(false);

const pizzaQuantities = computed(() => {
  if (!showConfirmationModal.value) return {};

  const quantities: { [key: number]: number } = {};
  timeslotList.value[selectedTimeslotId.value].pizza.forEach((pizzaId) => {
    const pizzaQuantityInput = document.getElementById(`pizzaQuantity-${pizzaId}`);
    const quantity = parseInt((pizzaQuantityInput as HTMLInputElement)?.value || '', 10);
    if (quantity) {
      quantities[pizzaId] = quantity;
    }
  });
  return quantities;
});

const totalPrice = computed(() => {
  let unitPrice: number;
  if (selectedOrderType.value === OrderType.PUBLIC) {
    unitPrice = timeslotList.value[selectedTimeslotId.value].external_price;
  } else if (selectedOrderType.value === OrderType.PLAYER) {
    unitPrice = timeslotList.value[selectedTimeslotId.value].player_price;
  } else if (selectedOrderType.value === OrderType.STAFF) {
    unitPrice = timeslotList.value[selectedTimeslotId.value].staff_price;
  } else {
    throw new Error('unreachable');
  }
  const pizzaCount = Object.values(pizzaQuantities.value)
    .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  return unitPrice * pizzaCount;
});

const validatePizza = () => {
  // check if payment method is selected
  if (selectedPaymentMethod.value === 'default') {
    add_error('Veuillez choisir un moyen de paiement');
    return;
  }

  if (!pseudo.value) {
    add_error('Veuillez renseigner un pseudo');
    return;
  }

  const selectedTimeslot = timeslotList.value[selectedTimeslotId.value];

  // check if there is at least one pizza in the order
  const hasPizza = selectedTimeslot.pizza.some((pizzaId) => {
    const pizzaQuantityInput = document.getElementById(`pizzaQuantity-${pizzaId}`);
    const quantity = parseInt((pizzaQuantityInput as HTMLInputElement)?.value || '', 10);
    return quantity > 0;
  });

  if (!hasPizza) {
    add_error('Veuillez ajouter au moins une pizza');
    return;
  }

  showConfirmationModal.value = true;
};

const sendOrder = async () => {
  showConfirmationModal.value = false;

  const pizza: number[] = [];
  const selectedTimeslot = timeslotList.value[selectedTimeslotId.value];

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

  await addOrder(selectedTimeslotId.value, pizza, pseudo.value, selectedOrderType.value, selectedPaymentMethod.value);

  // reset all input value
  const pizzaQuantityInputs = document.querySelectorAll('input[type="number"]');
  pizzaQuantityInputs.forEach((pizzaQuantityInput) => {
    (pizzaQuantityInput as HTMLInputElement).value = '0';
  });
  pseudo.value = '';
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
    delivery_time: new Date(timeslotList.value[selectedTimeslotId.value]?.delivery_time || Date.now()).toLocaleTimeString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }),
    pizza_max: timeslotList.value[selectedTimeslotId.value]?.pizza_max || 0,
    start: new Date(timeslotList.value[selectedTimeslotId.value]?.start || Date.now()).toLocaleTimeString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }),
    end: new Date(timeslotList.value[selectedTimeslotId.value]?.end || Date.now()).toLocaleTimeString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }),
    public: true,
    player_price: timeslotList.value[selectedTimeslotId.value]?.player_price || 0,
    staff_price: timeslotList.value[selectedTimeslotId.value]?.staff_price || 0,
    external_price: timeslotList.value[selectedTimeslotId.value]?.external_price || 0,
    pizza_selection: timeslotList.value[selectedTimeslotId.value]?.pizza.map((pizzaId: number) => ({
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
    const dateFormat: string = '$3-$2-$1T$4:$6:00';
    const dateRegexp: RegExp = /(\d{2})\/(\d{2})\/(\d{4}) (\d{2})(:|h)(\d{2})/;
    await addTimeslot(
      data_create.delivery_time.replace(dateRegexp, dateFormat),
      data_create.start.replace(dateRegexp, dateFormat),
      data_create.end.replace(dateRegexp, dateFormat),
      data_create.pizza_max,
      data_create.public,
      data_create.player_price,
      data_create.staff_price,
      data_create.external_price,
      pizzaIds,
    );
    showModal.value = false;
    if (selectedTimeslotId.value === 0) {
      selectedTimeslotId.value = (Object.values(timeslotList.value) as { id: number }[])[0]?.id;
    }
  }
};

await fetchAllPizzas();
await fetchNextTimeslots();
await fetchAdminDetailTimeslot();
if (Object.keys(timeslotList.value).length !== 0) {
  const timeslots = Object.values(timeslotList.value) as { id: number; delivery_time: Date }[];
  const now = new Date(Date.now());
  let timeslot = timeslots[0];
  for (let i = 1; i < timeslots.length; i += 1) {
    const date = new Date(timeslots[i].delivery_time);
    const timeslotDate = new Date(timeslot.delivery_time);
    if (now < date) {
      if (timeslotDate < now || date < timeslotDate) {
        timeslot = timeslots[i];
      }
    } else if (timeslotDate < now && timeslotDate < date) {
      timeslot = timeslots[i];
    }
  }
  selectedTimeslotId.value = timeslot.id;
}

const pizzaCount = computed(() => {
  const timeslot = (timeslotList.value[selectedTimeslotId.value] as AdminTimeslotDeref);
  return timeslot.orders.reduce((accumulator, currentValue): number => accumulator + currentValue.pizza.length, 0);
});

const handleWheel = (event: WheelEvent) => {
  if (event.target === null) return;

  const target = event.target as HTMLInputElement;
  target.blur();
};
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
          @click="selectedTimeslotId = timeslot.id"
          @keydown.enter="selectedTimeslotId = timeslot.id"
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
          Créneau {{ frenchFormatFromDate(new Date(timeslotList[selectedTimeslotId]?.delivery_time)) }}
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
              <input id="searchPizza" v-model="pizzaSearch" type="text" class="w-full rounded-xl border-2 border-black bg-gray-300 p-0 text-center" placeholder="Rechercher une pizza"/>
            </div>
          </div>
          <div class="grow overflow-y-auto bg-gray-300 text-center text-black md:h-px">
            <div v-for="pizzaId in timeslotList[selectedTimeslotId]?.pizza" :key="pizzaId" class="flex flex-row justify-between">
              <div :class="{ hidden: !pizzaList[pizzaId]?.name.toLowerCase().includes(pizzaSearch.toLowerCase()) }" class="flex flex-1 border-b-2 border-black">
                <label :for="'pizzaQuantity-' + pizzaId" class="flex flex-1 flex-col justify-center">
                  {{ pizzaList[pizzaId]?.name }}: {{ pizzaList[pizzaId]?.ingredients.join(', ') }}
                </label>
                <input :id="'pizzaQuantity-' + pizzaId" type="number" class="w-20 border-0 bg-gray-300 text-center" :value="0" min="0" @wheel="handleWheel"/>
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
              <label for="order-type" class="sr-only">Type de commande</label>
              <select id="order-type" v-model="selectedOrderType" class="m-2 rounded-xl bg-gray-300 p-0 pl-2 pr-8 text-left text-black">
                <option v-for="type in OrderType" :key="type" :value="type">
                  {{ orderTypeToString[type] }}
                </option>
              </select>
            </div>
            <div class="flex flex-1">
              <label for="InputPseudo" class="sr-only">Input Text</label>
              <input id="InputPseudo" v-model="pseudo" type="text" class="m-2 flex-1 rounded-xl border-2 border-black bg-gray-300 p-0 text-center text-black" placeholder="Pseudo"/>
            </div>
            <div class="flex justify-center">
              <button type="submit" class="m-2 w-20 flex-1 rounded-xl bg-green-600 p-0 text-center text-white" @click.prevent="validatePizza">
                Ajouter
              </button>
            </div>
          </div>
        </form>
      </div>
      <div class="flex flex-1 flex-col">
        <div class="title my-2 rounded-xl text-center text-white" :class="{ 'bg-red-600': pizzaCount >= timeslotList[selectedTimeslotId]?.pizza_max }">
          Commandes : {{ pizzaCount }} /
          {{ timeslotList[selectedTimeslotId]?.pizza_max }}
          <fa-awesome-icon
            class="ml-2 hover:cursor-pointer"
            icon="fa-download"
            @click="exportOrders(selectedTimeslotId)"
            @keydown.enter="exportOrders(selectedTimeslotId)"
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
              <input id="searchPizza" v-model="orderSearch" type="text" class="w-full rounded-xl border-2 border-black bg-gray-300 p-0 text-center" placeholder="Rechercher une commande"/>
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
              <div v-for="order in (timeslotList[selectedTimeslotId] as AdminTimeslotDeref)?.orders" :key="order.id">
                <div v-if="order.user.toLowerCase().includes(orderSearch.toLowerCase())" class="align-center mx-2 my-1 flex flex-row justify-center rounded-xl bg-gray-200 text-center">
                  <div class="flex flex-1 items-center justify-center">
                    {{ order.user }}
                  </div>
                  <div class="flex-1 text-left">
                    {{ order.pizza?.map((pizzaId: number) => pizzaList[pizzaId]?.name).join(', ') }}
                  </div>
                  <div class="flex flex-1 flex-col items-center">
                    <label for="isTakenCheckbox-{{ order.id }}" class="flex flex-1 flex-col justify-center">
                      <input id="isTakenCheckbox-{{ order.id }}" type="checkbox" class="h-5 w-5 bg-gray-300" :value="order.delivered" :checked="order.delivered" @change="patchOrder(selectedTimeslotId, order.id, !order.delivered)"/>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            class="flex flex-col rounded-2xl bg-gray-500 text-center md:flex-row"
            :class="{
              'bg-red-600': new Date(timeslotList[selectedTimeslotId]?.end) < new Date(),
            }"
          >
            <div class="flex flex-1">
              <div
                class="m-1 flex flex-1 justify-center text-center text-2xl text-black"
                :class="{
                  invisible: new Date(timeslotList[selectedTimeslotId]?.end) > new Date(),
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
            selectedTimeslotId = 0;
          } else if (selectedDelete === selectedTimeslotId) {
            selectedTimeslotId = Object.values(timeslotList).filter(timeslot => timeslot.id !== selectedDelete)[0]?.id;
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

  <Modal v-if="showConfirmationModal" @close="showConfirmationModal = false">
    <template #icon>
      <div/>
    </template>
    <template #title>
      <h3 id="modal-title" class="text-white-900 text-base font-semibold leading-6">
        Résumé de la commande
      </h3>
    </template>
    <template #body>
      <div class="m-2 text-left">
        <p>Pseudo : {{ pseudo }} </p>
        <p>Type de command : {{ orderTypeToString[selectedOrderType] }}</p>
        <p>Pizza{{ Object.values(pizzaQuantities).reduce((acc, val) => acc + val) > 1 ? 's' : '' }} :</p>
        <ul>
          <li v-for="(quantity, pizzaId) in pizzaQuantities" :key="pizzaId">
            - {{ quantity }} x {{ pizzaList[pizzaId].name }}
          </li>
        </ul>
        <p>Méthode de paiement : {{ PAYMENT_METHODS[selectedPaymentMethod as Payment] }}</p>
        <p>Total : {{ totalPrice }} €</p>
      </div>
    </template>
    <template #buttons>
      <button
        class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
        type="submit"
        @click="sendOrder"
      >
        Valider
      </button>
      <button
        type="button"
        class="inline-flex w-full justify-center rounded-md bg-gray-500 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-300 sm:mt-0 sm:w-auto"
        @click="showConfirmationModal = false"
      >
        Annuler
      </button>
    </template>
  </Modal>
</template>
<style src="vue-multiselect/dist/vue-multiselect.css"></style>

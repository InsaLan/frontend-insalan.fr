<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import { storeToRefs } from 'pinia';
import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Multiselect from 'vue-multiselect';
import FormField from '@/components/FormField.vue';
import Modal from '@/components/Modal.vue';
import { type Payment, PAYMENT_METHODS } from '@/models/order';
import type { AdminTimeslotDeref } from '@/models/timeslot';
import { useNotificationStore } from '@/stores/notification.store';
import { usePizzaStore } from '@/stores/pizza.store';
import { required } from '@/support/locales/errors.fr';
import { frenchFormatFromDate } from '@/utils';

const { addNotification } = useNotificationStore();
const { t } = useI18n();

const pizzaStore = usePizzaStore();
const { pizzaList, timeslotList } = storeToRefs(pizzaStore);
const {
  fetchNextTimeslots,
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
  [OrderType.PUBLIC]: 'Public',
  [OrderType.PLAYER]: 'Joueur·euse',
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
    addNotification('Veuillez choisir un moyen de paiement', 'error');
    return;
  }

  if (!pseudo.value) {
    addNotification('Veuillez renseigner un pseudo', 'error');
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
    addNotification('Veuillez ajouter au moins une pizza', 'error');
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

const factorise = (pizzas: number[]) => {
  const counts: Record<number, number> = {};
  pizzas.forEach((pizza) => {
    if (counts[pizza] === undefined) {
      counts[pizza] = 1;
    } else {
      counts[pizza] += 1;
    }
  });
  return Object.keys(counts).map((pizza) => {
    const pizzaId = parseInt(pizza, 10);
    if (counts[pizzaId] > 1) {
      return `${pizzaList.value[pizzaId].name} x${counts[pizzaId]}`;
    }
    return pizzaList.value[pizzaId].name;
  }).join(', ');
};
</script>
<template>
  <div v-if="timeslotList && Object.keys(timeslotList).length > 0" class="l-flex-column l-cross-center u-px-2 u-pb-2">
    <div
      v-if="extend"
      class="backdrop l-absolute-position"
      @click="extend = false"
      @keyup="extend = false"
    />

    <button
      class="c-btn-bg-2"
      type="button"
      @click="extend = !extend"
    >
      Créneau {{ frenchFormatFromDate(new Date(timeslotList[selectedTimeslotId]?.delivery_time)) }}
      <fa-awesome-icon
        class="c-inline-icon u-mr-0"
        icon="fa-chevron-down"
      />
    </button>
    <div
      class="ontop l-absolute-position u-text-center c-card-bg-3 u-p-0 l-gap-0"
      :class="{ 'u-hidden': !extend }"
      @click="extend = !extend"
      @keydown.enter="extend = !extend"
    >
      <div
        v-for="timeslot in timeslotList"
        :key="timeslot.id"
        type="button"
        class="l-flex-row l-cross-center u-full-width"
      >
        <button
          type="button"
          class="c-btn-bg-3 l-grow u-text-left"
          @click="selectedTimeslotId = timeslot.id"
        >
          Créneau {{ frenchFormatFromDate(new Date(timeslot.delivery_time)) }}
        </button>
        <button
          type="button"
          title="Supprimer le créneau"
          @click="showDeleteModal = true; selectedDelete = timeslot.id"
        >
          <fa-awesome-icon
            class="c-image-btn u-color-error-1 c-inline-icon u-mr-2"
            icon="fa-trash-can"
          />
        </button>
      </div>
      <button
        type="button"
        class="c-btn-secondary u-full-width"
        @click="openModal"
        @keydown.enter="openModal"
      >
        <fa-awesome-icon
          class="c-inline-icon"
          icon="fa-circle-plus"
        />
        Ajouter un créneau
      </button>
    </div>
    <div class="desktop-only-row u-mt-2 l-grow l-gap-2 u-full-width">
      <div class="l-flex-column l-gap-2 c-card-bg-2 u-full-width">
        <h2 class="u-text-center u-m-0">
          Nouvelle commande
        </h2>
        <div
          v-if="new Date(timeslotList[selectedTimeslotId]?.end) < new Date()"
          class="u-text-center c-card-error u-full-width"
        >
          <fa-awesome-icon
            class="c-inline-icon"
            icon="fa-warning"
          />
          <strong>L'heure de fin de commande est dépassée</strong>
        </div>
        <form id="add_pizza" class="l-flex-column l-gap-2 u-full-width">
          <label for="searchPizza" class="sr-only">Rechercher une pizza</label>
          <input id="searchPizza" v-model="pizzaSearch" type="text" placeholder="Rechercher une pizza"/>
          <div class="l-flex-column l-gap-1 reasonable-height">
            <div v-for="pizzaId in timeslotList[selectedTimeslotId]?.pizza" :key="pizzaId">
              <div v-if="pizzaList[pizzaId]?.name.toLowerCase().includes(pizzaSearch.toLowerCase())" class="l-flex-row l-cross-center l-gap-1">
                <label :for="`pizzaQuantity-${pizzaId}`" :title="pizzaList[pizzaId]?.ingredients.join(', ')" class="u-big-text">
                  {{ pizzaList[pizzaId]?.name }}
                </label>
                <div class="l-grow"/>
                <input :id="`pizzaQuantity-${pizzaId}`" type="number" class="number-width" :value="0" min="0" max="99" @wheel="handleWheel"/>
              </div>
            </div>
          </div>
          <div class="desktop-only-row l-cross-end u-text-center l-gap-1">
            <div class="l-grow">
              <label for="paymentMethod">{{ t('content.common.paymentMethod') }}</label>
              <select id="paymentMethod" v-model="selectedPaymentMethod">
                <option value="default" selected>
                  {{ t('content.common.choosePaymentMethod') }}
                </option>
                <option v-for="paymentMethod in PAYMENT_METHODS" :key="paymentMethod" :value="paymentMethod">
                  {{ t(`content.common.paymentMethods.${paymentMethod}`) }}
                </option>
              </select>
            </div>
            <div class="l-grow">
              <label for="order-type">Type de commande</label>
              <select id="order-type" v-model="selectedOrderType">
                <option v-for="type in OrderType" :key="type" :value="type">
                  {{ orderTypeToString[type] }}
                </option>
              </select>
            </div>
            <div class="l-grow">
              <label for="InputPseudo">Pseudo</label>
              <input id="InputPseudo" v-model="pseudo" type="text" placeholder="Pseudo"/>
            </div>
            <button type="submit" class="c-btn-secondary" @click.prevent="validatePizza">
              Ajouter
            </button>
          </div>
        </form>
      </div>
      <div class="l-flex-column l-gap-2 c-card-bg-2 u-full-width">
        <h2 class="u-text-center u-m-0">
          Commandes : {{ pizzaCount }} /
          {{ timeslotList[selectedTimeslotId]?.pizza_max }}
          <button
            type="button"
            title="Exporter les commandes"
            @click="exportOrders(selectedTimeslotId)"
          >
            <fa-awesome-icon
              class="c-inline-icon c-image-btn"
              icon="fa-download"
            />
          </button>
        </h2>
        <div
          v-if="pizzaCount > timeslotList[selectedTimeslotId]?.pizza_max"
          class="u-text-center c-card-error u-full-width"
        >
          <fa-awesome-icon
            class="c-inline-icon"
            icon="fa-warning"
          />
          <strong>Le nombre maximum de pizzas a été dépassé</strong>
        </div>
        <label for="searchPizza" class="sr-only">Rechercher une commande</label>
        <input id="searchPizza" v-model="orderSearch" type="text" placeholder="Rechercher une commande"/>
        <div class="l-flex-row u-text-center u-big-text c-card-bg-3 u-full-width u-bold">
          <div class="l-grow">
            Pseudo
          </div>
          <div class="l-grow">
            Pizza(s)
          </div>
          <div class="l-grow">
            Récupéré ?
          </div>
        </div>
        <div class="l-flex-column l-gap-1 u-full-width reasonable-height">
          <div v-for="order in (timeslotList[selectedTimeslotId] as AdminTimeslotDeref)?.orders" :key="order.id">
            <div v-if="order.user.toLowerCase().includes(orderSearch.toLowerCase())" class="l-flex-row l-cross-center u-text-center u-big-text">
              <div class="l-grow">
                {{ order.user }}
              </div>
              <div class="l-grow">
                {{ factorise(order.pizza) }}
              </div>
              <div class="l-flex-row l-grow l-main-center">
                <input id="isTakenCheckbox-{{ order.id }}" type="checkbox" class="size-5" :value="order.delivered" :checked="order.delivered" @change="patchOrder(selectedTimeslotId, order.id, !order.delivered)"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="l-flex-column l-cross-center u-py-2">
    <button
      type="button"
      class="c-btn-secondary"
      @click="openModal"
      @keydown.enter="openModal"
    >
      <fa-awesome-icon
        class="c-inline-icon"
        icon="fa-circle-plus"
      />
      Ajouter un créneau
    </button>
    <div class="u-m-text u-my-2 u-text-center u-big-text">
      Il n'y a pas de créneau de commande
    </div>
  </div>

  <Modal v-if="showModal" @close="showModal = false">
    <template #title>
      Créer un créneau
    </template>
    <template #body>
      <form id="patch-user" class="l-grid-3" @submit.prevent="validateModal">
        <div class="l-flex-column l-gap-2">
          <FormField
            :validations="v$_create.delivery_time"
          >
            <label for="delivery_time">
              Date de livraison
            </label>
            <input
              id="delivery_time"
              v-model="data_create.delivery_time"
              aria-label="Date de livraison"
              placeholder="2021-01-01 00:00"
              required
              type="text"
              @blur="v$_create.delivery_time.$touch"
            />
          </FormField>
          <FormField
            :validations="v$_create.start"
          >
            <label for="start">
              Début de la commande
            </label>
            <input
              id="start"
              v-model="data_create.start"
              aria-label="Début de la commande"
              placeholder="2021-01-01 00:00"
              required
              type="text"
              @blur="v$_create.delivery_time.$touch"
            />
          </FormField>
          <FormField
            :validations="v$_create.end"
          >
            <label for="end">
              Fin de la commande
            </label>
            <input
              id="end"
              v-model="data_create.end"
              aria-label="Fin de la commande"
              placeholder="2021-01-01 00:00"
              required
              type="text"
              @blur="v$_create.delivery_time.$touch"
            />
          </formfield>
        </div>
        <div class="l-flex-column l-gap-2">
          <FormField
            :validations="v$_create.player_price"
          >
            <label for="player_price">
              Prix pour les joueur·euse·s
            </label>
            <input
              id="player_price"
              v-model="data_create.player_price"
              aria-label="Prix pour les joueur·euse·s"
              placeholder="0"
              required
              type="number"
              @blur="v$_create.player_price.$touch"
            />
          </FormField>
          <FormField
            :validations="v$_create.staff_price"
          >
            <label for="staff_price">
              Prix pour le staff
            </label>
            <input
              id="staff_price"
              v-model="data_create.staff_price"
              aria-label="Prix pour le staff"
              placeholder="0"
              required
              type="number"
              @blur="v$_create.staff_price.$touch"
            />
          </FormField>
          <FormField
            :validations="v$_create.external_price"
          >
            <label for="external_price">
              Prix pour les externes
            </label>
            <input
              id="external_price"
              v-model="data_create.external_price"
              aria-label="Prix pour les externes"
              placeholder="0"
              required
              type="number"
              @blur="v$_create.external_price.$touch"
            />
          </FormField>
        </div>
        <div class="l-flex-column l-gap-2">
          <FormField
            :validations="v$_create.pizza_max"
          >
            <label for="pizza_max">
              Nombre de pizzas maximum
            </label>
            <input
              id="pizza_max"
              v-model="data_create.pizza_max"
              aria-label="Nombre de pizzas maximum"
              placeholder="0"
              required
              type="number"
              @blur="v$_create.pizza_max.$touch"
            />
          </FormField>
          <FormField
            :validations="v$_create.pizza_selection"
          >
            <label for="pizza_selection">
              Sélection de pizzas
            </label>
            <multiselect
              id="pizza_selection"
              v-model="data_create.pizza_selection"
              :options="Object.values(pizzaList).map((pizza) => ({ id: pizza.id, name: pizza.name }))"
              :multiple="true"
              :close-on-select="false"
              :clear-on-select="false"
              :preserve-search="true"
              placeholder="Sélection de pizzas"
              label="name"
              track-by="id"
              :preselect-first="false"
              :max-height="100"
              @blur="v$_create.pizza_selection.$touch"
            />
          </FormField>
        </div>
        <button class="u-hidden" type="submit"/>
      </form>
    </template>
    <template #buttons>
      <button
        class="c-btn-bg-3"
        type="button"
        @click="showModal = false"
      >
        Annuler
      </button>
      <button
        class="c-btn-secondary"
        type="submit"
        @click="validateModal"
      >
        Valider
      </button>
    </template>
  </Modal>

  <Modal v-if="showDeleteModal" @close="showDeleteModal = false">
    <template #title>
      Supprimer un créneau
    </template>
    <template #body>
      Vous allez suppimer le créneau du
      <strong>{{ frenchFormatFromDate(new Date(timeslotList[selectedDelete].delivery_time)) }}</strong>
      ainsi que les
      <strong>{{ (timeslotList[selectedDelete] as AdminTimeslotDeref).orders.length }}</strong>
      commandes associées.
      <br/>
      <br/>
      <em>Ne supprimez pas un créneau terminé, les données seront perdues.</em>
    </template>
    <template #buttons>
      <button
        class="c-btn-bg-3"
        type="button"
        @click="showDeleteModal = false"
      >
        Annuler
      </button>
      <button
        class="c-btn-secondary"
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
    </template>
  </Modal>

  <Modal v-if="showConfirmationModal" @close="showConfirmationModal = false">
    <template #title>
      Résumé de la commande
    </template>
    <template #body>
      <p>Pseudo : <strong>{{ pseudo }}</strong> </p>
      <p>Type de commande : <strong>{{ orderTypeToString[selectedOrderType] }}</strong></p>
      <p v-if="Object.values(pizzaQuantities).reduce((acc, val) => acc + val) <= 1">
        Pizza : <strong>{{ pizzaList[Number(Object.keys(pizzaQuantities)[0])]?.name }}</strong>
      </p>
      <div v-else>
        Pizzas :
        <ul>
          <li v-for="(quantity, pizzaId) in pizzaQuantities" :key="pizzaId">
            <strong>{{ quantity }} x {{ pizzaList[pizzaId].name }}</strong>
          </li>
        </ul>
      </div>
      <p>
        {{ t('content.common.paymentMethod') }}:
        <strong>{{ t(`content.common.paymentMethods.${selectedPaymentMethod as Payment}`) }}</strong>
      </p>
      <p>Total : <strong>{{ totalPrice }} €</strong></p>
    </template>
    <template #buttons>
      <button
        type="button"
        class="c-btn-bg-3"
        @click="showConfirmationModal = false"
      >
        Annuler
      </button>
      <button
        class="c-btn-secondary"
        type="submit"
        @click="sendOrder"
      >
        Valider
      </button>
    </template>
  </Modal>
</template>

<style src="vue-multiselect/dist/vue-multiselect.css"></style>

<style scoped>
.backdrop {
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  transition: opacity 0.2s;
}

.ontop {
  z-index: 10;
}

.number-width {
  width: 6rem;
}

.reasonable-height { /* yeah I could have done something cleaner, but I don't really care actually */
  overflow-y: scroll;
  max-height: 30vh;
}

@media (max-width: 50rem) {
  .desktop-only-row {
    display: flex;
    flex-direction: column;
  }
}

@media (min-width: 50rem) {
  .desktop-only-row {
    display: flex;
    flex-direction: row;
  }
}
</style>

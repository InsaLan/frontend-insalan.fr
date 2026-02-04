<script setup lang="ts">

import { storeToRefs } from 'pinia';
import { computed, reactive, ref } from 'vue';
import Modal from '@/components/Modal.vue';
import type { Export } from '@/models/timeslot';
import { usePizzaStore } from '@/stores/pizza.store';
import { frenchFormatFromDate } from '@/utils';

const pizzaStore = usePizzaStore();
const { timeslotList, timeslotExportList } = storeToRefs(pizzaStore);
const {
  fetchAllTimeslotsPaginated,
  fetchAdminDetailTimeslot,
  fetchTimeslotExports,
  deleteExport,
  downloadTimeslotDetails,
  exportOrders,
} = pizzaStore;

const timeslotsExpand = reactive<{ [key: number]: boolean }>({});
const exportToDelete = ref<Export | null>(null);

const closeConfirmDeleteModal = () => {
  exportToDelete.value = null;
};

const confirmDeleteExport = async () => {
  if (exportToDelete.value === null) return;

  await deleteExport(exportToDelete.value.id);
  closeConfirmDeleteModal();
};

const page = ref(1);
const max_pages = ref(1);
const timeslots_id = ref<number[]>([]);
const loading = ref(false);

const visiblePages = computed(() => {
  const pages = [];
  const totalVisible = 7;

  if (max_pages.value <= totalVisible) {
    for (let i = 1; i <= max_pages.value; i += 1) {
      pages.push(i);
    }
  } else {
    pages.push(1);

    if (page.value > 3) {
      pages.push('...');
    }

    let start = Math.max(2, page.value - 1);
    let end = Math.min(max_pages.value - 1, page.value + 1);

    if (page.value === 1) {
      end = Math.min(max_pages.value - 1, page.value + 2);
    } else if (page.value === max_pages.value) {
      start = Math.max(2, page.value - 2);
    }

    for (let i = start; i <= end; i += 1) {
      pages.push(i);
    }

    if (page.value < max_pages.value - 2) {
      pages.push('...');
    }

    pages.push(max_pages.value);
  }

  return pages;
});

const changePage = async (newPage: number) => {
  page.value = newPage;
  loading.value = true;

  const res = await fetchAllTimeslotsPaginated(page.value);
  await fetchAdminDetailTimeslot();
  await fetchTimeslotExports();

  timeslots_id.value = res.results.map((timeslot) => timeslot.id);
  max_pages.value = Math.floor(res.count / 10) + 1;

  loading.value = false;
};

await changePage(page.value);

Object.values(timeslotList.value).forEach((timeslot) => {
  timeslotsExpand[timeslot.id] = false;
});

</script>

<template>
  <h1 class="c-title">
    Liste des exports
  </h1>
  <div class="mb-6 mt-2 flex flex-col px-4">
    <div v-if="timeslots_id.length === 0" class="flex justify-center text-2xl">
      Il n'y a pas de créneau de commande.
    </div>
    <div
      v-else
      class="flex flex-col gap-2"
    >
      <!-- Loading spinner -->
      <div
        v-if="loading"
        class="flex justify-center"
      >
        <div class="flex w-full flex-1 flex-col items-center justify-center gap-5">
          <div class="text-2xl">
            Chargement...
          </div>
          <div role="status" aria-hidden="true" class="c-spinner"/>
        </div>
      </div>
      <div
        v-for="timeslot in Object.values(timeslotList).filter((timeslot) => timeslots_id.includes(timeslot.id))"
        v-else
        :key="timeslot.id"
        class="flex flex-col overflow-hidden rounded hover:cursor-pointer"
        :class="{
          'bg-cyan-900': timeslotExportList[timeslot.id].length > 0,
          'bg-gray-500': timeslotExportList[timeslot.id].length === 0,
        }"
      >
        <div
          class="flex select-none items-center gap-2 p-2"
          :class="{
            'hover:bg-cyan-800': timeslotExportList[timeslot.id].length > 0,
            'hover:bg-gray-400': timeslotExportList[timeslot.id].length === 0,
          }"
          @click="timeslotsExpand[timeslot.id] = !timeslotsExpand[timeslot.id]"
          @keydown.enter="timeslotsExpand[timeslot.id] = !timeslotsExpand[timeslot.id]"
        >
          <div class="flex size-8 items-center justify-center text-2xl">
            <fa-awesome-icon icon="fa-caret-right" :class="{ 'rotate-90': timeslotsExpand[timeslot.id] }"/>
          </div>
          <div
            v-if="timeslotExportList[timeslot.id].length > 0"
            class="flex size-8 items-center justify-center text-2xl"
            @click.stop="exportOrders(timeslot.id)"
            @keydown.enter="exportOrders(timeslot.id)"
          >
            <fa-awesome-icon icon="fa-download" class="text-white"/>
          </div>
          <div class="m-0 grow">
            Créneau {{ frenchFormatFromDate(new Date(timeslot.delivery_time)) }}
          </div>
          <div>
            Export{{ timeslotExportList[timeslot.id].length > 1 ? 's' : '' }}  : {{ timeslotExportList[timeslot.id].length }}
          </div>
        </div>
        <div
          v-if="timeslotExportList[timeslot.id].length === 0"
          class="flex items-center justify-center p-3"
          :class="{ hidden: !timeslotsExpand[timeslot.id] }"
        >
          Aucun export n'a été effectué pour ce créneau.
        </div>
        <div
          v-for="timeslotExport in timeslotExportList[timeslot.id]"
          :key="timeslotExport.id"
          class="ml-4 hover:bg-cyan-800"
          :class="{ hidden: !timeslotsExpand[timeslot.id] }"
          @click="downloadTimeslotDetails(timeslotExport.id)"
          @keydown.enter="downloadTimeslotDetails(timeslotExport.id)"
        >
          <div class="flex select-none items-center gap-2 p-2">
            <div class="flex size-8 items-center px-3">
              <fa-awesome-icon icon="fa-file"/>
            </div>
            <div class="m-0">
              Export {{ frenchFormatFromDate(new Date(timeslotExport.created_at)) }}
            </div>
            <div class="m-0 grow">
              | ({{ Object.values(timeslotExport.orders).reduce((acc, nb) => acc + nb, 0) }} pizzas)
            </div>
            <button
              type="button"
              class="size-8 rounded bg-red-600 hover:bg-red-500"
              title="Supprimer"
              @click.stop="exportToDelete = timeslotExport"
            >
              <fa-awesome-icon icon="fa-trash-can"/>
            </button>
          </div>
        </div>
      </div>
      <div class="flex items-center justify-center space-x-2">
        <button
          type="button"
          class="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          :disabled="page === 1"
          @click="changePage(page - 1)"
        >
          <fa-awesome-icon
            class="group-hover:rotate-180"
            icon="fa-arrow-left"
          />
        </button>

        <template v-for="(_page, index) in visiblePages" :key="index">
          <button
            v-if="typeof _page === 'number'"
            type="button"
            class="rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            :class="_page === page ? 'bg-indigo-600 text-white' : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'"
            @click="changePage(_page)"
          >
            {{ _page }}
          </button>
          <span v-else class="px-3 py-2 text-gray-500">...</span>
        </template>

        <button
          type="button"
          class="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          :disabled="page >= max_pages"
          @click="changePage(page + 1)"
        >
          <fa-awesome-icon
            class="group-hover:rotate-180"
            icon="fa-arrow-right"
          />
        </button>
      </div>
    </div>
  </div>

  <Modal v-if="exportToDelete">
    <template #icon>
      <div/>
    </template>
    <template #title>
      <div/>
      <h3 id="modal-title" class="text-white-900 text-base font-semibold leading-6">
        Supprimer un export
      </h3>
    </template>
    <template #body>
      <p class="mt-2 max-w-sm">
        Voulez-vous supprimer l'export du <span class="c-underline">{{ frenchFormatFromDate(new Date(exportToDelete.created_at)) }}</span> ?
      </p>
    </template>
    <template #buttons>
      <button
        class="c-btn-bg-3"
        type="button"
        @click="closeConfirmDeleteModal"
      >
        Annuler
      </button>
      <button
        class="c-btn-secondary"
        type="submit"
        @click="confirmDeleteExport"
      >
        Valider
      </button>
    </template>
  </Modal>
</template>

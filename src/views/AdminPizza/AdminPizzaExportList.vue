<script setup lang="ts">

import { storeToRefs } from 'pinia';
import { reactive, ref } from 'vue';
import Modal from '@/components/Modal.vue';
import type { Export } from '@/models/timeslot';
import { usePizzaStore } from '@/stores/pizza.store';
import { frenchFormatFromDate } from '@/utils';

const pizzaStore = usePizzaStore();
const { timeslotList, timeslotExportList } = storeToRefs(pizzaStore);
const {
  fetchNextTimeslots,
  fetchAdminDetailTimeslot,
  fetchTimeslotExports,
  deleteExport,
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

await fetchNextTimeslots();
await fetchAdminDetailTimeslot();
await fetchTimeslotExports();

Object.values(timeslotList.value).forEach((timeslot) => {
  timeslotsExpand[timeslot.id] = false;
});

</script>

<template>
  <h1 class="title">
    Liste des exports
  </h1>
  <div class="mb-6 mt-2 flex flex-col gap-2 px-4">
    <div
      v-for="timeslot in timeslotList"
      :key="timeslot.id"
      class="flex flex-col overflow-hidden rounded bg-cyan-900"
    >
      <div
        class="flex select-none items-center gap-2 p-2 hover:cursor-pointer hover:bg-cyan-800"
        @click="timeslotsExpand[timeslot.id] = !timeslotsExpand[timeslot.id]"
        @keydown.enter="timeslotsExpand[timeslot.id] = !timeslotsExpand[timeslot.id]"
      >
        <div class="flex size-8 items-center justify-center text-2xl">
          <fa-awesome-icon icon="fa-caret-right" :class="{ 'rotate-90': timeslotsExpand[timeslot.id] }"/>
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
      >
        <div class="flex select-none items-center gap-2 p-2">
          <div class="flex size-8 items-center px-3">
            <fa-awesome-icon icon="fa-file"/>
          </div>
          <div class="m-0 grow">
            Export {{ frenchFormatFromDate(new Date(timeslotExport.created_at)) }}
          </div>
          <button
            type="button"
            class="size-8 rounded bg-red-600 hover:bg-red-500"
            title="Supprimer"
            @click="exportToDelete = timeslotExport"
          >
            <fa-awesome-icon icon="fa-trash-can"/>
          </button>
        </div>
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
        Voulez-vous supprimer l'export du <span class="underline">{{ frenchFormatFromDate(new Date(exportToDelete.created_at)) }}</span> ?
      </p>
    </template>
    <template #buttons>
      <div class="flex w-full justify-center gap-4">
        <button
          class="rounded bg-gray-500 p-2 text-sm text-gray-900 hover:bg-gray-300"
          type="button"
          @click="closeConfirmDeleteModal"
        >
          Annuler
        </button>
        <button
          class="rounded bg-red-600 p-2 text-sm hover:bg-red-500"
          type="submit"
          @click="confirmDeleteExport"
        >
          Valider
        </button>
      </div>
    </template>
  </Modal>
</template>

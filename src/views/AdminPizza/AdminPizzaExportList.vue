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
  <div class="u-pb-2 l-flex-column u-m-main u-full-height">
    <h1>
      Liste des exports
    </h1>
    <div v-if="timeslots_id.length === 0" class="u-text-center u-big-text">
      Il n'y a pas de créneau de commande.
    </div>
    <div
      v-else
      class="l-flex-column l-gap-1 l-grow"
    >
      <div
        v-if="loading"
        class="l-flex-column l-main-center l-cross-center l-gap-2 l-grow"
      >
        <div class="u-big-text">
          Chargement...
        </div>
        <div role="status" aria-hidden="true" class="c-spinner"/>
      </div>

      <div
        v-for="timeslot in Object.values(timeslotList).filter((timeslot) => timeslots_id.includes(timeslot.id))"
        v-else
        :key="timeslot.id"
        class="l-flex-column c-card-bg-2 u-full-width"
        :class="{ 'u-color-text-2': timeslotExportList[timeslot.id].length === 0 }"
      >
        <div
          class="l-flex-row l-cross-center l-gap-1 u-full-width u-pr-1"
        >
          <button
            type="button"
            class="u-big-text"
            :class="{ 'c-image-btn': timeslotExportList[timeslot.id].length !== 0 }"
            title="Afficher les exports du créneau"
            :disabled="timeslotExportList[timeslot.id].length === 0"
            @click="timeslotsExpand[timeslot.id] = !timeslotsExpand[timeslot.id]"
            @keydown.enter="timeslotsExpand[timeslot.id] = !timeslotsExpand[timeslot.id]"
          >
            <fa-awesome-icon icon="fa-chevron-right" :class="{ rotate: timeslotsExpand[timeslot.id] }"/>
          </button>
          <button
            v-if="timeslotExportList[timeslot.id].length > 0"
            type="button"
            class="u-big-text c-image-btn"
            title="Exporter les commandes du créneau"
            @click="exportOrders(timeslot.id)"
            @keydown.enter="exportOrders(timeslot.id)"
          >
            <fa-awesome-icon icon="fa-download"/>
          </button>
          Créneau {{ frenchFormatFromDate(new Date(timeslot.delivery_time)) }}
          <div class="l-grow"/>
          {{ timeslotExportList[timeslot.id].length }} export{{ timeslotExportList[timeslot.id].length > 1 ? 's' : '' }}
        </div>
        <button
          v-for="timeslotExport in timeslotExportList[timeslot.id]"
          :key="timeslotExport.id"
          type="button"
          class="c-btn-bg-2 u-full-width l-flex-row l-cross-center l-gap-1 u-regular u-normal-text"
          :class="{ 'u-hidden': !timeslotsExpand[timeslot.id] }"
          title="Télécharger l'export"
          @click="downloadTimeslotDetails(timeslotExport.id)"
          @keydown.enter="downloadTimeslotDetails(timeslotExport.id)"
        >
          <fa-awesome-icon icon="fa-file"/>
          <strong> Export {{ frenchFormatFromDate(new Date(timeslotExport.created_at)) }} </strong>
          ({{ Object.values(timeslotExport.orders).reduce((acc, nb) => acc + nb, 0) }} pizza{{ Object.values(timeslotExport.orders).reduce((acc, nb) => acc + nb, 0) > 1 ? 's' : '' }})
          <div class="l-grow"/>
          <button
            type="button"
            class="c-image-btn u-color-error-1 u-big-text"
            title="Supprimer"
            @click.stop="exportToDelete = timeslotExport"
          >
            <fa-awesome-icon icon="fa-trash-can"/>
          </button>
        </button>
      </div>
      <div class="l-flex-row l-cross-center l-main-center l-gap-1 u-big-text u-mt-2">
        <button
          type="button"
          class="c-image-btn"
          :disabled="page === 1"
          title="Page précédente"
          @click="changePage(page - 1)"
        >
          <fa-awesome-icon
            icon="fa-chevron-left"
          />
        </button>

        <template v-for="(_page, index) in visiblePages" :key="index">
          <button
            v-if="typeof _page === 'number'"
            type="button"
            class="c-image-btn u-px-1"
            :disabled="_page === page"
            :title="`Page ${_page}`"
            @click="changePage(_page)"
          >
            {{ _page }}
          </button>
          <span v-else class="u-color-text-2 u-px-1">...</span>
        </template>

        <button
          type="button"
          class="c-image-btn"
          :disabled="page >= max_pages"
          title="Page suivante"
          @click="changePage(page + 1)"
        >
          <fa-awesome-icon
            icon="fa-chevron-right"
          />
        </button>
      </div>
    </div>
  </div>

  <Modal v-if="exportToDelete" @close="closeConfirmDeleteModal">
    <template #title>
      Supprimer un export
    </template>
    <template #body>
      Voulez-vous supprimer l'export du
      <strong>{{ frenchFormatFromDate(new Date(exportToDelete.created_at)) }}</strong> ?
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

<style scoped>
.rotate {
  transform: rotate(90deg);
  transition: transform 150ms ease-in-out;
}
</style>

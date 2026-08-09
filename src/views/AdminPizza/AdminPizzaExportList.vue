<script setup lang="ts">

import { storeToRefs } from 'pinia';
import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Modal from '@/components/Modal.vue';
import type { Export } from '@/models/timeslot';
import { usePizzaStore } from '@/stores/pizza.store';
import { frenchFormatFromDate } from '@/utils';

const pizzaStore = usePizzaStore();
const { t } = useI18n();
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
      {{ t('content.AdminPizza.exportsTitle') }}
    </h1>
    <div v-if="timeslots_id.length === 0" class="u-text-center u-big-text">
      {{ t('content.AdminPizza.noTimeslots') }}
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
          {{ t('content.components.App.loading') }}
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
            :title="t('content.AdminPizza.showTimeslotExports')"
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
            :title="t('content.AdminPizza.exportTimeslotOrders')"
            @click="exportOrders(timeslot.id)"
            @keydown.enter="exportOrders(timeslot.id)"
          >
            <fa-awesome-icon icon="fa-download"/>
          </button>
          {{ t('content.AdminPizza.timeslot', { date: frenchFormatFromDate(new Date(timeslot.delivery_time)) }) }}
          <div class="l-grow"/>
          {{ t('content.AdminPizza.exportCount', { count: timeslotExportList[timeslot.id].length }) }}
        </div>
        <div
          v-for="timeslotExport in timeslotExportList[timeslot.id]"
          :key="timeslotExport.id"
          type="button"
          class="c-card-bg-3 u-p-0 u-full-width l-flex-row l-cross-center l-gap-1 u-regular u-normal-text"
          :class="{ 'u-hidden': !timeslotsExpand[timeslot.id] }"
          :title="t('content.AdminPizza.downloadExport')"
        >
          <button
            type="button"
            class="c-btn-bg-3 l-grow l-flex-row l-cross-center l-gap-1 u-regular u-normal-text"
            @click="downloadTimeslotDetails(timeslotExport.id)"
          >
            <fa-awesome-icon icon="fa-file"/>
            <strong>{{ t('content.AdminPizza.export', { date: frenchFormatFromDate(new Date(timeslotExport.created_at)) }) }}</strong>
            ({{ t('content.AdminPizza.pizzaCount', { count: Object.values(timeslotExport.orders).reduce((acc, nb) => acc + nb, 0) }) }})
          </button>
          <button
            type="button"
            class="c-image-btn u-color-error-1 u-big-text u-mr-2"
            :title="t('content.common.delete')"
            @click.stop="exportToDelete = timeslotExport"
          >
            <fa-awesome-icon icon="fa-trash-can"/>
          </button>
        </div>
      </div>
      <div class="l-flex-row l-cross-center l-main-center l-gap-1 u-big-text u-mt-2">
        <button
          type="button"
          class="c-image-btn"
          :disabled="page === 1"
          :title="t('content.AdminPizza.previousPage')"
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
            :title="t('content.AdminPizza.page', { page: _page })"
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
          :title="t('content.AdminPizza.nextPage')"
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
      {{ t('content.AdminPizza.deleteExportTitle') }}
    </template>
    <template #body>
      {{ t('content.AdminPizza.deleteExportQuestion', { date: frenchFormatFromDate(new Date(exportToDelete.created_at)) }) }}
    </template>
    <template #buttons>
      <button
        class="c-btn-bg-3"
        type="button"
        @click="closeConfirmDeleteModal"
      >
        {{ t('content.common.cancel') }}
      </button>
      <button
        class="c-btn-secondary"
        type="submit"
        @click="confirmDeleteExport"
      >
        {{ t('content.common.validate') }}
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

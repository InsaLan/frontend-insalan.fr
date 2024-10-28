import axios from 'axios';
import { defineStore, storeToRefs } from 'pinia';
import { ref } from 'vue';
import type { Order } from '@/models/order';
import type { Pizza } from '@/models/pizza';
import type { AdminTimeslotDeref, Export, Timeslot } from '@/models/timeslot';
import { frenchFormatFromDate } from '@/utils';

import { useUserStore } from './user.store';

const { get_csrf } = useUserStore();
const { csrf } = storeToRefs(useUserStore());

export const usePizzaStore = defineStore('pizza', () => {
  const pizzaList = ref<Record<number, Pizza>>({});
  const timeslotList = ref<Record<number, Timeslot | AdminTimeslotDeref>>({});
  const timeslotExportList = ref<Record<number, Export[]>>({});

  async function fetchAllPizzas() {
    const res = await axios.get<Pizza[]>('/pizza/pizza/full');
    res.data.forEach((p: Pizza) => { pizzaList.value[p.id] = p; });
  }

  async function fetchAdminDetailTimeslot() {
    await Promise.all(Object.values(timeslotList.value).map(async (timeslot) => {
      const res = await axios.get<AdminTimeslotDeref>(`/pizza/timeslot/${timeslot.id}`);
      timeslotList.value[res.data.id] = res.data;
    }));
  }

  async function fetchNextTimeslots() {
    const res = await axios.get<Timeslot[]>('/pizza/timeslot/next');
    res.data.forEach((p: Timeslot) => { timeslotList.value[p.id] = p; });
  }

  async function deleteTimeslot(timeslotId: number) {
    await get_csrf();

    const res = await axios.delete(`/pizza/timeslot/${timeslotId}/`, {
      withCredentials: true,
      headers: {
        'X-CSRFToken': csrf.value,
      },
    });
    if (res.status === 204) {
      delete timeslotList.value[timeslotId];
    }
  }

  async function addTimeslot(
    delivery_time: string,
    start: string,
    end: string,
    pizza_max: number,
    is_public: boolean,
    player_price: number,
    staff_price: number,
    external_price: number,
    pizza: number[],
  ) {
    await get_csrf();

    // change date formats from 'dd/mm/yyyy hh:mm' to 'yyyy-mm-ddThh:mm:ss'
    const data = {
      delivery_time: new Date(delivery_time).toISOString(),
      start: new Date(start).toISOString(),
      end: new Date(end).toISOString(),
      pizza_max,
      public: is_public,
      player_price,
      staff_price,
      external_price,
      pizza,
    };
    const res = await axios.post<Timeslot>('/pizza/timeslot/', data, {
      withCredentials: true,
      headers: {
        'X-CSRFToken': csrf.value,
      },
    });
    if (res.status === 201) {
      timeslotList.value[res.data.id] = res.data;
    }
  }

  async function addOrder(timeslotId: number, pizza: number[], pseudo: string, type: string, payment_method: string) {
    await get_csrf();

    const data = {
      time_slot: timeslotId,
      pizza,
      user: pseudo,
      payment_method,
      type,
    };
    const res = await axios.post('/pizza/order/', data, {
      withCredentials: true,
      headers: {
        'X-CSRFToken': csrf.value,
      },
    });
    if (res.status === 201) {
      (timeslotList.value[timeslotId] as AdminTimeslotDeref).orders.push(res.data as Order);
    }
  }

  async function patchOrder(timeslotId: number, orderid: number, delivered: boolean) {
    await get_csrf();

    const data = {
      delivered,
    };
    const res = await axios.patch(`/pizza/order/${orderid}/`, data, {
      withCredentials: true,
      headers: {
        'X-CSRFToken': csrf.value,
      },
    });
    if (res.status === 200) {
      const order = (timeslotList.value[timeslotId] as AdminTimeslotDeref).orders.find((o) => o.id === orderid);
      if (order) {
        order.delivered = delivered;
      }
    }
  }

  async function fetchTimeslotExports() {
    await Promise.all(Object.values(timeslotList.value).map(async ({ id }) => {
      const res = await axios.get<Export[]>(`/pizza/timeslot/${id}/export`);
      timeslotExportList.value[id] = res.data;
    }));
  }

  async function deleteExport(exportId: number) {
    await get_csrf();

    const res = await axios.delete(`/pizza/export/${exportId}`, {
      withCredentials: true,
      headers: {
        'X-CSRFToken': csrf.value,
      },
    });

    if (res.status === 204) {
      Object.values(timeslotList.value).forEach(({ id }) => {
        for (let i = 0; i < timeslotExportList.value[id].length; i += 1) {
          if (timeslotExportList.value[id][i].id === exportId) {
            timeslotExportList.value[id].splice(i, 1);
          }
        }
      });
    }
  }

  async function exportOrders(timeslotId: number) {
    await get_csrf();

    const res = await axios.post<Export[]>(`/pizza/timeslot/${timeslotId}/export/`, {}, {
      withCredentials: true,
      headers: {
        'X-CSRFToken': csrf.value,
      },
    });
    if (res.status !== 200) {
      return;
    }
    const total: { [key: string]: number } = {};
    let data = '';
    data += `${frenchFormatFromDate(new Date(timeslotList.value[timeslotId].delivery_time))}\n`;
    let totalOrders = 0;
    let totalPizzas = 0;

    res.data.forEach((order) => {
      data += `export ${totalOrders + 1}\n`;
      Object.entries(order.orders).forEach(([pizza, quantity]: [string, number]) => {
        totalPizzas += quantity;
        if (total[pizza]) {
          total[pizza] += quantity;
        } else {
          total[pizza] = quantity;
        }
        data += `  - ${pizza} : ${quantity}\n`;
      });
      totalOrders += 1;
    });
    data += 'total\n';
    Object.entries(total).forEach(([pizza, quantity]) => {
      data += `  - ${pizza} : ${quantity}\n`;
    });
    data += `Nombre de pizza : ${totalPizzas}\n`;

    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `export_${frenchFormatFromDate(new Date(timeslotList.value[timeslotId].delivery_time))}.txt`);
    document.body.appendChild(link);
    link.click();
  }

  async function addPizza(
    name: string,
    ingredients: string[],
    allergens: string[],
    image: File | null,
  ) {
    await get_csrf();

    const data = {
      name,
      ingredients,
      allergens,
    };
    const res1 = await axios.post('/pizza/pizza/', data, {
      withCredentials: true,
      headers: {
        'X-CSRFToken': csrf.value,
      },
    });
    if (res1.status !== 201) return false;

    const res_data = res1.data as Pizza;
    pizzaList.value[res_data.id] = res_data;

    if (!image) return true;

    const formData = new FormData();
    if (image) formData.append('image', image, image.name);

    const res2 = await axios.patch(`/pizza/pizza/${res_data.id}/`, formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-CSRFToken': csrf.value,
      },
    });
    if (res2.status !== 200) return false;

    pizzaList.value[res_data.id].image = (res2.data as Pizza).image;

    return true;
  }

  async function patchPizza(
    pizzaId: number,
    name: string,
    ingredients: string[],
    allergens: string[],
    image: File | null,
  ) {
    await get_csrf();

    const data = {
      name,
      ingredients,
      allergens,
    };
    const res1 = await axios.patch(`/pizza/pizza/${pizzaId}/`, data, {
      withCredentials: true,
      headers: {
        'X-CSRFToken': csrf.value,
      },
    });
    if (res1.status !== 200) return false;

    const res_data = res1.data as Pizza;
    pizzaList.value[res_data.id].name = res_data.name;
    pizzaList.value[res_data.id].ingredients = res_data.ingredients;
    pizzaList.value[res_data.id].allergens = res_data.allergens;

    if (!image) return true;

    const formData = new FormData();
    if (image) formData.append('image', image, image.name);

    const res2 = await axios.patch(`/pizza/pizza/${pizzaId}/`, formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-CSRFToken': csrf.value,
      },
    });
    if (res2.status !== 200) return false;

    pizzaList.value[res_data.id].image = (res2.data as Pizza).image;

    return true;
  }

  async function deletePizza(pizzaId: number) {
    await get_csrf();

    const res = await axios.delete(`/pizza/pizza/${pizzaId}/`, {
      withCredentials: true,
      headers: {
        'X-CSRFToken': csrf.value,
      },
    });
    if (res.status === 204) {
      delete pizzaList.value[pizzaId];
    }
  }

  return {
    pizzaList,
    timeslotList,
    timeslotExportList,
    fetchAllPizzas,
    fetchNextTimeslots,
    fetchAdminDetailTimeslot,
    addOrder,
    patchOrder,
    addTimeslot,
    deleteTimeslot,
    fetchTimeslotExports,
    deleteExport,
    exportOrders,
    addPizza,
    patchPizza,
    deletePizza,
  };
});

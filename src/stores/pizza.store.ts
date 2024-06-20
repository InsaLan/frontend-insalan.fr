import axios from 'axios';
import { defineStore, storeToRefs } from 'pinia';
import { ref } from 'vue';
import type { Order } from '@/models/order';
import type { Pizza } from '@/models/pizza';
import type { AdminTimeslotDeref, Export, Timeslot } from '@/models/timeslot';

import { useUserStore } from './user.store';

const { get_csrf } = useUserStore();
const { csrf } = storeToRefs(useUserStore());

export const usePizzaStore = defineStore('pizza', () => {
  const pizzaList = ref<Record<number, Pizza>>({});
  const timeslotList = ref<Record<number, Timeslot | AdminTimeslotDeref>>({});

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

  function frenchFormatFromDate(date: Date): string {
    const mois: string[] = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const year = date.getFullYear();
    const dayNumber = date.getDate();
    const month = mois[date.getMonth()];
    const weekday = date.toLocaleDateString('fr-FR', { weekday: 'long' });
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${weekday} ${dayNumber} ${month} ${year} - ${hours}h${minutes}`;
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

  return {
    pizzaList,
    timeslotList,
    fetchAllPizzas,
    fetchNextTimeslots,
    frenchFormatFromDate,
    fetchAdminDetailTimeslot,
    addOrder,
    patchOrder,
    addTimeslot,
    deleteTimeslot,
    exportOrders,
  };
});

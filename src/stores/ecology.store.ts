import axios from 'axios';
import { defineStore, storeToRefs } from 'pinia';
import type { TravelData } from '@/models/travelData';

import { useUserStore } from './user.store';

const userStore = useUserStore();
const { get_csrf } = userStore;
const { csrf } = storeToRefs(userStore);

export const useEcologyStore = defineStore('ecology', () => {
  async function sendTravelData(travelData: TravelData): Promise<boolean> {
    await get_csrf();

    let response;
    try {
      response = await axios.post('/ecology/travel-data/', travelData, {
        withCredentials: true,
        headers: {
          'X-CSRFToken': csrf.value,
        },
      });
    } catch {
      return false;
    }

    return response.status === 201;
  }

  return {
    sendTravelData,
  };
});

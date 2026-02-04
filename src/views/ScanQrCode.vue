<script setup lang="ts">
import axios from 'axios';
import type { DetectedBarcode } from 'barcode-detector/pure';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { QrcodeStream } from 'vue-qrcode-reader';
import { type QRData, TicketStatus } from '@/models/tickets';
import { useNotificationStore } from '@/stores/notification.store';
import { useTournamentStore } from '@/stores/tournament.store';

const { addNotification } = useNotificationStore();

const tournamentStore = useTournamentStore();
const { get_unpaid_registration, validate_registration } = tournamentStore;
const { unpaidRegistration } = storeToRefs(tournamentStore);

const qrcodeData = ref<QRData | undefined>(undefined);
const paused = ref(false);
const torchActive = ref(false);
const torchNotSupported = ref<boolean | undefined>(undefined);

const search = ref('');

function paintOutline([detectedCode]: DetectedBarcode[], ctx: CanvasRenderingContext2D) {
  const [firstPoint, ...otherPoints] = detectedCode.cornerPoints;

  ctx.strokeStyle = 'red';

  ctx.beginPath();
  ctx.moveTo(firstPoint.x, firstPoint.y);
  otherPoints.forEach(({ x, y }) => ctx.lineTo(x, y));
  ctx.lineTo(firstPoint.x, firstPoint.y);
  ctx.closePath();
  ctx.stroke();
}

async function onDetect([detectedCode]: DetectedBarcode[]) {
  paused.value = true;
  if (detectedCode.rawValue.startsWith(`${window.location.origin}/v1/tickets/get/`)) {
    const url = detectedCode.rawValue.replace(`${window.location.origin}/v1`, '');
    const res = await axios.get<QRData>(url);
    qrcodeData.value = res.data;
  } else {
    paused.value = false;
  }
}

async function validate() {
  await axios.get(`/tickets/scan/${qrcodeData.value?.token}/`);
  paused.value = false;
  qrcodeData.value = undefined;
}

function cancel() {
  paused.value = false;
  qrcodeData.value = undefined;
}

const onError = (err: Error) => {
  if (err.name === 'NotAllowedError') {
    addNotification('Vous devez accorder l\'autorisation d\'accès à la caméra', 'error');
  } else if (err.name === 'NotFoundError') {
    addNotification('Pas d\'appareil photo sur cet appareil', 'error');
  } else if (err.name === 'NotSupportedError' || err.name === 'InsecureContextError') {
    addNotification('Contexte sécurisé requis (HTTPS, localhost)', 'error');
  } else if (err.name === 'NotReadableError') {
    addNotification('La caméra est-elle déjà utilisée ?', 'error');
  } else if (err.name === 'OverconstrainedError') {
    addNotification('Les caméras installées ne sont pas adaptées', 'error');
  } else {
    addNotification(err.message, 'error');
  }
};

const ticketStatus = computed(() => {
  switch (qrcodeData.value?.status) {
    case TicketStatus.CANCELLED:
      return 'Ticket annulé';
    case TicketStatus.SCANNED:
      return 'Ticket déjà scanné';
    case TicketStatus.VALID:
      return 'Ticket valide';
    default:
      return 'Erreur dans le scan du ticket';
  }
});

await get_unpaid_registration();

type TorchCapabilities = MediaTrackConstraints & { torch?: boolean };
</script>

<template>
  <section class="u-mx-2 l-flex-column l-items-cross-center l-gap-2">
    <qrcode-stream
      :paused="paused"
      :torch="torchActive"
      :track="paintOutline"
      @detect="onDetect"
      @error="onError"
      @camera-on="(capabilities: TorchCapabilities) => (torchNotSupported = !capabilities.torch)"
    >
      <button
        :disabled="torchNotSupported"
        type="button"
        @click="torchActive = !torchActive"
      >
        <fa-awesome-icon
          v-if="torchNotSupported === false"
          :class="torchActive ? 'text-green-500' : 'text-red-500'"
          class="ml-3 mt-3 text-5xl"
          icon="fa-solid fa-bolt"
        />
      </button>
    </qrcode-stream>

    <div v-if="qrcodeData">
      <p>Joueur : {{ qrcodeData.user }}</p>
      <p>Identité : {{ qrcodeData.identity }}</p>
      <p>Statut : {{ ticketStatus }}</p>
      <p>Tournois : {{ qrcodeData.tournament }}</p>
      <p>Equipe : {{ qrcodeData.team }}</p>
      <div class="mb-6 flex gap-7">
        <button
          v-if="qrcodeData.status === TicketStatus.VALID"
          type="button"
          class="form-btn"
          @click="validate"
        >
          Valider
        </button>
        <button
          type="button"
          class="form-btn bg-red-600"
          @click="cancel"
        >
          Annuler
        </button>
      </div>
    </div>
    <div v-else class="u-mb-2 l-flex-column max-h-[100px] u-full-width l-gap-1">
      <div class="flex l-gap-1 rounded-2xl bg-gray-500 p-1 u-text-center text-black">
        <div class="l-flex-column">
          <fa-awesome-icon
            class="u-ml-1 flex-1"
            icon="fa-magnifying-glass"
          />
        </div>
        <div class="flex-1">
          <label for="search" class="sr-only">Rechercher une inscription</label>
          <input id="search" v-model="search" type="text" class="u-full-width rounded-xl border-2 border-black bg-gray-300 p-0 u-text-center" placeholder="Rechercher une inscription non payé"/>
        </div>
      </div>
      <div v-if="search && unpaidRegistration.filter((registration) => registration.user.includes(search)).length > 0">
        <div class="rounded-2xl bg-green-600 u-text-center">
          {{ unpaidRegistration.filter((registration) => registration.user.includes(search))[0]?.user }} :
          {{ unpaidRegistration.filter((registration) => registration.user.includes(search))[0]?.team }}
        </div>
        <div class="flex l-items-main-center">
          <button
            type="button"
            class="form-btn"
            @click="
              validate_registration(
                unpaidRegistration.filter((registration) => registration.user.includes(search))[0]?.type,
                unpaidRegistration.filter((registration) => registration.user.includes(search))[0]?.id,
              );
              search = ''
            "
          >
            Valider le paiement de
            {{ unpaidRegistration.filter((registration) => registration.user.includes(search))[0]?.user }}
          </button>
        </div>
      </div>
      <div v-else-if="search" class="rounded-2xl bg-red-500 u-text-center">
        Aucune inscription trouvée
      </div>
    </div>
  </section>
</template>

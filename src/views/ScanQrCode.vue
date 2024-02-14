<script setup lang="ts">
import axios from 'axios';
import type { DetectedBarcode } from 'barcode-detector/pure';
import { computed, ref } from 'vue';
import { QrcodeStream } from 'vue-qrcode-reader';
import { type QRData, TicketStatus } from '@/models/tickets';
import { useErrorStore } from '@/stores/error.store';

const { add_error } = useErrorStore();

const qrcodeData = ref<QRData | undefined>(undefined);
const paused = ref(false);
const torchActive = ref(false);
const torchNotSupported = ref<boolean | undefined>(undefined);

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
  await axios.get(`/tickets/scan/${qrcodeData.value?.token}`);
  paused.value = false;
  qrcodeData.value = undefined;
}

function cancel() {
  paused.value = false;
  qrcodeData.value = undefined;
}

const onError = (err: Error) => {
  if (err.name === 'NotAllowedError') {
    add_error('Vous devez accorder l\'autorisation d\'accès à la caméra');
  } else if (err.name === 'NotFoundError') {
    add_error('Pas d\'appareil photo sur cet appareil');
  } else if (err.name === 'NotSupportedError' || err.name === 'InsecureContextError') {
    add_error('Contexte sécurisé requis (HTTPS, localhost)');
  } else if (err.name === 'NotReadableError') {
    add_error('La caméra est-elle déjà utilisée ?');
  } else if (err.name === 'OverconstrainedError') {
    add_error('Les caméras installées ne sont pas adaptées');
  } else {
    add_error(err.message);
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

type TorchCapabilities = MediaTrackConstraints & { torch?: boolean };
</script>

<template>
  <section class="mx-4 flex flex-col items-center gap-4">
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
      <p>Statut : {{ ticketStatus }}</p>
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
  </section>
</template>

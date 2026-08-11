<script setup lang="ts">
import axios from 'axios';
import type { DetectedBarcode } from 'barcode-detector/pure';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { QrcodeStream } from 'vue-qrcode-reader';
import { type QRData, TicketStatus } from '@/models/tickets';
import { useNotificationStore } from '@/stores/notification.store';
import { useTournamentStore } from '@/stores/tournament.store';

const { addNotification } = useNotificationStore();
const { t } = useI18n();

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

  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-secondary-1').trim() || 'red';

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
    addNotification(t('views.scanQrCode.cameraPermissionRequired'), 'error');
  } else if (err.name === 'NotFoundError') {
    addNotification(t('views.scanQrCode.noCameraDevice'), 'error');
  } else if (err.name === 'NotSupportedError' || err.name === 'InsecureContextError') {
    addNotification(t('views.scanQrCode.secureContextRequired'), 'error');
  } else if (err.name === 'NotReadableError') {
    addNotification(t('views.scanQrCode.cameraAlreadyInUse'), 'error');
  } else if (err.name === 'OverconstrainedError') {
    addNotification(t('views.scanQrCode.unsupportedCamera'), 'error');
  } else {
    addNotification(err.message, 'error');
  }
};

const ticketStatus = computed(() => {
  switch (qrcodeData.value?.status) {
    case TicketStatus.CANCELLED:
      return t('views.scanQrCode.ticketCancelled');
    case TicketStatus.SCANNED:
      return t('views.scanQrCode.ticketAlreadyScanned');
    case TicketStatus.VALID:
      return t('views.scanQrCode.ticketValid');
    default:
      return t('views.scanQrCode.ticketScanError');
  }
});

const filteredRegistrations = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return [];
  return unpaidRegistration.value.filter((registration) => registration.user.toLowerCase().includes(term));
});

await get_unpaid_registration();

type TorchCapabilities = MediaTrackConstraints & { torch?: boolean };
</script>

<template>
  <div class="u-m-main u-pb-2 l-flex-column l-cross-center l-main-center l-gap-2 u-full-height">
    <div class="camera u-rounded">
      <qrcode-stream
        :paused="paused"
        :torch="torchActive"
        :track="paintOutline"
        @detect="onDetect"
        @error="onError"
        @camera-on="(capabilities: TorchCapabilities) => (torchNotSupported = !capabilities.torch)"
      >
        <button
          v-if="torchNotSupported === false"
          type="button"
          @click="torchActive = !torchActive"
        >
          <fa-awesome-icon
            :class="torchActive ? 'u-color-text-1' : 'u-color-text-3'"
            class="u-m-2 u-huge-text"
            icon="fa-bolt"
          />
        </button>
      </qrcode-stream>
    </div>

    <div class="u-full-width">
      <div class="u-m-text">
        <div v-if="qrcodeData" class="c-card-bg-2 l-flex-column l-gap-2">
          <p>
            {{ $t('views.scanQrCode.player') }} {{ qrcodeData.user }} <br/>
            {{ $t('views.scanQrCode.identity') }} {{ qrcodeData.identity }} <br/>
            {{ $t('views.scanQrCode.status') }} {{ ticketStatus }} <br/>
            {{ $t('views.scanQrCode.tournament') }} {{ qrcodeData.tournament }} <br/>
            {{ $t('views.scanQrCode.team') }} {{ qrcodeData.team }}
          </p>
          <div class="l-flex-row l-main-center l-cross-center l-gap-2 u-full-width">
            <button
              type="button"
              class="c-btn-bg-3"
              @click="cancel"
            >
              {{ $t('views.scanQrCode.cancel') }}
            </button>
            <button
              :disabled="qrcodeData.status !== TicketStatus.VALID"
              type="button"
              class="c-btn-secondary"
              @click="validate"
            >
              {{ $t('views.scanQrCode.validate') }}
            </button>
          </div>
        </div>
        <div v-else class="l-flex-column u-full-width l-gap-1">
          <label for="search">{{ $t('views.scanQrCode.searchUnpaidRegistration') }}</label>
          <input
            id="search"
            v-model="search"
            type="text"
            :placeholder="$t('views.scanQrCode.usernamePlaceholder')"
          />
          <div v-if="search && filteredRegistrations.length > 0" class="l-flex-column l-gap-1">
            <div v-for="registration in filteredRegistrations" :key="registration.id" class="c-card-bg-3 u-full-width l-flex-row">
              {{ unpaidRegistration[0]?.user }} ({{ unpaidRegistration[0]?.team }})
              <div class="l-grow"/>
              <button
                type="button"
                class="c-btn-secondary u-normal-text"
                @click="
                  validate_registration(
                    registration.type,
                    registration.id,
                  );
                  search = ''
                "
              >
                {{ $t('views.scanQrCode.validatePayment') }}
              </button>
            </div>
          </div>
          <div v-else-if="search" class="c-card-error u-p-0 u-text-center u-full-width">
            {{ $t('views.scanQrCode.noRegistrationFound') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.camera {
  flex: 1 1 auto;
  width: 100%;
  max-width: min(100%, 100vmin);
  height: min(100%, 100vmin);
  overflow: hidden;
}
</style>

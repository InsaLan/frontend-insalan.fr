<script setup lang="ts">
import type { DetectedBarcode } from 'barcode-detector/pure';
import { ref } from 'vue';
import { QrcodeStream } from 'vue-qrcode-reader';
import { useErrorStore } from '@/stores/error.store';

const { add_error } = useErrorStore();

const scannedValue = ref('');
// const devices = ref<MediaDeviceInfo[]>([]);
// const selected = ref<string | null>(null);
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

function onDetect([detectedCode]: DetectedBarcode[]) {
  scannedValue.value = detectedCode.rawValue;
  // TODO if value == api.insalan.fr -> axios vers ce lien
  // value = retour d'axios
  // ajouter un btn valider
}

const onError = (err: Error) => {
  // TODO a traduire
  if (err.name === 'NotAllowedError') {
    add_error('You need to grant camera access permission');
  } else if (err.name === 'NotFoundError') {
    add_error('No camera on this device');
  } else if (err.name === 'NotSupportedError' || err.name === 'InsecureContextError') {
    add_error('Secure context required (HTTPS, localhost)');
  } else if (err.name === 'NotReadableError') {
    add_error('Is the camera already in use ?');
  } else if (err.name === 'OverconstrainedError') {
    add_error('Installed cameras are not suitable');
  } else if (err.name === 'StreamApiNotSupportedError') {
    add_error('Stream API is not supported in this browser');
  } else {
    add_error(err.message);
  }
};

// onMounted(async () => {
// // Trigger the camera permission request
// await navigator.mediaDevices.getUserMedia({ video: true });
// devices.value = (await navigator.mediaDevices.enumerateDevices()).filter(({ kind }) => kind === 'videoinput');
//
// if (devices.value.length > 0) {
//   // The last device is usually the best rear camera
//   selected.value = devices.value.at(-1)!.deviceId;
// }
// });
</script>

<template>
  <section class="mx-4 flex flex-col items-center gap-4">
    <!--    <div class="flex flex-col text-xl">-->
    <!--      <label for="device">Caméras</label>-->
    <!--      <select id="device" v-model="selected" class="text-black">-->
    <!--        <option-->
    <!--          v-for="device in devices"-->
    <!--          :key="device.label"-->
    <!--          :value="device.deviceId"-->
    <!--        >-->
    <!--          {{ device.label }}-->
    <!--        </option>-->
    <!--      </select>-->
    <!--    </div>-->

    <qrcode-stream
      :torch="torchActive"
      :track="paintOutline"
      @detect="onDetect"
      @error="onError"
      @camera-on="(capabilities) => (torchNotSupported = !capabilities.torch)"
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
    <p class="break-all">
      {{ scannedValue }}
    </p>
  </section>
</template>

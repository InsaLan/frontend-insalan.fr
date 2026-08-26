<script setup lang="ts">
defineProps<{
  bgColorLevel?: number;
  quantity1: number;
  max1: number;
  description1?: string;
  quantity2?: number;
  max2?: number;
  description2?: string;
}>();
</script>

<template>
  <div class="l-relative-position l-flex-row u-full-width u-full-height l-main-center l-cross-center u-rounded u-big-text" :class="`u-bg-bg-${bgColorLevel ?? 1}`">
    <template
      v-if="quantity2 !== undefined && max2 !== undefined"
    >
      <div
        class="tooltip-target u-rounded u-bg-primary-1"
        :style="{ width: `${max1 / (max1 + max2) * 100}%` }"
      >
        {{ quantity1 }}/{{ max1 }}
        <span
          role="tooltip"
          class="tooltip-text"
        >
          {{ quantity1 }}/{{ max1 }} {{ description1 }}
        </span>
      </div>
      <span
        class="tooltip-target"
        :style="{ width: `${max2 / (max1 + max2) * 100}%` }"
      >
        {{ quantity2 }}/{{ max2 }}
        <span
          role="tooltip"
          class="tooltip-text"
        >
          {{ quantity2 }}/{{ max2 }} {{ description2 }}
        </span>
      </span>
      <div
        class="progress-bar u-bg-secondary-1"
        :style="{ width: `${(quantity1 + quantity2) / (max1 + max2) * 100}%` }"
      />
    </template>
    <template
      v-else
    >
      <div
        class="progress-bar u-bg-primary-1"
        :style="{ width: `${(quantity1 / max1) * 100}%` }"
      />
      <span
        class="tooltip-target u-full-width"
      >
        {{ quantity1 }}/{{ max1 }}
        <span
          role="tooltip"
          class="tooltip-text"
        >
          {{ quantity1 }}/{{ max1 }} {{ description1 }}
        </span>
      </span>
    </template>
  </div>
</template>

<style scoped>
.progress-bar {
  position: absolute;
  left: 0;
  height: 100%;
  border-radius: var(--radius);
}

.tooltip-text {
  position: absolute;
  top: 3rem;
  opacity: 0;
  visibility: hidden;
  border-radius: var(--radius);
  background-color: var(--color-bg-3);
  padding: 0.5rem 0.75rem;
  max-width: 11rem;
  text-align: center;
}

.tooltip-text::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: 100%;
  margin-left: -5px;
  border-width: 6px;
  border-style: solid;
  border-color: transparent transparent var(--color-bg-3) transparent;
}

.tooltip-target {
  cursor: default;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.tooltip-target:hover .tooltip-text {
  opacity: 1;
  visibility: visible;
}

.tooltip-target:hover .tooltip-text:hover {
  opacity: 0;
  visibility: hidden;
}
</style>

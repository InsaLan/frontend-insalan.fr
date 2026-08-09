<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import GroupTable from '@/components/Tournament/GroupTable.vue';
import MatchCard from '@/components/Tournament/MatchCard.vue';
import type { Group } from '@/models/group';
import { MatchTypeEnum } from '@/models/match';
import { useTournamentStore } from '@/stores/tournament.store';

const { group } = defineProps<{
  group: Group;
  onBack?: () => void;
  admin?: boolean;
}>();

const selectModel = defineModel<Set<number>>();

const { get_matchs_per_round } = useTournamentStore();
const { t } = useI18n();
</script>

<template>
  <section
    id="group_detail"
    class="desktop-row l-gap-2 u-full-width"
  >
    <div class="l-flex-column l-cross-center">
      <GroupTable
        :group="group"
        :on-back="onBack"
      />
    </div>
    <div
      class="l-flex-row l-gap-2 l-overflow-auto u-full-width"
    >
      <div
        v-for="matchs in get_matchs_per_round(group.matchs ?? []).reverse()"
        :key="matchs[0].id"
        class="c-frame u-p-1 l-flex-column l-gap-1 u-full-width"
      >
        <div class="u-text-center u-big-text">
          {{ t('content.components.Tournament.GroupDetail.round', { round: matchs[0].round_number }) }}
        </div>
        <MatchCard
          v-for="match in matchs"
          :key="match.id"
          v-model="selectModel"
          :match="match"
          :match-type="{ type: MatchTypeEnum.GROUP, id: match.group }"
          :editable="admin"
          :selectable="admin"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.desktop-row {
  display: flex;
}

@media (max-width: 50rem) {
  .desktop-row {
    flex-direction: column;
  }
}

@media (min-width: 50rem) {
  .desktop-row {
    flex-direction: row;
  }
}
</style>

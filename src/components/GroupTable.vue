<script setup lang="ts">
import type { Group } from '@/models/group';
import type { Team } from '@/models/team';
const props =  defineProps<{
  group: Group;
  teams: Record<string, Team[]>;
}>();
const get_validated_team_by_id = (id: number) => {
  return props.teams.validated_teams.find(team => team.id === id);
};

</script>
<template>
    <table :key="group.id" border="1" class="text-3xl text-bold border-collapse border border-slate-500 hover:border-4">
        <thead>
            <tr>
            <th colspan="2" class="text-black bg-slate-400">{{ group.name }}</th>
            </tr>
            <tr>
            <th align="center" class="border-separate border border-slate-500 troncate bg-slate-200 text-black">Equipe</th>
            <th align="center" class="border-separate border border-slate-500 bg-slate-200 text-black">Score</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="team_id in group.teams" :key="team_id">
            <td align="center" class="border-separate border border-slate-500">{{
                get_validated_team_by_id(team_id)?.name }}</td>
            <td align="center" class="border-separate border border-slate-500">{{group.scores[team_id]}}</td>
            </tr>
        </tbody>
    </table>
</template>
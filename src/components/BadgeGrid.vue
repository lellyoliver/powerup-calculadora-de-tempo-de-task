<script setup lang="ts">
import type { TaskTimeResult } from '@/types/trello';

defineProps<{
  metrics: TaskTimeResult;
}>();

const badges = [
  { key: 'tempoTask' as const, label: 'Tempo de task', tone: 'blue' },
  { key: 'diasAteFinalizar' as const, label: 'Dias até finalizar', tone: 'yellow' },
  { key: 'atrasos' as const, label: 'Atrasos (dias)', tone: 'red' },
  { key: 'totalDias' as const, label: 'Total de dias', tone: 'green' },
];
</script>

<template>
  <div class="badge-grid">
    <div v-for="badge in badges" :key="badge.key" class="metric">
      <span class="metric__label">{{ badge.label }}</span>
      <div class="metric__value" :class="`metric__value--${badge.tone}`">
        {{ metrics[badge.key] }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.badge-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.metric {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.metric__label {
  font-size: 11px;
  font-weight: 500;
  color: #9fadbc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.metric__value {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  border-radius: 8px;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}

.metric__value--blue {
  background: #579dff;
}

.metric__value--yellow {
  background: #e2b203;
}

.metric__value--red {
  background: #f87462;
}

.metric__value--green {
  background: #4bce97;
}

@media (max-width: 420px) {
  .badge-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>

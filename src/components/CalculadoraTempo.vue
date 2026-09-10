<script setup lang="ts">
import { computed, onMounted, reactive, watch } from 'vue';
import DateRangeFields from '@/components/DateRangeFields.vue';
import BadgeGrid from '@/components/BadgeGrid.vue';
import { useTaskTimeCalc } from '@/composables/useTaskTimeCalc';
import {
  loadCardMetrics,
  setDataFinal,
  setDataInicial,
} from '@/api/trello';
import type { CardTimeData, TrelloPowerUpIFrame } from '@/types/trello';

const props = defineProps<{
  t: TrelloPowerUpIFrame;
}>();

const data = reactive<CardTimeData>({
  dataInicial: '',
  dataFinal: '',
  dataConclusao: undefined,
});

const dataRef = computed(() => ({
  dataInicial: data.dataInicial,
  dataFinal: data.dataFinal,
  dataConclusao: data.dataConclusao,
}));

const { result } = useTaskTimeCalc(dataRef);

async function resize() {
  try {
    await props.t.sizeTo('body');
  } catch {
    /* iframe ainda não pronto */
  }
}

onMounted(async () => {
  const loaded = await loadCardMetrics(props.t);
  data.dataInicial = loaded.dataInicial ?? '';
  data.dataFinal = loaded.dataFinal ?? '';
  data.dataConclusao = loaded.dataConclusao;
  await resize();
});

watch(
  () => data.dataInicial,
  async (value) => {
    await setDataInicial(props.t, value ?? '');
    await resize();
  },
);

watch(
  () => data.dataFinal,
  async (value) => {
    await setDataFinal(props.t, value ?? '');
    await resize();
  },
);
</script>

<template>
  <section class="calculadora">
    <DateRangeFields
      :data-inicial="data.dataInicial ?? ''"
      :data-final="data.dataFinal ?? ''"
      @update:data-inicial="data.dataInicial = $event"
      @update:data-final="data.dataFinal = $event"
    />
    <BadgeGrid :metrics="result" />
  </section>
</template>

<style scoped>
.calculadora {
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial,
    sans-serif;
  color: #c7d1db;
  padding: 4px 2px 8px;
}
</style>

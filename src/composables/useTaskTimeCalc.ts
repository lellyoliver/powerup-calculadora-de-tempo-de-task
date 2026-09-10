import { computed, type Ref } from 'vue';
import type { CardTimeData, TaskTimeResult } from '@/types/trello';
import { diffDays, isValidYmd, todayYmd } from '@/utils/dates';

/**
 * Calcula os 4 indicadores da Calculadora de Tempo de Task.
 *
 * 1. Tempo de task      = Data Final − Data Inicial
 * 2. Dias até finalizar = max(0, Data Final − hoje)  [ou até dataConclusao se já concluído]
 * 3. Atrasos            = se hoje > Data Final e NÃO concluído → hoje − Data Final; senão 0
 * 4. Total de dias      = Tempo de task + dias excedentes se conclusão real > Data Final
 */
export function calculateTaskTime(
  data: Pick<CardTimeData, 'dataInicial' | 'dataFinal' | 'dataConclusao'>,
  now: Date = new Date(),
): TaskTimeResult {
  const empty: TaskTimeResult = {
    tempoTask: 0,
    diasAteFinalizar: 0,
    atrasos: 0,
    totalDias: 0,
  };

  if (!isValidYmd(data.dataInicial) || !isValidYmd(data.dataFinal)) {
    return empty;
  }

  const today = todayYmd(now);
  const referenceDay = isValidYmd(data.dataConclusao) ? data.dataConclusao : today;
  const isCompleted = isValidYmd(data.dataConclusao);

  const tempoTask = Math.max(0, diffDays(data.dataInicial, data.dataFinal));

  const diasAteFinalizar = isCompleted
    ? 0
    : Math.max(0, diffDays(today, data.dataFinal));

  const atrasos =
    !isCompleted && diffDays(data.dataFinal, today) > 0
      ? diffDays(data.dataFinal, today)
      : 0;

  let totalDias = tempoTask;
  if (isCompleted && diffDays(data.dataFinal, referenceDay) > 0) {
    totalDias = tempoTask + diffDays(data.dataFinal, referenceDay);
  }

  return { tempoTask, diasAteFinalizar, atrasos, totalDias };
}

export function useTaskTimeCalc(data: Ref<CardTimeData>, now?: Ref<Date>) {
  const result = computed(() =>
    calculateTaskTime(data.value, now?.value ?? new Date()),
  );

  return { result };
}

import { computed, type Ref } from 'vue';
import type { CardTimeData, TaskTimeResult } from '@/types/trello';
import { diffDays, isValidYmd, todayYmd } from '@/utils/dates';

/**
 * Calcula os 4 indicadores da Calculadora de Tempo de Task.
 *
 * `dataConclusao` = data de entrega real do Trello (due marcado como completo
 * ou entrada na lista Concluído/Done). Quando existe, a task está concluída
 * (`isCompleted`) e essa data entra no cálculo do Total de dias.
 *
 * 1. Tempo de task      = Data Final − Data Inicial
 * 2. Dias até finalizar = max(0, Data Final − hoje); 0 se concluído
 * 3. Atrasos            = se hoje > Data Final e NÃO concluído → hoje − Data Final; senão 0
 * 4. Total de dias      = Tempo de task + (dataConclusao − Data Final) se entrega > Data Final
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
  // Data de entrega do Trello (quando a task foi realmente concluída)
  const dataEntrega = isValidYmd(data.dataConclusao) ? data.dataConclusao : undefined;
  const isCompleted = Boolean(dataEntrega);

  const tempoTask = Math.max(0, diffDays(data.dataInicial, data.dataFinal));

  const diasAteFinalizar = isCompleted
    ? 0
    : Math.max(0, diffDays(today, data.dataFinal));

  const atrasos =
    !isCompleted && diffDays(data.dataFinal, today) > 0
      ? diffDays(data.dataFinal, today)
      : 0;

  let totalDias = tempoTask;
  if (isCompleted && dataEntrega && diffDays(data.dataFinal, dataEntrega) > 0) {
    // Entrega (Trello) depois da Data Final → soma os dias excedentes
    totalDias = tempoTask + diffDays(data.dataFinal, dataEntrega);
  }

  return { tempoTask, diasAteFinalizar, atrasos, totalDias };
}

export function useTaskTimeCalc(data: Ref<CardTimeData>, now?: Ref<Date>) {
  const result = computed(() =>
    calculateTaskTime(data.value, now?.value ?? new Date()),
  );

  return { result };
}

import { computed, type Ref } from 'vue';
import type { CardTimeData, TaskTimeResult } from '@/types/trello';
import { diffDays, isValidYmd, todayYmd } from '@/utils/dates';

/**
 * Calcula os 4 indicadores da Calculadora de Tempo de Task.
 *
 * `dataConclusao` = data de entrega real do Trello (due completo / lista Done).
 * Referência do atraso: data de entrega se concluído; senão, hoje.
 *
 * 1. Tempo de task      = Data Final − Data Inicial
 * 2. Dias até finalizar = max(0, Data Final − hoje); 0 se concluído
 * 3. Atrasos            = dias além da Data Final (0 se ainda no prazo)
 * 4. Total de dias      = Tempo de task + Atrasos  (ex.: 23 + 8 = 31)
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
  const dataEntrega = isValidYmd(data.dataConclusao) ? data.dataConclusao : undefined;
  const isCompleted = Boolean(dataEntrega);

  // Dia de referência: entrega no Trello, ou hoje se ainda aberta
  const referenceDay = dataEntrega ?? today;

  const tempoTask = Math.max(0, diffDays(data.dataInicial, data.dataFinal));

  const diasAteFinalizar = isCompleted
    ? 0
    : Math.max(0, diffDays(today, data.dataFinal));

  const atrasos = Math.max(0, diffDays(data.dataFinal, referenceDay));

  // Total = tempo planejado + atraso (ex.: 23 + 8 = 31)
  const totalDias = tempoTask + atrasos;

  return { tempoTask, diasAteFinalizar, atrasos, totalDias };
}

export function useTaskTimeCalc(data: Ref<CardTimeData>, now?: Ref<Date>) {
  const result = computed(() =>
    calculateTaskTime(data.value, now?.value ?? new Date()),
  );

  return { result };
}

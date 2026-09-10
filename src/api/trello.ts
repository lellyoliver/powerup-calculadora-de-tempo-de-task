import type {
  CardTimeData,
  TrelloAction,
  TrelloPowerUpIFrame,
} from '@/types/trello';
import { isDoneListName, isValidYmd, todayYmd } from '@/utils/dates';

const STORAGE_KEYS = {
  dataInicial: 'dataInicial',
  dataFinal: 'dataFinal',
  dataConclusao: 'dataConclusao',
} as const;

export async function getCardTimeData(t: TrelloPowerUpIFrame): Promise<CardTimeData> {
  const stored = await t.get<CardTimeData | null>('card', 'shared');
  return {
    dataInicial: stored?.dataInicial,
    dataFinal: stored?.dataFinal,
    dataConclusao: stored?.dataConclusao,
  };
}

export async function setDataInicial(t: TrelloPowerUpIFrame, value: string): Promise<void> {
  await t.set('card', 'shared', STORAGE_KEYS.dataInicial, value || undefined);
}

export async function setDataFinal(t: TrelloPowerUpIFrame, value: string): Promise<void> {
  await t.set('card', 'shared', STORAGE_KEYS.dataFinal, value || undefined);
}

/**
 * Data real de entrega/conclusão do Trello:
 * 1) dueComplete → data em que marcou a Data de entrega (action) ou o campo `due`
 * 2) lista Concluído/Done → data da movimentação
 * 3) persiste em shared.dataConclusao para o cálculo (total / atrasos)
 */
export async function resolveCompletionDate(
  t: TrelloPowerUpIFrame,
  current?: CardTimeData,
): Promise<string | undefined> {
  try {
    const card = await t.card(['id', 'due', 'dueComplete', 'idList']);
    const list = await t.list(['name']);

    const completedByDue = Boolean(card.dueComplete);
    const completedByList = isDoneListName(list.name);

    if (!completedByDue && !completedByList) {
      if (current?.dataConclusao) {
        await t.remove('card', 'shared', STORAGE_KEYS.dataConclusao).catch(() => undefined);
      }
      return undefined;
    }

    let conclusao: string | undefined;

    // Momento em que a Data de entrega foi marcada como concluída
    if (completedByDue && card.id) {
      conclusao = await fetchDueCompleteDate(t, card.id);
    }

    // Campo "Data de entrega" do card (due)
    if (!conclusao && completedByDue && card.due) {
      const dueYmd = card.due.slice(0, 10);
      if (isValidYmd(dueYmd)) conclusao = dueYmd;
    }

    // Entrou na lista de concluído
    if (!conclusao && completedByList && card.id) {
      conclusao = await fetchListMoveDate(t, card.id);
    }

    if (!conclusao) {
      conclusao = current?.dataConclusao ?? todayYmd();
    }

    if (conclusao !== current?.dataConclusao) {
      await t.set('card', 'shared', STORAGE_KEYS.dataConclusao, conclusao);
    }

    return conclusao;
  } catch {
    return current?.dataConclusao;
  }
}

async function getCardToken(t: TrelloPowerUpIFrame): Promise<string | undefined> {
  try {
    const api = t.getRestApi();
    const authorized = await api.isAuthorized().catch(() => false);
    if (!authorized) return undefined;
    return (await api.getToken()) ?? undefined;
  } catch {
    return undefined;
  }
}

async function fetchDueCompleteDate(
  t: TrelloPowerUpIFrame,
  cardId: string,
): Promise<string | undefined> {
  try {
    if (!__POWERUP_APP_KEY__) return undefined;
    const token = await getCardToken(t);
    if (!token) return undefined;

    const url =
      `https://api.trello.com/1/cards/${cardId}/actions` +
      `?filter=updateCard:due&limit=20` +
      `&key=${encodeURIComponent(__POWERUP_APP_KEY__)}` +
      `&token=${encodeURIComponent(token)}`;

    const res = await fetch(url);
    if (!res.ok) return undefined;

    const actions = (await res.json()) as TrelloAction[];
    const markedComplete = actions.find(
      (a) => a.data.card?.dueComplete === true || a.data.old?.dueComplete === false,
    );
    if (!markedComplete?.date) return undefined;

    return markedComplete.date.slice(0, 10);
  } catch {
    return undefined;
  }
}

async function fetchListMoveDate(
  t: TrelloPowerUpIFrame,
  cardId: string,
): Promise<string | undefined> {
  try {
    if (!__POWERUP_APP_KEY__) return undefined;
    const token = await getCardToken(t);
    if (!token) return undefined;

    const url =
      `https://api.trello.com/1/cards/${cardId}/actions` +
      `?filter=updateCard:idList&limit=10` +
      `&key=${encodeURIComponent(__POWERUP_APP_KEY__)}` +
      `&token=${encodeURIComponent(token)}`;

    const res = await fetch(url);
    if (!res.ok) return undefined;

    const actions = (await res.json()) as TrelloAction[];
    const moveToDone = actions.find((a) => isDoneListName(a.data.listAfter?.name));
    if (!moveToDone?.date) return undefined;

    return moveToDone.date.slice(0, 10);
  } catch {
    return undefined;
  }
}

export async function loadCardMetrics(t: TrelloPowerUpIFrame): Promise<CardTimeData> {
  const data = await getCardTimeData(t);
  const dataConclusao = await resolveCompletionDate(t, data);
  return { ...data, dataConclusao };
}

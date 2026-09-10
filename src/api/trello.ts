import type {
  CardTimeData,
  TrelloAction,
  TrelloPowerUpIFrame,
} from '@/types/trello';
import { isDoneListName, todayYmd } from '@/utils/dates';

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
 * Detecta a data real de conclusão do card:
 * 1) dueComplete → usa hoje (ou data já persistida)
 * 2) lista atual com nome de "Done/Concluído"
 * 3) persistência em shared.dataConclusao para "travar" o cálculo
 */
export async function resolveCompletionDate(
  t: TrelloPowerUpIFrame,
  current?: CardTimeData,
): Promise<string | undefined> {
  if (current?.dataConclusao) {
    return current.dataConclusao;
  }

  try {
    const card = await t.card(['id', 'dueComplete', 'idList']);
    const list = await t.list(['name']);

    const completedByDue = Boolean(card.dueComplete);
    const completedByList = isDoneListName(list.name);

    if (!completedByDue && !completedByList) {
      return undefined;
    }

    let conclusao = todayYmd();

    // Tenta obter a data em que o card entrou na lista atual (mais preciso)
    if (completedByList && card.id && __POWERUP_APP_KEY__) {
      const fromActions = await fetchListMoveDate(t, card.id);
      if (fromActions) conclusao = fromActions;
    }

    await t.set('card', 'shared', STORAGE_KEYS.dataConclusao, conclusao);
    return conclusao;
  } catch {
    return current?.dataConclusao;
  }
}

async function fetchListMoveDate(
  t: TrelloPowerUpIFrame,
  cardId: string,
): Promise<string | undefined> {
  try {
    const api = t.getRestApi();
    const authorized = await api.isAuthorized().catch(() => false);
    if (!authorized) return undefined;

    const token = await api.getToken();
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

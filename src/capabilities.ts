import { calculateTaskTime } from '@/composables/useTaskTimeCalc';
import { loadCardMetrics } from '@/api/trello';
import type { TrelloBadge, TrelloPowerUpIFrame } from '@/types/trello';

function iconUrl(): string {
  return new URL('./static/icon.svg', window.location.href).href;
}

function sectionUrl(t: TrelloPowerUpIFrame): string {
  const base = new URL('./card-back-section.html', window.location.href).href;
  return t.signUrl(base);
}

async function buildFrontBadges(t: TrelloPowerUpIFrame): Promise<TrelloBadge[]> {
  const data = await loadCardMetrics(t);
  if (!data.dataInicial || !data.dataFinal) return [];

  const r = calculateTaskTime(data);
  const icon = iconUrl();
  return [
    { text: String(r.tempoTask), color: 'blue', icon, refresh: 60 },
    { text: String(r.diasAteFinalizar), color: 'yellow', icon, refresh: 60 },
    { text: String(r.atrasos), color: 'red', icon, refresh: 60 },
    { text: String(r.totalDias), color: 'green', icon, refresh: 60 },
  ];
}

async function buildDetailBadges(t: TrelloPowerUpIFrame): Promise<TrelloBadge[]> {
  const data = await loadCardMetrics(t);
  if (!data.dataInicial || !data.dataFinal) return [];

  const r = calculateTaskTime(data);
  return [
    { title: 'Tempo de task', text: `${r.tempoTask} dias`, color: 'blue', refresh: 60 },
    {
      title: 'Dias até finalizar',
      text: `${r.diasAteFinalizar} dias`,
      color: 'yellow',
      refresh: 60,
    },
    { title: 'Atrasos', text: `${r.atrasos} dias`, color: 'red', refresh: 60 },
    { title: 'Total de dias', text: `${r.totalDias} dias`, color: 'green', refresh: 60 },
  ];
}

window.TrelloPowerUp.initialize({
  'card-back-section': (t) => ({
    title: 'Calculadora de tempo de task',
    icon: iconUrl(),
    content: {
      type: 'iframe',
      url: sectionUrl(t),
      height: 220,
    },
  }),

  'card-badges': (t) => buildFrontBadges(t),

  'card-detail-badges': (t) => buildDetailBadges(t),
});

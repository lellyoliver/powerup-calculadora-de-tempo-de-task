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
  // Só o número — sem ícone
  return [
    { text: String(r.tempoTask), color: 'blue', refresh: 60 },
    { text: String(r.diasAteFinalizar), color: 'yellow', refresh: 60 },
    { text: String(r.atrasos), color: 'red', refresh: 60 },
    { text: String(r.totalDias), color: 'green', refresh: 60 },
  ];
}

async function buildDetailBadges(t: TrelloPowerUpIFrame): Promise<TrelloBadge[]> {
  const data = await loadCardMetrics(t);
  if (!data.dataInicial || !data.dataFinal) return [];

  const r = calculateTaskTime(data);
  return [
    { title: 'Tempo', text: String(r.tempoTask), color: 'blue', refresh: 60 },
    { title: 'Restante', text: String(r.diasAteFinalizar), color: 'yellow', refresh: 60 },
    { title: 'Atraso', text: String(r.atrasos), color: 'red', refresh: 60 },
    { title: 'Total', text: String(r.totalDias), color: 'green', refresh: 60 },
  ];
}

window.TrelloPowerUp.initialize({
  'card-back-section': (t) => ({
    title: 'Tempo da task',
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

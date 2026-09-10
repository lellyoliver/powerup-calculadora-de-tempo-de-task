import { calculateTaskTime } from '@/composables/useTaskTimeCalc';
import { loadCardMetrics } from '@/api/trello';
import type { TrelloBadge, TrelloPowerUpIFrame } from '@/types/trello';

/** URL absoluta no GitHub Pages (/repo/...), sem depender da barra final do connector. */
function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const normalized = path.replace(/^\//, '');
  return new URL(`${base}${normalized}`, window.location.origin).href;
}

function iconUrl(): string {
  // PNG 24x24 — SVG costuma renderizar como quadrado cinza no card-back-section
  return assetUrl('static/icon.png');
}

function sectionUrl(t: TrelloPowerUpIFrame): string {
  return t.signUrl(assetUrl('card-back-section.html'));
}

async function buildFrontBadges(t: TrelloPowerUpIFrame): Promise<TrelloBadge[]> {
  const data = await loadCardMetrics(t);
  if (!data.dataInicial || !data.dataFinal) return [];

  const r = calculateTaskTime(data);
  return [
    { text: String(r.tempoTask), color: 'blue', refresh: 60 },
    { text: String(r.diasAteFinalizar), color: 'yellow', refresh: 60 },
    { text: String(r.atrasos), color: 'red', refresh: 60 },
    { text: String(r.totalDias), color: 'green', refresh: 60 },
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
});

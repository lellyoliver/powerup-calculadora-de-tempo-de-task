import { calculateTaskTime } from '@/composables/useTaskTimeCalc';
import { loadCardMetrics } from '@/api/trello';
import type { TrelloBadge, TrelloPowerUpIFrame } from '@/types/trello';

/** URL absoluta fixa — evita base path / cache quebrando o ícone no Trello */
const ICON_GRAY =
  'https://lellyoliver.github.io/powerup-calculadora-de-tempo-de-task/static/icon-gray.svg';

function sectionUrl(t: TrelloPowerUpIFrame): string {
  const url = new URL(
    'https://lellyoliver.github.io/powerup-calculadora-de-tempo-de-task/card-back-section.html',
  );
  url.searchParams.set('v', '11');
  return t.signUrl(url.href);
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
    icon: ICON_GRAY,
    content: {
      type: 'iframe',
      url: sectionUrl(t),
      height: 200,
    },
  }),

  'card-badges': (t) => buildFrontBadges(t),
});

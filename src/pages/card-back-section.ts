import { createApp } from 'vue';
import CalculadoraTempo from '@/components/CalculadoraTempo.vue';

const t = window.TrelloPowerUp.iframe({
  appKey: __POWERUP_APP_KEY__ || undefined,
  appName: __POWERUP_NAME__,
});

t.render(() => {
  const el = document.getElementById('app');
  if (!el) return;

  // Evita remount em re-renders do Trello
  if (!el.dataset.mounted) {
    createApp(CalculadoraTempo, { t }).mount(el);
    el.dataset.mounted = '1';
  }

  void t.sizeTo('body');
});

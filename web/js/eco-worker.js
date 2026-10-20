import { calcularEco } from './calcular-eco.js';

self.addEventListener('message', ({ data }) => {
  const { id, texto, reabrir = false } = data ?? {};
  try {
    self.postMessage({ id, resultado: calcularEco(texto), reabrir });
  } catch {
    self.postMessage({ id, falha: true });
  }
});

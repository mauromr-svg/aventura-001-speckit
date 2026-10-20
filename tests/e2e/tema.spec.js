import { test, expect } from './ajudantes.js';

const paginas = [
  '/web/',
  '/web/professor.html',
  '/web/docs/index.html',
  '/web/docs/precedencia.html',
  '/web/docs/constante.html',
  '/web/docs/aritmetica.html',
  '/web/docs/geometrica.html',
  '/web/docs/fibonacci.html',
  '/web/docs/polinomial.html',
];

function luminancia(hex) {
  const canais = hex.match(/[\da-f]{2}/gi).map((canal) => parseInt(canal, 16) / 255).map((valor) =>
    valor <= 0.04045 ? valor / 12.92 : ((valor + 0.055) / 1.055) ** 2.4,
  );
  return canais[0] * 0.2126 + canais[1] * 0.7152 + canais[2] * 0.0722;
}

function contraste(corA, corB) {
  const [clara, escura] = [luminancia(corA), luminancia(corB)].sort((a, b) => b - a);
  return (clara + 0.05) / (escura + 0.05);
}

test('todas as telas mantêm o tema, português, CSS, contraste e sem erros JS', async ({ page }) => {
  const erros = [];
  page.on('pageerror', (erro) => erros.push(erro.message));
  page.on('console', (mensagem) => {
    if (mensagem.type() === 'error') erros.push(mensagem.text());
  });

  for (const url of paginas) {
    await page.goto(url);
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
    await expect(page.locator('link[rel="stylesheet"][href*="estilo.css"]')).toHaveCount(1);
    await expect(page.locator('.cabecalho .marca')).toContainText('Castelo do Eco');
    expect(await page.locator('.cabecalho .marca img').evaluate((img) => img.naturalWidth)).toBeGreaterThan(0);
    const cores = await page.evaluate(() => ({
      texto: window.getComputedStyle(document.documentElement).color,
      fundo: window.getComputedStyle(document.documentElement).backgroundColor,
    }));
    const rgb = (s) => `#${s.match(/\d+/g).slice(0, 3).map((n) => Number(n).toString(16).padStart(2, '0')).join('')}`;
    expect(contraste(rgb(cores.texto), rgb(cores.fundo))).toBeGreaterThanOrEqual(4.5);
  }
  expect(erros).toEqual([]);
});

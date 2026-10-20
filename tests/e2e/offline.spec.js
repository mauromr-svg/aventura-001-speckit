import { test, expect, entrarComNome } from './ajudantes.js';

test('eco, gráfico e documentação continuam funcionando sem rede após o primeiro carregamento', async ({ page, context }) => {
  await page.goto('./');
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller?.scriptURL ?? '')).toContain('/web/sw.js');
  await entrarComNome(page, 'Ana');
  await context.setOffline(true);
  await page.reload();
  await entrarComNome(page, 'Ana');
  await page.getByLabel('Sua sequência').fill('2, 4, 8');
  await page.getByRole('button', { name: 'Ouvir o eco' }).click();
  await expect(page.locator('#resposta')).toContainText('O eco responde: 16');
  await expect(page.locator('#grafico-regiao svg circle.previsao')).toHaveAttribute('aria-label', 'Previsão: 16');
  await page.getByRole('link', { name: 'Saiba mais sobre este padrão' }).click();
  await expect(page).toHaveURL(/docs\/geometrica\.html/);
  await expect(page.getByRole('heading', { name: 'Progressão geométrica' })).toBeVisible();
});

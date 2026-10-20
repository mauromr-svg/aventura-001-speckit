import { test, expect, entrarComNome } from './ajudantes.js';

test('histórico persiste, reabre gráfico e ordena ecos', async ({ page }) => {
  await page.goto('./');
  await entrarComNome(page, 'Ana');
  const entrada = page.getByLabel('Sua sequência');
  await entrada.fill('3, 6, 9');
  await page.getByRole('button', { name: 'Ouvir o eco' }).click();
  await expect(page.locator('#resposta')).toContainText('12');
  await entrada.fill('abc, 1, 2');
  await page.getByRole('button', { name: 'Ouvir o eco' }).click();
  await expect(page.locator('#resposta')).toContainText('não é um número');
  await entrada.fill('3, 1, 4, 1, 5');
  await page.getByRole('button', { name: 'Ouvir o eco' }).click();
  await expect(page.locator('#resposta')).toContainText('não encontrou um padrão');

  const itens = page.locator('#historico .item-historico');
  await expect(itens).toHaveCount(3);
  await expect(itens.nth(0)).toContainText('3, 1, 4, 1, 5');
  await expect(itens.nth(1)).toContainText('abc, 1, 2');
  await page.reload();
  await entrarComNome(page, 'Ana');
  await expect(page.locator('#historico .item-historico')).toHaveCount(3);
  await page.locator('#historico .item-historico').nth(2).getByRole('button').click();
  await expect(page.locator('#resposta')).toContainText('O eco responde: 12');
  await expect(page.locator('#grafico-regiao svg circle.previsao')).toHaveAttribute('aria-label', 'Previsão: 12');
  await expect(page.locator('#historico .item-historico')).toHaveCount(3, 'reabrir um eco não cria uma nova memória');
  await entrada.fill('');
  await page.getByRole('button', { name: 'Ouvir o eco' }).click();
  await expect(page.locator('#resposta')).toContainText('Sussurre pelo menos dois números');
  await expect(itens).toHaveCount(3, 'entrada vazia não cria eco');
});

test('duas abas do mesmo aluno recebem ecos pelo mesmo IndexedDB', async ({ page, context }) => {
  await page.goto('./');
  await entrarComNome(page, 'Ana');
  const outra = await context.newPage();
  await outra.goto('./');
  await entrarComNome(outra, 'Ana');
  await outra.getByLabel('Sua sequência').fill('2, 4, 8');
  await outra.getByRole('button', { name: 'Ouvir o eco' }).click();
  await expect(outra.locator('#resposta')).toContainText('16');
  await expect(page.locator('#historico .item-historico')).toHaveCount(1);
  await expect(page.locator('#historico .item-historico')).toContainText('2, 4, 8');
});

test('histórico avisa quando a entrada original foi truncada', async ({ page }) => {
  await page.goto('./');
  await entrarComNome(page, 'Ana');
  const entradaLonga = Array.from({ length: 2200 }, () => '1').join(', ');
  await page.getByLabel('Sua sequência').fill(entradaLonga);
  await page.getByRole('button', { name: 'Ouvir o eco' }).click();
  await expect(page.locator('#resposta')).toContainText('O eco responde: 1');
  await expect(page.locator('#historico .item-historico')).toContainText('A entrada original era longa demais');
});

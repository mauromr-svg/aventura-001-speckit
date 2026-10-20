import { test, expect, entrarComNome } from './ajudantes.js';

test('desenha os valores e destaca a previsão', async ({ page }) => {
  await page.goto('./');
  await entrarComNome(page, 'Ana');
  await page.getByLabel('Sua sequência').fill('1, 4, 9, 16');
  await page.getByRole('button', { name: 'Ouvir o eco' }).click();
  await expect(page.locator('#grafico-regiao svg')).toHaveAttribute('role', 'img');
  await expect(page.locator('#grafico-regiao svg circle.ponto')).toHaveCount(4);
  await expect(page.locator('#grafico-regiao svg circle.previsao')).toHaveAttribute('aria-label', 'Previsão: 25');
  await expect(page.locator('#grafico-regiao svg title')).toContainText('4 números');
});

test('sem padrão mostra somente pontos informados; erro não desenha novo gráfico', async ({ page }) => {
  await page.goto('./');
  await entrarComNome(page, 'Ana');
  const entrada = page.getByLabel('Sua sequência');
  await entrada.fill('3, 1, 4, 1, 5');
  await page.getByRole('button', { name: 'Ouvir o eco' }).click();
  await expect(page.locator('#grafico-regiao svg circle.ponto')).toHaveCount(5);
  await expect(page.locator('#grafico-regiao svg circle.previsao')).toHaveCount(0);
  const antigo = await page.locator('#grafico-regiao svg').count();
  await entrada.fill('abc, 1, 2');
  await page.getByRole('button', { name: 'Ouvir o eco' }).click();
  await expect(page.locator('#resposta')).toContainText('não é um número');
  await expect(page.locator('#grafico-regiao svg')).toHaveCount(antigo);
});

test('um milhão de valores não bloqueia a interface', async ({ page }) => {
  await page.goto('./');
  await entrarComNome(page, 'Ana');
  const sequencia = Array.from({ length: 1_000_000 }, (_, i) => i + 1).join(' ');
  await page.getByLabel('Sua sequência').fill(sequencia);
  await page.getByRole('button', { name: 'Ouvir o eco' }).click();
  await expect(page.getByRole('button', { name: 'Ouvindo…' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'O que vem depois?' })).toBeVisible();
  await expect(page.locator('#resposta')).toContainText('1000001', { timeout: 5000 });
  await expect(page.locator('#aviso')).toContainText('alguns pontos foram resumidos');
  await expect(page.locator('#grafico-regiao svg title')).toContainText('1000000 números');
});

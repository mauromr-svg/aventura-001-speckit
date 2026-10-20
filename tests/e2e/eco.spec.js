import { test, expect, entrarComNome } from './ajudantes.js';

test('eco responde com padrão e preserva os erros', async ({ page }) => {
  await page.goto('./');
  await entrarComNome(page, 'Ana');
  const sequencia = page.getByLabel('Sua sequência');
  const resposta = page.locator('#resposta');

  await sequencia.fill('3, 6, 9, 12');
  await page.getByRole('button', { name: 'Ouvir o eco' }).click();
  await expect(resposta).toContainText('O eco responde: 15');
  await expect(resposta).toContainText('Padrão: progressão aritmética');

  await sequencia.fill('10, 20, 30, abc');
  await page.getByRole('button', { name: 'Ouvir o eco' }).click();
  await expect(resposta).toContainText('"abc" (item 4) não é um número');
  await expect(sequencia).toHaveValue('10, 20, 30, abc');

  await sequencia.fill('3, 1, 4, 1, 5');
  await page.getByRole('button', { name: 'Ouvir o eco' }).click();
  await expect(resposta).toContainText('não encontrou um padrão');
});

test('nome e entrada do usuário nunca são interpretados como HTML', async ({ page }) => {
  await page.goto('./');
  await page.getByLabel('Seu nome ou apelido').fill('<b>x</b>');
  await page.getByRole('button', { name: 'Entrar na sala' }).click();
  await expect(page.getByText('<b>x</b>', { exact: true })).toBeVisible();
  const dialog = page.waitForEvent('dialog', { timeout: 500 }).then(() => true).catch(() => false);
  await page.getByLabel('Sua sequência').fill('<script>alert(1)</script>');
  await page.getByRole('button', { name: 'Ouvir o eco' }).click();
  await expect(page.locator('#resposta')).toContainText('não é um número');
  expect(await dialog).toBe(false);
});

test('parâmetro seq preenche e calcula depois que o nome é informado', async ({ page }) => {
  await page.goto('./?seq=2%2C4%2C8');
  await entrarComNome(page, 'Ana');
  await expect(page.locator('#resposta')).toContainText('O eco responde: 16');
});

test('nome inválido é rejeitado e falha ao guardar não interrompe o eco', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Entrar na sala' }).click();
  await expect(page.locator('#erro-nome')).toContainText('1 a 40 caracteres');
  await page.getByLabel('Seu nome ou apelido').fill('A'.repeat(40));
  await expect(page.getByLabel('Seu nome ou apelido')).toHaveValue('A'.repeat(40));
  await page.getByLabel('Seu nome ou apelido').fill('Ana');
  await page.getByRole('button', { name: 'Entrar na sala' }).click();
  await page.evaluate(() => {
    IDBObjectStore.prototype.add = () => { throw new DOMException('sem espaço', 'QuotaExceededError'); };
  });
  await page.getByLabel('Sua sequência').fill('3, 6, 9');
  await page.getByRole('button', { name: 'Ouvir o eco' }).click();
  await expect(page.locator('#resposta')).toContainText('O eco responde: 12');
  await expect(page.locator('#aviso')).toContainText(/sem espaço|Não consegui guardar/);
});

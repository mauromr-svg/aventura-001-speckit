import { test, expect, entrarComNome } from './ajudantes.js';

const paginas = [
  { slug: 'constante', nome: 'Sequência constante' },
  { slug: 'aritmetica', nome: 'Progressão aritmética' },
  { slug: 'geometrica', nome: 'Progressão geométrica' },
  { slug: 'fibonacci', nome: 'Sequência de Fibonacci' },
  { slug: 'polinomial', nome: 'Sequência polinomial' },
];

test('índice de documentação lista padrões e precedência', async ({ page }) => {
  await page.goto('docs/index.html');
  for (const pagina of paginas) await expect(page.getByRole('link', { name: pagina.nome, exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /ordem de precedência/i })).toBeVisible();
});

for (const { slug } of paginas) {
  test(`${slug}: exemplos levam ao mesmo resultado do Castelo`, async ({ page }) => {
    await page.goto(`docs/${slug}.html`);
    const exemplos = page.locator('#exemplos a');
    const quantidade = await exemplos.count();
    expect(quantidade).toBeGreaterThanOrEqual(2);
    for (let i = 0; i < quantidade; i++) {
      const link = exemplos.nth(i);
      const esperado = await link.getAttribute('data-esperado');
      await link.click();
      await page.locator('#boas-vindas:not([hidden]), #eco:not([hidden])').first().waitFor({ state: 'visible' });
      const nome = page.getByLabel('Seu nome ou apelido');
      if (await nome.isVisible()) await entrarComNome(page, 'Ana');
      await expect(page.locator('#resposta')).toContainText(`O eco responde: ${esperado}`);
      await page.goBack();
    }
  });
}

test('Saiba mais leva à página do padrão da previsão', async ({ page }) => {
  await page.goto('./');
  await entrarComNome(page, 'Ana');
  await page.getByLabel('Sua sequência').fill('2, 4, 8');
  await page.getByRole('button', { name: 'Ouvir o eco' }).click();
  await page.getByRole('link', { name: 'Saiba mais sobre este padrão' }).click();
  await expect(page).toHaveURL(/docs\/geometrica\.html/);
});

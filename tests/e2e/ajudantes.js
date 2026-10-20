import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.goto('./');
    await page.evaluate(async () => {
      sessionStorage.clear();
      const request = indexedDB.deleteDatabase('castelo-do-eco');
      await new Promise((resolve, reject) => {
        request.onsuccess = resolve;
        request.onerror = reject;
        request.onblocked = resolve;
      });
    });
    await use(page);
  },
});

export { expect };

export async function entrarComNome(page, nome) {
  const campo = page.getByLabel('Seu nome ou apelido');
  await page.locator('#boas-vindas:not([hidden]), #eco:not([hidden])').first().waitFor({ state: 'visible' });
  if (await campo.isVisible()) {
    await campo.fill(nome);
    await page.getByRole('button', { name: 'Entrar na sala' }).click();
  }
}

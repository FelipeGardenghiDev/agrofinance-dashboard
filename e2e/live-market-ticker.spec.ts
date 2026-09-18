import { test, expect } from '@playwright/test';

test.describe('Live Market Ticker & Streaming de Cotações B3/CBOT', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
  });

  test('deve renderizar a barra de cotações com badge AO VIVO e símbolos agrícolas', async ({ page }) => {
    const ticker = page.getByRole('region', { name: /Cotações de mercado ao vivo/i });
    await expect(ticker).toBeVisible();

    await expect(ticker.getByText('AO VIVO')).toBeVisible();
    await expect(ticker.getByText('SOJA-PR')).toBeVisible();
    await expect(ticker.getByText('MILHO-B3')).toBeVisible();
    await expect(ticker.getByText('USD/BRL')).toBeVisible();
  });

  test('deve alternar entre Pausado e Ao Vivo ao clicar no botão de controle', async ({ page }) => {
    const ticker = page.getByRole('region', { name: /Cotações de mercado ao vivo/i });
    await expect(ticker).toBeVisible();

    // Clica para pausar
    const pauseButton = ticker.getByRole('button', { name: /Pausar/i });
    await expect(pauseButton).toBeVisible();
    await pauseButton.click();

    // Verifica que agora exibe PAUSADO
    await expect(ticker.getByText('PAUSADO')).toBeVisible();

    // Clica para retomar
    const resumeButton = ticker.getByRole('button', { name: /Retomar/i });
    await expect(resumeButton).toBeVisible();
    await resumeButton.click();

    await expect(ticker.getByText('AO VIVO')).toBeVisible();
  });

  test('deve disparar um tick manual e exibir toast com recálculo', async ({ page }) => {
    const ticker = page.getByRole('region', { name: /Cotações de mercado ao vivo/i });
    const tickButton = ticker.getByRole('button', { name: /Simular Tick/i });
    await expect(tickButton).toBeVisible();

    await tickButton.click();

    // Verifica exibição do toast de tick de mercado
    const toast = page.locator('[data-testid="toast-info"]');
    await expect(toast).toBeVisible({ timeout: 10000 });
    await expect(toast).toContainText(/Tick de Mercado Disparado/i);
  });
});

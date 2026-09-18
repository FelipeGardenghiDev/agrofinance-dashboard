import { test, expect } from '@playwright/test';

test.describe('Modo Campo & Resiliência Offline (PWA)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
  });

  test('deve ativar o Modo Campo ao clicar no botão do header e exibir banner de resiliência', async ({ page }) => {
    const toggleBtn = page.getByTestId('header-offline-toggle');
    await expect(toggleBtn).toBeVisible();
    await expect(toggleBtn).toContainText('Modo Campo');

    // Clica para ativar
    await toggleBtn.click();

    // Banner de Modo Campo deve ficar visível
    const banner = page.getByTestId('offline-field-mode-banner');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('Modo Campo Ativo (Offline)');

    // Botão no header deve refletir estado ativo
    await expect(toggleBtn).toContainText('Modo Campo (ON)');

    // Clica em "Simular Reconexão" no banner
    const reconnectBtn = banner.getByRole('button', { name: /Simular Reconexão/i });
    await expect(reconnectBtn).toBeVisible();
    await reconnectBtn.click();

    // Banner deve sumir e botão voltar ao normal
    await expect(banner).not.toBeVisible();
    await expect(toggleBtn).toContainText('Modo Campo');
  });

  test('deve permitir navegar entre páginas normalmente durante o Modo Campo', async ({ page }) => {
    // Ativa o Modo Campo
    const toggleBtn = page.getByTestId('header-offline-toggle');
    await toggleBtn.click();

    const banner = page.getByTestId('offline-field-mode-banner');
    await expect(banner).toBeVisible();

    // Navega para Hedge & B3
    await page.getByRole('link', { name: /Hedge/i }).first().click();
    await expect(page).toHaveURL(/.*hedge/);
    await expect(page.getByRole('heading', { name: /Hedge Cambial & Derivativos/i })).toBeVisible();

    // Banner continua ativo
    await expect(page.getByTestId('offline-field-mode-banner')).toBeVisible();

    // Navega para Transações
    await page.getByRole('link', { name: /^Transações$/i }).first().click();
    await expect(page).toHaveURL(/.*transactions/);
    await expect(page.getByRole('heading', { name: /^Transações$/i })).toBeVisible();
  });
});

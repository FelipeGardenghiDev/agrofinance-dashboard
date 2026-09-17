import { test, expect } from '@playwright/test';

test.describe('Acessibilidade, Temas e Navegação', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
  });

  test('deve alternar entre modo Claro e Escuro, persistindo após recarregamento', async ({ page }) => {
    const themeButton = page.getByRole('button', { name: /Alternar tema/i });
    await expect(themeButton).toBeVisible();
    await themeButton.click();

    // Seleciona modo Escuro
    await page.getByRole('button', { name: /Escuro/i }).click();

    // Verifica que a classe dark foi aplicada na tag <html>
    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);

    // Recarrega a página para validar persistência no localStorage
    await page.reload();
    await expect(html).toHaveClass(/dark/);

    // Retorna para modo Claro
    await page.getByRole('button', { name: /Alternar tema/i }).click();
    await page.getByRole('button', { name: /Claro/i }).click();
    await expect(html).not.toHaveClass(/dark/);
  });

  test('deve abrir a Central de Notificações e fechar ao pressionar a tecla Escape', async ({ page }) => {
    const bellButton = page.getByRole('button', { name: /Notificações e Alertas/i }).first();
    await expect(bellButton).toBeVisible();
    await bellButton.click();

    // Dropdown deve estar visível
    const dropdown = page.locator('[data-testid="notifications-dropdown"]');
    await expect(dropdown).toBeVisible();
    await expect(dropdown).toContainText(/Alertas & Notificações/i);

    // Pressiona Escape no teclado
    await page.keyboard.press('Escape');

    // Dropdown deve fechar
    await expect(dropdown).not.toBeVisible();
  });

  test('deve navegar suavemente entre as rotas principais pela barra superior', async ({ page }) => {
    // Navega para Transações
    await page.getByRole('link', { name: /^Transações$/i }).first().click();
    await expect(page).toHaveURL(/\/transactions/);
    await expect(page.getByRole('heading', { name: /^Transações$/i })).toBeVisible();

    // Navega para Crédito & CPR
    await page.getByRole('link', { name: /^Crédito & CPR$/i }).first().click();
    await expect(page).toHaveURL(/\/credit/);
    await expect(page.getByRole('heading', { name: /Crédito Rural & CPR Digital/i })).toBeVisible();

    // Navega para Nova Operação
    await page.getByRole('link', { name: /^Nova Operação$/i }).first().click();
    await expect(page).toHaveURL(/\/new-operation/);
    await expect(page.getByRole('heading', { name: /Nova Operação/i })).toBeVisible();

    // Retorna ao Dashboard
    await page.getByRole('link', { name: /^Dashboard$/i }).first().click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('deve acionar o botão Restaurar Demo com confirmação', async ({ page }) => {
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('restaurar os dados');
      await dialog.accept();
    });

    const resetButton = page.getByTitle(/Restaurar dados iniciais/i).first();
    if (await resetButton.isVisible()) {
      await resetButton.click();
      await expect(page.getByText(/Dados Resetados!/i)).toBeVisible();
    }
  });
});

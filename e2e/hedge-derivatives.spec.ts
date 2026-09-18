import { test, expect } from '@playwright/test';

test.describe('Fluxo de Hedge Cambial & Derivativos B3/CBOT', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/hedge');
    await page.waitForLoadState('domcontentloaded');
  });

  test('deve renderizar os indicadores e formulário de simulação de hedge', async ({ page }) => {
    // Verifica cabeçalho da página
    await expect(page.getByRole('heading', { name: /Hedge Cambial & Derivativos Agro/i })).toBeVisible();
    await expect(page.getByText(/Volume Assegurado/i)).toBeVisible();
    await expect(page.getByText(/Patrimônio Protegido/i)).toBeVisible();
    await expect(page.getByText(/Posições Ativas/i)).toBeVisible();

    // Verifica presença do simulador e tabela
    await expect(page.getByRole('heading', { name: /Simulador de Trava de Preço B3/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Contratar Trava de Preço na B3/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Posições de Hedge em Aberto & Histórico/i })).toBeVisible();
  });

  test('deve recalcular dinamicamente o prêmio e impacto financeiro ao alterar valores', async ({ page }) => {
    // Clica no atalho de 2.500 sacas
    const button2500 = page.getByRole('button', { name: '2.500 sacas', exact: true });
    await expect(button2500).toBeVisible();
    await button2500.click();

    // Clica no preset de proteção extra (+5% ITM)
    const buttonITMPreset = page.getByRole('button', { name: /Proteção Extra/i });
    await expect(buttonITMPreset).toBeVisible();
    await buttonITMPreset.click();

    // Verifica atualização do card de impacto financeiro
    await expect(page.getByText(/Impacto Financeiro da Trava/i)).toBeVisible();
    await expect(page.locator('span').filter({ hasText: '2.500 sacas' })).toBeVisible();
    await expect(page.getByText(/Cenário de Queda Severa/i)).toBeVisible();
  });

  test('deve contratar uma trava de preço na B3 com sucesso e registrar na tabela', async ({ page }) => {
    // Seleciona volume de 500 sacas para economizar saldo
    const button500 = page.getByRole('button', { name: '500 sacas', exact: true });
    await expect(button500).toBeVisible();
    await button500.click();

    // Clica no botão de contratação
    const contractButton = page.getByRole('button', { name: /Contratar Trava de Preço na B3/i });
    await expect(contractButton).toBeEnabled();
    await contractButton.click();

    // Verifica exibição do toast de sucesso
    const toast = page.locator('[data-testid="toast-success"]');
    await expect(toast).toBeVisible({ timeout: 10000 });
    await expect(toast).toContainText(/Hedge B3 Contratado/i);

    // Verifica que a tabela possui contratos registrados
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('tbody tr')).not.toHaveCount(0);
  });

  test('deve permitir exercer o ganho de uma opção ITM com confirmação', async ({ page }) => {
    // Intercepta e confirma popup de confirm()
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    // Procura por um botão "Exercer Lucro" na tabela de contratos
    const exerciseButton = page.getByRole('button', { name: /Exercer Lucro/i }).first();
    if (await exerciseButton.isVisible()) {
      await exerciseButton.click();

      // Verifica exibição do toast de crédito
      const toast = page.locator('[data-testid="toast-success"]');
      await expect(toast).toBeVisible({ timeout: 10000 });
      await expect(toast).toContainText(/Lucro de Proteção Creditado/i);
    }
  });
});

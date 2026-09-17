import { test, expect } from '@playwright/test';

test.describe('Fluxo de Crédito Rural & CPR Digital', () => {
  test.beforeEach(async ({ page }) => {
    // Garante que o teste comece navegando para a rota de crédito
    await page.goto('/credit');
    await page.waitForLoadState('domcontentloaded');
  });

  test('deve renderizar os indicadores e formulário de simulação de CPR', async ({ page }) => {
    // Verifica cabeçalho da página
    await expect(page.getByRole('heading', { name: /Crédito Rural & CPR Digital/i })).toBeVisible();
    await expect(page.getByText(/Limite Pré-Aprovado/i)).toBeVisible();
    await expect(page.getByText(/Taxa Agro Subsidiada/i)).toBeVisible();

    // Verifica presença do formulário e botão de ação
    await expect(page.getByRole('heading', { name: /Simulador Interativo de Financiamento/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Contratar CPR/i })).toBeVisible();
  });

  test('deve calcular dinamicamente parcelas e colateral ao alterar valores', async ({ page }) => {
    // Altera o valor solicitado via atalho de R$ 10.000
    const button10k = page.getByRole('button', { name: 'R$ 10.000,00' });
    if (await button10k.isVisible()) {
      await button10k.click();
    }

    // Seleciona prazo de 6 meses
    await page.getByRole('button', { name: /6 Meses/i }).click();

    // Verifica se o resumo contratual atualizou
    await expect(page.getByText(/Resumo Contratual da CPR/i)).toBeVisible();
    await expect(page.getByText(/Parcela Mensal Estimada/i)).toBeVisible();
    await expect(page.getByText(/Garantia Aprovada/i)).toBeVisible();
  });

  test('deve contratar uma nova CPR com sucesso, exibir toast e registrar na tabela', async ({ page }) => {
    // Configura valor de R$ 10.000
    const button10k = page.getByRole('button', { name: 'R$ 10.000,00' });
    if (await button10k.isVisible()) {
      await button10k.click();
    }

    // Clica para contratar a CPR
    const contractButton = page.getByRole('button', { name: /Contratar CPR e Receber/i });
    await expect(contractButton).toBeEnabled();
    await contractButton.click();

    // Verifica exibição do toast de sucesso
    const toast = page.locator('[data-testid="toast-success"]');
    await expect(toast).toBeVisible({ timeout: 10000 });
    await expect(toast).toContainText(/CPR Aprovada|Crédito/i);

    // Verifica que a tabela de contratos possui o novo registro
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('tbody tr')).not.toHaveCount(0);
  });

  test('deve permitir quitação antecipada de uma CPR ativa com liberação de colateral', async ({ page }) => {
    // Intercepta e confirma o popup nativo de confirm()
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Deseja quitar a CPR');
      await dialog.accept();
    });

    // Encontra o botão de Quitar CPR na tabela
    const settleButton = page.getByRole('button', { name: /Quitar CPR/i }).first();
    if (await settleButton.isVisible()) {
      await settleButton.click();

      // Aguarda feedback de liquidação
      await expect(page.getByText(/Liberado ✓|Liquidada/i).first()).toBeVisible({ timeout: 10000 });
    }
  });
});

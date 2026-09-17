import { test, expect } from '@playwright/test';

test.describe('Fluxo de Operações Financeiras & Transações RWA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/new-operation');
    await page.waitForLoadState('domcontentloaded');
  });

  test('deve realizar uma transferência PIX em duas etapas com comprovante e toast', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Nova Operação/i })).toBeVisible();

    // Seleciona a aba PIX (já padrão, mas garante clique)
    await page.getByRole('button', { name: /PIX/i }).first().click();

    // Preenche beneficiário via sugestão rápida
    const quickBeneficiary = page.getByRole('button', { name: /\+ Cooperativa Agro SP/i });
    if (await quickBeneficiary.isVisible()) {
      await quickBeneficiary.click();
    } else {
      await page.locator('input[name="beneficiary"]').fill('04.253.987/0001-44');
    }

    // Preenche valor
    const quick500 = page.getByRole('button', { name: /\+ R\$ 500,00/i });
    if (await quick500.isVisible()) {
      await quick500.click();
    } else {
      await page.locator('input[name="amount"]').fill('500,00');
    }

    // Avança para tela de revisão
    await page.getByRole('button', { name: /Revisar Operação/i }).click();

    // Valida tela de confirmação / revisão
    await expect(page.getByRole('heading', { name: /Confirmar Operação/i })).toBeVisible();
    await expect(page.getByText(/500,00/).first()).toBeVisible();

    // Executa a operação
    const confirmButton = page.getByRole('button', { name: /Confirmar e Transferir/i });
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();

    // Valida comprovante na tela de sucesso
    await expect(page.getByRole('heading', { name: /Operação Realizada com Sucesso/i })).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText(/ID da Transação:/i)).toBeVisible();

    // Valida toast de sucesso
    const toast = page.locator('[data-testid="toast-success"]');
    await expect(toast).toBeVisible();
  });

  test('deve solicitar resgate físico de grãos com emissão de Certificado CDA/WA', async ({ page }) => {
    // Seleciona tipo Resgate Físico
    await page.getByRole('button', { name: /Resgate Físico/i }).click();

    await expect(page.getByText(/Resgate Físico de Commodities/i)).toBeVisible();
    await expect(page.getByText(/Armazém Geral Credenciado/i)).toBeVisible();

    // Clica no atalho de 25% da posição
    const pctButton = page.getByRole('button', { name: /25%/i });
    await expect(pctButton).toBeVisible();
    await pctButton.click();

    // Avança para revisão
    await page.getByRole('button', { name: /Revisar Resgate Físico/i }).click();

    // Confirma emissão
    await expect(page.getByRole('heading', { name: /Confirmar Operação/i })).toBeVisible();
    const emitButton = page.getByRole('button', { name: /Emitir Certificado de Resgate/i });
    await expect(emitButton).toBeVisible();
    await emitButton.click();

    // Valida tela de sucesso com instruções de carregamento
    await expect(
      page.getByRole('heading', { name: /Certificado de Resgate Físico Emitido/i })
    ).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Instruções de Carregamento/i)).toBeVisible();

    // Navega até o extrato clicando no botão da tela de sucesso
    await page.getByRole('button', { name: /Ver no Extrato de Transações/i }).click();
    await expect(page).toHaveURL(/\/transactions/);
    await expect(page.getByRole('heading', { name: /^Transações$/i })).toBeVisible();
  });

  test('deve permitir buscar e filtrar transações no extrato', async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { name: /^Transações$/i })).toBeVisible();

    // Filtra pelo termo "Soja"
    const searchInput = page.getByPlaceholder(/Buscar por descrição|Buscar/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('Soja');
      // Aguarda tabela refletir filtro
      await page.waitForTimeout(300);
      await expect(page.getByText(/Soja/i).first()).toBeVisible();
    }
  });
});

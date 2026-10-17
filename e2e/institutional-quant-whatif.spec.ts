import { test, expect } from '@playwright/test';

test.describe('Jornadas Institucionais: Quant Engine, What-If, Barter & Dossiê de Auditoria', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
  });

  test('deve renderizar os módulos institucionais no dashboard principal', async ({ page }) => {
    // 1. Header & Dossiê Bancário
    await expect(page.getByRole('button', { name: /Dossiê Bancário/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Alertas Preditivos/i })).toBeVisible();

    // 2. Smart Hedge Advisor (IA Quant)
    await expect(page.getByText(/Smart Hedge Advisor/i)).toBeVisible();
    await expect(page.getByText(/Recomendação Algorítmica/i)).toBeVisible();

    // 3. Poder de Compra Agro & Barter
    await expect(page.getByText(/Poder de Compra Agro & Barter/i)).toBeVisible();
    await expect(page.getByText(/Adubo NPK/i)).toBeVisible();
    await expect(page.getByText(/Diesel S10/i)).toBeVisible();

    // 4. Simulador What-If Macroeconômico
    await expect(page.getByText(/Simulador de Cenários Macroeconômicos/i)).toBeVisible();
    await expect(page.getByText(/1\. Câmbio Dólar Comercial/i)).toBeVisible();
  });

  test('deve interagir com os cenários pré-calibrados do Simulador What-If', async ({ page }) => {
    // Localiza e clica no preset de Quebra Safra EUA
    const btnQuebraSafra = page.getByRole('button', { name: /Quebra Safra EUA/i });
    await expect(btnQuebraSafra).toBeVisible();
    await btnQuebraSafra.click();

    // Verifica que o choque de oferta e dólar foram atualizados
    await expect(page.getByText(/R\$ 6\.10/i)).toBeVisible();

    // Clica no preset de Supersafra / Queda
    const btnSupersafra = page.getByRole('button', { name: /Supersafra \/ Queda/i });
    await expect(btnSupersafra).toBeVisible();
    await btnSupersafra.click();
    await expect(page.getByText(/R\$ 5\.15/i)).toBeVisible();

    // Clica no botão Reset
    const btnReset = page.getByRole('button', { name: /Reset/i });
    await expect(btnReset).toBeVisible();
    await btnReset.click();
    await expect(page.getByText(/R\$ 5\.75/i).first()).toBeVisible();
  });

  test('deve abrir o modal de Dossiê Bancário de Risco e fechar com sucesso', async ({ page }) => {
    const btnDossier = page.getByRole('button', { name: /Dossiê Bancário/i });
    await expect(btnDossier).toBeVisible();
    await btnDossier.click();

    // Valida abertura do Modal e auditoria institucional
    const modalDialog = page.getByRole('dialog');
    await expect(modalDialog).toBeVisible();
    await expect(modalDialog.getByText(/Dossiê de Risco e Garantias RWA/i)).toBeVisible();
    await expect(modalDialog.getByText(/Hash de Autenticidade/i)).toBeVisible();
    await expect(modalDialog.getByText(/Stress Test Monte Carlo/i)).toBeVisible();

    // Valida presença do botão de imprimir e fechar
    await expect(modalDialog.getByRole('button', { name: /Imprimir \/ Salvar PDF/i })).toBeVisible();
    const btnClose = modalDialog.getByRole('button', { name: /Fechar/i });
    await expect(btnClose).toBeVisible();
    await btnClose.click();

    // Modal deve ser fechado
    await expect(modalDialog).not.toBeVisible();
  });

  test('deve navegar até transações e verificar opção de exportação ERP Agro', async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForLoadState('domcontentloaded');

    // Valida botão de exportação para ERPs do agronegócio (TOTVS Agro, Siagri, Aegro)
    const btnExportERP = page.getByRole('button', { name: /Exportar ERP Agro/i });
    await expect(btnExportERP).toBeVisible();
    await expect(btnExportERP).toBeEnabled();
  });

  test('deve alternar idioma na barra de navegação', async ({ page }) => {
    // Localiza botão de idioma (PT / EN)
    const langBtn = page.getByRole('button', { name: /Português|English/i }).first();
    await expect(langBtn).toBeVisible();
    await langBtn.click();

    // Clica na opção English
    const enOption = page.getByRole('button', { name: /English/i });
    if (await enOption.isVisible()) {
      await enOption.click();
      // Valida texto em inglês
      await expect(page.getByText(/Bank Audit Dossier/i)).toBeVisible();
    }
  });
});

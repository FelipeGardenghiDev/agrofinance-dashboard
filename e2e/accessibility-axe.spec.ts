import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Conformidade de Acessibilidade Digital W3C / WCAG 2.1 (Axe-Core)', () => {
  test('deve auditar o Dashboard (/dashboard) sem violações críticas de acessibilidade', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    const scanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const criticalViolations = scanResults.violations.filter(
      (v) => v.impact === 'critical'
    );

    expect(criticalViolations).toEqual([]);
  });

  test('deve auditar a página de Crédito Rural (/credit) sem violações críticas', async ({ page }) => {
    await page.goto('/credit');
    await page.waitForLoadState('domcontentloaded');

    const scanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const criticalViolations = scanResults.violations.filter(
      (v) => v.impact === 'critical'
    );

    expect(criticalViolations).toEqual([]);
  });

  test('deve auditar a mesa de Derivativos e Hedge (/hedge) sem violações críticas', async ({ page }) => {
    await page.goto('/hedge');
    await page.waitForLoadState('domcontentloaded');

    const scanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const criticalViolations = scanResults.violations.filter(
      (v) => v.impact === 'critical'
    );

    expect(criticalViolations).toEqual([]);
  });

  test('deve auditar o Extrato de Transações (/transactions) sem violações críticas', async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForLoadState('domcontentloaded');

    const scanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const criticalViolations = scanResults.violations.filter(
      (v) => v.impact === 'critical'
    );

    expect(criticalViolations).toEqual([]);
  });

  test('deve auditar o formulário de Nova Operação (/new-operation) sem violações críticas', async ({ page }) => {
    await page.goto('/new-operation');
    await page.waitForLoadState('domcontentloaded');

    const scanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const criticalViolations = scanResults.violations.filter(
      (v) => v.impact === 'critical'
    );

    expect(criticalViolations).toEqual([]);
  });
});

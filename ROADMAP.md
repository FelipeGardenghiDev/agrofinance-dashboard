# 🗺️ Roadmap de Evoluções — AgroFinance RWA Dashboard

Este documento registra as melhorias arquiteturais e de produto planejadas para as próximas etapas de desenvolvimento do **AgroFinance Dashboard**.

---

## 🎯 1. Testes End-to-End (E2E) com Playwright `[✅ CONCLUÍDO]`

### Objetivo
Validar os fluxos críticos de ponta a ponta em navegadores reais (Chromium), assegurando que o usuário final execute simulações, transações e quitações sem falhas de integração visual ou lógica.

### Status de Implementação
* **Suíte Implementada:** 11 cenários de testes automatizados distribuídos em 3 arquivos (`e2e/credit-cpr.spec.ts`, `e2e/financial-operations.spec.ts`, `e2e/theme-and-accessibility.spec.ts`).
* **Taxa de Sucesso:** 100% dos testes aprovados (11/11).
* **CI/CD Integrado:** Execução automática no GitHub Actions via [.github/workflows/ci.yml](.github/workflows/ci.yml) com upload do relatório Playwright.

### Cenários Cobertos
1. **Fluxo de Crédito & CPR Digital:**
   * Navegação até `/credit`.
   * Preenchimento do formulário de simulação (seleção de commodity, sacas e prazo).
   * Verificação dos cálculos de LTV máximo (70%) e parcelas da Tabela Price.
   * Contratação da CPR: confirmação da emissão, exibição do Toast de sucesso e registro na tabela de contratos ativos.
   * Validação de trava de tokens na carteira (`lockedQuantity`).
   * Quitação antecipada: liquidação do saldo devedor e confirmação do destravamento integral das sacas.
2. **Fluxo de Operações Financeiras & Toasts:**
   * Envio de PIX na rota `/new-operation` em 2 etapas com tela de revisão e comprovante.
   * Resgate físico com seleção de armazém geral e conferência do extrato em `/transactions`.
   * Busca e filtragem instantânea de transações.
3. **Persistência & Acessibilidade:**
   * Alternância entre temas (Claro / Escuro / Sistema) e persistência após recarregar a página.
   * Fechamento da central de notificações via tecla `Escape`.
   * Navegação fluida entre rotas principais e botão Restaurar Demo.

### Comandos de Execução
```bash
pnpm test:e2e       # Execução headless
pnpm test:e2e:ui    # Modo interativo com interface do Playwright
pnpm run test:all   # Vitest unitários + Playwright E2E
```

---

## 🌾 2. Módulo de Hedge Cambial & Derivativos Agro (B3 / CBOT)

### Contexto de Negócio
No agronegócio de exportação, a oscilação das cotações em Chicago (CBOT), o prêmio de porto (Paranaguá/Santos) e o câmbio (USD/BRL) representam o maior risco financeiro do produtor rural. O módulo de **Hedge** permite travar preços mínimos de venda antes da colheita.

### Funcionalidades Planejadas
1. **Simulador de Trava de Preço (Opções de Venda - Put & NDF Cambial):**
   * Seleção da safra/vencimento (ex: *Soja Março/2027*, *Milho Julho/2026*, *Dólar Futuro PTAX*).
   * Escolha de Preço de Exercício (*Strike Price*) por saca ou cotação de câmbio.
   * Cálculo em tempo real do prêmio da opção (custo de proteção) e margem de garantia requerida.
2. **Contratação & Débito em Conta:**
   * Débito do prêmio do saldo bancário disponível do produtor.
   * Emissão de contrato derivativo com código de registro simulado na B3.
   * Notificação instantânea na Central de Alertas.
3. **Gestão de Posições Abertas:**
   * Painel de monitoramento comparando o *Strike Price* contratado contra o preço spot atual de mercado.
   * Badges dinâmicos: `In The Money (ITM)` (preço de mercado caiu abaixo do strike -> proteção lucrativa) ou `Out of The Money (OTM)`.
   * Ação de exercício ou liquidação financeira antecipada no vencimento.

### Estrutura de Tipos Sugerida (`src/lib/types.ts`)
```typescript
export interface HedgeContract {
  id: string;
  contractNumber: string; // ex: "HDG-2026-B3-SOJA-8921"
  type: 'commodity_put' | 'commodity_forward' | 'ndf_usd';
  commodityName: string;
  commoditySymbol: string;
  targetMaturity: string;
  quantitySacas: number;
  strikePrice: number;
  currentSpotPrice: number;
  totalProtectedValue: number;
  premiumCost: number;
  status: 'active' | 'exercised' | 'expired';
  createdAt: string;
  expiryDate: string;
}
```

---

## 📡 3. Cotações Vivas com Streaming / Server-Sent Events (SSE)

### Objetivo
Simular flutuações de mercado dinâmicas (tick-by-tick ou atualizações a cada 30 segundos) nas cotações de Soja e Milho (Cepea/Esalq e B3), permitindo observar gráficos e alertas reagindo em tempo real.

---

## 📱 4. PWA (Progressive Web App) & Modo Offline do Campo

### Objetivo
Permitir instalação como aplicativo no celular/tablet do produtor rural e consulta em modo offline de saldos e contratos de CPR previamente sincronizados.

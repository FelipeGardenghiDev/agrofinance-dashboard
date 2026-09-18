# 🗺️ Roadmap de Evoluções — AgroFinance RWA Dashboard

Este documento registra os marcos de engenharia de software e funcionalidades concluídas para elevar o **AgroFinance Dashboard** ao nível sênior/pleno de excelência técnica.

---

## 🎯 1. Testes End-to-End (E2E) com Playwright `[✅ CONCLUÍDO]`

### Objetivo
Validar os fluxos críticos de ponta a ponta em navegadores reais (Chromium), assegurando que o usuário final execute simulações, transações e quitações sem falhas de integração visual ou lógica.

### Status de Implementação
* **Suíte Implementada:** 20 cenários de testes automatizados distribuídos em 6 arquivos (`e2e/credit-cpr.spec.ts`, `e2e/financial-operations.spec.ts`, `e2e/hedge-derivatives.spec.ts`, `e2e/live-market-ticker.spec.ts`, `e2e/offline-field-mode.spec.ts`, `e2e/theme-and-accessibility.spec.ts`).
* **Taxa de Sucesso:** 100% dos testes aprovados (20/20).
* **CI/CD Integrado:** Execução contínua com WebServer Next.js em produção e relatório Playwright.

---

## 🌾 2. Módulo de Hedge Cambial & Derivativos Agro (B3 / CBOT) `[✅ CONCLUÍDO]`

### Contexto de Negócio
No agronegócio de exportação, a oscilação das cotações em Chicago (CBOT), o prêmio de porto (Paranaguá/Santos) e o câmbio (USD/BRL) representam o maior risco financeiro do produtor rural. O módulo de **Hedge** permite travar preços mínimos de venda antes da colheita.

### Status de Implementação
* **Rota Dedicada:** `/hedge` acessível no Header (desktop e mobile) e com banner inteligente no `/dashboard`.
* **Motor Financeiro:** Funções `calculateHedgeSimulation` e `calculateHedgePayoff` para cálculo de prêmios por moneyness, ganho intrínseco e teste de stress (-10% no spot).
* **Gestão de Posições B3:** Tabela com badges dinâmicos `In The Money (ITM)` / `Out of The Money (OTM)`, hash criptográfico simulado da B3 com cópia e ação de exercício de lucro direto na conta corrente.
* **Cobertura de Testes:** 10 testes unitários no Vitest (`src/__tests__/hedge.test.ts`) + 4 testes End-to-End no Playwright (`e2e/hedge-derivatives.spec.ts`).

---

## 📡 3. Cotações Vivas com Streaming & Live Ticker (B3 / CBOT) `[✅ CONCLUÍDO]`

### Objetivo
Simular flutuações de mercado dinâmicas (tick-by-tick ou atualizações a cada 7 segundos) nas cotações de Soja (Paranaguá / CBOT), Milho (Campinas B3), Dólar PTAX e tokens RWA.

### Status de Implementação
* **Componente Global:** `<LiveMarketTicker />` integrado no `MainLayout` logo abaixo do Header, visível em todas as rotas da plataforma.
* **Reatividade Total:** Atualização a mercado a cada 7 segundos com animações visuais suaves de flash (`flashGreen` e `flashRed`).
* **Impacto Patrimonial:** A oscilação dos ticks atualiza proporcionalmente os tokens em custódia (`SOJA24`, `MLHO25`) e recalcula o patrimônio total do produtor em tempo real.
* **Controles Interativos:** Botão "Pausar / Retomar Cotações Vivas" e botão "⚡ Simular Tick B3" para testes imediatos de avaliadores.
* **Cobertura de Testes:** 5 testes unitários no Vitest (`src/__tests__/LiveMarketTicker.test.tsx`) + 3 testes End-to-End no Playwright (`e2e/live-market-ticker.spec.ts`).

---

## 📱 4. PWA (Progressive Web App) & Modo Campo Offline `[✅ CONCLUÍDO]`

### Objetivo
Permitir que o produtor rural acesse o sistema no campo sem sinal de internet (3G/4G/5G), garantindo persistência local de dados, consulta de custódia RWA, extrato e contratos de CPR e Hedge.

### Status de Implementação
* **Web App Manifest (`src/app/manifest.ts`):** Manifesto PWA nativo do Next.js 16 servido em `/manifest.webmanifest`, com ícones temáticos vetoriais SVG (192x192 e 512x512) em `public/`.
* **Detecção Automática de Conexão:** Componente `<OfflineFieldModeBanner />` ouvindo eventos nativos do navegador (`window.ononline` e `window.onoffline`) com toasts reativos.
* **Botão de Simulação no Header:** Botão `🌾 Modo Campo` no menu superior (desktop e mobile) permitindo aos recrutadores alternar o modo offline com 1 clique e testar a navegação resiliente.
* **Cobertura de Testes:** 4 testes unitários no Vitest (`src/__tests__/OfflineFieldModeBanner.test.tsx`) + 2 testes End-to-End no Playwright (`e2e/offline-field-mode.spec.ts`).

---

## 📊 5. Relatório Formal de Cobertura de Código (Vitest V8) `[✅ CONCLUÍDO]`

### Objetivo
Atingir métricas de cobertura de código superiores a 80-85% com provider oficial V8, gerando relatórios em terminal, JSON Summary e HTML navegável.

### Status de Implementação
* **Script Dedicado:** `pnpm test:coverage` (configurado em `package.json` e `vitest.config.ts`).
* **Métricas Alcançadas:**
  * **Linhas de Código (Lines):** **86.17%**
  * **Componentes UI (Design System):** **93.10%**
  * **Componentes de Funcionalidade (Features):** **89.89%**
  * **Gerenciamento de Estado (Zustand Store):** **88.75%**
* **Suíte Total:** **115 testes automatizados aprovados (95 Unitários Vitest + 20 E2E Playwright)**.

# 🏛️ Arquitetura de Software & Decisões de Engenharia (ADRs)
## AgroFinance RWA Dashboard — Plataforma de Crédito e Ativos Tokenizados do Agro

Este documento detalha os fundamentos arquiteturais, padrões de projeto e **Architecture Decision Records (ADRs)** adotados no **AgroFinance**, servindo como guia de governança técnica e referência para avaliadores seniores e tech leads.

---

## 📐 1. Visão Geral da Arquitetura

O AgroFinance foi projetado sob os princípios de **Clean Architecture**, **Domain-Driven Design (DDD)** simplificado e **Backend For Frontend (BFF)** sobre o **Next.js 16 (App Router)** com **React 19** e **TypeScript Strict Mode**.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        CAMADA DE APRESENTAÇÃO (UI)                     │
│  - App Router (Rotas: /dashboard, /transactions, /credit, /hedge)      │
│  - Atomic Design System (Card, Button, Badge, Input, Spinner, Toasts)  │
│  - Live Market Ticker & Streaming Visual com Feedback de Tick (B3)     │
│  - Modo Campo PWA (Offline Banner & Web App Manifest)                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     GERENCIAMENTO DE ESTADO REATIVO                    │
│  - Zustand Store desacoplada (useAgroFinanceStore)                     │
│  - Persist Middleware com partialize seletivo (LocalStorage)           │
│  - Reatividade atômica por seletores (Zero re-renders desnecessários)   │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│        MOTOR DE REGRAS & MATH        │  │       BFF / ROUTE HANDLERS   │
│  - Simulação Tabela Price (CPR)      │  │  - GET /api/quotes           │
│  - Trava Prudencial LTV (70%)        │  │  - Cache ISR (revalidate: 60)│
│  - Cálculo de Moneyness (ITM vs OTM) │  │  - Fallback Resiliente Local │
│  - Validação CPF Módulo 11 (Receita) │  │  - Consumo API Bacen/B3      │
│  - Schemas Dinâmicos Zod             │  └──────────────┬───────────────┘
└──────────────────────────────────────┘                 │
                                                         ▼
                                          ┌──────────────────────────────┐
                                          │      PROVEDORES EXTERNOS     │
                                          │  - AwesomeAPI / Banco Central│
                                          │  - Vercel Web Analytics      │
                                          └──────────────────────────────┘
```

---

## 📑 2. Architecture Decision Records (ADRs)

### ADR 001: Gestão de Estado Global com Zustand + Persistência Seletiva

* **Status:** Aprovado e Implementado
* **Contexto:**
  Plataformas financeiras exigem reatividade imediata para cotações em streaming, sincronização de saldos e controle de travas de colateral. Soluções como **Redux Toolkit** introduzem complexidade desnecessária (*boilerplate*, *action creators*, *reducers* verbosos), enquanto a **Context API** do React causa re-renderizações em cascata de toda a árvore de componentes ao atualizar um único valor de cotação.
* **Decisão:**
  Adotar **Zustand 5** com o middleware `persist`:
  1. Uso de seletores granulares (`useAgroFinanceStore(state => state.account.availableBalance)`), garantindo que apenas componentes dependentes do dado sofram re-render.
  2. Implementação da função `partialize` para salvar no `localStorage` apenas dados transacionais, preservando o estado da sessão sem inflar o armazenamento do navegador.
* **Consequências:**
  * Performance de renderização com tempo de resposta inferior a 16ms (60 FPS contínuos).
  * Fácil testabilidade: a store pode ser limpa ou mockada nos testes unitários com uma única chamada `resetToDefaultData()`.

---

### ADR 002: Arquitetura BFF (Backend for Frontend) para Cotações Financeiras

* **Status:** Aprovado e Implementado
* **Contexto:**
  O AgroFinance precisa exibir cotações reais do Dólar PTAX (Banco Central) e indicadores da B3/CBOT. Fazer chamadas diretas do navegador para APIs públicas externas expõe a aplicação a problemas de CORS, bloqueio por ad-blockers, rate limiting severo e quebra da interface caso a API externa sofra instabilidade.
* **Decisão:**
  Implementar um **Route Handler** em `src/app/api/quotes/route.ts` atuando como BFF:
  1. **Cache no Servidor:** Configurado com `next: { revalidate: 60 }`, reduzindo o volume de requisições externas e respeitando os limites gratuitos de infraestrutura.
  2. **Timeout Controlado:** Uso de `AbortController` com limite de 3.5 segundos para evitar requisições presas.
  3. **Fallback Resiliente:** Em caso de erro 5xx, timeout ou desconexão, o endpoint responde com status 200 e dados semente de referência demarcados com `isLiveExternal: false`.
* **Consequências:**
  * O frontend nunca quebra por falha de provedor externo.
  * A arquitetura demonstra desacoplamento entre cliente e servidor, essencial para sistemas corporativos.

---

### ADR 003: Resiliência Off-grid & Modo Campo (PWA)

* **Status:** Aprovado e Implementado
* **Contexto:**
  No agronegócio, agrônomos, corretores e produtores frequentemente precisam consultar saldos de safras, contratos de CPR e extratos bancários em locais remotos da lavoura sem cobertura de sinal 3G/4G/5G.
* **Decisão:**
  Transformar o AgroFinance em uma aplicação **Progressive Web App (PWA)** com capacidade operacional offline:
  1. **Manifest Nativo:** `src/app/manifest.ts` servindo metadados e ícones em alta resolução.
  2. **Detecção de Conexão:** Ouvintes reativos para `online` e `offline` que alternam o estado global e informam o usuário através do `<OfflineFieldModeBanner />`.
  3. **Simulador com 1 Clique:** Botão `🌾 Modo Campo` no menu superior permitindo aos avaliadores técnicos testar a navegação resiliente com persistência local instantânea.
* **Consequências:**
  * Experiência de uso contínua mesmo sem internet.
  * Diferencial de produto alinhado com as dores reais do agronegócio brasileiro.

---

### ADR 004: Rigor Matemático e Validações de Domínio Financeiro

* **Status:** Aprovado e Implementado
* **Contexto:**
  Aplicações bancárias e de tesouraria agro exigem precisão matemática em cálculos de amortização, margem de garantia e validação documental. Validações superficiais (como checar apenas o tamanho do CPF) são sinais clássicos de código amador.
* **Decisão:**
  1. **Validação de CPF Módulo 11:** Implementação do algoritmo oficial da Receita Federal com cálculo ponderado dos dois dígitos verificadores e rejeição de sequências repetidas (`111.111.111-11`).
  2. **Tabela Price para CPR:** Cálculo analítico de parcelas mensais `PMT = PV * [i * (1 + i)^n] / [(1 + i)^n - 1]`.
  3. **Limite Prudencial LTV (70%):** Trava matemática estrita que impede a concessão de crédito se o valor solicitado exceder 70% do valor de mercado da safra sob custódia.
  4. **Trava de Tokens (*Token Lock*):** Bloqueio atômico das sacas oferecidas em garantia, impedindo que o produtor venda grãos já empenhados.
* **Consequências:**
  * Aderência às melhores práticas de compliance e segurança financeira.

---

### ADR 005: Pirâmide de Testes Automatizados & Acessibilidade WCAG

* **Status:** Aprovado e Implementado
* **Contexto:**
  Garantir estabilidade de regressão em 4 módulos críticos (Banking, RWA, CPR e Hedge) sem que a suíte de testes se torne lenta ou frágil no CI.
* **Decisão:**
  Estruturar a estratégia de garantia de qualidade em 3 níveis:
  1. **Testes Unitários e de Integração (Vitest):** 98 testes cobrindo formatadores, validações Zod, cálculo financeiro e mutações de store, atingindo cobertura de código superior a 85% com provider V8.
  2. **Testes End-to-End (Playwright):** 25 testes navegando em instâncias reais do Chromium, cobrindo fluxos de ponta a ponta (PIX em duas etapas, contratação de CPR, exercício de Hedge e Modo Campo).
  3. **Auditoria de Acessibilidade (Axe-Core):** Testes automatizados contra a norma internacional **WCAG 2.1 AA** validando labels, semântica e atributos acessíveis nos 5 fluxos principais da plataforma.
* **Consequências:**
  * Total de **123 testes automatizados aprovados (100% passing)** executados em menos de 1 minuto no GitHub Actions.

---

## 🚀 3. Visão de Evolução para Nível Sênior (Produção Corporativa)

Para evolução futura em um ambiente corporativo com mais de 100.000 cooperados:
1. **Persistência Remota Multi-Tenant:** Migração do `localStorage` para **PostgreSQL** com **Prisma / Drizzle ORM**, isolando dados por CNPJ de cooperativa agrícola.
2. **Streaming em Tempo Real Bidirecional:** Substituição do polling de 7s por **WebSockets / SSE** conectados a gateways de market data da B3 e CBOT.
3. **Assinatura Digital de CPRs:** Integração com certificados digitais **ICP-Brasil** ou **Gov.br** para formalização jurídica das Cédulas de Produto Rural.

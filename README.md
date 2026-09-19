# AgroFinance RWA Dashboard — Plataforma de Crédito e Ativos Tokenizados do Agro

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel_Active-success?style=for-the-badge&logo=vercel)](https://agrofinance-dashboard-dev.vercel.app/dashboard)
[![CI Pipeline](https://github.com/felipegardenghidev/agrofinance-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/felipegardenghidev/agrofinance-dashboard/actions)
![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwind-css)
![Vitest](https://img.shields.io/badge/Vitest-98_Unit_Passing-729B1B?style=flat-square&logo=vitest)
![Playwright](https://img.shields.io/badge/Playwright-20_E2E_Passing-45ba4b?style=flat-square&logo=playwright)
![Total Tests](https://img.shields.io/badge/Tests-118_Passing_Total-success?style=flat-square)
![Coverage](https://img.shields.io/badge/Coverage-85.8%25_V8-success?style=flat-square)
![API Route](https://img.shields.io/badge/Route_Handler-BFF_Quotes_Live-blue?style=flat-square)
![PWA](https://img.shields.io/badge/PWA-Offline_Field_Mode-orange?style=flat-square)

> 🚀 **Aplicação em Produção:** [https://agrofinance-dashboard-dev.vercel.app/dashboard](https://agrofinance-dashboard-dev.vercel.app/dashboard)

Plataforma bancária digital e de gestão de **Real World Assets (RWA)** voltada ao agronegócio brasileiro (commodities tokenizadas como Soja e Milho), derivativos agro (Hedge B3/CBOT), streaming de cotações com API Route Handler (BFF) do Bacen/B3, OpenGraph dinâmico e Modo Campo offline (PWA), construída com arquitetura limpa e **118 testes automatizados (100% passing)**.

---

## 🌾 Visão Geral & Contexto de Negócio

No agronegócio moderno, a tokenização de safras e recebíveis (**RWA - Real World Assets**) permite conectar produtores rurais diretamente a investidores institucionais e de varejo, antecipando receitas, travando preços futuros e garantindo liquidez antes da colheita.

O **AgroFinance** entrega uma interface de internet banking corporativo e tesouraria agro que consolida:
1. **Custódia de Tokens de Commodities:** Visualização de lotes de Soja Premium, Soja Orgânica e Milho Híbrido com cotações vivas, quantidade de tokens em carteira e oscilação diária (24h).
2. **Hedge Cambial & Derivativos Agro (B3 / CBOT):** Trava de preço mínimo garantido (*Put Options*) e NDF de dólar para proteger safras contra quedas de mercado e quebra de margem.
3. **Live Market Ticker (Streaming):** Fita contínua de cotações com atualização a mercado a cada 7 segundos, animações suaves de flash e recálculo reativo do patrimônio total sob custódia.
4. **Modo Campo & Resiliência Offline (PWA):** Manifesto PWA nativo, ícones de aplicação e fallback resiliente via cache local com banner de conectividade e botão de simulação para avaliadores.
5. **Analytics & Gráficos Interativos:** Gráfico Donut de alocação de carteira RWA e gráfico de tendências/cotações históricas com alternador de séries e tooltips interativos.
6. **Liquidação e Transferências Multimodais:** Módulo completo de transferências (PIX, TED), aportes em tokens RWA, liquidação financeira a mercado (Venda RWA) e resgate físico de commodities.
7. **Resgate Físico de Commodities (CDA / WA):** Emissão de certificados de retirada física de safras em armazéns credenciados com queima (*burn*) de tokens e instruções de frete/pesagem.
8. **Crédito Rural & CPR Digital (Cédula de Produto Rural):** Empréstimos com colateral RWA, cálculo de amortização Price, limite prudencial de LTV (70%), trava de tokens em garantia e quitação antecipada.
9. **Dark Mode & Acessibilidade W3C:** Suporte nativo a Modo Claro, Escuro e Sistema, com seletor acessível, navegação por teclado e folha de impressão corporativa em alto contraste.

---

## ✨ Funcionalidades Principais

### 📊 1. Dashboard Financeiro Executivo & Analytics
* **Métricas em tempo real:** Saldo disponível em conta corrente, valor total de ativos sob custódia e status KYC.
* **Gráfico de Alocação RWA (Donut SVG):** Distribuição proporcional de ativos por safra/token com detalhamento interativo central e legenda dinâmica.
* **Gráfico de Tendências de Cotações (Área/Linha SVG):** Histórico semestral de preços com alternador de commodities (`TOTAL`, `SOJA24`, `SOJAO`, `MLHO25`, `MLHOP`), grid de métricas (mínima, máxima, variação) e tooltips hover.
* **Tabela de Ativos RWA com Ações Rápidas:** Ações diretas por lote de grãos: `+ Aportar` (compra), `Vender` (liquidação a mercado) e `Resgatar` (retirada física).
* **Banner Inteligente de Hedge:** Card de alta visibilidade com atalho para a mesa de derivativos e simulação de travas de preço.

### 🛡️ 2. Módulo de Hedge Cambial & Derivativos Agro (B3 / CBOT)
* **Trava de Preço com Opções de Venda (Put Agro) & NDF:** Simulação em tempo real de travas de preço mínimo garantido (*Strike Price*) para safras de Soja (Março/2027), Soja Orgânica, Milho Híbrido e Dólar Futuro PTAX.
* **Mecanismo de Proteção Antivolatilidade:** Débito do prêmio da opção em conta corrente e emissão de contrato derivativo com hash criptográfico e código de câmara B3.
* **Monitoramento Ativo de Moneyness (ITM vs OTM):** Classificação dinâmica em tempo real: posições *In The Money (ITM)* exibem o ganho intrínseco garantido (+R$/saca) quando o mercado cai, permitindo o exercício da opção com crédito financeiro imediato em conta.
* **Cenário de Stress Test Integrado:** Simulação paramétrica de queda severa (-10% no spot) demonstrando o retorno bruto garantido para o produtor rural.

### 📡 3. Live Market Ticker & Streaming de Cotações (B3 / CBOT)
* **Fita de Cotações Contínua (Ticker Tape):** Exibição em tempo real de ativos agrícolas e cambiais (Soja Paranaguá, Soja Chicago CBOT, Milho Campinas B3, Dólar Comercial PTAX, Boi Gordo B3 e tokens RWA).
* **Animação Visual de Tick (Flash Feedback):** Feedback visual suave (`flashGreen` verde e `flashRed` vermelho) disparado dinamicamente a cada oscilação de tick.
* **Recálculo Reativo de Patrimônio:** A oscilação das cotações atualiza imediatamente o valor unitário dos tokens RWA e o patrimônio total sob custódia em todo o dashboard sem recarregar a página.
* **Controles do Avaliador:** Botões interativos para "Pausar / Retomar Cotações Vivas" e "⚡ Simular Tick B3" para teste imediato de reatividade.

### 🌾 4. Modo Campo & Resiliência Offline (PWA)
* **Progressive Web App (PWA):** Manifesto nativo Next.js 16 (`manifest.webmanifest`) com ícones temáticos SVG de alta resolução (192x192 e 512x512).
* **Detecção Automática de Queda/Retorno de Conexão:** Ouvintes de eventos de rede (`online`/`offline`) que ativam o banner de Modo Campo e emitem toasts contextuais.
* **Acesso Off-grid:** Consulta contínua a saldos, tokens em custódia, extrato histórico e contratos ativos com persistência segura via `localStorage`.
* **Botão Evaluator Toggle no Header:** Botão `🌾 Modo Campo` no menu superior (desktop e mobile) permitindo aos avaliadores técnicos simular a desconexão com 1 clique.

### 🌾 5. Módulo de Crédito Rural & CPR Digital (Cédula de Produto Rural)
* **Empréstimo com Colateral RWA:** Financiamento de capital de giro e insumos agrícolas lastreado na própria safra tokenizada em custódia (Soja e Milho).
* **Simulação Financeira Precisa (Tabela Price):** Cálculo de parcelas mensais, juros pré-fixados de 1.2% ao mês e valor total com encargos.
* **Política Prudencial de LTV (Loan-to-Value):** Trava automática em até 70% do valor de mercado dos grãos oferecidos em garantia.
* **Bloqueio e Desbloqueio de Tokens (*Token Lock*):** Sacas dadas em garantia são travadas no store, impedindo venda simultânea ou resgate físico no armazém.
* **Emissão & Registro de CPR:** Geração automática do número de registro regulatório da Cédula (ex: `CPR-2026-SOJA-...`), data de emissão e vencimento.
* **Quitação Antecipada Integrada:** Liquidação do saldo devedor com débito em conta corrente e destravamento automático e integral das commodities em carteira.

### ⚡ 6. Módulo de Nova Operação (PIX / TED / Aporte / Venda / Resgate Físico)
* **5 Modos de Operação Integrados:**
  * `⚡ PIX`: Transferência bancária instantânea.
  * `🏦 TED`: Transferência bancária tradicional com taxa simulada.
  * `🌾 Aporte RWA`: Compra de tokens com débito em conta e crédito na carteira de custódia.
  * `💵 Venda RWA`: Venda de tokens a mercado com débito de custódia e crédito financeiro imediato no saldo em conta.
  * `🚜 Resgate Físico`: Retirada física de sacas em armazéns gerais credenciados (Sorriso/MT, Bebedouro/SP, Rio Verde/GO, Santos/SP) com emissão de Certificado CDA/WA e queima (*burn*) de tokens.
* **Validação Tipada em Tempo Real:** Schemas dinâmicos via `Zod` que validam limites de saldo em dinheiro ou quantidade de tokens em custódia.
* **Atalhos Rápidos de Posição:** Botões percentuais (*25%*, *50%*, *75%*, *100% da Posição*) e valores pré-definidos.
* **Fluxo em Duas Etapas:** Tela de pré-confirmação com resumo de impacto patrimonial e comprovante digital com hash criptográfico simulado.

### 📜 7. Histórico de Transações, Filtros & Exportação
* **Exportação para CSV:** Geração de arquivo `.csv` compatível com Excel (separador `;`, formatação monetária em padrão BRL e encoding UTF-8 com BOM para suporte a acentuação gráfica), respeitando instantaneamente os filtros ativos.
* **Impressão Corporativa / PDF:** Folha de estilos `@media print` sob medida que oculta botões, filtros e menus, forçando contraste limpo preto-no-branco e inserindo cabeçalho bancário oficial.
* **Filtros Combinados:** Filtragem instantânea por Tipo (*Entradas* vs *Saídas*), Status (*Concluída*, *Pendente*, *Falhou*, *Cancelada*) e Busca Textual por descrição, destinatário ou memo.
* **Ordenação Bidirecional:** Ordenação clicável por data de movimentação ou por valor financeiro.
* **Modal de Detalhes Acessível:** Comprovante completo com hash de blockchain, fechamento por `Esc` e banners para certificados de resgate e liquidação RWA.

### 🔔 8. Central de Alertas & Notificações RWA
* **Notificações Reativas em Tempo Real:** Disparadas instantaneamente a cada operação financeira (PIX, TED), aporte RWA, liquidação a mercado, resgate físico com emissão de certificado ou contratação/quitação de CPR e travas de Hedge.
* **Alertas do Agronegócio:** Notificações semente para oscilações de cotações na B3/CBOT (+2.3% Soja), autorização de carregamento em silos (Sorriso/MT) e conformidade cadastral (KYC Bacen).
* **Filtros e Gestão:** Abas de filtragem (*Todas*, *Não lidas*, *🌾 RWA & Grãos*), marcar individualmente ou todas como lidas, exclusão pontual ou limpeza completa.

### 🌙 9. Dark Mode Nativo (Claro / Escuro / Sistema)
* Alternador de tema no Header (desktop e mobile) com ícones e persistência via `localStorage`.
* Zero FOUC (*Flash of Unstyled Content*) com script inline no `<head>`.
* Paleta otimizada no Tailwind CSS v4 para cards, gráficos SVG, formulários e modais.

### 🔄 10. Ferramentas para Avaliadores Técnicos
* **Restaurar Demo:** Botão no Header para retornar o banco local ao estado semente inicial com 1 clique.
* **Alternador Modo Campo:** Permite simular a desconexão de rede imediatamente.
* **Simulador de Ticks B3:** Dispara oscilação de mercado imediata na fita de cotações.

---

## 🏛️ Arquitetura & Estrutura de Diretórios

```text
agrofinance-dashboard/
├── .github/
│   └── workflows/
│       └── ci.yml                    # Pipeline de CI (Lint + Vitest + Next Build)
├── e2e/                              # Testes End-to-End com Playwright (Chromium)
│   ├── credit-cpr.spec.ts            # Fluxo completo de CPR Digital e colateral
│   ├── financial-operations.spec.ts  # PIX, resgate físico CDA/WA e filtros
│   ├── hedge-derivatives.spec.ts     # Contratação e exercício de Hedge B3
│   ├── live-market-ticker.spec.ts    # Streaming de cotações e simulação de ticks
│   ├── offline-field-mode.spec.ts    # Modo Campo PWA e navegação offline
│   └── theme-and-accessibility.spec.ts # Dark Mode, acessibilidade e reset
├── public/
│   ├── icon-192.svg                  # Ícone PWA 192x192
│   └── icon-512.svg                  # Ícone PWA 512x512
├── src/
│   ├── app/                          # Next.js App Router (Páginas e Rotas)
│   │   ├── dashboard/                # Painel principal consolidado com Analytics
│   │   ├── transactions/             # Extrato detalhado com filtros e ordenação
│   │   ├── new-operation/            # Formulário reativo de transferência/investimento
│   │   ├── credit/                   # Módulo de Crédito Rural & CPR com colateral RWA
│   │   ├── hedge/                    # Módulo de Hedge Cambial & Derivativos B3/CBOT
│   │   ├── manifest.ts               # Metadata Web App Manifest nativo Next.js
│   │   ├── loading.tsx               # Skeleton screens de carregamento inicial
│   │   ├── error.tsx                 # Error boundary global com recuperação
│   │   ├── not-found.tsx             # Página 404 personalizada
│   │   └── components/
│   │       ├── ui/                   # Design System atômico (Button, Card, Badge, Input, Spinner, ThemeToggle, ToastContainer)
│   │       ├── layout/               # Header responsivo com ações rápidas e MainLayout
│   │       └── features/             # LiveMarketTicker, OfflineFieldModeBanner, NotificationCenter, Charts
│   ├── lib/
│   │   ├── store.ts                  # Zustand Store com middleware persist (localStorage) e partialize
│   │   ├── validations.ts            # Schemas Zod dinâmicos (createOperationSchema)
│   │   ├── types.ts                  # Contratos estritos (RWA, CPR, Hedge, Quotes, Toasts)
│   │   ├── utils.ts                  # Formatadores BRL, Tabela Price, Math de Hedge e LTV
│   │   └── mockData.ts               # Dados semente realistas do agro, derivativos e CPR
│   └── __tests__/                    # Suíte de 16 Arquivos de Testes Vitest
├── vitest.config.ts                  # Configuração Vitest com V8 Coverage Provider
├── playwright.config.ts              # Configuração Playwright E2E com WebServer
└── package.json                      # Scripts de teste, lint e build
```

---

## 🧪 Pirâmide de Testes Automatizados & Cobertura de Código

A plataforma conta com **115 testes automatizados aprovados (100% passing)** e relatório formal de cobertura V8 com **86.17% de linhas cobertas**:

```bash
# Executar todos os 95 testes unitários e de componentes
pnpm test

# Gerar relatório formal de cobertura de código (V8 Engine)
pnpm test:coverage

# Executar todos os 20 testes End-to-End (Playwright Headless)
pnpm test:e2e

# Executar suíte completa unificada (Unitários + E2E)
pnpm run test:all
```

### 📊 Relatório de Cobertura V8 (`pnpm test:coverage`):

| Módulo / Camada | % Declarações (Stmts) | % Branches | % Funções | % Linhas (Lines) |
|---|---|---|---|---|
| **Design System (UI Components)** | **93.84%** | **73.80%** | **95.45%** | **93.10%** |
| `Button.tsx`, `Badge.tsx`, `Card.tsx`, `Input.tsx`, `Spinner.tsx` | 100% | 100% | 100% | 100% |
| **Componentes de Funcionalidade (Features)** | **88.79%** | **72.92%** | **80.23%** | **89.89%** |
| `PriceTrendsChart.tsx` | 94.33% | 61.11% | 92.30% | 98.00% |
| `OfflineFieldModeBanner.tsx` | 96.00% | 83.33% | 100% | 95.00% |
| `LiveMarketTicker.tsx` | 84.37% | 93.75% | 76.92% | 86.95% |
| `TransactionDetailModal.tsx` | 91.66% | 62.50% | 88.88% | 100% |
| **Gerenciamento de Estado (`store.ts`)** | **88.23%** | **72.16%** | **91.93%** | **88.75%** |
| **Layout (`MainLayout.tsx`)** | **100%** | **100%** | **100%** | **100%** |
| **Média Geral de Toda a Aplicação** | **84.52%** | **72.04%** | **80.61%** | **86.17%** |

---

## 🚀 Como Executar Localmente

### Pré-requisitos
* Node.js v20+ ou v22+
* pnpm (recomendado) ou npm

```bash
# 1. Clonar o repositório
git clone https://github.com/felipegardenghidev/agrofinance-dashboard.git
cd agrofinance-dashboard

# 2. Instalar dependências
pnpm install

# 3. Executar em ambiente de desenvolvimento
pnpm dev
# Acesse http://localhost:3000

# 4. Executar os testes automatizados
pnpm test

# 5. Executar cobertura de código
pnpm test:coverage

# 6. Gerar build de produção
pnpm run build
```

---

## 👨‍💻 Autor

Desenvolvido por **Felipe Gardenghi Gonçalves**  
Sertãozinho, SP — Brasil

* **LinkedIn:** [linkedin.com/in/felipegardenghi](https://www.linkedin.com/in/felipegardenghi/)
* **GitHub:** [github.com/felipegardenghidev](https://github.com/felipegardenghidev)
* **Portfólio Oficial:** [felipegardenghi.dev](https://felipegardenghi.dev)
# AgroFinance RWA Dashboard — Plataforma de Crédito e Ativos Tokenizados do Agro

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel_Active-success?style=for-the-badge&logo=vercel)](https://agrofinance-dashboard-dev.vercel.app/dashboard)
[![CI Pipeline](https://github.com/felipegardenghidev/agrofinance-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/felipegardenghidev/agrofinance-dashboard/actions)
![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwind-css)
![Vitest](https://img.shields.io/badge/Vitest-56_Unit_Passing-729B1B?style=flat-square&logo=vitest)
![Playwright](https://img.shields.io/badge/Playwright-11_E2E_Passing-45ba4b?style=flat-square&logo=playwright)
![Total Tests](https://img.shields.io/badge/Tests-67_Passing_Total-success?style=flat-square)
![Zustand](https://img.shields.io/badge/State-Zustand_Persist-orange?style=flat-square)
![Zod](https://img.shields.io/badge/Schema-Zod_v4-3068b7?style=flat-square)

> 🚀 **Aplicação em Produção:** [https://agrofinance-dashboard-dev.vercel.app/dashboard](https://agrofinance-dashboard-dev.vercel.app/dashboard)

Plataforma bancária digital e de gestão de **Real World Assets (RWA)** voltada ao agronegócio brasileiro (commodities tokenizadas como Soja e Milho), construída com arquitetura moderna orientada a componentes, reatividade em tempo real e suíte rigorosa de testes automatizados.

---

## 🌾 Visão Geral & Contexto de Negócio

No agronegócio moderno, a tokenização de safras e recebíveis (**RWA - Real World Assets**) permite conectar produtores rurais diretamente a investidores institucionais e de varejo, antecipando receitas e garantindo liquidez antes da colheita.

O **AgroFinance** entrega uma interface de internet banking corporativo que consolida:
1. **Custódia de Tokens de Commodities:** Visualização de lotes de Soja Premium, Soja Orgânica e Milho Híbrido com cotações, quantidade de tokens em carteira e oscilação diária (24h).
2. **Analytics & Gráficos Interativos:** Gráfico Donut de alocação de carteira RWA e gráfico de tendências/cotações históricas com alternador de séries e tooltips interativos.
3. **Liquidação e Transferências Multimodais:** Módulo completo de transferências (PIX, TED), aportes em tokens RWA, liquidação financeira a mercado (Venda RWA) e resgate físico de commodities.
4. **Resgate Físico de Commodities (CDA / WA):** Emissão de certificados de retirada física de safras em armazéns credenciados com queima (*burn*) de tokens e instruções de frete/pesagem.
5. **Reatividade e Persistência em Tempo Real:** Débito/crédito imediato de saldo, cálculo automático de cotas tokenizadas e atualização instantânea do extrato histórico.
6. **Dark Mode & Acessibilidade:** Suporte nativo a Modo Claro, Escuro e Sistema, com seletor acessível e folha de impressão em alto contraste.
7. **Governança & Compliance KYC:** Monitoramento de status cadastral de produtor rural e documentação regulatória (CPF, comprovante de produtor e biometria).

---

## ✨ Funcionalidades Principais

### 📊 1. Dashboard Financeiro Executivo & Analytics
* **Métricas em tempo real:** Saldo disponível em conta corrente, valor total de ativos sob custódia e status KYC.
* **Gráfico de Alocação RWA (Donut SVG):** Distribuição proporcional de ativos por safra/token com detalhamento interativo central e legenda dinâmica.
* **Gráfico de Tendências de Cotações (Área/Linha SVG):** Histórico semestral de preços com alternador de commodities (`TOTAL`, `SOJA24`, `SOJAO`, `MLHO25`, `MLHOP`), grid de métricas (mínima, máxima, variação) e tooltips hover.
* **Tabela de Ativos RWA com Ações Rápidas:** Ações diretas por lote de grãos: `+ Aportar` (compra), `Vender` (liquidação a mercado) e `Resgatar` (retirada física).
* **Extrato Resumido:** Exibição dinâmica das 5 movimentações mais recentes.

### ⚡ 2. Módulo de Nova Operação (PIX / TED / Aporte / Venda / Resgate Físico)
* **5 Modos de Operação Integrados:**
  * `⚡ PIX`: Transferência bancária instantânea.
  * `🏦 TED`: Transferência bancária tradicional com taxa simulada.
  * `🌾 Aporte RWA`: Compra de tokens com débito em conta e crédito na carteira de custódia.
  * `💵 Venda RWA`: Venda de tokens a mercado com débito de custódia e crédito financeiro imediato no saldo em conta.
  * `🚜 Resgate Físico`: Retirada física de sacas em armazéns gerais credenciados (Sorriso/MT, Bebedouro/SP, Rio Verde/GO, Santos/SP) com emissão de Certificado CDA/WA e queima (*burn*) de tokens.
* **Validação Tipada em Tempo Real:** Schemas dinâmicos via `Zod` que validam limites de saldo em dinheiro ou quantidade de tokens em custódia.
* **Atalhos Rápidos de Posição:** Botões percentuais (*25%*, *50%*, *75%*, *100% da Posição*) e valores pré-definidos.
* **Fluxo em Duas Etapas:** Tela de pré-confirmação com resumo de impacto patrimonial e comprovante digital com hash criptográfico simulado.

### 🌙 3. Dark Mode Nativo (Claro / Escuro / Sistema)
* Alternador de tema no Header (desktop e mobile) com ícones e persistência via `localStorage`.
* Zero FOUC (*Flash of Unstyled Content*) com script inline no `<head>`.
* Paleta otimizada no Tailwind CSS v4 para cards, gráficos SVG, formulários e modais.

### 📜 4. Histórico de Transações, Filtros & Exportação
* **Exportação para CSV:** Geração de arquivo `.csv` compatível com Excel (separador `;`, formatação monetária em padrão BRL e encoding UTF-8 com BOM para suporte a acentuação gráfica), respeitando instantaneamente os filtros ativos.
* **Impressão Corporativa / PDF:** Folha de estilos `@media print` sob medida que oculta botões, filtros e menus, forçando contraste limpo preto-no-branco e inserindo cabeçalho bancário oficial.
* **Filtros Combinados:** Filtragem instantânea por Tipo (*Entradas* vs *Saídas*), Status (*Concluída*, *Pendente*, *Falhou*, *Cancelada*) e Busca Textual por descrição, destinatário ou memo.
* **Ordenação Bidirecional:** Ordenação clicável por data de movimentação ou por valor financeiro.
* **Modal de Detalhes Acessível:** Comprovante completo com hash de blockchain, fechamento por `Esc` e banners para certificados de resgate e liquidação RWA.

### 🌾 6. Módulo de Crédito Rural & CPR Digital (Cédula de Produto Rural)
* **Empréstimo com Colateral RWA:** Financiamento de capital de giro e insumos agrícolas lastreado na própria safra tokenizada em custódia (Soja e Milho).
* **Simulação Financeira Precisa (Tabela Price):** Cálculo de parcelas mensais, juros pré-fixados de 1.2% ao mês e valor total com encargos.
* **Política Prudencial de LTV (Loan-to-Value):** Trava automática em até 70% do valor de mercado dos grãos oferecidos em garantia.
* **Bloqueio e Desbloqueio de Tokens (*Token Lock*):** Sacas dadas em garantia são travadas no store, impedindo venda simultânea ou resgate físico no armazém.
* **Emissão & Registro de CPR:** Geração automática do número de registro regulatório da Cédula (ex: `CPR-2026-SOJA-...`), data de emissão e vencimento.
* **Quitação Antecipada Integrada:** Liquidação do saldo devedor com débito em conta corrente e destravamento automático e integral das commodities em carteira.

### 🔔 7. Central de Alertas & Notificações RWA
* **Notificações Reativas em Tempo Real:** Disparadas instantaneamente a cada operação financeira (PIX, TED), aporte RWA, liquidação a mercado, resgate físico com emissão de certificado ou contratação/quitação de CPR.
* **Alertas do Agronegócio:** Notificações semente para oscilações de cotações na B3/CBOT (+2.3% Soja), autorização de carregamento em silos (Sorriso/MT) e conformidade cadastral (KYC Bacen).
* **Filtros e Gestão:** Abas de filtragem (*Todas*, *Não lidas*, *🌾 RWA & Grãos*), marcar individualmente ou todas como lidas, exclusão pontual ou limpeza completa.
* **Badging e Acessibilidade:** Badge com contagem de não lidas e animação de pulso, dropdown com suporte a teclado (`Escape`) e fechamento ao clicar fora.

### 🍞 8. Sistema Global de Feedback por Toasts Acessíveis
* **Notificações Flutuantes Não Intrusivas:** Sistema reativo alimentado via Zustand Store com suporte a múltiplos toasts simultâneos e auto-dismiss em 4 segundos.
* **Acessibilidade W3C:** Container ancorado com `role="status"` e `aria-live="polite"`, permitindo que usuários com tecnologia assistiva ouçam o resultado de transações sem perda de foco.
* **Categorias Semânticas:** Estilos para `success` (verde agro), `error` (rubro), `warning` (âmbar) e `info` (azul celeste).

### 🛡️ 9. Resiliência de Aplicação (App Router Skeletons & Error Boundary)
* **Loading Skeleton Global (`loading.tsx`):** Estrutura animada com CSS pulse renderizada durante a navegação inicial e transições pesadas, cobrindo Header, cards de KPI, gráficos e tabelas.
* **Error Boundary de Raiz (`error.tsx`):** Captura erros de renderização e estado de forma elegante, impedindo o crash da aplicação e provendo botão de recuperação (*Tentar Novamente*).
* **Página 404 Personalizada (`not-found.tsx`):** Interface temática do agronegócio com redirecionamento intuitivo de volta ao Dashboard executivo.

### 🔄 10. Ferramenta de Demonstração (Reset State)
* Botão **"Restaurar Demo"** no Header: permite aos avaliadores técnicos realizarem quantas operações desejarem e resetar os dados ao estado inicial com 1 clique.

---

## 🏛️ Arquitetura & Decisões de Engenharia

```text
agrofinance-dashboard/
├── .github/
│   └── workflows/
│       └── ci.yml                    # Pipeline de CI (Lint + Vitest + Next Build)
├── src/
│   ├── app/                          # Next.js App Router (Páginas e Rotas)
│   │   ├── dashboard/                # Painel principal consolidado com Analytics
│   │   ├── transactions/             # Extrato detalhado com filtros e ordenação
│   │   ├── new-operation/            # Formulário reativo de transferência/investimento
│   │   ├── credit/                   # Módulo de Crédito Rural & CPR com colateral RWA
│   │   ├── loading.tsx               # Skeleton screens de carregamento inicial
│   │   ├── error.tsx                 # Error boundary global com recuperação
│   │   ├── not-found.tsx             # Página 404 personalizada
│   │   ├── components/               # Camada de Componentes
│   │   │   ├── ui/                   # Design System atômico (Button, Card, Badge, Input, Spinner, ThemeToggle, ToastContainer)
│   │   │   ├── layout/               # Header com rotas ativas e MainLayout responsivo
│   │   │   └── features/             # Componentes de negócio (TransactionFilters, DetailModal, Charts, NotificationCenter)
│   ├── lib/
│   │   ├── store.ts                  # Zustand Store com middleware persist (localStorage) e partialize
│   │   ├── validations.ts            # Schemas Zod dinâmicos (createOperationSchema)
│   │   ├── types.ts                  # Contratos de tipagem TypeScript estritos (RWA, CPR, Toasts)
│   │   ├── utils.ts                  # Formatadores BRL, Tabela Price e cálculo de LTV de CPR
│   │   └── mockData.ts               # Dados semente realistas do agronegócio e contratos CPR
│   └── __tests__/                    # Suíte de Testes Automatizados (Vitest)
│       ├── validations.test.ts       # Testes unitários das regras de negócio do Zod
│       ├── store.test.ts             # Testes de mutação de estado e liquidação
│       ├── credit.test.ts            # Testes do motor de simulação e quitação de CPR
│       ├── ToastContainer.test.tsx   # Testes de acessibilidade e ciclo de vida dos Toasts
│       ├── utils.test.ts             # Testes de formatação monetária e helpers
│       ├── TransactionFilters.test.tsx # Teste de integração de filtros
│       ├── charts.test.tsx           # Testes dos componentes de gráficos interativos
│       ├── ThemeToggle.test.tsx      # Testes do alternador de tema
│       └── NotificationCenter.test.tsx # Testes da central de notificações e alertas
├── vitest.config.ts                  # Configuração do ambiente jsdom e aliases
└── vitest.setup.ts                   # Setup com jest-dom matchers
```

### Principais Decisões:
* **Next.js 16 + React 19:** Utilização de compilação Turbopack para performance extrema e pré-renderização estática de páginas.
* **Gráficos SVG Nativos sem Bloatware:** Implementação de gráficos vetoriais interativos sob medida, mantendo o bundle minúsculo, 100% responsivo e livre de problemas de hidratação SSR.
* **Zustand com Persistência Segura & Partialize:** Em vez de manter estados locais efêmeros, o estado financeiro e de contratos de CPR persiste em `localStorage` através de um store tipado, isolando estados transientes (como toasts efêmeros) via `partialize`.
* **Validação Dinâmica de Limites com Zod:** O schema de validação recebe dinamicamente o saldo em conta como parâmetro, assegurando que o usuário não transfira mais do que possui, mesmo após múltiplas transações sequenciais.
* **Mecânica de Trava de Colateral (Token Lock):** No módulo de crédito, o sistema garante prudência bancária ao travar as sacas de commodities dadas em garantia, impedindo dupla alienação enquanto a CPR estiver ativa.
* **Acessibilidade (a11y):** Modais com foco retido, tratamento de tecla `Escape`, contraste visual validado, `aria-live` em notificações toast e semântica de formulários acessíveis por leitores de tela.

---

## 🧪 Pirâmide de Testes Automatizados (Vitest + Playwright E2E)

A plataforma conta com **67 testes automatizados aprovados (100% passing)**, cobrindo testes unitários, testes de componentes com Testing Library e fluxos End-to-End em navegadores reais:

```bash
# Executar testes unitários e de componentes
pnpm test

# Executar testes End-to-End (Playwright Headless)
pnpm test:e2e

# Executar suíte completa (Unitários + E2E)
pnpm run test:all
```

```text
 ✓ src/__tests__/utils.test.ts (9 tests)
 ✓ src/__tests__/store.test.ts (13 tests)
 ✓ src/__tests__/ToastContainer.test.tsx (3 tests)
 ✓ src/__tests__/ThemeToggle.test.tsx (4 tests)
 ✓ src/__tests__/charts.test.tsx (4 tests)
 ✓ src/__tests__/TransactionFilters.test.tsx (3 tests)
 ✓ src/__tests__/NotificationCenter.test.tsx (6 tests)
 ✓ src/__tests__/credit.test.ts (5 tests)
 ✓ src/__tests__/validations.test.ts (9 tests)
 ✓ e2e/credit-cpr.spec.ts (4 tests)
 ✓ e2e/financial-operations.spec.ts (3 tests)
 ✓ e2e/theme-and-accessibility.spec.ts (4 tests)

 Total: 67 passed (56 Unit/Integration + 11 End-to-End)
```

### O que os testes cobrem:
1. **Regras de Negócio Financeiras & RWA:** Validações de limites de saldo em dinheiro, limites de custódia de tokens, bloqueio de valores negativos/zero e obrigatoriedade de armazém credenciado para resgate físico.
2. **Motor de Crédito Rural & CPR Digital:** Validação de cálculo de amortização (Tabela Price), limites de LTV (70%), trava de tokens em colateral, débito de quitação antecipada e liberação de garantias.
3. **Fluxos E2E Reais (Playwright):** Simulação completa de crédito no navegador Chromium, contratação de CPR on-chain, execução de transferências PIX em 2 etapas com verificação de comprovante, resgate físico com emissão de CDA/WA e filtros no extrato.
4. **Sistema de Feedback Toast & Acessibilidade:** Renderização com atributos acessíveis (`role="status"`, `aria-live="polite"`), auto-dismiss, atalho de teclado `Escape` para fechar modais/notificações e alternância persistente de Dark Mode.
5. **Mutação de Estado & Liquidação:** Débito/crédito de saldo, compra de tokens, venda a mercado e queima (*burn*) de tokens no resgate físico.
6. **Helpers de Formatação & CSV:** Validação de conversão de moeda (`R$ 1.250,50`), datas relativas, mascaramento de CPF, truncamento de hashes e geração de CSV estruturado com BOM UTF-8.

---

## 🗺️ Roadmap & Próximas Evoluções

As especificações detalhadas das próximas etapas planejadas para o projeto estão documentadas em [ROADMAP.md](ROADMAP.md):
1. **Testes End-to-End (E2E) com Playwright:** Cobertura de ponta a ponta dos fluxos de crédito/CPR, toasts e operações bancárias.
2. **Módulo de Hedge Cambial & Derivativos Agro:** Fixação de preço futuro de commodities (Opções Put e NDF cambial) integrados à B3/CBOT.
3. **Streaming de Cotações Vivas (SSE):** Atualizações reativas de cotações de grãos e moedas.
4. **PWA & Operação Offline:** Aplicativo instalável para uso do produtor rural em campo.

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

# 5. Gerar build de produção
pnpm run build
```

---

## 👨‍💻 Autor

Desenvolvido por **Felipe Gardenghi Gonçalves**  
Sertãozinho, SP — Brasil

* **LinkedIn:** [linkedin.com/in/felipegardenghi](https://www.linkedin.com/in/felipegardenghi/)
* **GitHub:** [github.com/felipegardenghidev](https://github.com/felipegardenghidev)
* **Portfólio Oficial:** [felipegardenghi.dev](https://felipegardenghi.dev)
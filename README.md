# AgroFinance RWA Dashboard — Plataforma de Crédito e Ativos Tokenizados do Agro

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel_Active-success?style=for-the-badge&logo=vercel)](https://feeagro-dashboard.vercel.app/dashboard)
[![CI Pipeline](https://github.com/felipegardenghidev/agrofinance-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/felipegardenghidev/agrofinance-dashboard/actions)
![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwind-css)
![Vitest](https://img.shields.io/badge/Vitest-30_Passing-729B1B?style=flat-square&logo=vitest)
![Zustand](https://img.shields.io/badge/State-Zustand_Persist-orange?style=flat-square)
![Zod](https://img.shields.io/badge/Schema-Zod_v4-3068b7?style=flat-square)

> 🚀 **Aplicação em Produção:** [https://feeagro-dashboard.vercel.app/dashboard](https://feeagro-dashboard.vercel.app/dashboard)

Plataforma bancária digital e de gestão de **Real World Assets (RWA)** voltada ao agronegócio brasileiro (commodities tokenizadas como Soja e Milho), construída com arquitetura moderna orientada a componentes, reatividade em tempo real e suíte rigorosa de testes automatizados.

---

## 🌾 Visão Geral & Contexto de Negócio

No agronegócio moderno, a tokenização de safras e recebíveis (**RWA - Real World Assets**) permite conectar produtores rurais diretamente a investidores institucionais e de varejo, antecipando receitas e garantindo liquidez antes da colheita.

O **AgroFinance** entrega uma interface de internet banking corporativo que consolida:
1. **Custódia de Tokens de Commodities:** Visualização de lotes de Soja Premium, Soja Orgânica e Milho Híbrido com cotações, quantidade de tokens em carteira e oscilação diária (24h).
2. **Analytics & Gráficos Interativos:** Gráfico Donut de alocação de carteira RWA e gráfico de tendências/cotações históricas com alternador de séries e tooltips interativos.
3. **Liquidação e Transferências Instantâneas:** Módulo completo de transferências bancárias (PIX, TED) e aportes diretos em pools de liquidez RWA.
4. **Reatividade e Persistência em Tempo Real:** Débito imediato de saldo, cálculo automático de cotas tokenizadas adquiridas e atualização instantânea do extrato histórico.
5. **Governança & Compliance KYC:** Monitoramento de status cadastral de produtor rural e documentação regulatória (CPF, comprovante de produtor e biometria).

---

## ✨ Funcionalidades Principais

### 📊 1. Dashboard Financeiro Executivo & Analytics
* **Métricas em tempo real:** Saldo disponível em conta corrente, valor total de ativos sob custódia e status KYC.
* **Gráfico de Alocação RWA (Donut SVG):** Distribuição proporcional de ativos por safra/token com detalhamento interativo central e legenda dinâmica.
* **Gráfico de Tendências de Cotações (Área/Linha SVG):** Histórico semestral de preços com alternador de commodities (`TOTAL`, `SOJA24`, `SOJAO`, `MLHO25`, `MLHOP`), grid de métricas (mínima, máxima, variação) e tooltips hover.
* **Tabela de Ativos RWA & Aporte Rápido:** Detalhamento por tipo de grão, ticker do token, quantidade, preço unitário, variação 24h e botão de aporte direto pré-configurado.
* **Extrato Resumido:** Exibição dinâmica das 5 movimentações mais recentes.

### ⚡ 2. Módulo de Nova Operação (PIX / TED / Investimento RWA)
* **Validação Tipada em Tempo Real:** Schemas dinâmicos via `Zod` que impedem valores nulos, negativos ou superiores ao saldo real disponível.
* **Atalhos para Avaliação:** Botões rápidos de valor (*+ R$ 500*, *+ R$ 1.500*, *+ R$ 5.000*, *Saldo Máximo*) e sugestões de destinatários (*Cooperativa Agro*, *Fertilizantes Safra Forte*, etc.).
* **Calculadora de Conversão RWA:** Ao selecionar um ativo de safra e digitar um valor, o sistema calcula previamente o volume de tokens que serão creditados na carteira.
* **Fluxo em Duas Etapas:** Tela de pré-confirmação com resumo de impacto no saldo futuro e comprovante digital com hash criptográfico simulado.

### 📜 3. Histórico de Transações, Filtros & Exportação
* **Exportação para CSV:** Geração de arquivo `.csv` compatível com Excel (separador `;`, formatação monetária em padrão BRL e encoding UTF-8 com BOM para suporte a acentuação gráfica), respeitando instantaneamente os filtros ativos.
* **Impressão Corporativa / PDF:** Folha de estilos `@media print` sob medida que oculta botões, filtros e menus, inserindo cabeçalho bancário com dados do produtor, número de conta, data/hora de emissão e saldo consolidado.
* **Filtros Combinados:** Filtragem instantânea por Tipo (*Entradas* vs *Saídas*), Status (*Concluída*, *Pendente*, *Falhou*, *Cancelada*) e Busca Textual por descrição, destinatário ou memo.
* **Ordenação Bidirecional:** Ordenação clicável por data de movimentação ou por valor financeiro.
* **Modal de Detalhes Acessível:** Exibição de comprovante completo com fechamento pela tecla `Esc` ou clique no backdrop e botão de cópia de hash de liquidação.

### 🔄 4. Ferramenta de Demonstração (Reset State)
* Botão **"Restaurar Demo"** no Header: permite aos avaliadores técnicos realizarem quantas operações desejarem e resetar os dados ao estado de fábrica com 1 clique.

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
│   │   ├── components/               # Camada de Componentes
│   │   │   ├── ui/                   # Design System atômico (Button, Card, Badge, Input, Spinner)
│   │   │   ├── layout/               # Header com rotas ativas e MainLayout responsivo
│   │   │   └── features/             # Componentes de negócio (TransactionFilters, DetailModal, Charts)
│   ├── lib/
│   │   ├── store.ts                  # Zustand Store com middleware persist (localStorage)
│   │   ├── validations.ts            # Schemas Zod dinâmicos (createOperationSchema)
│   │   ├── types.ts                  # Contratos de tipagem TypeScript estritos
│   │   ├── utils.ts                  # Formatadores de moeda BRL, datas e ordenadores
│   │   └── mockData.ts               # Dados semente realistas do agronegócio
│   └── __tests__/                    # Suíte de Testes Automatizados (Vitest)
│       ├── validations.test.ts       # Testes unitários das regras de negócio do Zod
│       ├── store.test.ts             # Testes de mutação de estado e liquidação
│       ├── utils.test.ts             # Testes de formatação monetária e helpers
│       ├── TransactionFilters.test.tsx # Teste de integração de filtros
│       └── charts.test.tsx           # Testes dos componentes de gráficos interativos
├── vitest.config.ts                  # Configuração do ambiente jsdom e aliases
└── vitest.setup.ts                   # Setup com jest-dom matchers
```

### Principais Decisões:
* **Next.js 16 + React 19:** Utilização de compilação Turbopack para performance extrema e pré-renderização estática de páginas.
* **Gráficos SVG Nativos sem Bloatware:** Implementação de gráficos vetoriais interativos sob medida, mantendo o bundle minúsculo, 100% responsivo e livre de problemas de hidratação SSR.
* **Zustand com Persistência Segura:** Em vez de manter estados locais efêmeros, o estado financeiro persiste em `localStorage` através de um store tipado, garantindo coerência entre diferentes telas sem mismatch de hidratação.
* **Validação Dinâmica de Limites com Zod:** O schema de validação recebe dinamicamente o saldo em conta como parâmetro, assegurando que o usuário não transfira mais do que possui, mesmo após múltiplas transações sequenciais.
* **Acessibilidade (a11y):** Modais com foco retido, tratamento de tecla `Escape`, contraste visual validado e semântica de formulários acessíveis por leitores de tela.

---

## 🧪 Suíte de Testes Automatizados (Vitest + Testing Library)

O projeto conta com **30 testes automatizados** cobrindo regras de negócio críticas:

```bash
pnpm test
```

```text
 ✓ src/__tests__/utils.test.ts (9 tests)
 ✓ src/__tests__/validations.test.ts (7 tests)
 ✓ src/__tests__/store.test.ts (7 tests)
 ✓ src/__tests__/TransactionFilters.test.tsx (3 tests)
 ✓ src/__tests__/charts.test.tsx (4 tests)

 Test Files  5 passed (5)
      Tests  30 passed (30)
```

### O que os testes cobrem:
1. **Regras de Negócio Financeiras:** Bloqueio de valores negativos, zero ou superiores ao saldo disponível; obrigatoriedade de destinatário com no mínimo 11 caracteres.
2. **Mutação de Estado & RWA:** Teste do débito de saldo, cálculo proporcional de tokens adquiridos na custódia e inserção de comprovantes no topo do extrato.
3. **Helpers de Formatação:** Validação de conversão de moeda (`R$ 1.250,50`), datas relativas, mascaramento de CPF e truncamento de hashes.
4. **Interatividade de Interface:** Renderização de filtros, alteração de select de tipos e disparo de buscas por evento de digitação.

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
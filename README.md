# AgroFinance RWA Dashboard — Plataforma de Crédito e Ativos Tokenizados do Agro

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel_Active-success?style=for-the-badge&logo=vercel)](https://agrofinance-dashboard-dev.vercel.app/dashboard)
[![CI Pipeline](https://github.com/felipegardenghidev/agrofinance-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/felipegardenghidev/agrofinance-dashboard/actions)
![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwind-css)
![Vitest](https://img.shields.io/badge/Vitest-40_Passing-729B1B?style=flat-square&logo=vitest)
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

### 🔄 5. Ferramenta de Demonstração (Reset State)
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

O projeto conta com **40 testes automatizados** cobrindo regras de negócio críticas:

```bash
pnpm test
```

```text
 ✓ src/__tests__/utils.test.ts (9 tests)
 ✓ src/__tests__/validations.test.ts (9 tests)
 ✓ src/__tests__/store.test.ts (11 tests)
 ✓ src/__tests__/ThemeToggle.test.tsx (4 tests)
 ✓ src/__tests__/charts.test.tsx (4 tests)
 ✓ src/__tests__/TransactionFilters.test.tsx (3 tests)

 Test Files  6 passed (6)
      Tests  40 passed (40)
```

### O que os testes cobrem:
1. **Regras de Negócio Financeiras & RWA:** Validações de limites de saldo em dinheiro, limites de custódia de tokens, bloqueio de valores negativos/zero e obrigatoriedade de armazém credenciado para resgate físico.
2. **Mutação de Estado & Liquidação:** Débito/crédito de saldo, compra de tokens, venda a mercado, queima (*burn*) de tokens no resgate físico e persistência do tema.
3. **Alternância de Tema (Dark Mode):** Renderização acessível, abertura/fechamento por teclado (`Esc`), seleção e alteração do tema no store.
4. **Helpers de Formatação & CSV:** Validação de conversão de moeda (`R$ 1.250,50`), datas relativas, mascaramento de CPF, truncamento de hashes e geração de CSV estruturado com BOM UTF-8.
5. **Interatividade de Interface & Gráficos:** Renderização de filtros, alteração de tipos, busca textual dinâmica e comportamento do gráfico Donut e histórico.

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
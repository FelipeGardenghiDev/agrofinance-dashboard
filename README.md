# FeeAgro RWA Dashboard - Teste Técnico Frontend Senior

Dashboard banking focado em **Real World Assets (RWA)** do agronegócio brasileiro (Soja/Milho), desenvolvido com Next.js 15 + Tailwind CSS v4 + TypeScript. Implementa módulo completo de área logada com dashboard, histórico de transações e simulação de PIX.

## 🚀 Tecnologias & Stack

- Next.js 15 (App Router) 
- React 19 
- TypeScript 5.6
- Tailwind CSS v4 
- Zod React Hook Form

## 📱 Funcionalidades Implementadas

✅ **Dashboard Responsivo**  
- Cards de saldo total, portfolio RWA (Soja/Milho)  
- Status KYC com badge visual 
- Sparkline de rentabilidade (mock data)  
- Mobile-first (320px → desktop)

✅ **Histórico de Transações**  
- Lista paginada com filtros (data/tipo/status)  
- Ordenação por clique em headers  
- Modal de detalhes com timeline  
- Estados: loading, empty, error

✅ **Nova Operação (PIX Simulado)**  
- Formulário validado (Zod + React Hook Form)  
- Autocomplete de beneficiários salvos  
- Resumo pré-confirmação com modal  
- Notificação de sucesso/erro

✅ **UX States Completos**  
- Loading skeletons  
- Empty states com CTAs  
- Error boundaries com retry  
- Responsive drawer (mobile)

## 🎨 Design System FeeAgro

- Paleta oficial adaptada do logo/brand
- Tema claro 
- Componentes reutilizáveis (`ui/button`, `ui/card`, `ui/badge`)  
- Animações suaves

## 🏗️ Arquitetura & Estrutura

```
src/
├── app/ # App Router + Server Components
│ ├── dashboard/ # Lazy-loaded page
│ ├── transactions/ # + filtros via searchParams
│ └── new-operation/ # + Form server actions
├── components/ # Design System
│  ├── ui/ # Button, Input, Spinner, Card, Badge
│  ├── layout/ # Header e Main Layout
│  └── features/ # Filters e Modal
└── lib/ # Utils, validators, Mock JSON
```

**Decisões Arquiteturais:**
- **App Router** (Next.js 15) para performance + parallel routes  
- **Server Actions** para forms (sem API routes extras)   
- **Mock-first** (JSON local) com estrutura preparada para API real

## 🚀 Como Rodar Localmente

```bash
# 1. Clone e instale
git clone https://github.com/felipegardenghidev/feeagro-dashboard.git
cd feeagro-dashboard
pnpm install

# 2. Rode o projeto
pnpm dev

# 3. Abra http://localhost:3000

Scripts Disponíveis:
pnpm dev
pnpm build
pnpm lint
```

### 📈 Próximas Melhorias (Tempo Extra)
- Deploy (Vercel ou outro)
- Persistência - Supabase/PlanetScale + Drizzle ORM
- Testes - Vitest + @testing-library/react + MSW
- Autenticação - NextAuth.js + Passkeys
- Analytics - PostHog/PostAnalytics
- Desenvolvimento de Dark Mode
- Foco em acessibilidade


### 📝 Notas do Desenvolvimento
Tempo total: 4h

Foco principal: Arquitetura + UI/UX

Dados mock realistas baseados em RWA agro brasileiro


### Pontos de Destaque:
- ✅ TypeScript estrito (strict: true)
- ✅ Acessibilidade básica (ARIA labels)
- ✅ Bundle otimizado (Next.js analyzer)
- ✅ SEO preparado (metadata dinâmica)

```
Desenvolvido por Felipe Gardenghi Gonçalves
Sertãozinho, SP - 08/02/2026
```
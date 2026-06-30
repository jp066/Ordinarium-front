# Ordinarium — Frontend

Portal católico para consultar horários de missas, confissões e adorações em paróquias, explorar locais no mapa, acompanhar a liturgia diária e colaborar com doações.

## Tech Stack

- **Framework:** SvelteKit 2 (Svelte 5 — Runes mode)
- **Linguagem:** TypeScript 6
- **Estilos:** Tailwind CSS v4
- **Mapas:** Leaflet + `@types/leaflet`
- **Ícones:** Lucide (`@lucide/svelte`)
- **Adapter:** `@sveltejs/adapter-auto` (Vercel, Netlify, Cloudflare, etc.)
- **Lint/Format:** ESLint 10 + Prettier 3

## Scripts

| Comando           | Descrição                               |
| ----------------- | --------------------------------------- |
| `npm run dev`     | Inicia servidor de desenvolvimento      |
| `npm run build`   | Build de produção                       |
| `npm run preview` | Pré-visualiza o build                   |
| `npm run check`   | Verificação de tipos com `svelte-check` |
| `npm run lint`    | ESLint + Prettier                       |
| `npm run format`  | Formata código com Prettier             |

## Estrutura

```
src/
├── lib/
│   ├── assets/        # Imagens e ícones
│   ├── components/    # Componentes Svelte reutilizáveis
│   ├── mockData.ts    # Dados mock de igrejas/horários
│   └── theme.svelte.ts # Estado global do tema
├── routes/
│   ├── api/           # Endpoints REST (churches, schedules)
│   ├── colaborar/     # Página de doações
│   ├── horarios/      # Grade de horários litúrgicos
│   ├── liturgia/      # Liturgia diária (API externa)
│   └── paroquias/     # Mapa + cards de paróquias
└── app.html           # Template HTML principal
```

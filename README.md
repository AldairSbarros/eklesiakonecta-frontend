# EklesiaKonecta Frontend

Este projeto é o frontend da plataforma EklesiaKonecta, desenvolvido em React + TypeScript + Vite.

## Pré-requisitos
- Node.js 18+
- npm 9+

## Instalação
```sh
npm install
```

## Ambiente de desenvolvimento
```sh
npm run dev
```

## Build para produção
```sh
npm run build
```
Os arquivos finais serão gerados na pasta `dist/`.

## Variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```env
VITE_BIBLE_API_KEY=xxxx-xxxx-xxxx-xxxx
VITE_BIBLE_API_URL=https://4.dbt.io/api
VITE_API_URL=https://api.eklesia.app.br
```
Nunca suba o `.env` para o GitHub!

## Estrutura de pastas
- `src/components/` — Componentes reutilizáveis
- `src/pages/` — Páginas principais
- `src/types/` — Tipos TypeScript centralizados
- `src/backend/services/` — Serviços de integração com backend

## Principais comandos
- `npm run dev` — Inicia o servidor de desenvolvimento
- `npm run build` — Gera o build para produção
- `npm run lint` — Executa o linter

## Deploy
1. Faça o build (`npm run build`)
2. Envie a pasta `dist/` para o servidor VPS
3. Configure o servidor web (ex: nginx) para servir os arquivos estáticos

## Segurança
- Nunca exponha suas chaves/API_KEY no código ou no repositório
- Use variáveis de ambiente e mantenha o `.env` fora do versionamento

## Contato
Dúvidas ou sugestões: [AldairSbarros](https://github.com/AldairSbarros)

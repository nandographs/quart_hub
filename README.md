# QUART · Pré-work

Hub onde os clientes da QUART respondem o briefing estratégico de branding. Cada projeto tem um link, cada pessoa da equipe do cliente responde com o próprio nome, e as respostas chegam no painel `/admin`.

## Rodar no computador

```bash
npm install
npm run dev
```

Abra http://localhost:3000/admin. A senha do painel fica em `.env.local` (`ADMIN_PASSWORD`).

Localmente, o banco de dados e os arquivos enviados ficam na pasta `.data/`. Para começar do zero, é só apagar essa pasta.

## Como usar

1. No painel, crie um projeto com o nome do cliente.
2. Copie o link do projeto e envie para o cliente.
3. Cada pessoa (dono, sócios, equipe, marketing) entra pelo link, informa nome e e-mail e recebe um link pessoal. Quem usar o mesmo e-mail de novo continua de onde parou.
4. No painel você acompanha o progresso de cada pessoa, lê as respostas individuais, compara as respostas lado a lado e exporta em PDF (botão **Exportar PDF** → "Salvar como PDF").

## Editar as perguntas

Todo o roteiro está em [`src/content/prework.ts`](src/content/prework.ts). Dá para mudar textos, trocar a ordem e adicionar ou remover perguntas sem mexer no resto. Os tipos de pergunta disponíveis estão em [`src/content/types.ts`](src/content/types.ts):

| Tipo | Uso |
|---|---|
| `text` | Resposta longa |
| `fields` | Vários campos na mesma tela (`layout: "columns"` coloca lado a lado) |
| `list` | Itens repetíveis ("+ adicionar concorrente") |
| `choice` | Escolha entre opções, em `chips` ou `cards` |
| `files` | Upload de arquivos + links |
| `toggle` | Sim/não com detalhe |

Cuidado ao renomear o `id` de uma pergunta que já tem respostas: as respostas antigas ficam guardadas com o id anterior.

## Publicar (Vercel + Supabase)

1. Importe o repositório na Vercel.
2. Em **Settings → Environment Variables**, crie `ADMIN_PASSWORD` (a senha do painel).
3. Em **Integrations**, adicione a integração **Supabase** e conecte o projeto do Supabase. Ela cria a conexão do banco sozinha.
4. Em **Storage**, crie um **Blob Store** (arquivos enviados pelos clientes).
5. Faça o redeploy. As tabelas são criadas sozinhas no primeiro acesso.

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

## Publicar (Vercel)

1. Suba esta pasta para um repositório no GitHub e importe na [Vercel](https://vercel.com/new).
2. No projeto da Vercel, em **Storage**:
   - conecte um **Postgres** (Neon). Isso cria a variável `DATABASE_URL`.
   - crie um **Blob Store**. Isso cria a variável `BLOB_READ_WRITE_TOKEN` (é onde ficam os arquivos que os clientes enviam).
3. Em **Settings → Environment Variables**, adicione `ADMIN_PASSWORD` (a senha do painel) e `ADMIN_SECRET` (um texto longo e aleatório).
4. Faça o deploy. As tabelas do banco são criadas sozinhas no primeiro acesso.

Para usar um domínio próprio depois, é só adicionar em **Settings → Domains**.

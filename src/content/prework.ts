import type { Questionnaire } from "./types";

const FRENTES = "Pense em três frentes: sua Marca, seu Negócio e sua Comunicação.";

export const prework: Questionnaire = {
  id: "prework",
  title: "Pré-work",
  subtitle: "Briefing estratégico de branding",
  chapters: [
    {
      id: "empresa",
      number: "01",
      title: "Informações gerais da empresa",
      description: "Quem é a organização, de onde ela vem e com quem disputa espaço.",
      minutes: 10,
      questions: [
        {
          id: "assets",
          kind: "files",
          title: "Adicione a logo da empresa e os assets visuais da organização.",
          hint: "Logo, manual de marca, fotos, papelaria, embalagens. Qualquer formato serve. Se estiver numa pasta online, cole o link.",
          links: true,
          optional: true,
        },
        {
          id: "oferta",
          kind: "fields",
          title: "O que exatamente vocês vendem, e qual o ticket médio?",
          fields: [
            { id: "oferta", label: "O que vendem", multiline: true, placeholder: "Produtos, serviços, linhas, formatos…" },
            { id: "ticket", label: "Ticket médio", placeholder: "Ex.: R$ 350 por pedido" },
          ],
        },
        {
          id: "proposito",
          kind: "text",
          title: "Qual o propósito da sua empresa?",
          placeholder: "Por que ela existe, além de vender?",
        },
        {
          id: "nome",
          kind: "fields",
          title: "Qual é o nome da empresa? E por que escolheram este nome?",
          fields: [
            { id: "nome", label: "Nome da empresa" },
            { id: "porque", label: "Por que este nome", multiline: true },
          ],
        },
        {
          id: "historia",
          kind: "fields",
          title: "Quando foi fundada e qual a sua história?",
          fields: [
            { id: "fundacao", label: "Ano de fundação", placeholder: "Ex.: 2016" },
            { id: "historia", label: "A história", multiline: true, placeholder: "Como começou, os marcos, as viradas…" },
          ],
        },
        {
          id: "concorrentes",
          kind: "list",
          title: "Quem são seus principais concorrentes?",
          itemLabel: "Concorrente",
          addLabel: "Adicionar concorrente",
          fields: [
            { id: "nome", label: "Nome" },
            { id: "link", label: "Site ou perfil", placeholder: "https://" },
            { id: "obs", label: "O que você observa neles", multiline: true },
          ],
        },
      ],
    },
    {
      id: "publico",
      number: "02",
      title: "Público-alvo",
      description: "Para quem a marca fala hoje e por quais canais.",
      minutes: 7,
      questions: [
        {
          id: "perfis",
          kind: "list",
          title: "Quais são os principais perfis de consumidores da empresa?",
          itemLabel: "Perfil",
          addLabel: "Adicionar perfil",
          fields: [
            { id: "nome", label: "Como você chama esse perfil", placeholder: "Ex.: casais 30+ que recebem em casa" },
            { id: "descricao", label: "Quem são, o que buscam, como compram", multiline: true },
          ],
        },
        {
          id: "canais",
          kind: "choice",
          title: "Como a empresa se comunica hoje com esses clientes? Quais canais utiliza?",
          multiple: true,
          variant: "chips",
          other: true,
          options: [
            { id: "instagram", label: "Instagram" },
            { id: "whatsapp", label: "WhatsApp" },
            { id: "site", label: "Site" },
            { id: "tiktok", label: "TikTok" },
            { id: "linkedin", label: "LinkedIn" },
            { id: "youtube", label: "YouTube" },
            { id: "email", label: "E-mail" },
            { id: "loja", label: "Loja física / ponto de venda" },
            { id: "eventos", label: "Eventos" },
            { id: "anuncios", label: "Anúncios pagos" },
            { id: "imprensa", label: "Imprensa" },
          ],
          detail: {
            id: "detail",
            label: "Como é essa comunicação hoje?",
            multiline: true,
            placeholder: "Frequência, tom, quem cuida, o que funciona e o que não funciona…",
          },
        },
        {
          id: "exemplos",
          kind: "files",
          title: "Compartilhe exemplos de comunicação que fizeram ou fazem nos pontos de contato que usam.",
          hint: "Materiais de divulgação, posts de redes sociais, campanhas. Envie arquivos ou cole links.",
          links: true,
          optional: true,
        },
      ],
    },
    {
      id: "desafio",
      number: "03",
      title: "Desafio atual",
      description: "Onde a marca está, o que trava e onde precisa chegar.",
      minutes: 15,
      questions: [
        {
          id: "contexto",
          kind: "text",
          title: "Como você enxerga o contexto em que sua empresa está inserida? Quais são os principais desafios que ela enfrenta hoje?",
          hint: "Por exemplo: concorrência, inovação, expansão de mercado, entre outros.",
        },
        {
          id: "metas",
          kind: "fields",
          title: "Qual é a principal meta da empresa a curto, médio e longo prazo?",
          layout: "columns",
          fields: [
            { id: "curto", label: "Curto prazo", multiline: true },
            { id: "medio", label: "Médio prazo", multiline: true },
            { id: "longo", label: "Longo prazo", multiline: true },
          ],
        },
        {
          id: "forcas",
          kind: "fields",
          title: "Promotores, detratores e aceleradores.",
          hint: FRENTES,
          layout: "columns",
          fields: [
            { id: "promotores", label: "Promotores", hint: "As principais forças e vantagens.", multiline: true },
            { id: "detratores", label: "Detratores", hint: "Os principais pontos de dor.", multiline: true },
            { id: "aceleradores", label: "Aceleradores", hint: "As principais oportunidades.", multiline: true },
          ],
        },
        {
          id: "mpg",
          kind: "fields",
          title: "O que você gostaria de manter, perder ou ganhar durante este projeto?",
          hint: FRENTES,
          layout: "columns",
          fields: [
            { id: "manter", label: "Manter", multiline: true },
            { id: "perder", label: "Perder", multiline: true },
            { id: "ganhar", label: "Ganhar", multiline: true },
          ],
        },
        {
          id: "motivacoes",
          kind: "text",
          title: "Quais suas principais motivações para buscar o branding? O que você espera que esse projeto resolva?",
        },
        {
          id: "areas",
          kind: "text",
          title: "Quais áreas da empresa precisam de mais foco para que a marca seja mais reconhecida ou valorizada?",
        },
        {
          id: "rumo",
          kind: "toggle",
          title: "Prevê alterações de rumo da empresa em breve?",
          hint: "Por exemplo: abrir ou fechar lojas, lançar site, novos produtos, sociedade.",
          yesLabel: "Sim, prevejo",
          noLabel: "Não por agora",
          detail: { id: "detail", label: "Conte o que está previsto", multiline: true },
        },
      ],
    },
    {
      id: "referencias",
      number: "04",
      title: "Referências e benchmarks",
      description: "Links, materiais e marcas que servem de parâmetro.",
      minutes: 8,
      questions: [
        {
          id: "links",
          kind: "list",
          title: "Links úteis",
          hint: "Matérias ou estudos recentes relevantes sobre o seu mercado ou algum concorrente.",
          itemLabel: "Link",
          addLabel: "Adicionar link",
          optional: true,
          fields: [
            { id: "url", label: "Link", placeholder: "https://" },
            { id: "sobre", label: "Do que se trata" },
          ],
        },
        {
          id: "benchmarks",
          kind: "list",
          title: "Quais marcas inspiram o seu negócio e com quem podemos aprender?",
          hint: "Podem ser de qualquer mercado.",
          itemLabel: "Marca",
          addLabel: "Adicionar marca",
          fields: [
            { id: "nome", label: "Marca" },
            { id: "link", label: "Site ou principal ponto de contato", placeholder: "https://" },
            { id: "inspira", label: "Por que inspira? O que ela faz bem?", multiline: true },
            { id: "incomoda", label: "O que você não gosta ou te incomoda nela?", multiline: true },
          ],
        },
      ],
    },
    {
      id: "conducao",
      number: "05",
      title: "Condução do projeto",
      description: "Como conduzir e adaptar o projeto para você e sua empresa.",
      minutes: 2,
      questions: [
        {
          id: "conducao",
          kind: "choice",
          title: "Estamos chegando ao fim. Como você prefere que seja a condução do nosso projeto?",
          hint: "Marque quantas opções quiser.",
          multiple: true,
          variant: "cards",
          options: [
            { id: "corrida", label: "Rotina corrida", description: "Tenho a rotina corrida e pouco tempo para as atividades." },
            { id: "dinamico", label: "Dinâmico e prático", description: "Gosto de atividades mais dinâmicas e práticas." },
            { id: "profundo", label: "Em profundidade", description: "Gosto de entrevistas e reuniões mais aprofundadas e detalhadas." },
            { id: "informal", label: "Rápido e informal", description: "Prefiro formas de comunicação rápidas e informais, como WhatsApp." },
          ],
        },
      ],
    },
  ],
};

export function getChapter(id: string) {
  return prework.chapters.find((c) => c.id === id);
}

export function findQuestion(id: string) {
  for (const chapter of prework.chapters) {
    const question = chapter.questions.find((q) => q.id === id);
    if (question) return { chapter, question };
  }
  return undefined;
}

export const totalMinutes = prework.chapters.reduce((sum, c) => sum + c.minutes, 0);

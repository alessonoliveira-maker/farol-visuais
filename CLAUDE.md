> LEIA TAMBÉM, NESTE NÍVEL: ./STATUS.md  ./PLAN.md
> Para OPERAR a produção: ./_operacao/ORQUESTRADOR.md, e nada mais deste nível.

# Frente: Catálogo VISUAIS do Farol

**Responsabilidade:** mostruário de visuais para copiar e colar no Farol (`../app/`): 27 famílias, 205 modelos, 814 versões planejadas, cada versão uma pasta com `Chart.tsx`, `data.ts`, `meta.json` e dois `preview.svg`, desenhada com os tokens e formatadores do próprio Farol e verificada por ferramenta (`_render/`). Dado 100% fictício.

**Regra de leitura, a mais importante deste nível.** Os documentos de régua são grandes (`CONTRATO.md` 99 KB, `ARMADILHAS.md` 96 KB, `PRODUCAO.md` 89 KB) e **ninguém os lê inteiros para trabalhar**:

| Papel | Lê | Não lê |
|---|---|---|
| Orquestrador (a sessão) | `_operacao/ORQUESTRADOR.md`, este arquivo, Fase 0 do `PLAN.md` | régua, estudo, PNG, código |
| Produtor (agente) | o dossiê de `npm run dossie -- <familia>/<modelo>` e o modelo-guia | `CONTRATO`, `ARMADILHAS`, `PRODUCAO`, estudo da família |
| Revisor (agente) | `CHECKLIST_REVISAO.md` e as seções de regras do dossiê | `PRODUCAO` |
| Ferramenta (agente) | só o que o item do PLAN nomeia | `PRODUCAO` inteiro |

Consulta pontual **por código** (`Grep` por `REC-8`, `ACE-5`) é sempre permitida. `PRODUCAO.md` é o diário de auditoria do dono; o regime vigente está aqui e em `_operacao/`.

**Arquivos-chave:**
- `README.md`: índice do catálogo, como navegar, famílias, campos do catálogo, pendências de fechamento das famílias.
- `CONTRATO.md`: a lei de autoria (estrutura, anatomia, imports, tokens, seção 14.1 com o peso de cada regra, seção 17 com os códigos TIP, COR, EIX, ROT, ANO, NUM, ESP, EST, DIC, ACE).
- `CHECKLIST_REVISAO.md`: 32 perguntas de sim ou não; um "não" reprova.
- `ARMADILHAS.md`: 73 entradas por código (REC, GEO, TOK, DAD) e as dez perguntas de autorrevisão ("Antes de entregar").
- `_render/`: ferramenta; comandos abaixo. `_render/.qa/` é saída regenerável (fora do git), menos `revisao/`, que guarda os vereditos presos ao sha1 do código.
- `_estudo/catalogo.json`: a especificação das 814 versões (título, caso de uso, o que demonstra, canvas). Não se edita à mão.
- `_operacao/`: o kit de operação (protocolo, fila, decisões pendentes, LOG). Briefings dos agentes em `.claude/agents/visuais-*.md` na raiz do repositório.
- `validation/`: pareceres de revisão e notas de ferramenta.

**Comandos** (de dentro de `_render/`, após `npm install`):

| Comando | Para quê |
|---|---|
| `npm run dossie -- <familia>/<modelo>` | Gera a leitura única do produtor em `.qa/dossie/` |
| `npm run render -- <caminho> --tema ambos` | Previews e PNGs de conferência |
| `npm run check -- <caminho>` | Contrato, READMEs, 15 guardas e tipos; `0 com erro` é o portão de produção |
| `npm run revisao -- <f>/<m>/<v> aprovado\|reprovado "nota"` | Veredito, só pelo revisor |
| `npm run pendencias [-- --sem-tipos]` | Estado do catálogo contra o disco |
| `node ../_operacao/fila.mjs --proximos N` | O que vem a seguir, com o prompt de cada agente |
| `npm run galeria`, `npm run selftest` | Galeria e provas da ferramenta |

**Quatro contagens, e elas não são intercambiáveis:** versões planejadas (814); no disco (`Chart.tsx` existe); prontas (check em zero erro **e** veredito válido); modelos completos (todas as versões no disco). Antes de citar um número diga qual dos quatro é. `node _operacao/fila.mjs --resumo` imprime os quatro.

**Papéis e portões:** produtor entrega com `check` em zero erros (aviso passa); revisor independente registra o veredito; uma única rodada de correção por modelo; o que sobra vira "Pendências conhecidas" no README do modelo. Produtor nunca registra veredito. Unidade de trabalho é o **modelo**, não a versão.

**Regras locais:** português do Brasil acentuado em texto de tela e documento; sem hífen, travessão ou meia risca como separador de frase; datas `YYYY-MM-DD`; zero nome real de pessoa, empresa, marca ou produto no dado; fonte Inter proibida; cor só por token; nada de `Math.random` ou `Date.now`; nenhuma dependência nova; `../app/` é somente leitura salvo item do PLAN que o nomeie; escrita de arquivo longo em blocos de até 150 linhas; a ferramenta em `_render/scripts/` só muda por item da Fase 0 do PLAN, com `selftest` verde antes e depois.

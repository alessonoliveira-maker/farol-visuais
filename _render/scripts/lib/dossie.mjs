/**
 * Montagem do dossiê de produção de um modelo do catálogo.
 *
 * POR QUE EXISTE: quem produz uma versão lia `CONTRATO.md` (86 KB), `ARMADILHAS.md` (66 KB) e
 * `PRODUCAO.md` (31 KB) antes da primeira linha de código, e pagava esse contexto uma vez por
 * agente, com 467 versões ainda por produzir. O dossiê é um arquivo só, com o que aquele modelo
 * precisa, e o resto continua consultável por código.
 *
 * REGRA DE PROJETO: todo texto de regra aqui é RECORTE LITERAL da origem, nunca reescrita. Nada
 * neste arquivo resume uma regra com palavras próprias. O motivo é dívida paga nesta frente: o
 * `ARMADILHAS.md` mantinha numeração à mão, o cabeçalho divergiu do corpo, e a correção foi passar a
 * derivar o índice do corpo por script. Segunda fonte da verdade escrita à mão deriva, sempre.
 *
 * Quando um recorte precisa ser mais curto, ele é mais curto por CORTE DETERMINÍSTICO (frases
 * inteiras do item, com orçamento em bytes; uma subseção inteira pelo título; o corpo inteiro de uma
 * entrada, ficando só o título), e o dossiê diz em que código o leitor acha o que ficou fora.
 */
import fs from 'node:fs';
import path from 'node:path';

import { ASCENDENTE, CENTRAL_DESLOCA, DESCENDENTE, LARGURA_PADRAO, TABELAS_DE_GLIFO, larguraDoTexto } from './colisao.mjs';
import { razaoDeContraste } from './contraste.mjs';
import { resumoDaFila } from './divida.mjs';
import { lerTokensDoFarol, medirMarca } from './marca.mjs';
import { medirOpacidadeMinima, medirTextoSobreMarca } from './opacidade.mjs';
import { CANVAS_PRESETS } from './meta.mjs';
import { APP_SRC, RENDER_DIR, VISUAIS_DIR, toPosix } from './paths.mjs';

export const CONTRATO_PATH = path.join(VISUAIS_DIR, 'CONTRATO.md');
export const ARMADILHAS_PATH = path.join(VISUAIS_DIR, 'ARMADILHAS.md');
export const CATALOGO_PATH = path.join(VISUAIS_DIR, '_estudo', 'catalogo.json');

/**
 * As seções do CONTRATO que governam a FORMA do arquivo, na ordem do contrato.
 *
 * Critério: entra a seção que o `npm run check` cobra ou que o produtor precisa para escrever um dos
 * cinco arquivos da versão. Fica fora a seção 16 (roteiro de colagem no Farol, que é trabalho de
 * quem leva o visual para `app/` e não de quem produz), a 17 (vem em enunciado, mais abaixo) e a 18
 * (emendas em estudo, que por definição ainda não valem).
 *
 * `cortar` nomeia subseções H3 removidas por título exato: corte por título é determinístico e o
 * dossiê declara o que saiu.
 */
export const SECOES_ESTRUTURAIS = [
  { num: '1' },
  { num: '2' },
  { num: '3' },
  { num: '4' },
  { num: '5' },
  { num: '6' },
  { num: '7' },
  { num: '8' },
  { num: '9' },
  { num: '10' },
  { num: '11' },
  // A subseção de pendências e revisão é do revisor, não do produtor: quem produz nunca roda
  // `npm run revisao`, e o comando de veredito na mão do produtor já custou fila de revisão errada.
  { num: '12', cortar: ['Pendências e revisão'] },
  { num: '13' },
  { num: '14' },
  { num: '14.1' },
  { num: '15' },
];

export const SECOES_FORA = [
  { num: '16', motivo: 'roteiro de colagem no Farol; é trabalho de quem leva o visual para `app/`' },
  { num: '17', motivo: 'vem neste dossiê em forma de enunciado, uma linha por regra' },
  { num: '18', motivo: 'emendas em estudo; ainda não valem como régua' },
];

/**
 * OS PAPÉIS, e a composição de cada um.
 *
 * POR QUE EXISTE: o dossiê nasceu com 59 KB em 2026-09-28 e chegou a 167 KB em 2026-10-01, maior que
 * os três arquivos que ele veio substituir, porque cada pedido de produtor virou seção nova e nenhuma
 * saiu. Quem revisa lia tudo isso para usar quatro seções. O papel escolhe o que entra.
 *
 * A composição é uma LISTA DE NOMES DE PARTE, em ordem: `montarDossie` monta cada parte na sua própria
 * lista de linhas e esta tabela diz quais o papel recebe. Cortar ou devolver uma seção é mexer aqui, em
 * uma palavra, sem tocar na montagem.
 *
 * `completo` é o dossiê inteiro, como era antes dos papéis. Ele NÃO é leitura de produção: é o endereço
 * do que os papéis enxutos deixaram fora, porque boa parte daquele texto (largura de caractere, tabela
 * por glifo, lacunas da rampa) só existe no gerador, e cortar sem endereço seria perder a medição.
 *
 * Partes enxutas e o que elas guardam da parte inteira:
 *   `molduraEnxuta`     a linha do canvas do modelo, a linha da moldura que vale para ele e a tabela do passo
 *   `paletaEnxuta`      as tabelas de opacidade mínima e de texto legível sobre marca
 *   `guardasResumidas`  de cada guarda: régua, onde olha, o que mede, piso, escape e motivos de não
 *                       medição; sem o corpo, sem trecho de código e sem a fonte dos leitores
 *   `guardasEmTabela`   o mesmo resumo numa linha de tabela por guarda: o que mede vem até o fim da frase
 *                       em que o orçamento fecha e a constante vem sem o comentário; piso, escape e não
 *                       medição entram inteiros, e a guarda em que um deles não cabe vem em prosa
 *   `formatadoresEnxutos` a tabela de assinatura e do que cada função devolve, mais o parágrafo do sinal;
 *                       sem o corpo de `format.ts`
 *   `rechartsEnxuto`    os hooks e o comportamento conferido no pacote; sem a contagem de imports
 *
 * As três últimas são do F0.1b (2026-10-02), que enxugou o produtor sem tocar no recorte do contrato,
 * nos enunciados nem nas armadilhas; o teto em que ele cabe é o do F0.1c. O revisor segue com
 * `guardasResumidas`.
 */
export const PAPEIS = ['produtor', 'revisor', 'completo'];
export const PAPEL_PADRAO = 'produtor';

/**
 * O teto do dossiê do produtor, em bytes: 110 KB, decisão do dono em 2026-10-02 (PLAN.md, F0.1c).
 *
 * É GUARDA CONTRA CRESCIMENTO CALADO, NÃO META DE TAMANHO: o dossiê foi de 59 para 167 KB em quatro dias
 * sem que nada acusasse. O número saiu da medição, não de um alvo: com os três cortes do F0.1b o produtor
 * vai de 88,9 a 106,1 KB nos 205 modelos do catálogo, e 110 KB cobre todos com folga. O teto anterior, de
 * 100 KB (F0.1b), deixava 47 modelos acima dele, todos de Recharts, e por isso nunca chegou a reprovar.
 *
 * PESO: no `npm run dossie` ele AVISA e não falha, o dossiê é gravado do mesmo jeito; no `selftest` ele
 * REPROVA, pelo modelo de prova (`16_distribuicao/05_histograma-comparativo`). O `selftest` também fixa
 * o valor, para o teto não subir calado junto com o dossiê.
 * Estourou por emenda de régua: a saída é cortar o que não é regra ou o dono subir o teto, nunca
 * encurtar regra para caber.
 */
export const TETO_DO_PRODUTOR = 110 * 1024;

/**
 * O aviso de dossiê acima do teto, ou `null`. Só o papel do produtor tem teto: o do revisor é menor por
 * construção e o completo não é leitura de produção.
 */
export function avisoDoTeto({ papel, bytes }, teto = TETO_DO_PRODUTOR) {
  if (papel !== PAPEL_PADRAO || !(bytes > teto)) return null;
  const kb = (n) => (n / 1024).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return `acima do teto do produtor: ${kb(bytes)} KB contra ${kb(teto)} KB (${kb(bytes - teto)} KB a mais)`;
}

export const COMPOSICAO_POR_PAPEL = {
  produtor: [
    'cabecalho', 'modelo', 'versoes', 'estrutural', 'molduraEnxuta', 'paletaEnxuta', 'formatadoresEnxutos',
    'rechartsEnxuto', 'regras', 'armadilhas', 'guardasEmTabela', 'comandos', 'antesDeEntregar',
  ],
  revisor: ['cabecalho', 'modelo', 'versoes', 'regras', 'armadilhas', 'guardasResumidas'],
  completo: [
    'cabecalho', 'modelo', 'versoes', 'estrutural', 'moldura', 'paleta', 'formatadores',
    'recharts', 'regras', 'armadilhas', 'guardas', 'comandos', 'antesDeEntregar',
  ],
};

/** O sufixo do arquivo gravado: o do produtor fica sem sufixo, que é o nome que os agentes já leem. */
export function sufixoDoPapel(papel) {
  return papel === PAPEL_PADRAO ? '' : `.${papel}`;
}

/**
 * O molde que cada abordagem copia, pelo rótulo da tabela da seção 1 do contrato.
 * É chave de junção, não texto de regra: o caminho do molde sai do próprio contrato.
 */
const MOLDE_POR_ABORDAGEM = {
  'recharts-nativo': 'Recharts nativo',
  'recharts-custom': 'Recharts nativo',
  'html-tailwind': 'HTML com Tailwind',
  'svg-puro': 'SVG puro em React',
};

/**
 * As abordagens que usam Recharts, nomeadas uma por uma.
 *
 * `recharts-custom` está aqui por extenso, e não por `startsWith('recharts')`, porque ela vale 40 dos
 * 205 modelos e ficou de fora do enunciado da tarefa: prefixo por acaso do nome é a forma de a
 * próxima abordagem entrar ou sair da regra sem ninguém decidir.
 */
export const ABORDAGENS_RECHARTS = new Set(['recharts-nativo', 'recharts-custom']);

/** As seções de ARMADILHAS que se aplicam a cada abordagem, por prefixo de código. */
export function prefixosAplicaveis(abordagem) {
  // REC é Recharts puro: numa peça de SVG ou de HTML nenhuma das 29 entradas tem como acontecer.
  return ABORDAGENS_RECHARTS.has(String(abordagem ?? '')) ? ['REC', 'GEO', 'TOK', 'DAD'] : ['GEO', 'TOK', 'DAD'];
}

/**
 * Ordem de leitura por código: número como número, sufixo de letra depois do número puro.
 *
 * Só vale para APRESENTAR. A origem tem código fora de sequência (ROT-7, ROT-9, ROT-8; ESP-2, ESP-6,
 * ESP-3) porque código nunca é reatribuído, e isso é o preço certo de um código estável: ordenar na
 * origem quebraria a citação de quem já escreveu. Aqui é vitrine, e ordenar é de graça.
 */
export function compararCodigo(a, b) {
  const parse = (codigo) => {
    const m = String(codigo).match(/^([A-Z]{3})-(\d+)([a-z]?)$/);
    return m ? { prefixo: m[1], numero: Number(m[2]), sufixo: m[3] } : { prefixo: String(codigo), numero: 0, sufixo: '' };
  };
  const x = parse(a);
  const y = parse(b);
  if (x.prefixo !== y.prefixo) return x.prefixo < y.prefixo ? -1 : 1;
  if (x.numero !== y.numero) return x.numero - y.numero;
  return x.sufixo.localeCompare(y.sufixo);
}

/**
 * Lê uma fonte e normaliza a quebra de linha.
 *
 * O `CONTRATO.md` e o `ARMADILHAS.md` estão gravados com CRLF, e sem normalizar o recorte de uma
 * subseção por título não casa: o título vem de `trim()`, sem o `\r`, e o corpo ainda tem o `\r` de
 * cada linha. O defeito apareceu como "subseção não recortável", que é o jeito certo de falhar, mas a
 * causa não estava no título.
 */
export function lerFonte(arquivo) {
  if (!fs.existsSync(arquivo)) throw new Error(`Fonte ausente: ${arquivo}`);
  return fs.readFileSync(arquivo, 'utf8').replace(/^﻿/, '').replace(/\r\n/g, '\n');
}

export function lerCatalogo(arquivo = CATALOGO_PATH) {
  const cru = JSON.parse(lerFonte(arquivo));
  return Array.isArray(cru) ? cru : (cru.familias ?? []);
}

/**
 * Acha o modelo pelo caminho `<familia>/<modelo>`.
 *
 * O CATÁLOGO é quem resolve o alvo, não o disco: 81 dos 205 modelos ainda não têm pasta, e são
 * justamente os que mais precisam de dossiê. Resolver pelo disco recusaria o alvo certo.
 */
export function acharModelo(catalogo, alvo) {
  const partes = String(alvo ?? '').replace(/\\/g, '/').replace(/^\.\/+/, '').replace(/^VISUAIS\//, '').replace(/\/+$/, '').split('/');
  if (partes.length !== 2 || !partes[0] || !partes[1]) {
    throw new Error(`o alvo do dossiê é <familia>/<modelo>, dois níveis, sem "../"; recebi "${alvo}"`);
  }
  const [famSlug, modSlug] = partes;
  const familia = catalogo.find((f) => f.slug === famSlug);
  if (!familia) throw new Error(`família fora do catálogo: ${famSlug} (procurei em ${path.relative(VISUAIS_DIR, CATALOGO_PATH)})`);
  const modelo = (familia.modelos ?? []).find((m) => m.slug === modSlug);
  if (!modelo) throw new Error(`modelo fora do catálogo: ${famSlug}/${modSlug} (a família tem ${(familia.modelos ?? []).length} modelo(s))`);
  return { familia, modelo };
}

/**
 * Planeja N alvos posicionais, na ordem dada, e devolve a união dos modelos.
 *
 * Mesmo contrato do `planTargets` do `paths.mjs` (um item por alvo pedido, com `motivo` quando falha,
 * união deduplicada, ordem preservada), e pelo mesmo motivo escrito lá: alvo que não resolve não pode
 * cancelar os outros nem sumir calado.
 *
 * POR QUE NÃO É O `planTargets`: ele descobre versão pela existência de `Chart.tsx` no disco e recusa
 * pasta inexistente. Aqui o alvo é um MODELO, e o modelo vazio, sem pasta nenhuma, é o alvo mais
 * importante que existe: são 81 dos 205. O disco entra só como estado, e quem resolve é o catálogo.
 *
 * Um alvo de um nível só, quando bate com o slug de uma família, vale por todos os modelos dela.
 */
export function planModelos(catalogo, args) {
  if (!args || args.length === 0) {
    throw new Error('Informe o caminho relativo a VISUAIS, por exemplo: 02_barras-horizontais/01_simples-ordenada (ou a família inteira).');
  }
  const alvos = [];
  const vistos = new Set();
  const modelos = [];
  for (const arg of args) {
    const limpo = String(arg).replace(/\\/g, '/').replace(/^\.\/+/, '').replace(/^VISUAIS\//, '').replace(/\/+$/, '');
    if (limpo.includes('..')) {
      alvos.push({ arg, escopo: arg, motivo: `o caminho precisa estar dentro de VISUAIS, sem "..": ${arg}`, modelos: [] });
      continue;
    }
    const familia = limpo.includes('/') ? null : catalogo.find((f) => f.slug === limpo);
    try {
      const achados = familia
        ? (familia.modelos ?? []).map((modelo) => ({ familia, modelo }))
        : [acharModelo(catalogo, limpo)];
      if (achados.length === 0) throw new Error(`família sem modelo no catálogo: ${limpo}`);
      const desta = [];
      for (const achado of achados) {
        const chave = `${achado.familia.slug}/${achado.modelo.slug}`;
        if (vistos.has(chave)) continue;
        vistos.add(chave);
        modelos.push(achado);
        desta.push(chave);
      }
      alvos.push({ arg, escopo: limpo, motivo: null, modelos: desta });
    } catch (error) {
      alvos.push({ arg, escopo: limpo, motivo: error.message, modelos: [] });
    }
  }
  return { alvos, modelos };
}

/** Quebra um markdown nas seções de um nível de título, com o corpo de cada uma. */
export function fatiarPorTitulo(texto, marca) {
  const linhas = texto.split('\n');
  const inicios = [];
  for (const [i, linha] of linhas.entries()) if (linha.startsWith(`${marca} `)) inicios.push(i);
  return inicios.map((inicio, k) => {
    const fim = inicios[k + 1] ?? linhas.length;
    return {
      titulo: linhas[inicio].slice(marca.length + 1).trim(),
      corpo: linhas.slice(inicio + 1, fim).join('\n'),
      linha: inicio + 1,
    };
  });
}

/** Tira separadores horizontais e linhas vazias das pontas: é limpeza de forma, não de conteúdo. */
function aparar(corpo) {
  return corpo.replace(/\n*(?:^|\n)-{3,}\s*$/g, '').replace(/^\n+|\n+$/g, '');
}

/**
 * Recorta uma seção H2 do contrato pelo número, opcionalmente sem as subseções H3 nomeadas.
 * Devolve o título como está no contrato e o corpo literal.
 */
export function recortarSecao(contrato, num, { cortar = [] } = {}) {
  const secoes = fatiarPorTitulo(contrato, '##').filter((s) => !s.titulo.startsWith('#'));
  const alvo = secoes.find((s) => s.titulo.startsWith(`${num}. `) || s.titulo.startsWith(`${num} `));
  if (!alvo) throw new Error(`seção ${num} não encontrada no CONTRATO.md`);
  let corpo = alvo.corpo;
  const removidas = [];
  if (cortar.length) {
    const subs = fatiarPorTitulo(corpo, '###');
    for (const titulo of cortar) {
      const sub = subs.find((s) => s.titulo === titulo);
      if (!sub) throw new Error(`subseção "${titulo}" não encontrada na seção ${num} do CONTRATO.md`);
      const bloco = `### ${sub.titulo}\n${sub.corpo}`;
      if (!corpo.includes(bloco)) throw new Error(`subseção "${titulo}" não recortável na seção ${num}`);
      corpo = corpo.replace(bloco, '');
      removidas.push(titulo);
    }
  }
  return { titulo: alvo.titulo, corpo: aparar(corpo), removidas };
}

/**
 * Orçamento do enunciado de uma regra, em bytes, cortando só em fim de frase.
 *
 * 360 B é medido, não escolhido por gosto: nesse valor 64 das regras entram INTEIRAS e as demais que
 * sobram guardam ao menos as duas primeiras frases, que é onde o enunciado se completa.
 */
export const ORCAMENTO_ENUNCIADO = 360;

/**
 * Recorta o enunciado pela frase, com orçamento, e diz se cortou.
 *
 * POR QUE NÃO É "a linha em negrito": parecia o corte óbvio e a medição derrubou. Em boa parte das
 * regras a corrida em negrito é só a primeira oração, e o recorte saía com cara de regra completa e
 * sem a régua: `TIP-2` virava "Três tamanhos no corpo, no máximo," sem o "Nada abaixo de 11 px", e
 * `COR-5` virava "Vizinhos que não contrastam entre si" sem dizer o que fazer com eles. Fragmento que
 * se lê como regra inteira é pior que regra ausente, porque ninguém vai conferir na origem.
 */
export function recortarEnunciado(linha, orcamento = ORCAMENTO_ENUNCIADO) {
  const texto = linha.replace(/^\*\s+/, '').trim();
  // Fim de frase é ponto seguido de espaço e de abertura de frase nova. Decimal em pt-BR usa vírgula,
  // e "17.2" não tem espaço depois do ponto, então nenhum dos dois é confundido com fim de frase.
  const frases = texto.split(/(?<=\.)(?=\s+(?:\*\*)?[A-ZÀ-Ý“"`(])/);
  let saida = '';
  for (const frase of frases) {
    if (saida && Buffer.byteLength(saida + frase, 'utf8') > orcamento) {
      return { enunciado: `${saida.trim()} […]`, cortado: true };
    }
    saida += frase;
  }
  return { enunciado: saida.trim(), cortado: false };
}

/**
 * As regras codificadas do padrão de acabamento, em enunciado.
 *
 * Cada regra é um item de primeiro nível da seção 17 aberto por `**COD-N. ...`. O recorte é literal:
 * o item sem os sub-itens, pela `recortarEnunciado`. Fica fora o exemplo trabalhado, que nos itens
 * longos vem nos sub-itens e nas frases finais.
 *
 * SEM LISTA DE PREFIXOS DE PROPÓSITO: qualquer código de três letras maiúsculas entra. Uma allowlist
 * (`ROT|EIX|COR|...`) perderia calado o dia em que o contrato ganhasse um prefixo novo, que é
 * exatamente a forma como uma extração começa a perder regra sem ninguém ver.
 */
const RE_REGRA = /^\* \*\*([A-Z]{3}-\d+[a-z]?)\./;

export function extrairRegras(contrato) {
  const regras = [];
  const linhas = contrato.split('\n');
  for (let i = 0; i < linhas.length; i += 1) {
    const m = linhas[i].match(RE_REGRA);
    if (!m) continue;
    // O BULLET INTEIRO, e nao a primeira linha fisica dele. O contrato quebra linha a 100 colunas e a
    // continuacao vem indentada sem marcador; lendo linha a linha, toda regra cujo enunciado passa de
    // uma linha saia CORTADA no meio da frase e SEM o aviso de corte. Um produtor achou o defeito em
    // 2026-09-29 lendo a `EIX-6b`, que chegava ao dossie terminando em "(emenda de".
    // Continuacao e a linha indentada que NAO abre sub-item e nao esta vazia.
    let bruto = linhas[i];
    for (let j = i + 1; j < linhas.length; j += 1) {
      const proxima = linhas[j];
      if (!/^\s{2,}\S/.test(proxima) || /^\s*\*\s/.test(proxima)) break;
      bruto += ` ${proxima.trim()}`;
    }
    regras.push({ codigo: m[1], prefixo: m[1].slice(0, 3), ...recortarEnunciado(bruto) });
  }
  return regras;
}

/**
 * As entradas de ARMADILHAS, com o título, que é o SINTOMA.
 *
 * O corpo NÃO vem: nem `Sintoma`, nem `Causa`, nem `Saída`. A saída era 15 KB do dossiê de uma peça de
 * Recharts, e o dono cortou por isso em 2026-09-28. O que entra no lugar é a obrigação, escrita em
 * texto visível na seção, de abrir o `ARMADILHAS.md` pelo código antes de improvisar solução: conhecer
 * o sintoma sem a saída só serve se o produtor souber onde está a saída.
 *
 * `temSaida` fica, e não é sobra de código: é a prova de que o encaminhamento tem destino. Entrada sem
 * bloco `Saída` na origem faria o dossiê mandar consultar uma contramedida que não existe.
 */
const RE_ENTRADA = /^### ([A-Z]{3}-\d+)\. (.*?)(?: \[([^\]]*)\])?\s*$/gm;

/**
 * Diz se a entrada tem bloco `Saída` na origem.
 *
 * Por indexOf e não por regex de propósito: a primeira versão usava
 * `/^- \*\*Saída\.\*\*([\s\S]*?)(?=\n- \*\*|\n\n|$)/m` e trazia SÓ A PRIMEIRA LINHA de cada saída,
 * porque com a flag `m` o `$` do fim da alternativa casa no fim de qualquer linha.
 */
function temBlocoSaida(corpo) {
  // O rótulo é o INÍCIO do bloco, não o texto inteiro dele: a `TOK-8` escreve
  // "- **Saída, e ela é mais fraca do que esta entrada dizia na primeira redação.**", e casar o literal
  // `- **Saída.**` dizia que a entrada não tinha contramedida quando ela tem.
  return /^- \*\*Sa[íi]da[^*]*\*\*/m.test(corpo);
}

export function extrairArmadilhas(armadilhas) {
  const marcas = [...armadilhas.matchAll(RE_ENTRADA)];
  const secoes = fatiarPorTitulo(armadilhas, '##').filter((s) => !s.titulo.startsWith('#'));
  const secaoDe = (indice) => {
    let nome = '';
    for (const s of secoes) if (armadilhas.indexOf(`## ${s.titulo}`) <= indice) nome = s.titulo;
    return nome;
  };
  return marcas.map((m, k) => {
    const inicio = m.index + m[0].length;
    const fim = k + 1 < marcas.length ? marcas[k + 1].index : armadilhas.length;
    const corpo = armadilhas.slice(inicio, fim);
    return {
      codigo: m[1],
      prefixo: m[1].slice(0, 3),
      titulo: m[2].trim(),
      modelos: m[3] ?? '',
      secao: secaoDe(m.index),
      temSaida: temBlocoSaida(corpo),
    };
  });
}

/**
 * A seção `## Antes de entregar` do `ARMADILHAS.md`, inteira e literal.
 *
 * São as perguntas de autorrevisão contra o PNG, e cada uma corresponde a uma classe de defeito que
 * passou no `check` e morreu na revisão humana. O dossiê crescia e não as trazia: quem produzia só com
 * ele nunca as lia.
 *
 * Seção ausente ou vazia é ERRO, não parte que some: o papel que promete a seção e sai sem ela é a
 * forma calada de a extração perder conteúdo, que é o defeito que este arquivo existe para evitar.
 */
export const TITULO_ANTES_DE_ENTREGAR = 'Antes de entregar';

export function extrairAntesDeEntregar(armadilhas) {
  const secao = fatiarPorTitulo(armadilhas, '##').find((s) => s.titulo === TITULO_ANTES_DE_ENTREGAR);
  if (!secao) throw new Error(`seção "## ${TITULO_ANTES_DE_ENTREGAR}" não encontrada no ARMADILHAS.md`);
  const corpo = aparar(secao.corpo);
  if (!corpo) throw new Error(`seção "## ${TITULO_ANTES_DE_ENTREGAR}" do ARMADILHAS.md está vazia`);
  return { titulo: secao.titulo, corpo };
}

// ---------------------------------------------------------------------------------------------
// AS GUARDAS DO `npm run check`
// ---------------------------------------------------------------------------------------------
//
// POR QUE ESTA SEÇÃO EXISTE. O piloto de 2026-09-28 produziu três versões só com o dossiê, chegou a
// zero erro, e para isso SAIU do dossiê três vezes: foi ler `guardas.mjs` (87 KB) para descobrir que a
// CONTRASTE-MARCA só julga dois tokens, estourou o teto de 250 caracteres da FRASE-ACESSIVEL em duas
// versões, e não sabia que existe escape. A frase dele sobre o que faltava: "a guarda X mede Y no
// arquivo Z, reprova acima de tal piso, e o escape é este".
//
// Tudo aqui é extraído do código da ferramenta: a tabela do cabeçalho de `guardas.mjs`, os parágrafos
// rotulados de cada guarda, as constantes numéricas dentro do trecho de cada uma, os motivos de NÃO
// MEDIDA que ela declara, a lista de códigos que aceitam escape e a lista de guardas com fila.

const LIB_DIR = path.join(RENDER_DIR, 'scripts', 'lib');
export const GUARDAS_PATH = path.join(LIB_DIR, 'guardas.mjs');
export const DIVIDA_PATH = path.join(LIB_DIR, 'divida.mjs');

/**
 * Rótulos de parágrafo que NÃO entram no dossiê: são a história da guarda, não o que ela cobra.
 *
 * Denylist e não allowlist de propósito. Vários parágrafos operacionais não têm rótulo em caixa alta
 * (o "ERRO, `--surface-overlay`" da CONTRASTE-MARCA, o "PISO de 3:1", o "EST-2 manda escrever" da
 * AUSENCIA-LITERAL), e uma allowlist os perderia calados. Errar para o lado de incluir custa bytes;
 * errar para o lado de excluir custa a rodada de check que esta seção existe para evitar.
 */
const ROTULOS_FORA = [
  'POR QUE ELA EXISTE',
  'POR QUE ELA É A GUARDA DE MAIOR RETORNO DO PROJETO',
  'ACHADO QUE MUDOU O DESENHO DESTA GUARDA',
  'O CARIMBO',
];

/**
 * Ajudantes cujo cabeçalho entra INTEIRO no dossiê.
 *
 * Os dois são de guarda que mede CÓDIGO, não desenho, e por isso a régua delas não está em lugar
 * nenhum que o produtor veja: a AGREGACAO-ZERO tem seis regras nomeadas (e a RECAI só dispara em nome
 * de núcleo, o que ninguém adivinha) e a FORMATO-ACESSIVEL compara a frase acessível com o corpo pelo
 * ARGUMENTO. Dois agentes de produção foram ler estes dois arquivos; é por isso que eles estão aqui.
 */
const AJUDANTES_NO_DOSSIE = ['agregacao.mjs', 'formato.mjs'];

/** As linhas da tabela do cabeçalho de `guardas.mjs`: código, regra do contrato, onde olha. */
function tabelaDoCabecalho(fonte) {
  const linhas = [];
  for (const linha of fonte.split('\n')) {
    const m = linha.match(/^\s*\*\s*(\|.*\|)\s*$/);
    if (m) linhas.push(m[1].trim());
    else if (linhas.length) break;
  }
  return linhas;
}

/** O docblock de abertura de um arquivo, sem as marcas de comentário. Recorte literal e inteiro. */
function cabecalhoDeArquivo(fonte) {
  if (!fonte.startsWith('/**')) return '';
  return fonte
    .slice(3, fonte.indexOf('\n */'))
    .split('\n')
    .map((l) => l.replace(/^\s*\*(?: |$)/, ''))
    .join('\n')
    .trim();
}

/** Um array de literais de texto declarado no código, pelo nome da constante. */
function listaDeCodigo(fonte, nome) {
  const i = fonte.indexOf(`${nome} = [`);
  if (i < 0) return [];
  const fim = fonte.indexOf('];', i);
  return [...fonte.slice(i, fim).matchAll(/'([^']+)'/g)].map((m) => m[1]);
}

/**
 * As guardas, uma por banner `// CODIGO` em `guardas.mjs`.
 *
 * O número de guardas é o que o código tem, não o que um enunciado diz: quem conta é o banner.
 */
export function extrairGuardas(fonteGuardas = lerFonte(GUARDAS_PATH), fonteDivida = lerFonte(DIVIDA_PATH)) {
  const linhas = fonteGuardas.split('\n');
  const escapaveis = listaDeCodigo(fonteGuardas, 'export const CODIGOS');
  const comFila = listaDeCodigo(fonteDivida, 'export const GUARDAS_COM_FILA');
  const tabela = tabelaDoCabecalho(fonteGuardas);
  const banners = [];
  for (const [i, l] of linhas.entries()) if (/^\/\/ [A-Z][A-Z-]+$/.test(l)) banners.push({ codigo: l.slice(3).trim(), inicio: i });

  const guardas = banners.map((b, k) => {
    const fim = k + 1 < banners.length ? banners[k + 1].inicio : linhas.length;
    const trecho = linhas.slice(b.inicio, fim);
    // O bloco de comentário contíguo depois do banner é a explicação da guarda.
    const bloco = [];
    for (let i = b.inicio + 1; i < fim; i += 1) {
      if (!linhas[i].startsWith('//')) break;
      bloco.push(linhas[i].replace(/^\/\/ ?/, ''));
    }
    const paragrafos = bloco
      .join('\n')
      .split(/\n\s*\n/)
      .map((p) => p.replace(/\s+/g, ' ').trim())
      .filter((p) => p && !/^-{10,}$/.test(p))
      // SEM ORÇAMENTO DE CORTE, e isto foi medido em produção: com 360 B o corte caía exatamente no
      // meio do "QUAIS TOKENS ELA JULGA" da CONTRASTE-MARCA, e o agente não sabia se rampa `--seq` de
      // quatro degraus era erro ou não julgada. Regra pela metade custa rodada de check; KB não.
      .filter((p) => !ROTULOS_FORA.some((r) => p.startsWith(r)));
    // Guarda sem banner explicativo cai no jsdoc da própria função: a MARCA-REAL é assim, porque a
    // lista de marcas bloqueadas é que carrega a explicação, e uma guarda sem uma linha de escopo no
    // dossiê é a guarda que manda o produtor abrir `guardas.mjs`.
    if (!paragrafos.length) {
      for (const [i, l] of trecho.entries()) {
        if (!/^export function /.test(l)) continue;
        const doc = [];
        for (let j = i - 1; j >= 0 && (trecho[j].startsWith(' *') || trecho[j].startsWith('/**')); j -= 1) doc.unshift(trecho[j]);
        // O fechamento vem ANTES do asterisco solto na alternância: na ordem inversa, `\s*\*\s*`
        // comia o espaço e o asterisco de ` */` e deixava a barra sozinha no fim da frase.
        const texto = doc.join(' ').replace(/\/\*\*|\s*\*\/|\s*\*\s*/g, ' ').replace(/\s+/g, ' ').trim();
        if (texto) paragrafos.push(texto);
      }
    }
    // Constantes numéricas declaradas dentro do trecho da guarda, com o comentário de uma linha.
    const constantes = [];
    for (const [i, l] of trecho.entries()) {
      const m = l.match(/^(?:export )?const ([A-Z][A-Z0-9_]*) = (-?[\d.]+);/);
      if (!m) continue;
      const comentario = (trecho[i - 1] ?? '').match(/^\/\*\* (.*) \*\/$/);
      constantes.push({ nome: m[1], valor: m[2], comentario: comentario ? comentario[1] : '' });
    }
    const motivos = [...new Set([...trecho.join('\n').matchAll(/naoMedida\('([a-z_]+)'\)|motivoUnico \?\?= '([a-z_]+)'|`\$\{tema\}:([a-z_]+)`/g)].map((m) => m[1] ?? m[2] ?? m[3]))];
    const arquivos = [...new Set([...trecho.join('\n').matchAll(/`([a-z]+\.mjs)`/g)].map((m) => m[1]))];
    const funcao = trecho.join('\n').match(/export function (guarda[A-Za-z]+)/)?.[1] ?? null;
    // O cabeçalho do ajudante entra inteiro quando o ajudante está na lista: é onde vive a régua das
    // guardas que medem código, e nenhuma delas aparece no PNG para o produtor descobrir sozinho.
    const ajudantes = arquivos
      .filter((a) => AJUDANTES_NO_DOSSIE.includes(a) && fs.existsSync(path.join(LIB_DIR, a)))
      .map((a) => ({ arquivo: a, cabecalho: cabecalhoDeArquivo(lerFonte(path.join(LIB_DIR, a))) }))
      .filter((a) => a.cabecalho);
    return {
      codigo: b.codigo,
      linha: b.inicio + 1,
      funcao,
      arquivos,
      ajudantes,
      escapavel: escapaveis.includes(b.codigo),
      fila: comFila.includes(b.codigo),
      paragrafos,
      constantes,
      motivos,
    };
  });
  return { guardas, tabela, escapaveis, comFila };
}

/**
 * Um trecho nomeado de um docblock, pelo começo do texto. Recorte literal, sem orçamento.
 *
 * `ateOFim` leva os parágrafos seguintes junto, e existe porque a SINTAXE do escape mora num
 * parágrafo e os DOIS EXEMPLOS dela no parágrafo seguinte: cortar no primeiro entregava a advertência
 * sem o que copiar, que é justamente o que o piloto não tinha.
 *
 * A barra invertida que a origem põe no fechamento de comentário do exemplo é removida: ela só existe
 * porque o exemplo mora dentro de um bloco de comentário, e copiá-la daria um JSX quebrado.
 */
function paragrafoQueComeca(fonte, inicio, { ateOFim = false } = {}) {
  // O fechamento do docblock fica FORA: sem isso o recorte até o fim levava a linha ` */` junto.
  const bloco = fonte.slice(0, fonte.indexOf('\n */'));
  const paragrafos = bloco.split(/\n \*\s*\n/).map((p) =>
    p
      .replace(/^\/\*\*\n/, '')
      .split('\n')
      .map((l) => l.replace(/^\s*\*(?: |$)/, ''))
      .join('\n')
      .replace(/\*\\\//g, '*/')
      .replace(/\s+$/, ''),
  );
  const i = paragrafos.findIndex((p) => p.trimStart().startsWith(inicio));
  if (i < 0) return '';
  return (ateOFim ? paragrafos.slice(i) : [paragrafos[i]]).join('\n\n').trim();
}

/**
 * O resumo de uma guarda para os papéis enxutos: o que mede, piso, escape e motivos de não medição.
 *
 * É SELEÇÃO DE PARÁGRAFO INTEIRO, nunca corte no meio: o orçamento em bytes já foi tentado nesta seção
 * e caía no meio do "QUAIS TOKENS ELA JULGA" (ver `extrairGuardas`). O que sai é parágrafo que o autor
 * da guarda rotulou, e o que fica fora continua no banner dela em `guardas.mjs`, pela linha.
 *
 *   o que mede   o parágrafo `O QUE ELA MEDE` ou `O QUE A GUARDA COBRE`; sem nenhum dos dois, o primeiro
 *                parágrafo que não é título (termina em dois-pontos) nem um dos três abaixo
 *   piso         o parágrafo `PISO`, quando existe; as constantes saem à parte, de `g.constantes`
 *   escape       o parágrafo `ESCAPE`, quando existe; sem ele vale o bloco geral do cabeçalho
 *   não medida   o parágrafo `NÃO MEDIDA`, que é a lista completa da própria guarda; a lista de códigos
 *                achada no trecho (`g.motivos`) é o recurso quando o parágrafo não existe
 */
const RE_PARAGRAFO_PISO = /^PISO\b/;
const RE_PARAGRAFO_ESCAPE = /^ESCAPE\b/;
const RE_PARAGRAFO_NAO_MEDIDA = /^N[ÃA]O MEDIDA\b/;
const RE_PARAGRAFO_O_QUE_MEDE = /^O QUE (?:ELA MEDE|A GUARDA COBRE)\b/;

export function resumirGuarda(g) {
  const achar = (re) => g.paragrafos.find((p) => re.test(p)) ?? null;
  const reservado = (p) => RE_PARAGRAFO_PISO.test(p) || RE_PARAGRAFO_ESCAPE.test(p) || RE_PARAGRAFO_NAO_MEDIDA.test(p);
  return {
    oQueMede: achar(RE_PARAGRAFO_O_QUE_MEDE) ?? g.paragrafos.find((p) => !p.endsWith(':') && !reservado(p)) ?? null,
    piso: achar(RE_PARAGRAFO_PISO),
    escape: achar(RE_PARAGRAFO_ESCAPE),
    naoMedida: achar(RE_PARAGRAFO_NAO_MEDIDA),
  };
}

/**
 * Orçamento do "o que mede" na tabela de guardas, em bytes, cortando só em fim de frase.
 *
 * 180 B é medido em 2026-10-02 nas 15 guardas: só com a primeira frase, dois recortes saem com o título
 * do parágrafo e mais nada (`QUAL É O PISO, E DE ONDE ELE VEM.` na TAMANHO-TEXTO, `1.` na
 * CONTRASTE-TEXTO), e com 160 B a NUMERO-CRU para no marcador `N1.` sem dizer o que o N1 é. Fragmento
 * com cara de resposta é pior que célula vazia. Em 180 toda guarda traz ao menos uma frase com conteúdo.
 * A primeira frase nunca é cortada, mesmo maior que o orçamento.
 */
export const ORCAMENTO_DO_QUE_MEDE = 180;

/**
 * O maior parágrafo de piso, de escape ou de não medição que ainda vai numa célula de tabela.
 *
 * É o mesmo orçamento do enunciado de regra, de propósito: é o tamanho que este arquivo já mediu como
 * "cabe numa linha". Acima dele o parágrafo NÃO é cortado: a guarda inteira sai da tabela e vem em prosa.
 */
export const ORCAMENTO_DA_CELULA = ORCAMENTO_ENUNCIADO;

/**
 * As células de uma guarda na tabela do produtor, e se ela cabe numa linha de tabela.
 *
 * O QUE ENCOLHE E O QUE NÃO ENCOLHE (F0.1b, 2026-10-02). Encolhe o "o que mede", por frase inteira, e o
 * comentário de cada constante, que fica em `guardas.mjs`. NÃO encolhem o parágrafo de `PISO`, o de
 * `ESCAPE` e o de `NÃO MEDIDA`, nem o nome e o valor de constante nenhuma: são o que decide se a peça
 * passa, se a saída é legítima e se o check verde quer dizer medido.
 *
 * `cabe` é falso em dois casos, e nos dois a guarda vem em prosa em vez de ter o texto adaptado: um
 * desses três parágrafos passa do orçamento da célula, ou algum texto dela tem barra vertical, que
 * quebraria a coluna (escapar a barra entregaria `number \| null`, que não é o que a origem escreve).
 */
export function celulasDaGuarda(g, regua) {
  const resumo = resumirGuarda(g);
  const bytes = (t) => Buffer.byteLength(t ?? '', 'utf8');
  const mede = resumo.oQueMede ? recortarEnunciado(resumo.oQueMede, ORCAMENTO_DO_QUE_MEDE).enunciado : '(sem parágrafo na origem)';
  const constantes = (g.constantes ?? []).map((c) => `\`${c.nome} = ${c.valor}\``).join('; ');
  const piso = [resumo.piso, constantes].filter(Boolean).join(' ') || 'sem constante';
  // Sem parágrafo próprio de escape vale o bloco geral, que a seção imprime antes da tabela com a
  // sintaxe nas duas formas: repetir a sintaxe em cada célula custava 75 B por guarda sem dizer nada novo.
  const escape = !g.escapavel ? 'não aceita' : (resumo.escape ?? 'aceita, com o alcance do bloco acima');
  // Sem parágrafo e sem código achado, a célula diz o que a EXTRAÇÃO não achou, e não que a guarda sempre
  // mede: a busca de `g.motivos` só vê `naoMedida('x')`, e há guarda que devolve o motivo por outro
  // caminho (`motivo: 'sem_codigo'`, e os do leitor dela). Afirmar "nenhum" seria atestar cobertura.
  const naoMedida = resumo.naoMedida ?? ((g.motivos ?? []).length ? g.motivos.map((m) => `\`${m}\``).join(', ') : 'sem parágrafo na origem');
  const reguaEOnde = `${regua?.regra ?? '(fora da tabela do cabeçalho)'}; ${regua?.onde ?? '(fora da tabela do cabeçalho)'}`;
  const longo = [resumo.piso, resumo.escape, resumo.naoMedida].some((p) => bytes(p) > ORCAMENTO_DA_CELULA);
  const comBarra = [reguaEOnde, mede, piso, escape, naoMedida].some((t) => t.includes('|'));
  return { cabe: !longo && !comBarra, motivo: longo ? 'paragrafo_longo' : comBarra ? 'barra_vertical' : null, regua: reguaEOnde, mede, piso, escape, naoMedida };
}

/** A tabela do cabeçalho de `guardas.mjs` como mapa: código para régua do contrato e onde olha. */
export function reguaPorGuarda(tabela) {
  const mapa = new Map();
  for (const linha of tabela.slice(2)) {
    const [codigo, regra, onde] = linha.split('|').slice(1, 4).map((c) => c.trim());
    if (codigo) mapa.set(codigo, { regra, onde });
  }
  return mapa;
}

/** O parágrafo do escape, no cabeçalho de `guardas.mjs`, e o que separa escape de fila, em `divida.mjs`. */
export function extrairEscapeEFila(fonteGuardas = lerFonte(GUARDAS_PATH), fonteDivida = lerFonte(DIVIDA_PATH)) {
  return {
    escape: paragrafoQueComeca(fonteGuardas, 'ESCAPE.', { ateOFim: true }),
    fila: paragrafoQueComeca(fonteDivida, 'ESTE MECANISMO NÃO É ESCAPE.'),
    // A condição exata do motivo que mais aparece: forma de SVG com `transform`. O piloto viu as
    // quatro versões de dispersão saírem `preview_com_transform`, inclusive a v1 aprovada.
    condicaoTransform: (() => {
      const marca = lerFonte(path.join(LIB_DIR, 'marca.mjs'));
      const linha = marca.split('\n').findIndex((l) => l.includes('temTransform = true'));
      return linha < 0 ? null : { arquivo: 'marca.mjs', linha: linha + 1, codigo: marca.split('\n')[linha].trim() };
    })(),
  };
}

// ---------------------------------------------------------------------------------------------
// RECORTES PONTUAIS DA ORIGEM (F0.3, 2026-10-02)
// ---------------------------------------------------------------------------------------------
//
// POR QUE EXISTEM. Quatro consertos de régua levantados por produtores tinham a mesma forma: a origem
// foi emendada e o dossiê continuou imprimindo a redação velha, porque o trecho dele era PROSA DO
// GERADOR e não recorte. O caso que deu nome ao defeito é o da `GEO-1`, emendada na armadilha e repetida
// errada quatro vezes por dossiê, uma por versão. As quatro funções abaixo recortam o item, a frase ou
// o comentário da origem, e devolvem `null` quando o trecho não está lá: o dossiê então cala, em vez
// de afirmar de memória.

/**
 * Um item de lista da origem, inteiro e literal, achado por um trecho que só a PRIMEIRA linha dele tem.
 *
 * Sai sem o marcador e sem os sub-itens, com as linhas de continuação juntadas por um espaço. Para no
 * primeiro item seguinte, de qualquer nível, e na linha em branco.
 */
export function extrairItem(fonte, marca) {
  const linhas = String(fonte ?? '').replace(/\r\n/g, '\n').split('\n');
  const i = linhas.findIndex((l) => /^\s*[-*] /.test(l) && l.includes(marca));
  if (i < 0) return null;
  const corpo = [linhas[i].replace(/^\s*[-*] /, '').trim()];
  for (const l of linhas.slice(i + 1)) {
    if (!l.trim() || /^\s*(?:[-*] |#)/.test(l)) break;
    corpo.push(l.trim());
  }
  return corpo.join(' ');
}

/**
 * Uma frase do corpo de UMA entrada do `ARMADILHAS.md`, da abertura `de` ao fecho `ate`, literal.
 *
 * O ponto depois do código separa `GEO-1` de `GEO-10`. As quebras de linha da origem viram espaço.
 */
export function extrairFraseDaArmadilha(armadilhas, codigo, de, ate) {
  const texto = String(armadilhas ?? '').replace(/\r\n/g, '\n');
  const inicio = texto.indexOf(`### ${codigo}. `);
  if (inicio < 0) return null;
  const fim = texto.indexOf('\n### ', inicio + 1);
  const corpo = texto.slice(inicio, fim < 0 ? undefined : fim).replace(/\s+/g, ' ');
  const a = corpo.indexOf(de);
  if (a < 0) return null;
  const b = corpo.indexOf(ate, a);
  return b < 0 ? null : corpo.slice(a, b + ate.length);
}

/**
 * A frase do banner da FRASE-ACESSIVEL que diz ONDE a frase vive no `preview.svg`.
 *
 * O parágrafo `O CARIMBO` fica fora do resumo da guarda (`ROTULOS_FORA`), porque conta a história dela,
 * e com ele saía o único lugar que nomeia `data-farol-ace`. Produtores foram procurar a frase em
 * `aria-label`, acharam o da moldura e contaram os caracteres errados. Vem só a frase que nomeia o
 * atributo, com a linha de `guardas.mjs`.
 */
export function extrairFraseDoCarimbo(fonteGuardas = lerFonte(GUARDAS_PATH)) {
  const linhas = String(fonteGuardas ?? '').replace(/\r\n/g, '\n').split('\n');
  const i = linhas.findIndex((l) => l.startsWith('// O CARIMBO'));
  if (i < 0) return null;
  const paragrafo = [];
  for (const l of linhas.slice(i)) {
    if (!/^\/\/ \S/.test(l)) break;
    paragrafo.push(l.replace(/^\/\/ /, ''));
  }
  const frase = paragrafo
    .join(' ')
    .split(/(?<=\.)\s+(?=[A-ZÀ-Ý])/)
    .find((f) => f.includes('`data-farol-ace`'));
  return frase ? { frase: frase.trim(), linha: i + 1 } : null;
}

/**
 * A caixa de tinta de uma linha de texto, como o leitor `colisao.mjs` a estima, por tamanho.
 *
 * É conta sobre as três constantes do leitor, e não medição nova: a `GEO-19` manda reservar a altura
 * da caixa contra a borda curva e não dizia quanto ela mede. `acima` e `abaixo` são contra a linha de
 * base; `centralAcima` e `centralAbaixo` são contra a âncora de quem usa `dominant-baseline="central"`.
 */
export function medirCaixaDeTinta(tamanhos = [11, 12]) {
  return tamanhos.map((tamanho) => ({
    tamanho,
    acima: tamanho * ASCENDENTE,
    abaixo: tamanho * DESCENDENTE,
    altura: tamanho * (ASCENDENTE + DESCENDENTE),
    centralAcima: tamanho * (ASCENDENTE - CENTRAL_DESLOCA),
    centralAbaixo: tamanho * (DESCENDENTE + CENTRAL_DESLOCA),
  }));
}

/**
 * O texto sobre marca TRANSLÚCIDA: a opacidade abaixo da qual o par que a matriz aprova deixa de passar.
 *
 * A matriz de `medirTextoSobreMarca` mede marca opaca, e a tabela de opacidade mínima mede a marca
 * contra o cartão no piso de 3:1. O par texto sobre marca composta não estava em nenhuma das duas, e
 * um produtor mediu `--surface-raised` sobre `--chart-1` caindo de 6,00:1 para 3,38:1 a 0,72 no claro.
 * Aqui o fundo do texto é a cor da marca composta com o cartão, pela mesma `medirMarca` da guarda.
 *
 * Entra só o preenchimento que tem texto aprovado opaco e opacidade de marca com solução; `minima` é
 * a do texto aprovado que aguenta a menor opacidade, em passo de 0,01, descendo de 1.
 *
 * MORA AQUI E NÃO EM `opacidade.mjs` porque nenhuma guarda a cobra ainda: no dia em que uma cobrar, a
 * função muda de casa pelo mesmo motivo das duas tabelas vizinhas.
 */
export function medirTextoSobreMarcaComposta(piso = 4.5, pisoDeMarca = 3) {
  const matriz = medirTextoSobreMarca(piso);
  const opacidade = medirOpacidadeMinima(pisoDeMarca);
  let tabelas;
  try {
    tabelas = lerTokensDoFarol();
  } catch {
    return null;
  }
  if (!matriz || !opacidade || !tabelas?.dark || !tabelas?.light) return null;
  const razao = (texto, fundo, alfa, tema) => {
    const tinta = tabelas[tema].get(texto);
    const marca = tabelas[tema].get(fundo);
    const cartao = tabelas[tema].get('--surface-raised');
    if (!tinta || !marca || !cartao) return null;
    return razaoDeContraste(tinta, medirMarca({ ...marca, a: alfa }, cartao).corEfetiva);
  };
  const passa = (texto, fundo, alfa) => razao(texto, fundo, alfa, 'dark') >= piso && razao(texto, fundo, alfa, 'light') >= piso;
  const linhas = [];
  for (const l of matriz.linhas) {
    const daMarca = opacidade.linhas.find((o) => o.token === l.fundo)?.minima ?? null;
    if (!l.aprovados.length || daMarca === null) continue;
    let melhor = null;
    for (const texto of l.aprovados) {
      let minima = 1;
      for (let passo = 99; passo >= 1 && passa(texto, l.fundo, passo / 100); passo -= 1) minima = passo / 100;
      if (!melhor || minima < melhor.minima) melhor = { texto, minima };
    }
    linhas.push({ fundo: l.fundo, texto: melhor.texto, minima: melhor.minima, daMarca });
  }
  return { piso, pisoDeMarca, linhas, razao };
}

// ---------------------------------------------------------------------------------------------
// A GEOMETRIA DA MOLDURA
// ---------------------------------------------------------------------------------------------
//
// POR QUE MEDIDA, E NÃO DEDUZIDA. Foi o item mais pedido pelos agentes de produção, e os dois que
// tentaram deduzir chegaram a números que NÃO BATEM entre si (66x122 e 66x126), nem com a redação antiga
// da §13 do contrato, que falava em 574x234 para o canvas `card` e foi corrigida para o par 241,5 e 225.
// A `GEO-1` manda escrever a conta, e a conta depende deste desconto, então um número errado aqui
// contamina a peça.
//
// A MEDIDA sai dos previews já gravados: a ilha do `<header>` começa exatamente na origem da caixa de
// conteúdo, então o `x` dela é o recuo por lado e a altura dela é o cabeçalho. O vão de 12 px entre o
// cabeçalho e o corpo é confirmado pela existência de elemento começando em `recuo + cabeçalho + 12`.
//
// O QUE VARIA, e é isto que nenhum dos dois agentes tinha: o cabeçalho tem DUAS alturas, porque o caso
// de uso quebra em duas linhas (`line-clamp-2`). Não existe um número só.

/** Recuo por lado de cada moldura, na ordem em que o harness o aplica. */
function recuoDaMoldura(frame, largura) {
  const folgado = largura >= 560;
  // `card`: recuo do palco (p-3) + borda do cartão (1) + recuo interno (p-5 folgado, p-4 compacto).
  if (frame === 'card') return 12 + 1 + (folgado ? 20 : 16);
  return folgado ? 20 : 16;
}

let cacheMoldura = null;

/** O vão entre o cabeçalho e o corpo, em px: `mb-3` do `<header>` do harness. */
export const VAO_DO_CABECALHO = 12;

/**
 * Mede a moldura nos previews do catálogo, agrupando por moldura e faixa de largura.
 * Memorizado no processo: uma família inteira gera muitos dossiês numa chamada só.
 */
let cacheAlturaDeLinha = null;
/**
 * A ALTURA DE LINHA do texto do corpo, medida nos previews do acervo.
 *
 * POR QUE EXISTE: dois produtores, em rodadas diferentes de 2026-09-29, escreveram a mesma falta. O
 * dossie publicava a altura da ilha do CABECALHO (40,5 e 54,5 px) e o vao de 12 px, e nao publicava a
 * altura de LINHA das classes do corpo, que e justamente o numero que a conta de linhas escritas da
 * GEO-1 exige. Um deles teve de derivar do Tailwind e conferir medindo as ilhas do proprio preview.
 *
 * O QUE A MEDICAO MOSTRA, e e mais do que os dois pediram: a altura NAO e funcao do tamanho. A 11 px
 * ela varia de 11 a 16,5 px conforme a classe de `leading`, isto e 50% de diferenca, entao a conta
 * precisa do PAR (tamanho, altura) e nunca do tamanho sozinho.
 */
export function medirAlturaDeLinha(raiz = VISUAIS_DIR) {
  if (cacheAlturaDeLinha) return cacheAlturaDeLinha;
  const pares = new Map();
  let previews = 0;
  const andar = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) {
        if (['node_modules', '.qa', '.tmp', '.lock', '.git', '_estudo'].includes(e.name)) continue;
        andar(path.join(dir, e.name));
        continue;
      }
      if (e.name !== 'preview.svg') continue;
      previews += 1;
      const texto = fs.readFileSync(path.join(dir, e.name), 'utf8');
      for (const bloco of texto.matchAll(/<foreignObject\b[^>]*>([\s\S]*?)<\/foreignObject>/g)) {
        for (const tag of bloco[1].matchAll(/style="([^"]*)"/g)) {
          const tamanho = /font-size:\s*([\d.]+)px/.exec(tag[1]);
          const altura = /line-height:\s*([\d.]+)px/.exec(tag[1]);
          if (!tamanho || !altura) continue;
          const chave = `${Number(tamanho[1])}|${Number(altura[1])}`;
          pares.set(chave, (pares.get(chave) ?? 0) + 1);
        }
      }
    }
  };
  andar(raiz);
  const linhas = [...pares.entries()]
    .map(([chave, n]) => {
      const [tamanho, altura] = chave.split('|').map(Number);
      return { tamanho, altura, razao: altura / tamanho, vezes: n };
    })
    .filter((l) => l.vezes >= 20)
    .sort((a, b) => a.tamanho - b.tamanho || a.altura - b.altura);
  cacheAlturaDeLinha = { previews, linhas, total: [...pares.values()].reduce((s, n) => s + n, 0) };
  return cacheAlturaDeLinha;
}

export function medirMoldura(raiz = VISUAIS_DIR) {
  if (cacheMoldura) return cacheMoldura;
  const grupos = new Map();
  let previews = 0;
  let medidos = 0;
  let vaoConfirmado = 0;
  let larguraDivergente = 0;
  const andar = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) {
        if (['node_modules', '.qa', '.tmp', '.lock', '.git', '_estudo'].includes(e.name)) continue;
        andar(path.join(dir, e.name));
        continue;
      }
      if (e.name !== 'preview.svg') continue;
      const metaFile = path.join(dir, 'meta.json');
      if (!fs.existsSync(metaFile)) continue;
      let meta;
      try {
        meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
      } catch {
        continue;
      }
      const svg = fs.readFileSync(path.join(dir, e.name), 'utf8');
      previews += 1;
      const raizSvg = svg.match(/<svg[^>]*width="(\d+)" height="(\d+)"/);
      if (!raizSvg) continue;
      const largura = Number(raizSvg[1]);
      const frame = meta.frame ?? 'card';
      const recuo = recuoDaMoldura(frame, largura);
      // A largura da ilha entra na medida porque a CAIXA DO CASO DE USO não é obviamente a mesma do
      // corpo: se o `<header>` tivesse recuo próprio, o limiar de caracteres sairia errado e reproduziria
      // o defeito que a tabela veio consertar. Medido: ela é igual à do corpo.
      const ilha = svg.match(new RegExp(`<(?:foreignObject|svg|g)[^>]*x="${recuo}(?:\\.\\d+)?" y="${recuo}(?:\\.\\d+)?"[^>]*width="([\\d.]+)" height="([\\d.]+)"`));
      if (!ilha) continue;
      medidos += 1;
      const larguraDaIlha = Number(ilha[1]);
      const cabecalho = Number(ilha[2]);
      if (larguraDaIlha !== largura - 2 * recuo) larguraDivergente += 1;
      const chave = `${frame}|${largura >= 560}`;
      if (!grupos.has(chave)) grupos.set(chave, { frame, folgado: largura >= 560, recuo, cabecalhos: new Map(), n: 0 });
      const g = grupos.get(chave);
      g.cabecalhos.set(cabecalho, (g.cabecalhos.get(cabecalho) ?? 0) + 1);
      g.n += 1;
      const topo = recuo + cabecalho + VAO_DO_CABECALHO;
      if (svg.includes(`y="${topo}"`) || svg.includes(`y="${topo}.`)) vaoConfirmado += 1;
    }
  };
  andar(raiz);
  cacheMoldura = { previews, medidos, vaoConfirmado, larguraDivergente, grupos: [...grupos.values()].sort((a, b) => a.frame.localeCompare(b.frame) || Number(b.folgado) - Number(a.folgado)) };
  return cacheMoldura;
}

/**
 * A largura média de caractere, em em e em px, por família e por classe de caractere.
 *
 * POR QUE ENTRA NO DOSSIÊ. Um agente precisou dela para a anticolisão de uma camada própria de rótulo
 * e COPIOU `6.4` das peças vizinhas sem saber se era medido ou herdado; sete peças do catálogo carregam
 * `LABEL_CHAR_WIDTH = 6.4`. A mesma grandeza existe hoje em três números diferentes: a tabela por
 * glifo de `colisao.mjs` (a medição), o `ESP_LARGURA_POR_EM` de `guardas.mjs` (outra finalidade) e o
 * `6.4` das peças.
 *
 * Medido AQUI pela mesma função que a guarda usa, e não por número transcrito: assim o que o dossiê
 * publica e o que a COLISAO-TEXTO mede não podem divergir.
 */
export function medirLarguraDeCaractere(tamanho = 11) {
  const classes = [
    { nome: 'dígitos', chars: '0123456789' },
    { nome: 'maiúsculas', chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' },
    { nome: 'minúsculas', chars: 'abcdefghijklmnopqrstuvwxyz' },
  ];
  const familias = [
    { nome: 'grotesk', papel: 'número e rótulo de valor (`font-display`, `kpi-number`)' },
    { nome: 'manrope', papel: 'texto, nome de categoria, legenda e tique' },
  ];
  const medidas = familias.map((f) => ({
    ...f,
    classes: classes.map((c) => {
      const em = [...c.chars].reduce((soma, ch) => soma + larguraDoTexto(ch, 1, f.nome), 0) / c.chars.length;
      return { nome: c.nome, em, px: em * tamanho };
    }),
  }));
  return { tamanho, medidas, padrao: { em: LARGURA_PADRAO, px: LARGURA_PADRAO * tamanho } };
}

/**
 * Padrões do Recharts que surpreendem, com a linha do pacote como prova.
 *
 * POR QUE ESTA EXTRAÇÃO EXISTE: **assinatura de tipo não é semântica.** Um agente perdeu um render
 * porque `ZAxis range={[a,a]}` não fixou o raio do ponto, e o dossiê recomendava justamente esse
 * padrão; outro perdeu porque a escala de eixo categórico devolve a BORDA da faixa e não o centro. Nos
 * dois casos o tipo estava certo, o número saiu certo, e o significado do número era outro. Por isso
 * cada item aqui carrega o trecho do pacote e o `arquivo:linha`, para quem quiser conferir.
 *
 * Conferido contra o pacote instalado, não contra a documentação.
 */
/**
 * SONDAS por COMPONENTE: o que surpreende em cada um, com a linha do pacote como prova.
 *
 * ESCOPO POR MODELO, e é isso que torna a seção viável: documentar os 54 nomes do Recharts seria enorme
 * e quase todo inútil para cada peça. O dossiê é por modelo, então a seleção sai de graça: entra só o
 * componente que as versões existentes deste modelo importam.
 *
 * SÓ O QUE SURPREENDE. Prop que não existe, padrão que não se desliga, valor que significa outra coisa,
 * fórmula interna que depende do que o autor não controla, e chave que colide. Assinatura de tipo não
 * entra: ela já está publicada e o próprio produtor disse que ela não é semântica.
 *
 * Componente sem sonda declarada sai com "nenhuma pegadinha conhecida", que é informação útil: evita
 * que alguém vá ler o pacote por precaução. Sonda cuja linha não está mais no pacote sai como LACUNA
 * DECLARADA, nunca como descrição do plausível.
 */
const SONDAS_POR_COMPONENTE = [
  {
    componente: 'SunburstChart',
    titulo: 'O rótulo de cada setor é impresso sempre, e não existe prop para desligar',
    arquivo: 'es6/chart/SunburstChart.js',
    agulha: '}), d[dataKey])));',
    consequencia:
      'O `Text` com `d[dataKey]` é filho fixo de cada setor, sem condição em volta: não há `label={false}` ' +
      'nem `hideLabels`. Em anel fino o número sai por cima da borda e não há como pedir que ele não saia. ' +
      'Quem precisa de setor sem rótulo não usa o `SunburstChart`; desenha o anel em SVG puro.',
  },
  {
    componente: 'SunburstChart',
    titulo: 'A espessura é igual em todos os anéis, e a conta inclui a raiz que nunca é desenhada',
    arquivo: 'es6/chart/SunburstChart.js',
    agulha: 'var thickness = (outerRadius - innerRadius) / treeDepth;',
    consequencia:
      'O `treeDepth` vem de `getMaxDepthOf(data)`, que devolve 1 para folha e soma 1 por nível, então a ' +
      'raiz entra na divisão mesmo sem virar setor: uma árvore de dois níveis visíveis divide o raio por ' +
      'três. O autor não controla a espessura por anel, só o par `innerRadius`/`outerRadius` e a forma da ' +
      'árvore que ele entrega.',
  },
  {
    componente: 'SunburstChart',
    titulo: 'A chave de React do setor é o nome do nó mais o índice dentro do próprio pai',
    arquivo: 'es6/chart/SunburstChart.js',
    agulha: 'key: "sunburst-sector-".concat(d.name, "-").concat(i)',
    consequencia:
      '**Dois nós com o mesmo nome em pais diferentes colidem na chave**, porque o índice é relativo ao pai ' +
      'e não ao desenho inteiro; o React avisa e o render quebra. Isto já aconteceu nesta frente. O dado ' +
      'fictício precisa de nomes únicos em toda a árvore, e não só entre irmãos.',
  },
  {
    componente: 'Sankey',
    titulo: 'O valor do nó é o MAIOR dos dois lados, e ele não exige que entradas e saídas batam',
    arquivo: 'es6/chart/Sankey.js',
    agulha: 'value: Math.max(getSumOfIds(links, result.sourceLinks), getSumOfIds(links, result.targetLinks)),',
    consequencia:
      'Nó desequilibrado desenha mais alto que as faixas que o alimentam, e o diagrama fica coerente na ' +
      'aparência com um dado que não fecha. É a forma exata do defeito do acervo que declarava 412 repasses e ' +
      'somava 338, registrado como `REC-33`. Feche a conta no `data.ts` antes de desenhar: nada no Recharts ' +
      'vai reclamar.',
  },
  {
    componente: 'Sankey',
    titulo: 'A escala vertical é a MENOR entre as colunas, então um nó inflado encolhe o diagrama inteiro',
    arquivo: 'es6/chart/Sankey.js',
    agulha: 'var yRatio = Math.min(...depthTree.map(nodes => {',
    consequencia:
      'Cada coluna tem a razão `(altura − vãos) / soma da coluna` e o desenho usa a **menor** delas, isto é a ' +
      'da coluna de soma maior; daí `node.dy = node.value * yRatio` vale para todos. Uma soma inflada numa ' +
      'coluna só afina **todas** as faixas do diagrama, em silêncio, e a espessura que você calculou para a ' +
      'primeira coluna não se cumpre.',
  },
  {
    componente: 'Bar',
    titulo: 'Coluna negativa chega com `height` NEGATIVO, e só o `Rectangle` normaliza',
    arquivo: 'es6/cartesian/Bar.js',
    agulha: 'var computedHeight = baseValueScale - currentValueScale;',
    consequencia:
      'Com valor abaixo da base, `height` sai negativo e `y` fica na borda de baixo do retângulo. O ' +
      '`Rectangle` do próprio pacote normaliza ao desenhar, então a marca aparece certa; **a sua conta de ' +
      'rótulo não normaliza nada**. Um produtor mediu o rótulo de um estorno nascendo 86 px fora do lugar em ' +
      '2026-09-29. Se você calcula posição a partir de `y` e `height`, normalize primeiro: o topo é ' +
      '`Math.min(y, y + height)` e a altura é `Math.abs(height)`.',
  },
  {
    componente: 'Bar',
    titulo: 'O `index` que o `shape` recebe é o FILTRADO, e o do dado é `originalDataIndex`',
    arquivo: 'es6/cartesian/Bar.js',
    agulha: 'entry.originalDataIndex',
    consequencia:
      'O pacote filtra as entradas antes de desenhar, então o `index` que chega ao seu `shape` e ao seu ' +
      '`LabelList` conta as marcas DESENHADAS, não as linhas do `data`. Com `null` no meio da série, ' +
      '`rows[index]` passa a ler a linha errada, e o erro cresce a cada ausência anterior. Use ' +
      '`entry.originalDataIndex`, que o pacote carrega exatamente para isso, e nunca o `index` posicional. ' +
      'Um produtor mediu isso em 2026-09-29 numa série com ausência declarada.',
  },
  {
    componente: 'Bar',
    titulo: 'A isenção da forma própria cobre a marca de DIMENSÃO ZERO, não o valor `null`',
    arquivo: 'es6/cartesian/Bar.js',
    agulha: '!hasCustomShape && (width === 0 || height === 0)',
    consequencia:
      'Com `shape` o pacote deixa de descartar o retângulo de largura ou altura zero, e só isso. O `null` sai ' +
      'antes desta linha, porque a escala devolve indefinido, e o seu `shape` **não é chamado**: ausência não ' +
      'se desenha por ele. É a `REC-11`.',
  },
  {
    componente: 'ReferenceArea',
    titulo: '`x1` igual a `x2` desenha UMA BANDA em escala de banda, e nada em escala de pontos',
    arquivo: 'es6/cartesian/ReferenceArea.js',
    agulha: "position: 'end'",
    consequencia:
      'O fim da categoria soma `bandwidth()`. Com `<Bar>` a escala é de banda e a faixa cobre a categoria ' +
      'inteira; em `LineChart`, `AreaChart` e `ComposedChart` sem `<Bar>` a escala é de pontos, a largura é ' +
      'zero e nada é desenhado. É a `REC-24`.',
  },
  {
    componente: 'Line',
    titulo: 'O `LabelList` de uma `Line` recebe caixa de tamanho ZERO, e `position` não posiciona nada',
    arquivo: 'es6/cartesian/Line.js',
    agulha: 'lowerWidth: 0,',
    consequencia:
      'O `viewBox` de cada ponto sai com largura e altura zero e `parentViewBox` vai como `undefined`, com ' +
      'um comentário do próprio pacote dizendo que os rótulos podem escapar e que isso "parece um defeito". ' +
      '`Label` posiciona CONTRA a caixa, então com área zero o ponto é a caixa inteira e `position` e ' +
      '`offset` não têm contra o que medir; em `Bar` o mesmo código funciona porque ali a caixa é o ' +
      'retângulo da barra. Desenhe o rótulo pela coordenada do ponto, que é correta, e faça a contenção ' +
      'você mesmo, porque o pacote não passa `parentViewBox` neste caminho. É a `REC-34`.',
  },
  {
    componente: 'Sankey',
    titulo: 'As ligações são desenhadas ANTES dos nós, e nada nas props inverte isso',
    arquivo: 'es6/chart/Sankey.js',
    agulha: 'AllSankeyLinkElements, {',
    consequencia:
      'A ordem do documento é a ordem de pintura no SVG, então o nó sempre cobre a ligação e a ligação nunca ' +
      'cobre o nó. Contorno de nó, halo de rótulo e faixa de rótulo se desenham sabendo disso; querer a ' +
      'ligação por cima exige desenhar você mesmo, não uma prop. Um produtor precisou abrir o pacote em ' +
      '2026-09-29 porque duas das versões dele dependiam dessa ordem para existir.',
  },
  {
    componente: 'Sankey',
    titulo: '`node` e `link` aceitam ReactElement, não só função',
    arquivo: 'es6/chart/Sankey.js',
    agulha: 'isValidElement(option)',
    consequencia:
      'Quando o valor é elemento, o pacote faz `cloneElement(option, props)` e injeta as props calculadas por ' +
      'cima das suas; quando é função, ele chama a função. As duas formas funcionam e se comportam de modo ' +
      'diferente diante de prop que você já tenha escrito no elemento: no clone a prop do pacote **vence** a ' +
      'sua, porque entra depois. Vale para `renderLinkItem` e para `renderNodeItem`.',
  },
  {
    componente: 'ReferenceLine',
    titulo: 'O padrão é DESCARTAR a referência que cai fora do domínio',
    arquivo: 'es6/cartesian/ReferenceLine.js',
    agulha: "ifOverflow: 'discard',",
    consequencia:
      'A meta desaparece justamente no recorte em que ela é batida, que é o recorte que interessa: é a ' +
      'armadilha `REC-1`, a mais redescoberta do catálogo. A correção é `ifOverflow="extendDomain"` em toda ' +
      'referência, sempre, mais o valor dela escrito em texto.',
  },
  {
    componente: 'ReferenceArea',
    titulo: 'O padrão é DESCARTAR a faixa que cai fora do domínio',
    arquivo: 'es6/cartesian/ReferenceArea.js',
    agulha: "ifOverflow: 'discard',",
    consequencia: 'Mesma `REC-1` da `ReferenceLine`, e a mesma correção: `ifOverflow="extendDomain"`.',
  },
  {
    componente: 'ReferenceDot',
    titulo: 'O padrão é DESCARTAR o ponto que cai fora do domínio',
    arquivo: 'es6/cartesian/ReferenceDot.js',
    agulha: "ifOverflow: 'discard',",
    consequencia: 'Mesma `REC-1`, mesma correção.',
  },
  {
    componente: 'ZAxis',
    titulo: '`range` é a ÁREA do símbolo em px², não o raio',
    arquivo: 'es6/cartesian/Scatter.js',
    agulha: 'var radius = size == null ? 0 : Math.sqrt(Math.max(size, 0) / Math.PI);',
    consequencia:
      'O raio sai de `√(área/π)`, então o padrão `range=[64,64]` desenha 4,51 px de raio; para um raio `r` ' +
      'passe `range={[πr², πr²]}` (raio 4 pede 50,27). E o `range` **não chega ao símbolo** em dois casos: ' +
      '`<ZAxis>` não registrado para o `zAxisId` do `<Scatter>`, que cai no `implicitZAxis` de volta aos 64, ' +
      'e peça com `shape` própria, que recebe `size`, `width` e `height` e **nunca um `r`**.',
  },
  {
    componente: 'Scatter',
    titulo: 'A forma própria recebe área e caixa, nunca raio',
    arquivo: 'es6/cartesian/Scatter.js',
    agulha: 'var defaultRangeZ = zAxis ? zAxis.range : implicitZAxis.range;',
    consequencia:
      'Sem `<ZAxis>` registrado o tamanho vem do `implicitZAxis`, cujo `range` é `[64, 64]`. A `shape` própria ' +
      'que ignorar `size` desenha do mesmo tamanho para todo ponto, e nenhuma guarda pega isso.',
  },
  {
    // O mesmo fato vale pelo componente e pelos dois hooks de escala: quem chama `useXAxisScale` é
    // justamente quem vai ancorar rótulo na mão, e listá-lo como "sem pegadinha" seria um miss perigoso.
    componente: ['XAxis', 'YAxis', 'useXAxisScale', 'useYAxisScale'],
    titulo: 'A escala de eixo de categoria devolve a BORDA da faixa, não o centro',
    arquivo: 'es6/util/ChartUtils.js',
    agulha: 'return matchedTick.coordinate + bandSize / 2;',
    consequencia:
      '`useXAxisScale()(valor)` num eixo `band` dá o início da banda; o centro é `escala(valor) + bandwidth()/2`, ' +
      'e é assim que o próprio Recharts centraliza a marca. Rótulo ou casco ancorado no retorno cru nasce ' +
      'deslocado meia banda, o que no PNG parece erro de dado.',
  },
  {
    componente: 'Bar',
    titulo: 'O vão de categoria é descontado DOS DOIS LADOS da banda',
    arquivo: 'es6/state/selectors/combiners/combineAllBarPositions.js',
    agulha: 'var originalSize = (bandSize - 2 * _offset - (len - 1) * realBarGap) / len;',
    consequencia:
      'Com o `barCategoryGap` padrão de 10% a barra fica com **80%** da banda, não com 90%: o `2 *` na conta é ' +
      'o que engana. A conta completa, do canvas ao piso de espessura, está na seção da moldura.',
  },
];

const PADROES_RECHARTS = [
  {
    chave: 'zRange',
    arquivo: 'es6/state/selectors/axisSelectors.js',
    agulha: '  range: [64, 64],',
  },
  {
    chave: 'zSize',
    arquivo: 'es6/cartesian/Scatter.js',
    agulha: "var size = z !== '-' && zAxis != null ? zAxis.scale.map(z) : defaultZ;",
  },
  {
    chave: 'zRaio',
    arquivo: 'es6/cartesian/Scatter.js',
    agulha: 'var radius = size == null ? 0 : Math.sqrt(Math.max(size, 0) / Math.PI);',
  },
  {
    chave: 'zFallback',
    arquivo: 'es6/cartesian/Scatter.js',
    agulha: 'var defaultRangeZ = zAxis ? zAxis.range : implicitZAxis.range;',
  },
  {
    chave: 'simboloArea',
    arquivo: 'es6/shape/Symbols.js',
    agulha: "sizeType = _ref$sizeType === void 0 ? 'area' : _ref$sizeType,",
  },
  {
    chave: 'bandaCentro',
    arquivo: 'es6/util/ChartUtils.js',
    agulha: 'return matchedTick.coordinate + bandSize / 2;',
  },
  {
    chave: 'espessuraBarra',
    arquivo: 'es6/state/selectors/combiners/combineAllBarPositions.js',
    agulha: 'var originalSize = (bandSize - 2 * _offset - (len - 1) * realBarGap) / len;',
  },
  {
    chave: 'gapCategoria',
    arquivo: 'es6/chart/CartesianChart.js',
    agulha: "barCategoryGap: '10%',",
  },
  {
    chave: 'gapBarra',
    arquivo: 'es6/chart/CartesianChart.js',
    agulha: 'barGap: 4,',
  },
];

/** Os nomes que as versões EXISTENTES deste modelo importam de `recharts`. */
export function importsDoModelo(familia, modelo, raiz = VISUAIS_DIR) {
  const dir = path.join(raiz, familia.slug, modelo.slug);
  const nomes = new Set();
  if (!fs.existsSync(dir)) return nomes;
  for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entrada.isDirectory()) continue;
    const chart = path.join(dir, entrada.name, 'Chart.tsx');
    if (!fs.existsSync(chart)) continue;
    const texto = fs.readFileSync(chart, 'utf8');
    for (const m of texto.matchAll(/import\s+(type\s+)?\{([^}]*)\}\s+from\s+'recharts'/gs)) {
      // Import de TIPO fica fora: `type LabelProps` e `type SunburstData` não têm comportamento para
      // sondar, e listá-los como "sem pegadinha conhecida" seria ruído com cara de informação.
      const importDeTipo = Boolean(m[1]);
      for (const cru of m[2].split(',')) {
        const bruto = cru.trim();
        if (importDeTipo || bruto.startsWith('type ')) continue;
        const nome = bruto.split(/\s+as\s+/)[0].trim();
        if (nome) nomes.add(nome);
      }
    }
  }
  return nomes;
}

/**
 * Sonda o pacote pelo comportamento dos componentes que a peça usa.
 *
 * Devolve, por componente: os itens confirmados no pacote, os que a sondagem NÃO confirmou (lacuna
 * declarada) e a marca de "nenhuma sonda declarada", que são três estados diferentes e não um só.
 */
export function sondarComponentes(nomes, raiz = path.join(RENDER_DIR, 'node_modules', 'recharts')) {
  const alvo = [...nomes].sort();
  const porComponente = [];
  for (const componente of alvo) {
    const sondas = SONDAS_POR_COMPONENTE.filter((s) =>
      Array.isArray(s.componente) ? s.componente.includes(componente) : s.componente === componente,
    );
    if (!sondas.length) {
      porComponente.push({ componente, estado: 'sem-sonda', itens: [] });
      continue;
    }
    const itens = [];
    const naoConfirmadas = [];
    for (const sonda of sondas) {
      const arquivo = path.join(raiz, sonda.arquivo);
      if (!fs.existsSync(arquivo)) {
        naoConfirmadas.push(sonda);
        continue;
      }
      const linhas = fs.readFileSync(arquivo, 'utf8').replace(/\r\n/g, '\n').split('\n');
      const i = linhas.findIndex((l) => l.includes(sonda.agulha));
      if (i < 0) naoConfirmadas.push(sonda);
      else itens.push({ ...sonda, linha: i + 1, codigo: linhas[i].trim() });
    }
    porComponente.push({ componente, estado: itens.length ? 'com-pegadinha' : 'nao-confirmada', itens, naoConfirmadas });
  }
  return {
    porComponente,
    comPegadinha: porComponente.filter((c) => c.estado === 'com-pegadinha').length,
    semSonda: porComponente.filter((c) => c.estado === 'sem-sonda').map((c) => c.componente),
    naoConfirmadas: porComponente.filter((c) => c.estado === 'nao-confirmada').map((c) => c.componente),
  };
}

export function extrairPadroesDoRecharts(raiz = path.join(RENDER_DIR, 'node_modules', 'recharts')) {
  const achados = new Map();
  if (!fs.existsSync(raiz)) return { versao: null, achados };
  for (const item of PADROES_RECHARTS) {
    const arquivo = path.join(raiz, item.arquivo);
    if (!fs.existsSync(arquivo)) continue;
    const linhas = fs.readFileSync(arquivo, 'utf8').replace(/\r\n/g, '\n').split('\n');
    const i = linhas.findIndex((l) => l.includes(item.agulha));
    if (i < 0) continue;
    achados.set(item.chave, { arquivo: item.arquivo, linha: i + 1, codigo: linhas[i].trim() });
  }
  let versao = null;
  const pkg = path.join(raiz, 'package.json');
  if (fs.existsSync(pkg)) versao = JSON.parse(fs.readFileSync(pkg, 'utf8')).version ?? null;
  return { versao, achados };
}

/**
 * Do canvas ao passo, e do passo ao veredito do piso de espessura.
 *
 * A tabela da moldura entrega o CORPO; o que decide se a barra ou a faixa nasce abaixo do piso é o
 * PASSO, que é o corpo dividido pelo número de faixas. Sem esta conta o produtor só descobre no
 * render, e a correção é canvas maior, que é mudança de `meta.json` e não de código.
 *
 * Os números de folga do plano são os padrões do Recharts: margem de 5 px por lado e eixo X de 30 px.
 */
export const RECHARTS_MARGEM = 5;
export const RECHARTS_ALTURA_EIXO_X = 30;
export const RECHARTS_LARGURA_EIXO_Y = 60;
export const RECHARTS_GAP_CATEGORIA = 0.1;

export function calcularPasso({ corpo, faixas, series = 1, gapCategoria = RECHARTS_GAP_CATEGORIA, gapBarra = 4, piso }) {
  const plano = corpo - 2 * RECHARTS_MARGEM - RECHARTS_ALTURA_EIXO_X;
  const banda = plano / faixas;
  const folga = banda * gapCategoria;
  const espessura = (banda - 2 * folga - (series - 1) * gapBarra) / series;
  // Quantas faixas ainda cabem com a espessura no piso: a conta invertida, que é a que interessa.
  const bandaMinima = (piso * series + (series - 1) * gapBarra) / (1 - 2 * gapCategoria);
  return { plano, banda, espessura, bandaMinima, faixasNoPiso: Math.floor(plano / bandaMinima) };
}

/**
 * A partir de quantos caracteres o caso de uso quebra na SEGUNDA linha do cabeçalho.
 *
 * POR QUE EXISTE: a tabela da moldura dá as duas alturas de cabeçalho e não dizia qual usar, e é essa
 * escolha que decide se o corpo tem 241,5 ou 225 px. Dois agentes nomearam a lacuna e um deles errou a
 * v4 por causa dela. As duas metades já estavam publicadas (largura útil do cabeçalho e avanço por
 * caractere) e ninguém tinha juntado.
 *
 * MEDIDO NO CORPUS, não por fórmula: os 814 casos de uso do catálogo são a amostra, e cada um é medido
 * pela mesma função da guarda. Uma média por classe erra em prosa, porque o espaço avança 0,216 em e
 * baixa a média real bem abaixo da média das minúsculas.
 *
 * TRÊS FAIXAS, e não um limiar: **seguro** é o maior tamanho abaixo do qual TODO texto do corpus cabe;
 * **fronteira** é a faixa em que uns cabem e outros não, porque ali a composição do texto decide; e
 * acima dela são duas linhas sempre. Um caso de uso na fronteira é frágil: qualquer emenda no texto
 * muda a altura do cabeçalho e desloca o desenho inteiro.
 */
export function medirLimiarDoCabecalho(larguras, { tamanho = 12, familia = 'manrope' } = {}) {
  const corpus = [];
  try {
    for (const familiaDoCatalogo of lerCatalogo()) {
      for (const modelo of familiaDoCatalogo.modelos ?? []) {
        for (const versao of modelo.versoes ?? []) if (versao.caso_de_uso) corpus.push(versao.caso_de_uso);
      }
    }
  } catch {
    return null;
  }
  if (!corpus.length) return null;
  const medidos = corpus.map((texto) => ({ chars: [...texto].length, px: larguraDoTexto(texto, tamanho, familia) }));
  const faixas = [...new Set(larguras)].sort((a, b) => a - b).map((largura) => {
    const cabem = medidos.filter((m) => m.px <= largura);
    const naoCabem = medidos.filter((m) => m.px > largura);
    return {
      largura,
      cabem: cabem.length,
      naoCabem: naoCabem.length,
      seguro: naoCabem.length ? Math.min(...naoCabem.map((m) => m.chars)) - 1 : null,
      maiorQueCabe: cabem.length ? Math.max(...cabem.map((m) => m.chars)) : null,
    };
  });
  const somaPx = medidos.reduce((s, m) => s + m.px, 0);
  const somaChars = medidos.reduce((s, m) => s + m.chars, 0);
  return { corpus: corpus.length, tamanho, familia, faixas, avancoMedio: somaPx / somaChars };
}

/** O cabeçalho do serializador: o que ele grava, o que ele omite e por quê. */
export function extrairSerializador(arquivo = path.join(RENDER_DIR, 'page', 'serialize.ts')) {
  if (!fs.existsSync(arquivo)) return '';
  return cabecalhoDeArquivo(lerFonte(arquivo));
}

// ---------------------------------------------------------------------------------------------
// AS LACUNAS MEDIDAS DA PALETA
// ---------------------------------------------------------------------------------------------
//
// Medido AQUI, na geração, contra `app/src/styles/tokens.css`, pela mesma fórmula da WCAG que as
// guardas usam: número de dossiê que não se recalcula envelhece calado, e a tabela da 17.10 do
// contrato já traz o aviso de que precisa ser refeita quando um token muda.

/** Os conjuntos de token que o dossiê mede contra o cartão, com o piso de cada papel. */
const LACUNAS = [
  {
    titulo: 'Rampa sequencial contra o cartão',
    tokens: ['--seq-1', '--seq-2', '--seq-3', '--seq-4', '--seq-5', '--seq-6', '--seq-7'],
    piso: 3,
    papel: 'marca de dado (WCAG 1.4.11)',
  },
  {
    titulo: 'Neutros de estrutura contra o cartão',
    tokens: ['--surface-overlay', '--surface-sunken', '--line-subtle', '--line-strong'],
    piso: 3,
    papel: 'trilho, poço, moldura e faixa (WCAG 1.4.11)',
  },
  // ACRESCENTADO EM 2026-09-29, a pedido de um produtor: o dossiê media marca e estrutura e não media
  // TEXTO. Quem escreve rótulo de procedência ou linha de apoio tinha de ir medir por conta, e um
  // produtor o fez e errou um dos quatro (deu 14,67 em `--text-primary`, contra 14,53 pela função do
  // projeto), justamente o que mais aparece. O piso aqui é o da ACE-3, 4,5:1, e não os 3:1 da marca.
  {
    titulo: 'Texto e procedência contra o cartão',
    tokens: ['--text-primary', '--text-secondary', '--text-muted', '--prov-medido', '--prov-derivado', '--prov-premissa', '--prov-lacuna', '--prov-prototipo'],
    piso: 4.5,
    papel: 'texto de qualquer papel (ACE-3, WCAG 1.4.3)',
  },
];

/**
 * Pares de MARCA CONTRA MARCA, medidos para provar que o segundo canal é obrigatório.
 *
 * ATENÇÃO AO QUE ESTE NÚMERO NÃO É. Ele não é piso a alcançar. A WCAG 1.4.11 pede 3:1 de objeto
 * contra o FUNDO, nunca de objeto contra objeto, e razão de contraste mede LUMINÂNCIA: paleta
 * categórica de luminância pareada é prática deliberada e correta. Quem cobre distinguir categoria é a
 * 1.4.1, isto é a ACE-2. Uma guarda de razão entre marcas reprovaria a paleta inteira e empurraria o
 * catálogo para cores de luminância espalhada, pior para quem vê cor e sem ganho para quem não vê.
 * Três agentes já mediram estes pares nesta frente, e um deles quase "consertou" a cor.
 */
const PARES_DE_MARCA = [
  { a: '--chart-1', b: '--chart-5', papel: 'duas categorias vizinhas na paleta' },
  { a: '--chart-1', b: '--text-muted', papel: 'o aceso contra o neutro de ausência' },
];

/**
 * A OPACIDADE MÍNIMA de cada cor de marca sai do módulo compartilhado `opacidade.mjs`, e é RE-EXPORTADA
 * aqui porque o dossiê a imprime numa tabela.
 *
 * ELA MORAVA NESTE ARQUIVO e MUDOU DE CASA em 2026-09-28, quando a guarda OPACIDADE-MARCA nasceu para
 * cobrar a `ACE-5`. O dossiê que ENSINA o número e a guarda que o COBRA precisam dizer a mesma coisa:
 * duas cópias divergiriam no primeiro ajuste de paleta, e aí a guarda passaria a reprovar exatamente a
 * peça que esta tabela mandou escrever. Trocar um token em `tokens.css` conserta as duas de uma vez.
 */
export { medirOpacidadeMinima } from './opacidade.mjs';

/**
 * A MATRIZ de texto sobre preenchimento de marca vive em `opacidade.mjs`, ao lado de `CORES_DE_MARCA`
 * e da tabela de opacidade mínima, e mudou de casa em 2026-09-29, quando a guarda TEXTO-NA-MARCA
 * nasceu para cobrar a ROT-6 e a ROT-7b. O motivo é o mesmo da tabela de opacidade logo acima: o
 * dossiê que ENSINA qual texto é legível sobre cada preenchimento e a guarda que COBRA o mesmo piso
 * têm de dizer a mesma coisa, ou a guarda passaria a reprovar a peça que esta tabela mandou escrever.
 */
export { medirTextoSobreMarca } from './opacidade.mjs';

/**
 * Confere a tabela de pares medidos da ACE-8 (§17.10) contra a medição desta geração.
 *
 * A tabela foi escrita à mão, e já se sabe o que acontece com número escrito à mão nesta frente. São
 * conferidas só as linhas com par resolvível: as que dão FAIXA (`--chart-1` a `--chart-6`) ficam de
 * fora, porque ali a tabela não nomeia um par.
 *
 * `bg-<nome>/<pct>` é o fundo translúcido do Tailwind: o token composto naquela opacidade sobre o
 * cartão. É o caso das duas linhas de selo de variação.
 */
export function conferirParesDaAce8(contrato) {
  let tabelas;
  try {
    tabelas = lerTokensDoFarol();
  } catch {
    return { conferidos: 0, divergencias: [] };
  }
  const secao = fatiarPorTitulo(contrato, '###').find((s) => s.titulo.startsWith('17.10'));
  if (!secao) return { conferidos: 0, divergencias: [] };
  const numero = (texto) => Number(texto.replace(/\*/g, '').trim().replace(',', '.'));
  const corDe = (nome, tema) => {
    const composto = nome.match(/^bg-([a-z-]+)\/(\d+)$/);
    if (composto) {
      const base = tabelas[tema].get(`--${composto[1]}`);
      const cartao = tabelas[tema].get('--surface-raised');
      if (!base || !cartao) return null;
      return medirMarca({ ...base, a: Number(composto[2]) / 100 }, cartao).corEfetiva;
    }
    return tabelas[tema].get(nome) ?? null;
  };
  let conferidos = 0;
  const divergencias = [];
  for (const linha of secao.corpo.split('\n')) {
    const m = linha.match(/^\|\s*`([^`]+)`\s+(?:sobre|contra)\s+`([^`]+)`[^|]*\|([^|]+)\|([^|]+)\|/);
    if (!m) continue;
    const [, a, b, escuroTxt, claroTxt] = m;
    if (/\ba\b/.test(a) || /\ba\b/.test(b)) continue;
    const esperado = { escuro: numero(escuroTxt), claro: numero(claroTxt) };
    if (!Number.isFinite(esperado.escuro) || !Number.isFinite(esperado.claro)) continue;
    const medido = {};
    for (const tema of ['dark', 'light']) {
      const x = corDe(a, tema);
      const y = corDe(b, tema);
      if (!x || !y) return { conferidos, divergencias };
      medido[tema === 'dark' ? 'escuro' : 'claro'] = Number(razaoDeContraste(x, y).toFixed(2));
    }
    conferidos += 1;
    if (medido.escuro !== esperado.escuro || medido.claro !== esperado.claro) {
      divergencias.push({
        par: `\`${a}\` sobre \`${b}\``,
        tabela: `${esperado.escuro.toLocaleString('pt-BR')} / ${esperado.claro.toLocaleString('pt-BR')}`,
        medido: `${medido.escuro.toLocaleString('pt-BR')} / ${medido.claro.toLocaleString('pt-BR')}`,
      });
    }
  }
  return { conferidos, divergencias };
}

/**
 * Nomes de token citados num texto que NÃO existem em `tokens.css`.
 *
 * Um agente foi procurar `--danger` e não achou: quem marca atraso ou falha é `--negative`. A origem do
 * nome fantasma era a especificação de uma versão no catálogo, não a cabeça dele.
 *
 * Nome que é PREFIXO de um token existente fica de fora, porque no texto corrido `--seq` e `--prov`
 * são a família e não um token (`--seq-*`, `--prov-*`); acusá-los seria ruído.
 */
export function tokensFantasmas(texto) {
  let tabelas;
  try {
    tabelas = lerTokensDoFarol();
  } catch {
    return [];
  }
  const existe = new Set([...tabelas.dark.keys(), ...tabelas.light.keys()]);
  const citados = new Set([...String(texto ?? '').matchAll(/--[a-z][a-z0-9-]{2,}/g)].map((m) => m[0]));
  return [...citados]
    .filter((nome) => !existe.has(nome) && ![...existe].some((t) => t.startsWith(nome)))
    .sort();
}

/** Mede as lacunas da paleta nos dois temas. Devolve `null` quando os tokens não puderem ser lidos. */
export function medirLacunasDaPaleta() {
  let tabelas;
  try {
    tabelas = lerTokensDoFarol();
  } catch {
    // Sem os tokens do Farol a seção sai dizendo que não mediu, em vez de sair com número velho.
    return null;
  }
  if (!tabelas?.dark || !tabelas?.light) return null;
  const medir = (token, tema) => {
    const cor = tabelas[tema].get(token);
    const cartao = tabelas[tema].get('--surface-raised');
    if (!cor || !cartao) return null;
    return razaoDeContraste(cor, cartao);
  };
  const grupos = LACUNAS.map((l) => ({
    ...l,
    medidas: l.tokens.map((token) => ({ token, escuro: medir(token, 'dark'), claro: medir(token, 'light') })),
  }));
  // O melhor par de texto sobre cada degrau da rampa: é o que decide se "escrever o valor dentro da
  // marca" salva a rampa, como a isenção da 1.4.11 permite para marca com valor escrito.
  const textos = ['--text-primary', '--text-secondary', '--text-muted'];
  const melhorTextoSobre = (token) => {
    const por = (tema) => {
      const fundo = tabelas[tema].get(token);
      if (!fundo) return null;
      const pares = textos
        .map((t) => ({ texto: t, razao: razaoDeContraste(tabelas[tema].get(t), fundo) }))
        .filter((p) => Number.isFinite(p.razao))
        .sort((a, b) => b.razao - a.razao);
      return pares[0] ?? null;
    };
    return { escuro: por('dark'), claro: por('light') };
  };
  const pares = PARES_DE_MARCA.map((p) => ({
    ...p,
    escuro: razaoDeContraste(tabelas.dark.get(p.a), tabelas.dark.get(p.b)),
    claro: razaoDeContraste(tabelas.light.get(p.a), tabelas.light.get(p.b)),
  })).filter((p) => Number.isFinite(p.escuro) && Number.isFinite(p.claro));
  return { grupos, melhorSobreSeq4: melhorTextoSobre('--seq-4'), pisoDeTexto: 4.5, pares };
}

// ---------------------------------------------------------------------------------------------
// A BIBLIOTECA DE FORMATAÇÃO E A SUPERFÍCIE DO RECHARTS
// ---------------------------------------------------------------------------------------------

/**
 * As assinaturas de `@/lib/format`, com o comentário de uma linha de cada uma.
 *
 * `app/` é LEITURA APENAS para o catálogo. A seção 8 do contrato obriga a formatar só por aqui, e o
 * produtor não tinha como saber o que existe sem abrir o arquivo.
 */
export function extrairFormatadores(arquivo = path.join(APP_SRC, 'lib', 'format.ts')) {
  if (!fs.existsSync(arquivo)) return { arquivo: null, itens: [], sinal: '' };
  const fonte = lerFonte(arquivo);
  const linhas = fonte.split('\n');
  const itens = [];
  for (const [i, l] of linhas.entries()) {
    const m = l.match(/^export function (\w+)(\(.*\)): (\w+) \{$/);
    if (!m) continue;
    itens.push({ nome: m[1], assinatura: `${m[1]}${m[2]}: ${m[3]}`, comentario: comentarioAcima(linhas, i) });
  }
  return {
    arquivo: toPosix(path.relative(path.dirname(VISUAIS_DIR), arquivo)),
    itens,
    // O parágrafo do cabeçalho de `format.ts` sobre o sinal de negativo, literal e numa linha só. É ele
    // que diz, para TODOS os formatadores de uma vez, que nenhum devolve hífen e que na moeda o sinal
    // vem antes do símbolo; sem o corpo do arquivo no dossiê, é a única fonte disso para o
    // `formatCurrencyAxis`, cujo comentário não fala de negativo.
    sinal: paragrafoQueComeca(fonte, 'O sinal de negativo').replace(/\s+/g, ' ').trim(),
  };
}

/**
 * O comentário que a origem pôs em cima de uma função: a linha única, ou o PRIMEIRO PARÁGRAFO do bloco.
 *
 * POR QUE O BLOCO TAMBÉM (F0.1b, 2026-10-02): a extração só lia comentário de uma linha, e as duas
 * funções documentadas em bloco saíam como "(sem comentário na origem)". Uma delas é a
 * `formatCurrencyAxis`, que a `EIX-6` manda usar em todo tique de moeda. Enquanto o dossiê trazia o
 * corpo de `format.ts`, o buraco não custava nada; sem o corpo, a tabela é tudo o que o produtor tem.
 * O primeiro parágrafo é o que a origem escreveu como resumo; o resto do bloco é história do achado.
 */
function comentarioAcima(linhas, i) {
  const anterior = linhas[i - 1] ?? '';
  const umaLinha = anterior.match(/^\/\*\* (.*) \*\/$/);
  if (umaLinha) return umaLinha[1];
  if (anterior.trim() !== '*/') return '';
  const bloco = [];
  for (let j = i - 2; j >= 0 && !linhas[j].startsWith('/**'); j -= 1) bloco.unshift(linhas[j].replace(/^\s*\*(?: |$)/, ''));
  const fim = bloco.findIndex((l) => l.trim() === '');
  return (fim < 0 ? bloco : bloco.slice(0, fim)).join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Os dois tiques de moeda que o dossiê usa como exemplo, escritos como `formatCurrencyAxis` os devolve.
 *
 * O negativo leva o U+2212 ANTES do símbolo desde o F0.5b (2026-10-02). O gerador escrevia `R$ −200 mil`,
 * que é a posição antiga do sinal e não sai mais de formatador nenhum; a constante existe para o exemplo
 * mudar num lugar só no dia em que a biblioteca mudar de novo.
 */
export const TIQUE_POSITIVO = 'R$ 60 mil';
export const TIQUE_NEGATIVO = '−R$ 200 mil';

/**
 * Os limiares de eixo que a emenda da `EIX-6` mediu, lidos da tabela dela no contrato.
 *
 * POR QUE EXTRAÇÃO, E NÃO NÚMERO NO GERADOR: o parágrafo de largura de eixo fixava 17,8 e 18,2 px como
 * "medidos em dois rótulos", e a medição de 2026-10-02 mostrou que a sobrecarga vai de 15,8 a 22,6. Número
 * de medição copiado para o gerador envelhece na primeira bancada nova; lido da tabela, ele acompanha a
 * régua. A coluna é achada pelo TÍTULO, não pela posição, e tabela ausente devolve mapa vazio: quem usa
 * decide o que escrever sem número.
 */
export function extrairLimiaresDoTique(contrato) {
  const linhas = String(contrato ?? '').split('\n');
  const celulas = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
  const inicio = linhas.findIndex((l) => l.includes('|') && l.includes('Menor eixo em uma linha'));
  const mapa = new Map();
  if (inicio < 0) return mapa;
  const titulos = celulas(linhas[inicio]);
  const colEixo = titulos.findIndex((t) => t.startsWith('Menor eixo em uma linha'));
  const colSobrecarga = titulos.findIndex((t) => t.startsWith('Eixo menos tinta'));
  for (const l of linhas.slice(inicio + 2)) {
    if (!l.trim().startsWith('|')) break;
    const c = celulas(l);
    const tique = c[0]?.match(/^`([^`]+)`/)?.[1];
    const eixo = c[colEixo]?.match(/\d+/)?.[0];
    if (tique && eixo && !mapa.has(tique)) mapa.set(tique, { eixo, sobrecarga: colSobrecarga < 0 ? null : (c[colSobrecarga] ?? null) });
  }
  return mapa;
}

let cacheImports = null;

/**
 * O que as peças do catálogo de fato importam, com a frequência.
 *
 * Varre os `Chart.tsx` do catálogo em vez de documentar a biblioteca: o que 237 peças importam é a
 * superfície real, e o que nenhuma importa não precisa estar num dossiê. Memorizado no processo,
 * porque uma família inteira gera muitos dossiês numa chamada só.
 */
export function extrairImports(raiz = VISUAIS_DIR) {
  if (cacheImports) return cacheImports;
  const RE_IMPORT = /import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+'([^']+)'/gs;
  const contas = new Map();
  let pecas = 0;
  // Quantas peças escrevem a unidade `p.p.`: é o par da contagem de quem importa o conversor de
  // escala de 0 a 100, e os dois números saem da MESMA varredura para o dossiê não fixar nenhum.
  let pecasComPontoPercentual = 0;
  const conta = (modulo, nome) => {
    if (!contas.has(modulo)) contas.set(modulo, new Map());
    const m = contas.get(modulo);
    m.set(nome, (m.get(nome) ?? 0) + 1);
  };
  const andar = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) {
        if (['node_modules', '.qa', '.tmp', '.lock', '.git', '_estudo'].includes(e.name)) continue;
        andar(path.join(dir, e.name));
      } else if (e.name === 'Chart.tsx') {
        pecas += 1;
        const texto = fs.readFileSync(path.join(dir, e.name), 'utf8');
        if (texto.includes('p.p.')) pecasComPontoPercentual += 1;
        for (const m of texto.matchAll(RE_IMPORT)) {
          const modulo = m[2];
          for (const cru of m[1].split(',')) {
            const nome = cru.trim().split(/\s+as\s+/)[0].trim();
            if (nome) conta(modulo, nome);
          }
        }
      }
    }
  };
  andar(raiz);
  const ordenar = (modulo) => [...(contas.get(modulo) ?? new Map())].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  cacheImports = {
    pecas,
    pecasComPontoPercentual,
    // Quantas peças importam cada formatador, pelo nome.
    format: ordenar('@/lib/format'),
    recharts: ordenar('recharts'),
    chartTheme: ordenar('@/components/visuals/charts/chartTheme'),
    tooltip: ordenar('@/components/visuals/charts/ChartTooltip'),
    versaoRecharts: (() => {
      const pkg = path.join(RENDER_DIR, 'package.json');
      if (!fs.existsSync(pkg)) return null;
      return JSON.parse(fs.readFileSync(pkg, 'utf8')).dependencies?.recharts ?? null;
    })(),
  };
  return cacheImports;
}

/** As assinaturas dos hooks do Recharts que o catálogo usa, tiradas dos `.d.ts` do pacote. */
export function assinaturasDeHooks(nomes, raiz = path.join(RENDER_DIR, 'node_modules', 'recharts', 'types')) {
  const achadas = new Map();
  if (!fs.existsSync(raiz)) return achadas;
  const andar = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const alvo = path.join(dir, e.name);
      if (e.isDirectory()) andar(alvo);
      else if (e.name.endsWith('.d.ts')) {
        for (const m of fs.readFileSync(alvo, 'utf8').matchAll(/^export declare const (use\w+): (.*);$/gm)) {
          if (nomes.includes(m[1]) && !achadas.has(m[1])) achadas.set(m[1], `${m[1]}: ${m[2]}`);
        }
      }
    }
  };
  andar(raiz);
  return achadas;
}

// ---------------------------------------------------------------------------------------------
// COLISÃO ENTRE O QUE O CATÁLOGO PEDE E O QUE O CONTRATO PROÍBE
// ---------------------------------------------------------------------------------------------
//
// 42 das 814 versões planejadas prescrevem armadilha conhecida, e o piloto achou duas na especificação
// das próprias versões que produziu. Isto aqui é BUSCA DE TERMO, então é um MARCADOR e não um veredito:
// aponta a regra para conferir antes de implementar o que a versão pede.
//
// A negação é filtrada porque sem isso a busca vira ruído: metade dos acertos de "girado", "reticência"
// e "eixo duplo" no catálogo são a versão dizendo que NÃO faz aquilo ("sem texto girado", "em vez de
// reticência", "sem eixo duplo"), que é a regra sendo obedecida e não quebrada.

const TERMOS_DE_COLISAO = [
  {
    codigo: 'TIP-3',
    termo: /\b(?:peso|weight)\s*700\b|\bnegrito\b|font-bold/gi,
    // NÃO é colisão por menção: a TIP-3 PERMITE dois elementos em 700, "o nome e o valor do destaque",
    // que é justamente o uso comum. Marcar a menção geraria falso positivo em 44 versões planejadas, e
    // falso positivo é pior que marca nenhuma: ele ensina a ignorar a marca. A marca vira contagem.
    nota:
      'a `TIP-3` **permite dois** elementos em peso 700, o nome e o valor do destaque, então isto não é ' +
      'colisão por si: confira se a versão pede 700 em **mais de dois** elementos',
  },
  // A OPACIDADE IMPLICITA, acrescentada em 2026-09-29. O catalogo quase nunca escreve "opacidade": ele
  // escreve "baixa as demais para 15%". Medido nas 814 versoes, SEIS pedem opacidade em marca por esse
  // padrao e CINCO eram invisiveis a busca por termo, incluindo a que custou uma rodada a um produtor em
  // 2026-09-29. As seis pedem de 15% a 45%, e o minimo medido da ACE-5 e 0,63 a 0,77, ou seja as seis
  // pedem abaixo do piso. O padrao e estreito de proposito: exige o grupo NAO destacado ("demais") ao
  // lado do percentual, e assim acerta 6 de 6 sem marcar percentual de dado. Um padrao mais largo, com
  // qualquer "a NN%", foi medido antes e acertava 4 de 10, e marca ruidosa gasta a confianca na marca.
  {
    codigo: 'ACE-5',
    termo: /opacidade|fillOpacity|strokeOpacity|\bopacity\b|esmaecid|(?:demais[^.]{0,30}(?:para|a|em)\s+\d{1,2}\s?%)|(?:(?:para|a|em)\s+\d{1,2}\s?%[^.]{0,20}demais)/gi,
  },
  { codigo: 'COR-9', termo: /gradiente|\bsombra\b|\bbrilho\b|\btextura\b/gi },
  { codigo: 'TIP-5', termo: /rotacionad|inclinad|\bgirad[oa]\b|\bangle=/gi },
  { codigo: 'TIP-7', termo: /trunca\w*|reticênc\w*|\bellipsis\b/gi },
  { codigo: 'EIX-8', termo: /eixo duplo|eixos duplos|segundo eixo y/gi },
];

const NEGACAO = /\b(?:sem|nunca|não|nao|jamais|evita\w*|proibid\w*|dispensa\w*|elimina\w*|em vez de|alternativa a[o]?)\b[^.;|]{0,26}$/i;

/** Os códigos de regra que o texto de uma versão do catálogo pede para conferir. */
export function colisoesDaVersao(versao) {
  const campos = [versao.titulo, versao.caso_de_uso, ...(versao.o_que_demonstra ?? [])].filter(Boolean);
  const achados = [];
  for (const nome of tokensFantasmas(campos.join(' '))) {
    // Token que não existe em `tokens.css` prescrito pela própria especificação da versão: o check
    // recusa `var(--nome)` inexistente, então isto é reprovação garantida se implementado ao pé da letra.
    achados.push({ codigo: 'CONTRATO §7', trecho: nome });
  }
  for (const { codigo, termo, nota } of TERMOS_DE_COLISAO) {
    for (const campo of campos) {
      let marcou = false;
      for (const m of campo.matchAll(termo)) {
        if (NEGACAO.test(campo.slice(0, m.index))) continue;
        achados.push({ codigo, trecho: m[0], nota });
        marcou = true;
        break;
      }
      if (marcou) break;
    }
  }
  return achados;
}

/** Estado no disco de cada versão planejada, e as pastas de versão que o catálogo não conhece. */
export function estadoNoDisco(familia, modelo, raiz = VISUAIS_DIR) {
  const dirModelo = path.join(raiz, familia.slug, modelo.slug);
  const versoes = (modelo.versoes ?? []).map((v) => {
    const dir = path.join(dirModelo, v.slug);
    const chart = path.join(dir, 'Chart.tsx');
    return {
      ...v,
      produzida: fs.existsSync(chart),
      caminho: `${familia.slug}/${modelo.slug}/${v.slug}`,
    };
  });
  const planejadas = new Set(versoes.map((v) => v.slug));
  let extras = [];
  if (fs.existsSync(dirModelo)) {
    extras = fs
      .readdirSync(dirModelo, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !planejadas.has(e.name) && fs.existsSync(path.join(dirModelo, e.name, 'Chart.tsx')))
      .map((e) => e.name);
  }
  return { dirModelo, pastaExiste: fs.existsSync(dirModelo), versoes, extras };
}

function hoje(agora = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${agora.getFullYear()}-${p(agora.getMonth() + 1)}-${p(agora.getDate())}`;
}

/** A linha da tabela de moldes da seção 1 que corresponde à abordagem. */
function molde(contrato, abordagem) {
  const rotulo = MOLDE_POR_ABORDAGEM[abordagem];
  if (!rotulo) return null;
  for (const linha of contrato.split('\n')) {
    if (!linha.startsWith('| `_render/exemplos/')) continue;
    if (!linha.includes(rotulo)) continue;
    const caminho = linha.split('|')[1]?.trim();
    const tecnica = linha.split('|')[2]?.trim();
    return { caminho, tecnica };
  }
  return null;
}

function listar(itens) {
  return (itens ?? []).map((i) => `- ${i}`).join('\n');
}

/**
 * Monta o dossiê. Devolve o texto e a contagem do que entrou, para o comando e o selftest medirem a
 * extração contra a origem em vez de confiarem nela.
 */
export function montarDossie({ familia, modelo, contrato, armadilhas, agora, raiz = VISUAIS_DIR, papel = PAPEL_PADRAO }) {
  const composicao = COMPOSICAO_POR_PAPEL[papel];
  if (!composicao) throw new Error(`papel desconhecido: "${papel}"; o dossiê aceita ${PAPEIS.join(', ')}`);
  const entra = (parte) => composicao.includes(parte);
  const data = hoje(agora);
  const abordagem = modelo.abordagem_stack ?? '(não declarada)';
  const prefixos = prefixosAplicaveis(abordagem);
  const disco = estadoNoDisco(familia, modelo, raiz);
  const regras = extrairRegras(contrato);
  const todasArmadilhas = extrairArmadilhas(armadilhas);
  const aplicaveis = todasArmadilhas.filter((a) => prefixos.includes(a.prefixo));
  const secoes = SECOES_ESTRUTURAIS.map((s) => ({ ...s, ...recortarSecao(contrato, s.num, s) }));
  const exemplo = molde(contrato, abordagem);
  const produzidas = disco.versoes.filter((v) => v.produzida);
  const { guardas, tabela: tabelaGuardas, escapaveis } = extrairGuardas();
  const { escape: blocoEscape, fila: blocoFila, condicaoTransform } = extrairEscapeEFila();
  const formatadores = extrairFormatadores();
  const imports = extrairImports(raiz);
  const hooks = assinaturasDeHooks(imports.recharts.map(([nome]) => nome).filter((nome) => nome.startsWith('use')));
  const moldura = medirMoldura(raiz);
  const paleta = medirLacunasDaPaleta();
  const largura = medirLarguraDeCaractere();
  const fila = resumoDaFila();
  const padroes = extrairPadroesDoRecharts();
  // O que ESTE modelo importa de `recharts`; vazio quando ele ainda não tem versão no disco, e aí a
  // sondagem entra inteira, porque quem escreve a primeira versão não tem irmã para consultar.
  const nomesDoModelo = importsDoModelo(familia, modelo, raiz);
  const sondagem = sondarComponentes(nomesDoModelo.size ? nomesDoModelo : new Set(SONDAS_POR_COMPONENTE.map((s) => s.componente)));
  const opacidade = medirOpacidadeMinima();
  const textoSobreMarca = medirTextoSobreMarca();
  const textoSobreComposta = medirTextoSobreMarcaComposta();
  // Os recortes pontuais do F0.3: cada um é `null` quando a origem não traz o trecho, e aí o dossiê cala.
  const comoDeclararCanvas = extrairFraseDaArmadilha(armadilhas, 'GEO-1', 'quando a conta não cabe em nenhum preset', 'se lê de primeira.');
  const motivosDaEspessura = extrairItem(armadilhas, 'Quando a `ESPESSURA-MARCA` não mede');
  const emendaDoTique = extrairItem(contrato, 'com o eixo de categoria escondido');
  const carimboDaFrase = extrairFraseDoCarimbo();
  const caixaDeTinta = medirCaixaDeTinta();
  const divergenciaAce8 = conferirParesDaAce8(contrato);
  // Nomes de token que o contrato declara como PROPOSTA na 17.11 e que por isso não existem em
  // `tokens.css`. O recorte é a subseção, e não o contrato inteiro, porque no texto corrido aparecem
  // também as flags de linha de comando (`--tema`, `--json`) e os exemplos do que o check recusa
  // (`--chart-9`, `--cor-borda`), que não são nome fantasma circulando: são o próprio aviso.
  const secao1711 = fatiarPorTitulo(contrato, '###').find((s) => s.titulo.startsWith('17.11'));
  const fantasmasDoContrato = secao1711 ? tokensFantasmas(secao1711.corpo).filter((n) => !n.endsWith('-')) : [];
  const pisoEspessura = Number(
    guardas.find((g) => g.codigo === 'ESPESSURA-MARCA')?.constantes.find((c) => c.nome === 'ESP_PISO_GERAL')?.valor ?? 12,
  );
  const grupoCard = (largura2) => moldura.grupos.find((g) => g.frame === 'card' && g.folgado === largura2 >= 560);
  // As larguras de cabeçalho que os presets produzem, por moldura: é a caixa do caso de uso. Medido
  // ANTES do passo, porque é este limiar que diz se o cabeçalho de uma linha é alcançável na largura.
  const larguraDeCabecalho = [];
  for (const g of moldura.grupos) {
    for (const [, { width }] of Object.entries(CANVAS_PRESETS)) {
      if ((width >= 560) === g.folgado) larguraDeCabecalho.push(width - 2 * g.recuo);
    }
  }
  const limiar = medirLimiarDoCabecalho(larguraDeCabecalho);
  /**
   * O corpo de cada preset na moldura `card`, nas DUAS alturas de cabeçalho, mais o veredito de qual
   * delas é alcançável.
   *
   * Publicar só a de uma linha prometia um teto de faixas que não existe, e um produtor achou o
   * defeito em 2026-09-29: nos canvases estreitos (302 e 328 px de cabeçalho) NENHUM dos casos de uso
   * do catálogo cabe em uma linha, então o corpo real é o de duas e a tabela anunciava 8 faixas em
   * `kpi-alto` quando a espessura ali nasce em 11,55 px, abaixo do piso de 12. A altura de uma linha
   * continua publicada, porque nos canvases largos ela é alcançável e é o melhor caso verdadeiro.
   */
  const corpoDoPreset = (w, h) => {
    const g = grupoCard(w);
    if (!g) return null;
    const alturas = [...g.cabecalhos.keys()];
    const largura = w - 2 * g.recuo;
    const faixaDoLimiar = limiar?.faixas.find((f) => f.largura === largura) ?? null;
    return {
      largura,
      umaLinha: h - 2 * g.recuo - Math.min(...alturas) - VAO_DO_CABECALHO,
      duasLinhas: h - 2 * g.recuo - Math.max(...alturas) - VAO_DO_CABECALHO,
      umaLinhaAlcancavel: faixaDoLimiar === null ? true : faixaDoLimiar.cabem > 0,
    };
  };
  const passo = Object.entries(CANVAS_PRESETS)
    .map(([preset, { width, height }]) => {
      const corpo = corpoDoPreset(width, height);
      if (!corpo) return null;
      const uma = calcularPasso({ corpo: corpo.umaLinha, faixas: 8, piso: pisoEspessura });
      const duas = calcularPasso({ corpo: corpo.duasLinhas, faixas: 8, piso: pisoEspessura });
      return {
        preset,
        largura: width,
        altura: height,
        corpoLargura: corpo.largura,
        corpo: corpo.umaLinha,
        corpoDuas: corpo.duasLinhas,
        umaLinhaAlcancavel: corpo.umaLinhaAlcancavel,
        plano: uma.plano,
        planoDuas: duas.plano,
        faixasNoPiso: uma.faixasNoPiso,
        faixasNoPisoDuas: duas.faixasNoPiso,
        com8: uma.espessura,
        com8Duas: duas.espessura,
      };
    })
    .filter(Boolean);
  const exemploCorpo = corpoDoPreset(640, 360);
  const contaExemplo = exemploCorpo
    ? {
        corpo: exemploCorpo.umaLinha,
        plano: calcularPasso({ corpo: exemploCorpo.umaLinha, faixas: 8, piso: pisoEspessura }).plano,
        com8: calcularPasso({ corpo: exemploCorpo.umaLinha, faixas: 8, piso: pisoEspessura }).espessura,
        com14: calcularPasso({ corpo: exemploCorpo.umaLinha, faixas: 14, piso: pisoEspessura }).espessura,
        faixasNoPiso: calcularPasso({ corpo: exemploCorpo.umaLinha, faixas: 8, piso: pisoEspessura }).faixasNoPiso,
      }
    : { corpo: 0, plano: 0, com8: 0, com14: 0, faixasNoPiso: 0 };
  const num = (n) => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  // Razão de contraste sempre com duas casas: `1:1` e `2,6:1` na mesma tabela leem como grandezas
  // diferentes, e aqui a comparação entre linhas é o ponto.
  const raz = (n) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  // Largura de caractere: 3 casas em em e 2 em px. Casa a menos aqui esconde a diferença entre o 6,4
  // herdado e o medido, que é justamente o assunto.
  const em3 = (n) => n.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  // O QUE AS GUARDAS LEEM, E ONDE (F0.3). Três fatos da ferramenta que os produtores foram buscar fora do
  // dossiê, e que valem igual nas três formas da seção de guardas, então saem de uma função só: onde a
  // frase acessível vive no preview, os dois motivos de não medição da espessura e a caixa de tinta.
  // Cada bloco só entra quando a origem trouxe o trecho.
  const oQueAsGuardasLeem = () => {
    const B = [];
    if (carimboDaFrase) {
      B.push(
        '- **A frase acessível vive em `data-farol-ace`, no nó raiz do `preview.svg`:** o `aria-label` da tag ' +
          `\`<svg>\` raiz é o da moldura. De \`guardas.mjs:${carimboDaFrase.linha}\`, literal: “${carimboDaFrase.frase}”`,
      );
    }
    if (motivosDaEspessura) B.push(`- Do \`ARMADILHAS.md\` (Fluxo), literal: “${motivosDaEspessura}”`);
    const [onze, doze] = caixaDeTinta;
    B.push(
      '- **A caixa de tinta das guardas de texto**, pelas constantes de `colisao.mjs`: em ' +
        `${onze.tamanho} px, **${raz(onze.altura)} px** de altura (${raz(onze.acima)} acima e ${raz(onze.abaixo)} abaixo da linha de base); em ` +
        `${doze.tamanho} px, ${raz(doze.altura)} px. Com \`dominant-baseline="central"\`, a de ${onze.tamanho} px vai de ${raz(onze.centralAcima)} px ` +
        `acima da âncora a ${raz(onze.centralAbaixo)} px abaixo. É a altura que a \`GEO-19\` manda reservar contra a borda curva.`,
    );
    return ['### O que as guardas leem, e onde', '', ...B, ''];
  };

  // O TEXTO SOBRE MARCA TRANSLÚCIDA (F0.3): a matriz mede marca opaca e a tabela de opacidade mede a marca
  // contra o cartão. O par que faltava é o texto sobre a cor composta, e ele sai da mesma medição.
  const paragrafoDaComposta = () => {
    if (!textoSobreComposta?.linhas.length) return null;
    const exemplo = { texto: '--surface-raised', fundo: '--chart-1', alfa: 0.72 };
    const opaco = textoSobreComposta.razao(exemplo.texto, exemplo.fundo, 1, 'light');
    const composto = textoSobreComposta.razao(exemplo.texto, exemplo.fundo, exemplo.alfa, 'light');
    return (
      '**A matriz vale para marca OPACA.** Com `fillOpacity` o fundo do texto é a marca composta com o cartão, e o ' +
      'par aprovado cai' +
      (Number.isFinite(opaco) && Number.isFinite(composto)
        ? `: \`${exemplo.texto}\` sobre \`${exemplo.fundo}\` mede ${raz(opaco)}:1 opaco e **${raz(composto)}:1 a ${raz(exemplo.alfa)}** no claro`
        : '') +
      `. A opacidade mínima para o texto ficar em ${raz(textoSobreComposta.piso)}:1 (\`ACE-3\`) é **maior** que a da tabela de marca: ` +
      textoSobreComposta.linhas.map((l) => `\`${l.fundo}\` ${raz(l.minima)}`).join(' · ') +
      '.'
    );
  };

  // Agrupa por prefixo na ordem em que o prefixo aparece na origem, e ordena por código DENTRO do
  // grupo: a origem tem ROT-7, ROT-9, ROT-8 e ESP-2, ESP-6, ESP-3 porque código não é reatribuído, e
  // aqui é apresentação.
  const porPrefixo = (itens) => {
    const grupos = new Map();
    for (const i of itens) {
      if (!grupos.has(i.prefixo)) grupos.set(i.prefixo, []);
      grupos.get(i.prefixo).push(i);
    }
    for (const lista of grupos.values()) lista.sort((a, b) => compararCodigo(a.codigo, b.codigo));
    return grupos;
  };

  // Cada seção é montada na SUA lista de linhas, e a composição do papel escolhe quais entram. `L` é
  // sempre a parte aberta: trocar de seção é uma linha (`L = abrir(nome)`), e o texto de cada parte não
  // sabe em que papel vai sair. Todas as partes são montadas, inclusive as que o papel não leva: as
  // medições são memorizadas no processo e o custo é desprezível perto de duas montagens divergentes.
  const partes = new Map();
  const abrir = (nome) => {
    const linhas = [];
    partes.set(nome, linhas);
    return linhas;
  };
  const alvoDoModelo = `${familia.slug}/${modelo.slug}`;
  let L = abrir('cabecalho');
  L.push(`# Dossiê de ${papel === 'revisor' ? 'revisão' : 'produção'}: ${alvoDoModelo}`);
  L.push('');
  L.push('> ARQUIVO GERADO por `npm run dossie`, e por isso não se edita à mão: a próxima geração sobrescreve sem avisar, e regra corrigida aqui não vale nada, porque a régua continua sendo o `CONTRATO.md`. Corrija na origem e gere de novo.');
  L.push('');
  L.push('| Campo | Valor |');
  L.push('|---|---|');
  L.push(`| Família | \`${familia.slug}\` ${familia.nome ?? ''} |`);
  L.push(`| Modelo | \`${modelo.slug}\` ${modelo.nome ?? ''} |`);
  L.push(`| Abordagem | \`${abordagem}\` |`);
  L.push(`| Papel | \`${papel}\` |`);
  L.push(`| Gerado em | ${data} |`);
  L.push(`| Versões | ${produzidas.length} de ${disco.versoes.length} no disco |`);
  if (exemplo && entra('estrutural')) L.push(`| Molde a copiar | ${exemplo.caminho} (${exemplo.tecnica}) |`);
  L.push('');
  L.push(
    'Este dossiê existe para ser lido **em vez** de `CONTRATO.md`, `ARMADILHAS.md` e `PRODUCAO.md` ' +
      `na ${papel === 'revisor' ? 'revisão' : 'produção'} de uma versão deste modelo. Todo texto de regra abaixo é recorte literal da origem, ` +
      'nunca reescrita; onde o recorte é mais curto que o original, o dossiê diz por qual código abrir o corpo inteiro. ' +
      'Nada aqui autoriza o que o contrato proíbe. **Uma consulta continua obrigatória:** a saída de cada ' +
      'armadilha cujo sintoma bata com a sua peça, pelo código, no `ARMADILHAS.md`.',
  );
  L.push('');
  // O QUE FICOU FORA, e onde está. Papel enxuto sem endereço do que saiu manda o leitor procurar no
  // lugar errado; com endereço, o que saiu custa uma busca só para quem de fato precisa.
  if (papel !== 'completo') {
    const completoEm = `\`npm run dossie -- ${alvoDoModelo} --papel completo\`, que grava \`${familia.slug}__${modelo.slug}${sufixoDoPapel('completo')}.md\``;
    L.push(
      papel === 'revisor'
        ? '**O que este papel não traz:** a especificação estrutural, a moldura, a paleta, os formatadores, a ' +
            'superfície do Recharts, os comandos e as perguntas de antes de entregar, que são leitura de quem ' +
            `produz. Das guardas vem o resumo, sem o corpo. Tudo isso sai inteiro por ${completoEm}.`
        : '**O que este papel não traz, por tamanho:** da geometria da moldura, a altura de linha, a largura de ' +
            'caractere com a tabela por glifo e o serializador; da paleta, as rampas e os neutros contra o cartão e a ' +
            'razão entre marcas; das guardas, o corpo de cada uma e a fonte dos leitores `agregacao.mjs` e ' +
            '`formato.mjs`; dos formatadores, o corpo de `format.ts`; do Recharts, quantas peças importam cada nome. ' +
            `Nada disso foi apagado: sai inteiro por ${completoEm}, e ali se busca pelo título da seção.`,
    );
    L.push('');
  }
  L.push('---');
  L.push('');

  L = abrir('modelo');
  L.push('## O modelo');
  L.push('');
  L.push(`**${modelo.nome ?? modelo.slug}** (\`${abordagem}\`)`);
  L.push('');
  L.push(modelo.resumo ?? '(sem resumo no catálogo)');
  L.push('');
  L.push('### Quando usar');
  L.push('');
  L.push(listar(modelo.quando_usar) || '- (sem itens no catálogo)');
  L.push('');
  L.push('### Quando evitar');
  L.push('');
  L.push(listar(modelo.quando_evitar) || '- (sem itens no catálogo)');
  if (modelo.arquivo_estudo) {
    L.push('');
    L.push(`Estudo da família: \`${modelo.arquivo_estudo}\`.`);
  }
  L.push('');

  L = abrir('versoes');
  L.push('## As versões');
  L.push('');
  L.push(
    'As versões deste modelo já estão especificadas no catálogo: o produtor **implementa**, não ' +
      'inventa o que a versão é. O estado no disco é a existência de `Chart.tsx`.',
  );
  L.push('');
  if (produzidas.length) {
    L.push(`Irmãs já prontas, para copiar o padrão em vez de recomeçar: ${produzidas.map((v) => `\`${v.caminho}\``).join(', ')}.`);
    L.push('');
  }
  if (!disco.pastaExiste) {
    L.push(`A pasta \`${familia.slug}/${modelo.slug}/\` ainda não existe no disco; a primeira versão cria a pasta e o \`README.md\` do modelo.`);
    L.push('');
  }
  if (disco.extras.length) {
    L.push(`Pasta de versão no disco fora do catálogo: ${disco.extras.map((e) => `\`${e}\``).join(', ')}. Confira antes de criar mais uma.`);
    L.push('');
  }
  // COMO DECLARAR O CANVAS, uma vez e por recorte. O texto por versão dizia "canvas declarado por número",
  // que é só um dos três casos da `GEO-1` emendada, e quatro produtores bateram no aviso do `check` que
  // pede o nome do preset. A frase vem da armadilha; se ela sair de lá, sai daqui junto.
  if (comoDeclararCanvas) {
    L.push(`**Como declarar o canvas, da \`GEO-1\`, literal:** “${comoDeclararCanvas}”`);
    L.push('');
  }
  let colisoesNoModelo = 0;
  for (const v of disco.versoes) {
    L.push(`### \`${v.slug}\` — ${v.produzida ? 'PRODUZIDA' : 'A PRODUZIR'}`);
    L.push('');
    L.push(`**${v.titulo ?? '(sem título)'}**`);
    L.push('');
    L.push(`Caso de uso: ${v.caso_de_uso ?? '(sem caso de uso)'}`);
    L.push('');
    L.push('O que demonstra:');
    L.push('');
    L.push(listar(v.o_que_demonstra) || '- (sem requisitos no catálogo)');
    L.push('');
    // O canvas é CONSELHO: a GEO-1 mede que nenhum preset fecha o cartão depois que ele ganha linhas
    // escritas, e nas três versões do piloto o sugerido não serviu. A FORMA de declarar (nome do preset
    // ou número) não se escreve aqui: ela vem recortada da `GEO-1`, uma vez, antes das versões.
    L.push(
      `Canvas sugerido: \`${v.canvas_sugerido ?? '(não sugerido)'}\` · Caminho: \`${v.caminho}\`` +
        '\n\nO canvas sugerido é **conselho do catálogo, não especificação**: quem manda é a conta de ' +
        'linhas da `GEO-1`. Preset que não fecha o cartão se troca sem pedir licença.',
    );
    const colisoes = colisoesDaVersao(v);
    if (colisoes.length) {
      colisoesNoModelo += 1;
      L.push('');
      L.push(
        `**Confira antes de implementar:** o texto desta versão pede ${colisoes
          .map((c) => `"${c.trecho}" (${c.nota ? `\`${c.codigo}\`: ${c.nota}` : `contra a \`${c.codigo}\``})`)
          .join(' e ')}. É marca de busca de termo, não veredito: leia a regra citada e, se a especificação da versão ` +
          'e o contrato colidirem de fato, **o contrato vence** e o desvio se declara na nota do `meta.json`.',
      );
    }
    L.push('');
  }

  L = abrir('estrutural');
  L.push('---');
  L.push('');
  L.push('## A especificação estrutural');
  L.push('');
  L.push(
    `Recorte literal do \`CONTRATO.md\`: seções ${secoes.map((s) => s.num).join(', ')}. ` +
      `Fica fora ${SECOES_FORA.map((s) => `a ${s.num} (${s.motivo})`).join('; ')}.`,
  );
  const cortadas = secoes.filter((s) => s.removidas.length);
  if (cortadas.length) {
    L.push('');
    L.push(`Subseção removida por título: ${cortadas.map((s) => `§${s.num} "${s.removidas.join('", "')}"`).join('; ')}.`);
  }
  L.push('');
  for (const s of secoes) {
    L.push(`### CONTRATO §${s.titulo}`);
    L.push('');
    L.push(s.corpo);
    L.push('');
  }

  // --- A moldura, medida. Foi o item mais pedido pela produção, e os dois que deduziram erraram.
  // As duas tabelas saem de função porque a parte enxuta imprime as MESMAS linhas: duas cópias da
  // montagem de uma tabela divergem no primeiro ajuste, e aí o papel enxuto publicaria outro número.
  const CABECALHO_DA_TABELA_DA_MOLDURA = [
    '| Moldura | Largura do canvas | Recuo por lado | Cabeçalho medido | Desconto de largura | Desconto de altura |',
    '|---|---|---|---|---|---|',
  ];
  const linhaDaMoldura = (g) => {
    const alturas = [...g.cabecalhos].sort((a, b) => a[0] - b[0]);
    const desconto = alturas.map(([h]) => num(2 * g.recuo + h + VAO_DO_CABECALHO)).join(' ou ');
    return (
      `| \`${g.frame}\` | ${g.folgado ? '≥ 560 px' : '< 560 px'} | ${g.recuo} px | ` +
      `${alturas.map(([h, n]) => `${num(h)} px (${n} peça${n > 1 ? 's' : ''})`).join(' · ')} | ` +
      `**${2 * g.recuo} px** | **${desconto} px** |`
    );
  };
  const tabelaDoPasso = () => {
    const T = [
      `| Canvas (moldura \`card\`) | Corpo, cabeçalho de 1 linha | Corpo, 2 linhas | Faixas com espessura ≥ ${pisoEspessura} px (1 / 2 linhas) | Espessura com 8 faixas (1 / 2 linhas) |`,
      '|---|---|---|---|---|',
    ];
    for (const p of passo) {
      const comPiso = (v) => `${raz(v)} px${v < pisoEspessura ? ' (abaixo do piso)' : ''}`;
      const corpoUma = p.umaLinhaAlcancavel ? `${raz(p.corpoLargura)} × ${raz(p.corpo)}` : '**inalcançável**';
      const faixas = p.umaLinhaAlcancavel
        ? `**${p.faixasNoPiso}** / **${p.faixasNoPisoDuas}**`
        : `— / **${p.faixasNoPisoDuas}**`;
      const esp = p.umaLinhaAlcancavel ? `${comPiso(p.com8)} / ${comPiso(p.com8Duas)}` : `— / ${comPiso(p.com8Duas)}`;
      T.push(
        `| \`${p.preset}\` ${p.largura}x${p.altura} | ${corpoUma} | ${raz(p.corpoLargura)} × ${raz(p.corpoDuas)} | ${faixas} | ${esp} |`,
      );
    }
    return T;
  };
  L = abrir('moldura');
  L.push('---');
  L.push('');
  L.push('## A geometria da moldura, medida');
  L.push('');
  L.push(
    'A moldura é da ferramenta, nunca do `Chart.tsx`, e ela **come parte do canvas**: o que sobra é o ' +
      'corpo, onde o seu visual desenha. A `GEO-1` manda escrever a conta antes de escolher o canvas, ' +
      'e é esta a conta. Os números abaixo são medidos nos previews já gravados, não deduzidos: o recuo é o ' +
      `\`x\` da ilha do cabeçalho e o cabeçalho é a altura dela (${moldura.medidos} de ${moldura.previews} previews do catálogo).`,
  );
  L.push('');
  L.push('```');
  L.push('corpo_largura = canvas_largura − 2 × recuo');
  L.push(`corpo_altura  = canvas_altura  − 2 × recuo − cabeçalho − ${VAO_DO_CABECALHO}   (o ${VAO_DO_CABECALHO} é o vão entre cabeçalho e corpo)`);
  L.push('```');
  L.push('');
  if (moldura.grupos.length) {
    L.push(...CABECALHO_DA_TABELA_DA_MOLDURA);
    for (const g of moldura.grupos) L.push(linhaDaMoldura(g));
    L.push('');
  }
  L.push(
    '**O cabeçalho tem duas alturas, e é isso que não dá para adivinhar:** o caso de uso do `meta.json` ' +
      'quebra em até duas linhas (`line-clamp-2`), e a segunda linha custa 16,5 px de corpo. Caso de uso ' +
      'longo encolhe o seu desenho. O título é uma linha só, sempre, porque ele trunca.',
  );
  L.push('');
  if (limiar) {
    L.push('#### Quantos caracteres cabem numa linha do cabeçalho');
    L.push('');
    L.push(
      `Esta é a conta que decide **qual das duas alturas** usar, e ela junta as duas metades que o dossiê já ` +
        `publicava. A caixa do caso de uso é a MESMA do corpo, conferido nos ${moldura.medidos} previews medidos ` +
        `(${moldura.larguraDivergente} com largura divergente), então a largura útil é \`canvas − 2 × recuo\`. ` +
        `O texto é Manrope de ${limiar.tamanho} px, e a medida sai do corpus real: os ${limiar.corpus} casos de uso do ` +
        'catálogo, medidos um a um pela mesma função da `COLISAO-TEXTO`.',
    );
    L.push('');
    L.push('| Largura do cabeçalho | Uma linha garantida | Fronteira | Duas linhas |');
    L.push('|---|---|---|---|');
    for (const f of limiar.faixas) {
      const temFronteira = f.maiorQueCabe !== null && f.seguro !== null && f.maiorQueCabe > f.seguro;
      const seguro = f.cabem === 0 ? 'nenhum caso de uso real cabe' : `até **${f.seguro}** caracteres`;
      const fronteira = f.cabem === 0 ? '—' : temFronteira ? `${f.seguro + 1} a ${f.maiorQueCabe}` : 'não observada no corpus';
      const duas = f.cabem === 0 ? 'sempre' : `${(temFronteira ? f.maiorQueCabe : f.seguro) + 1} ou mais`;
      L.push(`| ${f.largura} px | ${seguro} | ${fronteira} | ${duas} |`);
    }
    L.push('');
    L.push(
      '**A fronteira não é detalhe: é onde a composição do texto decide.** Duas frases do mesmo tamanho em ' +
        'caracteres ocupam larguras diferentes, porque o espaço avança 0,216 em e a maiúscula 0,616. Caso de uso ' +
        'na fronteira é frágil: qualquer emenda no texto muda a altura do cabeçalho e desloca o desenho inteiro, ' +
        `e é exatamente assim que uma v4 se perdeu nesta frente. Escreva abaixo do limite seguro e o canvas para de ` +
        'depender da revisão de texto.',
    );
    L.push('');
    L.push(
      `**Por que não uma regra de três:** o avanço médio no corpus é ${raz(limiar.avancoMedio)} px por caractere, ` +
        `então dividir 574 por ele daria ${Math.round(574 / limiar.avancoMedio)} caracteres, que cai **dentro da faixa de ` +
        'fronteira** e é justamente o número que engana. A média serve para estimar, não para decidir; as três faixas ' +
        'decidem.',
    );
    L.push('');
    L.push(
      'Nos canvases estreitos (`kpi` e `kpi-alto`, 302 px de cabeçalho) **nenhum** dos 814 casos de uso do catálogo ' +
        'cabe em uma linha: ali conte com duas, sempre, e some os 16,5 px no desconto.',
    );
    L.push('');
  }
  L.push(
    'Nota de concordância: a §13 do contrato **já traz o par certo** para o canvas `card` de 640x360, ' +
      '**574 x 241,5 px** com o caso de uso em uma linha e **574 x 225 px** em duas, e a medição desta geração ' +
      'confirma os dois. Os "cerca de 574 x 234 px" da redação antiga eram média de duas situações que não se ' +
      'misturam, e saíram do contrato. Esta nota existia aqui cobrando aquela emenda **depois** de ela ter sido ' +
      'feita, e assim quatro produtores leram no dossiê que o contrato estava errado quando ele já estava certo: ' +
      'pendência escrita se confere contra o estado atual da regra que ela invoca, não contra a lembrança dela.',
  );
  L.push('');
  // Do canvas ao passo: a tabela acima dá o corpo, e é o passo que decide o piso de espessura.
  // A ALTURA DE LINHA do corpo: o numero que a conta de linhas da GEO-1 exige e que faltava.
  const alturaDeLinha = medirAlturaDeLinha();
  if (alturaDeLinha.linhas.length) {
    L.push('### A altura de linha do corpo, que é o que a conta de linhas da GEO-1 pede');
    L.push('');
    L.push(
      `Medida nas declarações de estilo das ilhas de HTML dos ${alturaDeLinha.previews} previews do acervo: ` +
        `${alturaDeLinha.total} pares de \`font-size\` com \`line-height\`, dos quais os ${alturaDeLinha.linhas.length} ` +
        'com 20 ocorrências ou mais estão abaixo. **A altura não é função do tamanho:** a 11 px ela vai de 11 a ' +
        '16,5 px conforme a classe de `leading`, isto é **50% de diferença**, e a 12 px vai de 15 a 20. Então a ' +
        'conta de linhas escritas precisa do **par**, nunca do tamanho sozinho, e é por isso que esta tabela ' +
        'existe: dois produtores, em rodadas diferentes, tiveram de derivá-la do Tailwind e conferir medindo as ' +
        'ilhas do próprio preview.',
    );
    L.push('');
    L.push('| Tamanho | Altura de linha | Fator | Ocorrências no acervo |');
    L.push('|---|---|---|---|');
    for (const l of alturaDeLinha.linhas) {
      L.push(`| ${raz(l.tamanho)} px | ${raz(l.altura)} px | ${em3(l.razao)} | ${l.vezes} |`);
    }
    L.push('');
    L.push(
      '**Os dois pares dominantes são o corpo do catálogo:** 12 px com 16 px, que é o `text-xs` com o padrão do ' +
        'Tailwind, e 11 px com 16,5 px, que é o `text-[0.6875rem]` sem classe de `leading`. Os 15 px com 22,5 px ' +
        'são o `<svg>` do Recharts, que declara o próprio tamanho e não é texto seu. Quando você quer linha justa ' +
        'em 11 px, `leading-4` entrega **16 px** e aparece 302 vezes no acervo; abaixo disso a linha começa a ' +
        'apertar a tinta, e o par 11 com 11 px, que aparece 82 vezes, só serve para texto de uma linha.',
    );
    L.push('');
  }
  L.push('### Do canvas ao passo, e do passo ao piso de espessura');
  L.push('');
  L.push(
    'A tabela acima entrega o **corpo**; o que decide se a barra ou a faixa nasce abaixo do piso é o **passo**, ' +
      `que é o plano dividido pelo número de faixas. O piso é o \`ESP_PISO_GERAL = ${pisoEspessura}\` da \`ESPESSURA-MARCA\`. ` +
      'A conta fecha o circuito: do canvas ao corpo pela tabela, do corpo ao passo pelas faixas e pelos vãos, e ' +
      'do passo ao veredito pelo piso. Ela se faz **antes** de renderizar, porque a correção é canvas maior, ' +
      'que é mudança de `meta.json`, e não de código.',
  );
  L.push('');
  L.push('```');
  L.push(`plano     = corpo_altura − 2 × ${RECHARTS_MARGEM} (margem do Recharts) − ${RECHARTS_ALTURA_EIXO_X} (altura do XAxis)`);
  L.push('banda     = plano / faixas');
  L.push(`espessura = (banda − 2 × ${RECHARTS_GAP_CATEGORIA * 100}% da banda − (series − 1) × 4) / series`);
  L.push(`veredito  = espessura ≥ ${pisoEspessura} px`);
  L.push('```');
  L.push('');
  L.push(
    `**O vão da categoria entra DUAS vezes, uma de cada lado:** com o \`barCategoryGap\` padrão de ` +
      `${RECHARTS_GAP_CATEGORIA * 100}% a barra fica com ${(1 - 2 * RECHARTS_GAP_CATEGORIA) * 100}% da banda, não com ${(1 - RECHARTS_GAP_CATEGORIA) * 100}%. ` +
      'É o erro de conta mais fácil de cometer aqui, e ele dá 12% de espessura a mais no papel do que no desenho.',
  );
  L.push('');
  if (passo.length) {
    L.push(...tabelaDoPasso());
    L.push('');
    L.push(
      '**Como ler as duas colunas.** O cabeçalho tem duas alturas e a diferença é de 16,5 px de corpo, o que ' +
        'tira faixa do teto. Onde a coluna de uma linha diz **inalcançável**, a caixa do caso de uso é tão ' +
        'estreita que nenhum dos casos de uso do catálogo cabe em uma linha, medido no corpus inteiro: ali só a ' +
        'coluna de duas linhas existe. Foi por publicar apenas a outra que esta tabela prometeu, até 2026-09-29, ' +
        '8 faixas em `kpi-alto`, onde a espessura nasce abaixo do piso. Nos canvases largos as duas alturas são ' +
        'possíveis, e quem decide é a contagem de caracteres do seu caso de uso na tabela de fronteira acima.',
    );
    L.push('');
  }
  L.push(
    `**Exemplo trabalhado**, canvas \`card\` de 640x360 na moldura \`card\`, uma série: o corpo mede 574 × ${raz(contaExemplo.corpo)} px; ` +
      `o plano fica com ${raz(contaExemplo.corpo)} − 10 − 30 = ${raz(contaExemplo.plano)} px; com 8 faixas a banda é ${raz(contaExemplo.plano / 8)} px e a ` +
      `espessura ${raz(contaExemplo.com8)} px, **acima** do piso; com 14 faixas a banda cai para ${raz(contaExemplo.plano / 14)} px e a espessura para ` +
      `${raz(contaExemplo.com14)} px, **abaixo** do piso de ${pisoEspessura}. O teto deste canvas é ${contaExemplo.faixasNoPiso} faixas; a partir dali ` +
      'o caminho é canvas mais alto (`alto`, 640x560) ou outra forma, não barra mais fina. Caso de uso em duas ' +
      'linhas rouba 16,5 px do corpo e pode tirar uma faixa do teto.',
  );
  L.push('');

  // A largura de caractere, para quem calcula posição de rótulo por conta própria.
  L.push('### A largura de caractere, para quem calcula posição de rótulo');
  L.push('');
  L.push(
    '**Leia primeiro, porque três produtores já caíram nisto:** a tabela de MÉDIA por classe, abaixo, erra de ' +
      '**8% a 26% em string real**, e erra **para baixo**, que é o lado que esconde colisão. Três medições ' +
      'independentes: `dom` a 11 px orçado em 17,4 px mediu 22; `Campanha congelada` orçado em 101,8 px passou de ' +
      '110 e quebrou em duas linhas; `42 agendas` errou 9%. A média descreve a **classe** e não a **composição**, e ' +
      'nenhuma string real é feita da classe média. **Use a soma por glifo** da tabela completa que vem depois ' +
      'desta, que é a mesma que a `COLISAO-TEXTO` usa, e acrescente 2 px por linha (o p99 do erro dela).',
  );
  L.push('');
  L.push(
    '**E o dígito tabular, medido em 2026-09-29:** o Farol escreve número com `tabular-nums`, e sob tabular ' +
      '**todo dígito mede 0,620 em**, igual para os dez, igual em Manrope e em Space Grotesk, igual nos pesos 400 a ' +
      '700 e nos tamanhos de 11 a 30 px. As tabelas por glifo são **proporcionais**, então elas erram em qualquer ' +
      'número tabular: `111` a 14 px mede 26,05 px e a soma proporcional dava 18,23, **30% a menos**; `000` mede os ' +
      'mesmos 26,05 e a soma dava 27,05, 3,8% a mais. Se o seu rótulo é número com `tnum`, conte **0,620 em por ' +
      'dígito** e a tabela só para o resto da string. Sem `tnum` a tabela é quase exata, com erro medido de 0,1% a ' +
      '0,5%. Controle da medição: família inexistente devolve 0,5000 em, e as duas famílias reais divergem sem ' +
      'tabular (0,5895 e 0,5614), o que prova que as fontes carregaram.',
  );
  L.push('');
  L.push(
    `A média por classe, medida nesta geração pela mesma função que a \`COLISAO-TEXTO\` usa, a ${largura.tamanho} px, ` +
      'em em e em px, e que serve para **orçar**, nunca para decidir:',
  );
  L.push('');
  L.push(`| Família | Papel | Dígitos | Maiúsculas | Minúsculas |`);
  L.push('|---|---|---|---|---|');
  for (const f of largura.medidas) {
    const cel = (nome) => {
      const c = f.classes.find((x) => x.nome === nome);
      return `${em3(c.em)} em · ${raz(c.px)} px`;
    };
    L.push(`| \`${f.nome}\` | ${f.papel} | ${cel('dígitos')} | ${cel('maiúsculas')} | ${cel('minúsculas')} |`);
  }
  L.push('');
  L.push(`Caractere fora da tabela cai em \`LARGURA_PADRAO\` = ${em3(largura.padrao.em)} em, ou ${raz(largura.padrao.px)} px a ${largura.tamanho} px.`);
  L.push('');
  // A TABELA POR GLIFO, INTEIRA. Dois produtores, no mesmo dia e de forma independente, escreveram que o
  // dossiê cita a tabela por glifo como fonte de verdade e NÃO a traz, obrigando a decidir pela média que
  // ele mesmo desautoriza. São 120 entradas e menos de 2 KB; não havia razão para ela ficar fora.
  L.push('#### A tabela por glifo, que é a régua de decidir');
  L.push('');
  L.push(
    'Avanço em em, por caractere, nas duas famílias. É a tabela que a `COLISAO-TEXTO` usa, ajustada contra o ' +
      'motor de fonte do navegador sobre as 1.347 linhas do acervo. **Dígito com `tabular-nums` não sai daqui:** ' +
      'sob tabular todo dígito vale 0,620 em, como está dito acima. Caractere que falta no Grotesk cai no valor do ' +
      'Manrope, e o que falta nos dois cai no padrão. O ajuste é **por palavra**, então um caractere que só ' +
      'aparece dentro de uma palavra fixa fica mal determinado sozinho, ainda que a soma da linha esteja certa: no ' +
      'Grotesk, `m`, `i` e `l` quase só aparecem em "mil", e os três só fazem sentido somados.',
  );
  L.push('');
  for (const [nomeDaFamilia, tabela] of Object.entries(TABELAS_DE_GLIFO)) {
    const entradas = Object.entries(tabela).map(([c, v]) => `\`${c === ' ' ? 'espaço' : c}\` ${em3(v)}`);
    L.push(`**${nomeDaFamilia === 'grotesk' ? 'Space Grotesk' : 'Manrope'}** (${entradas.length} glifos)`);
    L.push('');
    L.push(entradas.join(' · '));
    L.push('');
  }
  L.push(
    '> **A MÉDIA É PARA ORÇAR; A SOMA POR GLIFO É PARA DECIDIR.** A média por classe descreve o caractere ' +
      'isolado e **não descreve string real**, porque uma frase mistura as classes em proporção que a média não ' +
      'conhece: o espaço avança 0,216 em e a maiúscula 0,616. Duas medições de produção provam o tamanho do erro: ' +
      `\`42 agendas\` a ${largura.tamanho} px em Space Grotesk foi orçado em 57,0 px pela média e o render mediu ` +
      `**62,6 px** (9% baixo), enquanto a soma por glifo dá ${raz(larguraDoTexto('42 agendas', largura.tamanho, 'grotesk'))} px, ` +
      'que erra 1,2% para baixo; e um rótulo de moeda negativa orçado em 66 px precisou de **80 px** de largura de ' +
      'eixo. Antes de decidir posição ou reservar largura, **some os glifos da string** pela tabela de `colisao.mjs`.',
  );
  L.push('');
  L.push('Soma por glifo de strings típicas do catálogo, para copiar em vez de recontar:');
  L.push('');
  L.push(`| String | Space Grotesk | Manrope | Pela média (${num(6.4)} px × n) |`);
  L.push('|---|---|---|---|');
  // O negativo sai como a biblioteca o devolve desde o F0.5b: U+2212 ANTES do símbolo. `R$ −200 mil`,
  // que esta tabela trazia, não sai mais de formatador nenhum; a soma por glifo é a mesma, a string não.
  for (const exemploTexto of [TIQUE_NEGATIVO, 'R$ 401,3 mil', 'R$ 1,2 mi', '42 agendas', '13,1%', '+8,4 p.p.', 'Bianca R.', 'ago/26']) {
    L.push(
      `| \`${exemploTexto}\` | ${raz(larguraDoTexto(exemploTexto, largura.tamanho, 'grotesk'))} px | ` +
        `${raz(larguraDoTexto(exemploTexto, largura.tamanho, 'manrope'))} px | ${raz([...exemploTexto].length * 6.4)} px |`,
    );
  }
  L.push('');
  L.push(
    '**A folga a acrescentar é pequena, e ela é medida, não chutada:** a tabela foi ajustada por mínimos quadrados ' +
      'contra o motor de fonte do navegador sobre 1.347 linhas do acervo, e o erro por linha inteira tem p99 de ' +
      '**+0,53 px** em Space Grotesk e **+1,24 px** em Manrope, com pior caso de −3,84 px numa linha de prosa. ' +
      'Então **+2 px por linha cobrem o p99 das duas famílias**, e não há folga percentual a aplicar: o erro de 9% e ' +
      'de 21% das duas medições **é da média, não da soma**. Esta é a informação melhor, e é o contrário do que a ' +
      'primeira redação desta seção sugeria.',
  );
  L.push('');
  // O QUE O F0.5c MEDIU (2026-10-02), e por que este parágrafo mudou. A redação anterior explicava os 18 px
  // pela soma do `tickSize` de 6 com o `tickMargin` de 8, lida em `CartesianAxis.js`. A bancada do F0.5c
  // mediu o eixo de 1 em 1 px e não confirmou: a sobrecarga não é constante, e quem decide a quebra é o
  // `<Text>`, que mede palavra por palavra fora do eixo. Os limiares saem da tabela da emenda da `EIX-6`,
  // por extração; sem a tabela, o parágrafo aponta para a regra e não escreve número nenhum de memória.
  const limiares = extrairLimiaresDoTique(contrato);
  const limiarPositivo = limiares.get(TIQUE_POSITIVO);
  const limiarNegativo = limiares.get(TIQUE_NEGATIVO);
  const tintaDoNegativo = larguraDoTexto(TIQUE_NEGATIVO, largura.tamanho, 'grotesk', 0, true);
  L.push(
    `**Largura de eixo é outro cálculo, e a sobrecarga é de cerca de 18 px, não de 8.** Quem manda aqui é a \`EIX-6\`, ` +
      'cujo corpo se abre pelo código no `CONTRATO.md`, e ela é explícita: **some a tinta glifo a glifo e acrescente 18 px**. ' +
      'Somar só o `tickMargin` de 8 é o erro que as redações anteriores da regra cometiam, e ele prevê eixo que ' +
      '**quebra o tique em duas linhas** sem que nenhuma guarda acuse, porque o texto continua dentro do corpo. ' +
      '**A sobrecarga não é constante, e o motivo foi medido em 2026-10-02** (emenda da `EIX-6`, conferida em ' +
      '`recharts/es6/component/Text.js`, função `calculate`): o `<Text>` do Recharts não mede a tinta a 11 px. Ele ' +
      'mede cada palavra num vão solto no `body`, no tamanho do corpo da página e, no primeiro desenho, na fonte de ' +
      'reserva, e só deixa o tique em uma linha enquanto a soma das palavras, com um espaço por vão, fica abaixo da ' +
      'largura do eixo. Por isso a sobrecarga cresce com o texto' +
      (limiarPositivo && limiarNegativo
        ? `: na tabela da emenda, \`${TIQUE_POSITIVO}\` fica em uma linha a partir de ${limiarPositivo.eixo} px de eixo ` +
          `(${limiarPositivo.sobrecarga} px sobre a tinta) e \`${TIQUE_NEGATIVO}\` só a partir de ${limiarNegativo.eixo} px ` +
          `(${limiarNegativo.sobrecarga} px), no tique padrão em Manrope`
        : ', e os limiares medidos estão na tabela da emenda') +
      '. A redação anterior deste parágrafo explicava os 18 px pela soma do `tickSize` com o `tickMargin`, e a ' +
      'medição não confirmou essa conta. **Em tique negativo o `+18` subestima**, e ali a largura se confere no ' +
      '`preview.svg`, que é o que a `REC-2` já manda. ' +
      `\`${TIQUE_NEGATIVO}\` soma ${raz(tintaDoNegativo)} px de tinta em Space Grotesk, com dígito ` +
      `tabular, e já pela conta de +18 pede ${raz(tintaDoNegativo + 18)} px de eixo, acima do teto de 64. ` +
      'Em outras palavras, **teto de 64 px de eixo significa tinta de no máximo 46 px**, e é esse o número a ' +
      'conferir na tabela por glifo.',
  );
  L.push('');
  L.push(
    '**TENSÃO DECLARADA, e ela é nova de 2026-09-29: com a conta de 18 px e o dígito tabular, nenhum tique de ' +
      'moeda com a unidade escrita cabe no teto de 64 px.** Medido a 11 px em Space Grotesk, com dígito tabular, ' +
      `o mais estreito da família é \`R$ 1,7 mi\` com ${raz(larguraDoTexto('R$ 1,7 mi', largura.tamanho, 'grotesk', 0, true))} px de tinta, ` +
      `que pede ${raz(larguraDoTexto('R$ 1,7 mi', largura.tamanho, 'grotesk', 0, true) + 18)} px; ` +
      `\`${TIQUE_POSITIVO}\` pede ${raz(larguraDoTexto(TIQUE_POSITIVO, largura.tamanho, 'grotesk', 0, true) + 18)} px e ` +
      `\`${TIQUE_NEGATIVO}\` pede ${raz(tintaDoNegativo + 18)} px. ` +
      (limiarPositivo && limiarNegativo
        ? `**A conta é a do \`+18\` em Space Grotesk; a medição de 2026-10-02 no tique padrão, em Manrope, deu ${limiarPositivo.eixo} px ` +
          `para \`${TIQUE_POSITIVO}\` e ${limiarNegativo.eixo} px para \`${TIQUE_NEGATIVO}\`**, e a emenda da \`EIX-6\` diz o que isso muda: ` +
          'o negativo de milhar fica acima do teto com qualquer unidade. '
        : '') +
      'A `EIX-6` manda as duas coisas ao mesmo tempo, tique por `formatCurrencyAxis` **com a unidade no próprio ' +
      'tique** e largura entre 48 e 64, e depois da correção do dígito tabular as duas não fecham juntas: a ' +
      '`REC-2`, que manda encurtar o rótulo, não tem o que encurtar em `R$ 1,7 mi`. **Isto é decisão do dono do ' +
      'catálogo e está registrada como tal**, não escolha sua. Enquanto ela não sai: declare a largura que a sua ' +
      'conta pediu, escreva a conta no `notes` e cite esta tensão, que é o procedimento da `14.1` para desvio ' +
      'medido. Não invente formato de tique novo, e não afine o rótulo abaixo de 11 px.',
  );
  L.push('');
  // Quanto o `6.4 × n` erra numa string de verdade: positivo quer dizer ALTO, e alto esconde rótulo.
  const erroDoSeisQuatro = (texto) => (([...texto].length * 6.4) / larguraDoTexto(texto, largura.tamanho, 'grotesk') - 1) * 100;
  L.push(
    `**Sobre o \`6.4\` que sete peças do catálogo carregam em \`LABEL_CHAR_WIDTH\`:** ele é herdado, não medido. ` +
      `A ${largura.tamanho} px, 6,4 px equivalem a ${em3(6.4 / largura.tamanho)} em, contra os ` +
      `${em3(largura.medidas[0].classes[0].em)} em medidos para dígito em Space Grotesk, que é a fonte do número: ` +
      `uma subestimativa de ${num(Number(((1 - 6.4 / largura.tamanho / largura.medidas[0].classes[0].em) * 100).toFixed(1)))}% ` +
      'no dígito **isolado**, e foi por isso que a primeira redação desta seção o chamou de "lado seguro". ' +
      '**Medido em string real ele erra para o outro lado**, porque a string tem espaço e glifo estreito: ' +
      `\`42 agendas\` sai ${num(Number(erroDoSeisQuatro('42 agendas').toFixed(1)))}% ALTO, \`${TIQUE_NEGATIVO}\` ` +
      `${num(Number(erroDoSeisQuatro(TIQUE_NEGATIVO).toFixed(1)))}% alto e \`R$ 401,3 mil\` ` +
      `${num(Number(erroDoSeisQuatro('R$ 401,3 mil').toFixed(1)))}% alto. Superestimar é o lado que **esconde o rótulo**, e ` +
      'nenhuma guarda pega informação que não foi desenhada. Ou seja: `6.4 × n` não é conservador, é impreciso nos dois ' +
      'sentidos, e a saída não é outra constante; é a soma por glifo.',
  );
  L.push('');
  L.push(
    `**Um valor único para as duas famílias erra por cerca de 11%:** uma v1 do acervo carrega \`CHAR_WIDTH = 6.3\` ` +
      `para Manrope e Space Grotesk juntas, e a ${largura.tamanho} px isso é ${em3(6.3 / largura.tamanho)} em, contra ` +
      `${em3(largura.medidas[0].classes[0].em)} em do dígito em Grotesk. Número é Grotesk, nome de categoria é Manrope; ` +
      'uma constante só para as duas mede errado em uma das duas, sempre.',
  );
  L.push('');
  L.push(
    '**A direção segura do arredondamento se inverte por modelo, e o critério é um só: arredonde para o lado cuja ' +
      'consequência alguma guarda pega.** No caso geral, subestimar é seguro, porque a peça desenha o rótulo e a ' +
      '`COLISAO-TEXTO` acusa o encontro de tinta no render. **Num treemap é o contrário:** o rótulo que transborda invade ' +
      'a célula vizinha, e nenhuma guarda pega invasão entre células, então ali **superestimar** é o lado seguro e ' +
      'esconder o rótulo é o desfecho aceitável. **Em largura de eixo e em margem, superestime também:** o render ' +
      'acusa `Conteudo passa da area do corpo`, mas só depois de a rodada inteira ter sido gasta, e a correção é ' +
      'mudar a unidade do rótulo, que é retrabalho de dado e não de layout. Antes de escolher o lado, pergunte qual ' +
      'guarda pegaria o erro **e quando**: é isso que decide, não a estética do número.',
  );
  L.push('');
  L.push(
    'Cuidado declarado na origem: o ajuste da tabela é **por palavra, não por letra**, então letra que só aparece dentro ' +
      'de uma palavra fixa fica mal determinada sozinha (no Grotesk, `m`, `i` e `l` quase só aparecem em "mil", e o `i` ' +
      'não mede mesmo 0,520 em). A soma da linha está certa; o glifo isolado, nem sempre.',
  );
  L.push('');
  const serializador = extrairSerializador();
  if (serializador) {
    L.push('### O que o serializador grava, e o que ele omite');
    L.push('');
    L.push(
      'O `preview.svg` não é uma foto: é o DOM reescrito como SVG autônomo, por uma regra de decomposição ' +
        'com lista explícita de propriedades. Ela está abaixo, como está no código do serializador.',
    );
    L.push('');
    L.push(serializador);
    L.push('');
    L.push(
      '**A consequência prática que já inverteu um destaque:** propriedade herdada sai por **diferença contra o pai**, ' +
        'então `color` igual à do pai **não é gravada**, e na ilha do SVG o pai não é o mesmo do DOM. O item ' +
        'selecionado de uma lista, escrito com a mesma cor que o contêiner, chegou ao preview mais apagado que ' +
        'os não selecionados no tema escuro; a leitura se inverteu sem ninguém tocar no código. Quem depende de ' +
        'cor de texto para destacar declara a cor **no próprio elemento** e confere no PNG dos dois temas. ' +
        'A §13, acima, lista o que não sai de jeito nenhum (pseudo-elemento, `transform` em HTML, hover, animação).',
    );
    L.push('');
  }

  // --- A paleta: lacuna declarada, medida na geração contra os tokens do Farol.
  // As duas tabelas que a parte enxuta guarda saem de função, pelo mesmo motivo das da moldura.
  const semPrefixo = (t) => t.replace(/^--/, '');
  const tabelaDeOpacidade = () => {
    const T = ['| Cor | Opacidade mínima | Tema que reprova primeiro | Opaca: escuro / claro |', '|---|---|---|---|'];
    for (const l of opacidade.linhas) {
      T.push(
        `| \`${l.token}\` | ${l.minima === null ? '**nenhuma**' : raz(l.minima)} | ${l.temaQueReprova ?? '—'} | ` +
          `${raz(l.opacoEscuro)}:1 / ${raz(l.opacoClaro)}:1 |`,
      );
    }
    return T;
  };
  const tabelaDeTextoSobreMarca = () => {
    const T = [
      `| Preenchimento | ${textoSobreMarca.textos.map((t) => `\`${semPrefixo(t)}\``).join(' | ')} | Aprovados |`,
      `|---|${textoSobreMarca.textos.map(() => '---').join('|')}|---|`,
    ];
    for (const l of textoSobreMarca.linhas) {
      const celulas = l.celulas.map((c) => (c.passa ? `**${raz(c.pior)}**` : raz(c.pior)));
      T.push(
        `| \`${l.fundo}\` | ${celulas.join(' | ')} | ` +
          `${l.aprovados.length ? l.aprovados.map((t) => `\`${semPrefixo(t)}\``).join(', ') : '**nenhum**'} |`,
      );
    }
    return T;
  };
  L = abrir('paleta');
  if (paleta) {
    L.push('---');
    L.push('');
    L.push('## As lacunas medidas da paleta');
    L.push('');
    L.push(
      'Medido nesta geração contra `app/src/styles/tokens.css`, pela fórmula da WCAG que as guardas usam. ' +
        'Não é opinião de desenho: é o que os tokens do Farol **não alcançam**, e saber disto antes de desenhar ' +
        'evita a peça que só reprova no fim.',
    );
    L.push('');
    for (const g of paleta.grupos) {
      L.push(`### ${g.titulo}`);
      L.push('');
      L.push(`Piso de ${raz(g.piso)}:1 para ${g.papel}.`);
      L.push('');
      L.push('| Token | Escuro | Claro | Passa nos dois? |');
      L.push('|---|---|---|---|');
      for (const m of g.medidas) {
        const passa = m.escuro !== null && m.claro !== null && m.escuro >= g.piso && m.claro >= g.piso;
        L.push(`| \`${m.token}\` | ${m.escuro === null ? '(não lido)' : `${raz(m.escuro)}:1`} | ${m.claro === null ? '(não lido)' : `${raz(m.claro)}:1`} | ${passa ? 'sim' : '**não**'} |`);
      }
      L.push('');
    }
    const seq = paleta.grupos[0]?.medidas ?? [];
    const passamSeq = seq.filter((m) => m.escuro >= 3 && m.claro >= 3).map((m) => `\`${m.token}\``);
    L.push(
      `**A conclusão, e ela é de decisão:** da rampa sequencial só ${passamSeq.join(', ')} passam de 3:1 nos dois temas, ` +
        'então **não existe rampa ordinal de quatro degraus nos tokens do Farol acima do piso**. O motivo é que as ' +
        'cores de papel invertem de luminância entre os temas, e o que passa no escuro reprova no claro.',
    );
    L.push('');
    L.push(
      '**O índice do array não é o número do token, e a diferença de um pinta a rampa errada.** ' +
        '`CHART_SEQUENTIAL_COLORS` do `chartTheme.ts` é um array de 7 posições e a posição `i` vale ' +
        '`--seq-(i+1)`: `CHART_SEQUENTIAL_COLORS[0]` é `--seq-1` e `[6]` é `--seq-7`. Toda tabela deste dossiê ' +
        'nomeia o **token**, com a numeração de 1 a 7; quem indexa o array direto pelo grau lido na tabela ' +
        'pinta um degrau abaixo do que mediu, e a peça fica com contraste que ninguém conferiu. Um produtor ' +
        'levantou isso em 2026-09-29 depois de ir conferir no `chartTheme.ts`.',
    );
    if (paleta.melhorSobreSeq4?.escuro) {
      L.push('');
      L.push(
        `Escrever o valor dentro do bloco **não salva a rampa**: o melhor par de texto sobre \`--seq-4\` mede ` +
          `${raz(paleta.melhorSobreSeq4.escuro.razao)}:1 no escuro (\`${paleta.melhorSobreSeq4.escuro.texto}\`), abaixo do piso de texto de ` +
          `${raz(paleta.pisoDeTexto)}:1 da ACE-3; no claro o mesmo par mede ${raz(paleta.melhorSobreSeq4.claro.razao)}:1. ` +
          'A isenção da 1.4.11 vale para a marca, não para a legibilidade do número que se escreve nela.',
      );
    }
    L.push('');
    L.push(
      'Nos neutros a lacuna é a mesma, por outro caminho: **nenhum neutro do Farol alcança 3:1 contra o cartão**, ' +
        'o que atinge trilho de progresso, poço, moldura e faixa de período. `--surface-overlay` chega a medir ' +
        '1,00:1 no claro, que é o mesmo branco do cartão: a estrutura simplesmente não existe na tela.',
    );
    L.push('');
    if (opacidade) {
      L.push('### A opacidade mínima de cada cor, para a marca composta ficar em 3:1');
      L.push('');
      L.push(
        'Esta é a conta que a `ACE-5` cobra, e ela é a **maior classe de colisão do catálogo**: 50 das 814 versões ' +
          'planejadas pedem opacidade em marca. `fillOpacity` **compõe** a cor da marca com a do cartão, e o resultado ' +
          `precisa continuar em ${raz(opacidade.piso)}:1 pela WCAG 1.4.11, a mesma régua da marca opaca. A conta não é do desenho: é da ` +
          'cor e do tema, então ela está feita abaixo, medida nesta geração. **Arredondada para cima em passo de 0,01**, ' +
          'porque para baixo a peça passa no papel e reprova na guarda.',
      );
      L.push('');
      L.push(...tabelaDeOpacidade());
      L.push('');
      if (opacidade.semSolucao.length) {
        L.push(
          `**Nestas cores opacidade não é opção, e esta é a informação mais útil da tabela:** ` +
            `${opacidade.semSolucao.map((t) => `\`${t}\``).join(', ')} não alcançam ${raz(opacidade.piso)}:1 nem **opacas**, ` +
            'então nenhum valor de `fillOpacity` abaixo de 1 passa nos dois temas. Marca nessas cores vive da isenção do ' +
            'valor escrito nela ou junto dela, e baixar a opacidade só afunda um número que já está abaixo do piso.',
        );
        L.push('');
      }
      L.push(
        '**A saída que a própria `ACE-5` oferece é quase sempre melhor: contorno na cor da superfície** ' +
          '(`stroke="var(--surface-raised)"` de 1 a 2 px, que é a COR-5), porque ele separa marcas coladas **sem mexer ' +
          'no contraste do preenchimento**. Três agentes desta frente chegaram nessa saída por caminhos independentes. ' +
          'Opacidade serve para estado, como hover e fora de foco, e aí o piso ainda vale.',
      );
      L.push('');
      L.push(
        'Linhas idênticas não são erro de conta: `--chart-2` repete o hex de `--warning`, `--chart-4` o de `--positive` ' +
          'e `--chart-3` o de `--info`, o que é o motivo da ordem de slots da COR-8.',
      );
      L.push('');
    }
    if (textoSobreMarca) {
      L.push('### Que texto é legível sobre cada preenchimento de marca');
      L.push('');
      L.push(
        `Piso de **${raz(textoSobreMarca.piso)}:1**, que é o de TEXTO da \`ACE-3\`, e não os 3:1 de marca da tabela acima: ` +
          '**os dois pisos não se misturam**, e confundi-los já custou uma medição hoje. Texto sobre marca é 4,5:1; ' +
          'marca sobre fundo é 3:1. A célula traz o valor do **tema que reprova primeiro**, que é o que decide, e o ' +
          'aprovado vem em negrito. A `ACE-8` aprova um par só, `--accent-cyan-contrast` sobre `--chart-1`, e não diz ' +
          'nada sobre marca semântica, que é justamente o caso de quem pinta célula com `--positive` ou `--negative`.',
      );
      L.push('');
      L.push(...tabelaDeTextoSobreMarca());
      L.push('');
      if (paragrafoDaComposta()) {
        L.push(paragrafoDaComposta());
        L.push('');
      }
      L.push(
        '`surface-raised` é o **texto vazado na cor da superfície**, que é a saída mais usada no acervo, e ela resolve ' +
          'as duas variantes de tema sozinha: o token vale `#121c2e` no escuro e `#ffffff` no claro, então o vazado ' +
          'acompanha o cartão. No tema claro ele e o `accent-cyan-contrast` medem igual, porque ali os dois são o mesmo ' +
          'branco; no escuro o `accent-cyan-contrast` é quase preto e mede mais.',
      );
      L.push('');
      // A matriz, lida sozinha, convida ao erro: ela manda usar o vazado e a ROT-7 manda pôr halo.
      if (regras.some((r) => r.codigo === 'ROT-7b')) {
        L.push(
          '> **O vazado NÃO leva halo, e esta ressalva é parte da tabela.** A `ROT-7` manda halo na cor da superfície, ' +
            'e o texto vazado É a cor da superfície: no tema claro os dois são o mesmo branco, o halo apaga a letra e a ' +
            'medida contra ela dá 1,00:1. É a `ROT-7b`, e o teste dela é uma pergunta só: **o texto tem a marca inteira ' +
            'por baixo?** Se tem, vazado e **sem** halo. Se atravessa a borda da marca, então não é caso de vazado: é cor ' +
            'de texto **com** halo. Escolher a coluna desta tabela sem responder essa pergunta é a forma mais rápida de ' +
            'apagar o próprio rótulo.',
        );
        L.push('');
      }
      if (textoSobreMarca.semTexto.length) {
        L.push(
          `**Preenchimentos que não aceitam texto nenhum:** ${textoSobreMarca.semTexto.map((t) => `\`${t}\``).join(', ')}. ` +
            'Nenhum dos cinco textos alcança o piso sobre eles em ambos os temas, então a peça precisa saber disso ' +
            '**antes** de escolher a cor: ou o número sai FORA da marca, ou a cor muda. O caso de `--chart-8` é de ' +
            'faca: o vazado mede 4,4986:1 no claro e falta **0,0014** para o piso, o que na prática quer dizer que ' +
            'texto por dentro dele depende de arredondamento, e isso não é base para decidir.',
        );
        L.push('');
      }
    }
    if (divergenciaAce8.divergencias.length) {
      L.push(
        `**Sobre a tabela de pares da §17.10 (ACE-8):** conferi os ${divergenciaAce8.conferidos} pares resolvíveis dela e ` +
          `${divergenciaAce8.divergencias.length} divergem da minha medição, por 0,01 a 0,02 e **sem mudar nenhum ` +
          `veredito**: ${divergenciaAce8.divergencias.map((d) => `${d.par} (tabela ${d.tabela}, medido ${d.medido})`).join('; ')}. ` +
          'A causa é a composição do fundo translúcido: a tabela arredonda a cor composta para canal inteiro antes de ' +
          'medir, e eu compus em ponto flutuante. **Aqui o número da tabela é o mais fiel à tela**, porque o navegador ' +
          'rasteriza em 8 bits por canal; a diferença não muda decisão de peça nenhuma.',
      );
      L.push('');
    }
    if (fantasmasDoContrato.length) {
      L.push(
        `**Nome de token que circula e não existe:** ${fantasmasDoContrato.map((t) => `\`${t}\``).join(', ')} aparecem no ` +
          'contrato como **proposta** (seção 17.11), não como token disponível, e `var(--nome)` inexistente é recusado ' +
          'pelo check. O caso que custou uma busca: **`--danger` não existe**; quem marca atraso ou falha é `--negative`. ' +
          'Conferido contra `tokens.css` nesta geração.',
      );
      L.push('');
    }
    if (paleta.pares?.length) {
      L.push('### Razão entre marcas não é piso, e confundir isso seria destrutivo');
      L.push('');
      L.push('| Par | Escuro | Claro | O que o número prova |');
      L.push('|---|---|---|---|');
      for (const p of paleta.pares) {
        L.push(`| \`${p.a}\` contra \`${p.b}\` | ${raz(p.escuro)}:1 | ${raz(p.claro)}:1 | ${p.papel} |`);
      }
      L.push('');
      L.push(
        'Estes números são **prova de que o segundo canal é obrigatório**, e não piso a alcançar. Razão de contraste ' +
          'mede **luminância**, e a WCAG 1.4.11 pede 3:1 de objeto contra o **fundo**, nunca de objeto contra objeto: ' +
          'paleta categórica de luminância pareada é prática deliberada e correta, e é o que faz as cores parecerem da ' +
          'mesma família. Quem cobre distinguir categoria é a 1.4.1, que no contrato é a **ACE-2**: peso, forma, ícone, ' +
          'rótulo direto ou posição, sempre além da cor.',
      );
      L.push('');
      L.push(
        '**Não tente consertar a cor por causa deste número.** Uma régua de razão entre marcas reprovaria a paleta ' +
          'inteira e empurraria o catálogo para cores de luminância espalhada: pior para quem vê cor, e sem ganho ' +
          'nenhum para quem não vê. Três agentes desta frente já mediram estes pares, e um deles quase reescreveu a ' +
          'paleta por conta própria. O que o número manda fazer é **acrescentar o segundo canal**, não trocar o token.',
      );
      L.push('');
    }
    L.push(
      '**A saída de contorno, e ela é a mesma nos dois casos:** carregue a ordem por **posição fixa e nome da faixa**, ' +
        'não por degrau de cor (a rampa vira apoio, e quem ordena é o eixo, a sequência das células ou o rótulo escrito), ' +
        'e **escreva o valor** onde a estrutura não alcança contraste. Quando a peça precisa de quatro degraus ' +
        'distinguíveis, a forma muda: barra com valor escrito, ou faixa nomeada, em vez de intensidade de cor. ' +
        'Declare a escolha na nota do `meta.json`, porque ela é desvio consciente de uma lacuna conhecida, não descuido.',
    );
    L.push('');
  }

  // --- Formatação: a seção 8 obriga a formatar só por aqui, e o produtor ia ler o arquivo para saber
  // o que existe. Leitura apenas: `app/` não se altera pelo catálogo.
  //
  // A MESMA MONTAGEM SERVE AOS DOIS PAPÉIS (F0.1b, 2026-10-02): `comCorpo` é a única diferença. O
  // produtor recebe a assinatura, a linha do que cada função devolve e o parágrafo do sinal; o corpo
  // do arquivo, 7,5 KB, fica no papel completo. A tabela é a mesma nos dois, linha por linha.
  const montarFormatadores = (comCorpo) => {
    L.push('---');
    L.push('');
    L.push(`## Os ${formatadores.itens.length} formatadores de \`@/lib/format\``);
    L.push('');
    if (!formatadores.itens.length) {
      L.push(`Não foi possível ler \`app/src/lib/format.ts\`: sem ele, a seção 8 do contrato continua valendo e as assinaturas se conferem no arquivo.`);
    } else {
      L.push(
        `Assinaturas extraídas de \`${formatadores.arquivo}\` (leitura apenas; o catálogo nunca escreve em \`app/\`). ` +
          'A seção 8 manda **todo** número, moeda, taxa e data de tela passar por uma destas funções: ' +
          '`toLocaleString`, `toFixed` em texto visível e `Intl` direto no componente são recusados pelo check.',
      );
      L.push('');
      L.push('| Assinatura | O que devolve |');
      L.push('|---|---|');
      for (const f of formatadores.itens) L.push(`| \`${f.assinatura}\` | ${f.comentario || '(sem comentário na origem)'} |`);
      L.push('');
      // O SINAL, pelo cabeçalho da origem: vale para todos os formatadores de número, inclusive os que a
      // linha da tabela não comenta, e é o que impede o produtor de escrever o hífen à mão.
      if (formatadores.sinal) {
        L.push(`Do cabeçalho de \`${formatadores.arquivo}\`, literal: "${formatadores.sinal}"`);
        L.push('');
      }
      // AS CONTAGENS SAEM DA VARREDURA, nunca de texto. Este parágrafo fixava "17 peças escrevem `p.p.` e
      // 13 chamam o formatador", medido em 2026-09-29; em 2026-10-01 já eram 15, e o dossiê seguia
      // publicando 13. O nome novo só é citado quando `format.ts` o exporta: é leitura, não promessa.
      const quantasImportam = (nome) => imports.format.find(([n]) => n === nome)?.[1] ?? 0;
      const nomeHonesto = 'formatPercentFromScale100';
      const temNomeHonesto = formatadores.itens.some((f) => f.nome === nomeHonesto);
      L.push(
        '**Uma assinatura engana pelo nome, e a `DAD-4` existe por causa dela.** `formatPercentPoints` **não** ' +
          'escreve ponto percentual: o corpo dela é `formatPercent(points / 100)`, ou seja ela é um conversor de ' +
          'escala, de número em 0 a 100 para percentual, e o que sai na tela leva o **sinal de percentual**. ' +
          (temNomeHonesto
            ? `A mesma função tem hoje o nome honesto \`${nomeHonesto}\`, com o mesmo corpo e o mesmo texto de saída; ` +
              'os dois nomes estão na lista da seção 6 do contrato, e a seção 8 diz qual deles a versão nova usa. '
            : '') +
          'Usar esse conversor para uma variação em pontos percentuais publica "9,2%" onde o dado é 9,2 p.p., que é ' +
          'exatamente o sintoma da `DAD-4`. O idioma da casa para ponto percentual é `formatDecimal(valor, 1)` com a ' +
          `unidade \`p.p.\` escrita ao lado, e o acervo já está desse lado: medido nesta geração, nos ${imports.pecas} ` +
          `\`Chart.tsx\` do catálogo, **${imports.pecasComPontoPercentual} peças escrevem \`p.p.\`**, ` +
          `${quantasImportam('formatPercentPoints')} importam \`formatPercentPoints\`` +
          (temNomeHonesto ? ` e ${quantasImportam(nomeHonesto)} importam \`${nomeHonesto}\`` : '') +
          '. Pedido de formatador próprio vai para Referências no README do modelo, nunca contornado por dentro do componente.',
      );
      // O CORPO INTEGRAL, e não só a assinatura. Dois produtores perderam tempo com o comportamento de
      // BORDA, que a assinatura não conta: `formatCurrencyCompact(0)`, `formatRateWithVolume` com
      // denominador zero, o que devolve o rótulo de indisponível e o que devolve texto. São 170 linhas e
      // cerca de 6 KB, 4% deste dossiê, e publicá-las fecha toda pergunta de borda de uma vez. Extração
      // literal do arquivo, nunca paráfrase.
      const corpoFormat = comCorpo ? lerFonte(path.join(APP_SRC, 'lib', 'format.ts')) : '';
      if (corpoFormat) {
        L.push('');
        L.push(
          '**O corpo integral, porque a assinatura não conta o caso de borda.** O que cada função devolve ' +
            'com zero, com denominador zero, com lista vazia ou com data inválida decide o desenho, e é isso ' +
            'que dois produtores tiveram de ir ler no arquivo. Está abaixo por extração literal:',
        );
        L.push('');
        L.push('```ts');
        L.push(corpoFormat.trimEnd());
        L.push('```');
      } else if (!comCorpo) {
        // O ENDEREÇO DO QUE SAIU, com o nome do que só o corpo responde: quem depende de caso de borda
        // precisa saber que a tabela não o conta, em vez de deduzir da assinatura.
        L.push('');
        L.push(
          '**O corpo das funções não vem neste papel.** A tabela diz o que cada uma devolve no caso comum; o caso ' +
            'de borda (zero, denominador zero, data inválida, a faixa em que a moeda muda de unidade) só o corpo ' +
            `responde: leia a função em \`${formatadores.arquivo}\` antes de contar com o texto.`,
        );
      }
    }
    L.push('');
  };
  L = abrir('formatadores');
  montarFormatadores(true);
  L = abrir('formatadoresEnxutos');
  montarFormatadores(false);

  // --- Recharts: o que as peças de fato importam, com frequência. Não é a biblioteca inteira.
  //
  // `comFrequencia` é a única diferença entre os dois papéis (F0.1b, 2026-10-02). A contagem de quantas
  // peças importam cada nome custava 2 KB e não decide nada na produção de uma versão: a lista do que
  // PODE ser importado é a da seção 6 do contrato, que o produtor já recebe. Ficam as assinaturas dos
  // hooks e o comportamento conferido no pacote, que são o que evita rodada.
  const montarRecharts = (comFrequencia) => {
    L.push('---');
    L.push('');
    L.push(`## A superfície do Recharts e do tema que o catálogo usa`);
    L.push('');
    L.push(
      comFrequencia
        ? `Medido nos \`Chart.tsx\` do catálogo (${imports.pecas} peças), não na documentação da biblioteca: ` +
            `o que muitas peças importam é a superfície real, e o que nenhuma importa não precisa estar aqui. ` +
            `Recharts \`${imports.versaoRecharts ?? '(versão não lida)'}\`. A lista de imports **permitidos** é a da ` +
            'seção 6, acima; isto é a frequência de uso dentro dela.'
        : // O endereço da contagem que saiu está no cabeçalho do dossiê, com os outros cortes do papel.
          `Recharts \`${imports.versaoRecharts ?? '(versão não lida)'}\`. A lista de imports **permitidos** é a da seção 6, acima.`,
    );
    L.push('');
    const tabelaImports = (titulo, itens, minimo) => {
      if (!comFrequencia) return;
      const filtrados = itens.filter(([, n]) => n >= minimo);
      if (!filtrados.length) return;
      L.push(`### ${titulo}`);
      L.push('');
      L.push(filtrados.map(([nome, n]) => `\`${nome}\` ${n}`).join(' · '));
      L.push('');
    };
    if (ABORDAGENS_RECHARTS.has(abordagem)) {
      tabelaImports("De `recharts`, com quantas peças importam cada nome", imports.recharts, 1);
      if (hooks.size) {
        L.push('Os hooks de área e de escala, que são o que torna anticolisão e casco honestos, com a assinatura do pacote:');
        L.push('');
        for (const [, assinatura] of hooks) L.push(`- \`${assinatura}\``);
        L.push('');
        L.push(
          'Eles resolvem o problema que o `shape` e o `LabelList` não resolvem sozinhos: sem a área de plotagem e ' +
            'sem a escala do eixo, a posição de um rótulo ou de um casco é chute, e o chute só aparece no PNG.',
        );
        L.push('');
      }
    } else {
      L.push(
        `Esta abordagem (\`${abordagem}\`) não usa Recharts, então a lista de nomes da biblioteca ficou fora. ` +
          (comFrequencia
            ? 'O tema e a dica abaixo valem para qualquer abordagem.'
            : 'O tema e a dica valem para qualquer abordagem, e os nomes que se importam deles estão na seção 6.'),
      );
      L.push('');
    }
    tabelaImports('De `@/components/visuals/charts/chartTheme`', imports.chartTheme, 1);
    tabelaImports('De `@/components/visuals/charts/ChartTooltip`', imports.tooltip, 1);

    // Comportamento dos componentes que ESTE modelo usa: o tipo está certo e o significado é outro.
    if (ABORDAGENS_RECHARTS.has(abordagem) && sondagem.porComponente.length) {
      L.push('### O comportamento dos componentes que este modelo usa');
      L.push('');
      L.push(
        `Conferido no pacote instalado (\`recharts ${padroes.versao ?? '?'}\`), não na documentação. ` +
          (nomesDoModelo.size
            ? `A lista sai do que as versões já existentes deste modelo importam de \`recharts\` (${sondagem.porComponente.length} componente(s)).`
            : 'Este modelo ainda não tem versão no disco, então não há o que ler: entra a sondagem inteira, porque quem ' +
              'escreve a primeira versão é justamente quem não tem irmã para consultar.') +
          ' Entra **só o que surpreende**: prop que não existe, padrão que não se desliga, valor que significa outra ' +
          'coisa, fórmula que depende do que você não controla e chave que colide. Assinatura de tipo não entra; ela está ' +
          `${comFrequencia ? 'na lista acima' : 'no pacote'} e não é semântica.`,
      );
      L.push('');
      L.push(
        '**Esta lista é o que foi CONFERIDO, não um atestado do que não existe.** Cada item abaixo tem prova em ' +
          'arquivo e linha do pacote instalado; o que não está aqui simplesmente **não foi sondado**, e não há como ' +
          'concluir dele que seja óbvio ou inofensivo. Um produtor leu o silêncio como permissão para não abrir o ' +
          'pacote em 2026-09-29 e perdeu uma rodada com ordem de desenho. Três classes de comportamento não são ' +
          'sondadas por construção e você confere no pacote quando a sua peça depender delas: **ordem de pintura ' +
          'entre as partes de um componente**, **que tipos uma prop de render aceita** (função, elemento, objeto) e ' +
          '**o que um componente sincroniza com outro**. Quando a peça depende de um desses, a prova é ler o ' +
          'pacote, e o que você achar vale relatar para virar sonda.',
      );
      L.push('');
      for (const c of sondagem.porComponente) {
        if (c.estado === 'com-pegadinha') {
          L.push(`**\`${c.componente}\`**`);
          L.push('');
          for (const item of c.itens) {
            L.push(`- **${item.titulo}.** ${item.consequencia}`);
            L.push(`  - Prova, \`recharts/${item.arquivo}:${item.linha}\`: \`${item.codigo}\``);
          }
          for (const falha of c.naoConfirmadas ?? []) {
            L.push(
              `- **LACUNA DECLARADA:** a sondagem de "${falha.titulo}" procurava uma linha em \`${falha.arquivo}\` que ` +
                'não existe nesta versão do pacote. O comportamento **não foi confirmado** e não está descrito aqui: ' +
                'confira no pacote antes de contar com ele.',
            );
          }
          L.push('');
        }
      }
      if (sondagem.naoConfirmadas.length) {
        L.push(
          `**Sondagem não confirmada em:** ${sondagem.naoConfirmadas.map((n) => `\`${n}\``).join(', ')}. A linha que a ` +
            'sondagem procura não está mais no pacote, então o comportamento fica **declarado como lacuna** em vez de ' +
            'descrito de memória.',
        );
        L.push('');
      }
      if (sondagem.semSonda.length) {
        L.push(
          `**Sem sonda declarada:** ${sondagem.semSonda.map((n) => `\`${n}\``).join(', ')}. Ninguém sondou estes ` +
            'componentes ainda, e é só isso que a linha diz. **Não leia como "sem pegadinha"**: a redação anterior ' +
            'desta linha dizia "não vá ler o pacote por precaução", e em 2026-09-29 um produtor a seguiu e perdeu uma ' +
            'rodada com a ordem de pintura do Sankey, que estava escrita no pacote. O que dispensa a leitura é a ' +
            'ausência de dependência, não a ausência de sonda: se a sua peça depende de **ordem de pintura entre as ' +
            'partes do componente**, de **qual tipo uma prop de render aceita** ou de **o que ele sincroniza com ' +
            'outro**, leia o pacote, porque nenhuma dessas três classes é sondada. O que você achar entra na lista de ' +
            'sondas de `lib/dossie.mjs` no mesmo turno, com a linha do pacote como prova.',
        );
        L.push('');
      }
      L.push(
        'A lição que vale para além destes casos: **antes de confiar numa prop de tamanho, procure a unidade dela no ' +
          'pacote.** Área, raio, diâmetro e proporção da banda são quatro unidades diferentes, e a assinatura de tipo ' +
          'chama todas de `number`.',
      );
      L.push('');
    }
  };
  L = abrir('recharts');
  montarRecharts(true);
  L = abrir('rechartsEnxuto');
  montarRecharts(false);

  L = abrir('regras');
  L.push('---');
  L.push('');
  L.push(`## As ${regras.length} regras de acabamento, em enunciado`);
  L.push('');
  const regrasCortadas = regras.filter((r) => r.cortado).length;
  // As duas frases que apontam para a especificação estrutural só valem no papel que a traz: no do
  // revisor não há seção "acima", e dizer que há manda procurar o que não está no arquivo.
  L.push(
    'Cada linha é o enunciado da regra, recortado literalmente da seção 17 do contrato e cortado só em ' +
      `fim de frase. ${regrasCortadas} das ${regras.length} terminam em \`[…]\`, e nelas o exemplo trabalhado, a medição ` +
      'e as emendas ficaram fora. **Para ler a regra inteira, abra `CONTRATO.md` e busque pelo código** ' +
      '(por exemplo `ROT-2`). ' +
      (entra('estrutural')
        ? 'A seção 17 é a única do contrato que este dossiê não traz por inteiro, e o ' +
          'enunciado basta para escrever a peça, não para discutir uma margem.'
        : 'O enunciado basta para reconhecer a regra, não para discutir uma margem.'),
  );
  L.push('');
  L.push(
    entra('estrutural')
      ? 'A 14.1, acima, diz quais delas reprovam sempre e quais só reprovam quando o desvio aparece no render.'
      : 'A seção 14.1 do `CONTRATO.md` diz quais delas reprovam sempre e quais só reprovam quando o desvio aparece no render.',
  );
  L.push('');
  for (const [prefixo, itens] of porPrefixo(regras)) {
    L.push(`### ${prefixo} (${itens.length})`);
    L.push('');
    for (const r of itens) L.push(`- ${r.enunciado}`);
    L.push('');
  }
  // Correção de leitura registrada em 2026-09-28: a régua é a DIREÇÃO, e o valor da prop sai da
  // orientação da peça. Quem traduziu a regra em valor de prop errou no box plot horizontal.
  L.push('### Nota de leitura: a grade é regra de DIREÇÃO, não de valor de prop');
  L.push('');
  L.push(
    'A `EIX-3` e a `EIX-3b` dizem **grade só na direção da leitura**, e o valor da prop **depende da orientação da ' +
      'sua peça**, nunca o contrário. Coluna e linha, em que o valor corre no eixo Y, pedem `vertical={false}`; barra ' +
      'e box plot **horizontais**, em que o valor corre no eixo X, pedem `horizontal={false}`. Traduzir a regra num ' +
      'valor fixo de prop já produziu um erro nesta frente, num box plot horizontal que recebeu o `vertical={false}` ' +
      'do caso vertical e ficou com a grade atravessada. A `EIX-3b` é a exceção medida: quando os **dois** eixos são ' +
      'quantitativos e lidos por posição (dispersão, bolhas, matriz, quadrante), a grade nos dois sentidos é a régua ' +
      'do desenho e ali ela é obrigatória.',
  );
  L.push('');
  // A EMENDA QUE O ENUNCIADO NÃO ALCANÇA (F0.3). A `EIX-6b` sai acima só com a primeira frase, e a conta
  // da margem do tique mora num sub-item dela. Vem recortada do contrato, pela frase, e cala sem a emenda.
  if (emendaDoTique) {
    L.push('### Emenda da `EIX-6b` que o enunciado não alcança');
    L.push('');
    L.push(`Do \`CONTRATO.md\`, literal: ${recortarEnunciado(emendaDoTique, 440).enunciado}`);
    L.push('');
  }

  L = abrir('armadilhas');
  L.push('---');
  L.push('');
  L.push(`## As armadilhas que valem para \`${abordagem}\``);
  L.push('');
  L.push(
    `${aplicaveis.length} das ${todasArmadilhas.length} entradas do \`ARMADILHAS.md\`, pelos prefixos ${prefixos.join(', ')}. ` +
      (prefixos.includes('REC')
        ? 'As entradas `REC-*` entram porque a abordagem é Recharts.'
        : `As ${todasArmadilhas.length - aplicaveis.length} entradas \`REC-*\` ficaram fora: são de Recharts e esta abordagem não usa a biblioteca.`),
  );
  L.push('');
  L.push(
    'De cada entrada vem só o **título, que é o sintoma na tela**. A causa e a **Saída**, que é a ' +
      'contramedida, ficaram fora por tamanho.',
  );
  L.push('');
  L.push(
    '> **A SAÍDA DE CADA ARMADILHA VIVE NO `ARMADILHAS.md`, E SE CONSULTA PELO CÓDIGO.** Reconheceu o ' +
      'sintoma na sua peça, ou desconfiou dele: abra `ARMADILHAS.md`, busque pelo código (por exemplo ' +
      '`GEO-2`) e leia `Sintoma`, `Causa` e `Saída` daquela entrada antes de escrever a correção. ' +
      '**Consultar é obrigatório; improvisar solução para um sintoma listado aqui não é uma opção**, porque ' +
      'cada uma destas entradas já custou pelo menos um render errado e a saída dela é conhecida. ' +
      'Este dossiê te diz o que pode dar errado; o `ARMADILHAS.md` te diz o que fazer.',
  );
  L.push('');
  L.push(
    'O número entre parênteses é em quantos modelos distintos o mesmo fato foi redescoberto de forma ' +
      'independente: o que aparece em dezenas de modelos você vai encontrar na sua peça também.',
  );
  L.push('');
  for (const [prefixo, itens] of porPrefixo(aplicaveis)) {
    L.push(`### ${prefixo} (${itens.length}) · ${itens[0].secao}`);
    L.push('');
    for (const a of itens) L.push(`- **${a.codigo}.** ${a.titulo}${a.modelos ? ` *(${a.modelos})*` : ''}`);
    L.push('');
  }

  // --- As guardas: o que reprova a peça. É a seção que mais evita rodada de check.
  L = abrir('guardas');
  L.push('---');
  L.push('');
  L.push(`## As ${guardas.length} guardas do \`npm run check\``);
  L.push('');
  L.push(
    'Extraídas de `_render/scripts/lib/`. Elas são o que de fato reprova a peça: o contrato escreve a régua e ' +
      'a guarda a mede. **Cada uma diz onde olha, com que piso reprova e por que motivo deixa de medir**, e nenhuma ' +
      'delas se satisfaz com o código bonito: a maioria mede o `preview.svg`, isto é, o desenho que saiu.',
  );
  L.push('');
  L.push(tabelaGuardas.join('\n'));
  L.push('');
  // A fricção mais recorrente do portão, medida: 4 de 4 modelos do piloto gastaram uma rodada de check
  // com isto, em 252, 282, 284 e 240 caracteres. Em 44 modelos seriam 44 rodadas.
  L.push(
    '> **CONTE OS CARACTERES DA FRASE ACESSÍVEL ANTES DE RODAR O `check`.** A `ACE-1` pede de ' +
      '**100 a 250 caracteres** na frase da raiz, e acima de 250 é **erro**, não aviso: a peça não passa. ' +
      'Esta é a fricção mais recorrente do portão, medida em produção: quatro de quatro modelos gastaram ' +
      'uma rodada inteira de `check` nela, com 252, 282, 284 e 240 caracteres. A frase é **calculada do ' +
      'dado**, então ela muda de tamanho com o recorte e não dá para conferir de olho; conte o texto que ' +
      'o seu `describe(data)` produz com o dado padrão. Acima de 235 já sai aviso, e é aí que se encurta: ' +
      'tire a repetição, não a conclusão, porque o que a cauda carrega é justamente o achado (TIP-7).',
  );
  L.push('');
  L.push(
    `Aceitam escape: ${escapaveis.map((c) => `\`${c}\``).join(', ')}. ` +
      `Nasceram com fila de dívida: ${guardas.filter((g) => g.fila).map((g) => `\`${g.codigo}\``).join(', ') || '(nenhuma)'}.`,
  );
  L.push('');
  L.push(
    `**A fila de dívida hoje: ${fila.pecas} peça(s)**` +
      (fila.porCodigo.length ? `, sendo ${fila.porCodigo.map((c) => `\`${c.codigo}\` ${c.pecas}`).join(' e ')}` : '') +
      '. A soma por guarda pode passar do total, porque uma peça registrada em duas guardas conta nas duas. ' +
      `O arquivo tem mais ${fila.metaChaves.length} chave(s) de instrução, que começam com sublinhado ` +
      `(${fila.metaChaves.map((k) => `\`${k}\``).join(', ')}) e **não são dívida**: contar as chaves de topo dá ` +
      `${fila.pecas + fila.metaChaves.length} e já produziu dois relatos de contradição. O número da fila é peça, sempre. ` +
      'E o que importa para você: **a sua peça é nova, então ela não está na fila, e todo achado dela sai como ERRO.**',
  );
  L.push('');
  L.push('### O escape, e por que ele não é a fila de dívida');
  L.push('');
  if (blocoEscape) L.push(blocoEscape);
  L.push('');
  if (blocoFila) L.push(blocoFila);
  L.push('');
  L.push(
    '> Em uma linha: **escape diz "isto é legítimo"; fila diz "isto está errado e ainda não foi consertado"**. ' +
      'Peça nova nunca entra na fila, então todo defeito que você escrever hoje sai como ERRO. Escape sem motivo ' +
      'escrito é escape que o próximo revisor apaga.',
  );
  L.push('');
  L.push('### Check verde não quer dizer medido');
  L.push('');
  L.push(
    'Toda guarda de desenho declara um motivo quando **não consegue medir**, e nesse caso ela sai sem erro e sem ' +
      'ter olhado nada; o relatório do `check` imprime a cobertura de cada uma, e é ali que se vê. O caso mais comum ' +
      'é o preview com geometria girada, que cega a leitura de marca e de espessura: em dispersão, radial e mapa, ' +
      '`CONTRASTE-MARCA` e `ESPESSURA-MARCA` saem `preview_com_transform` em todas as versões, inclusive nas já ' +
      'aprovadas. Não é permissão: é medida que faltou, e o olho continua sendo o único juiz ali.',
  );
  if (condicaoTransform) {
    L.push('');
    L.push(`A condição exata, em \`${condicaoTransform.arquivo}:${condicaoTransform.linha}\`:`);
    L.push('');
    L.push('```js');
    L.push(condicaoTransform.codigo);
    L.push('```');
  }
  L.push('');
  L.push(
    '**E há a outra metade, que é escopo e não ponto cego: estar FORA DO ESCOPO de uma guarda não é estar APROVADO ' +
      'por ela.** Toda guarda recorta o que julga, e o recorte é deliberado; a peça que cai fora dele sai do `check` sem ' +
      'uma palavra, e isso não é um atestado. Caso medido em 2026-09-28: das quatro peças em que se esperava que a ' +
      '`EIXO-CALMO` pegasse a v1, **duas ficaram de fora, por motivos diferentes** — uma já escrevia `axisLine={false}` ' +
      'nos dois eixos, e a outra saiu `sem_eixo_com_axis_props`, porque escreve `axisLine={false}` **sem espalhar** ' +
      '`AXIS_PROPS`, e o escopo da guarda exclui eixo que não espalha o módulo compartilhado. Quem previu o contrário ' +
      'errou duas vezes em quatro. **Onde se lê a diferença:** na linha de cobertura que o `check` imprime por guarda, ' +
      'que diz quantas versões ela mediu e por que motivo as demais ficaram de fora. Zero erro com zero medição é zero ' +
      'informação, e a régua continua valendo sobre a sua peça mesmo quando nenhuma guarda a mediu.',
  );
  L.push('');
  for (const g of guardas) {
    L.push(`### ${g.codigo}${g.fila ? ' · com fila de dívida' : ''}${g.escapavel ? '' : ' · sem escape'}`);
    L.push('');
    const onde = [`\`guardas.mjs\`${g.funcao ? ` (\`${g.funcao}\`)` : ''}`, ...g.arquivos.filter((a) => a !== 'guardas.mjs').map((a) => `\`${a}\``)];
    L.push(`Vive em ${onde.join(', ')}.${g.motivos.length ? ` Não medida por: ${g.motivos.map((m) => `\`${m}\``).join(', ')}.` : ''}`);
    // O reforço vai NA LINHA DA GUARDA, que é onde o produtor lê: o escopo dela é recorte deliberado, e
    // fora do recorte ninguém mede por você. A `CONTRASTE-MARCA` deixou passar `--text-muted` como
    // preenchimento de nó sem medição nenhuma, e o produtor só descobriu lendo o escopo.
    if (g.motivos.length || g.paragrafos.some((p) => /^(?:QUAIS|ESCOPO|O QUE A GUARDA N[ÃA]O|N[ÃA]O COBRE)/.test(p))) {
      L.push('');
      L.push(
        `> Fora do escopo desta guarda **a medição é sua**: o que ela não julga sai do \`check\` sem uma palavra, e ` +
          'isso não é aprovação. Confira na linha de cobertura do `check` se ela mediu a sua peça.',
      );
    }
    L.push('');
    for (const p of g.paragrafos) L.push(`- ${p}`);
    if (g.constantes.length) {
      L.push('');
      L.push('Pisos e limiares, como estão no código:');
      L.push('');
      for (const c of g.constantes) L.push(`- \`${c.nome} = ${c.valor}\`${c.comentario ? ` — ${c.comentario}` : ''}`);
    }
    for (const a of g.ajudantes) {
      L.push('');
      L.push(`#### O leitor desta guarda, \`${a.arquivo}\`, inteiro`);
      L.push('');
      L.push(a.cabecalho);
    }
    L.push('');
  }
  L.push(...oQueAsGuardasLeem());

  L = abrir('comandos');
  L.push('---');
  L.push('');
  L.push('## Os comandos');
  L.push('');
  L.push('Rodam de dentro de `_render/`. O caminho já está preenchido com este modelo.');
  L.push('');
  L.push('```');
  L.push(`npm run check -- ${familia.slug}/${modelo.slug} --sem-tipos`);
  L.push(`npm run render -- ${familia.slug}/${modelo.slug} --tema ambos`);
  L.push(`npm run check -- ${familia.slug}/${modelo.slug}`);
  L.push('```');
  L.push('');
  L.push(
    'Na ordem: contrato cedo, sem typecheck (vai acusar preview ausente, e isso é normal antes do primeiro render); ' +
      'render nos dois temas; e o check inteiro até sair `0 com erro`. Entre o render e o check, **abra o PNG** de ' +
      `\`_render/.qa/${familia.slug}/${modelo.slug}/\` e olhe de verdade, nos dois temas.`,
  );
  L.push('');
  L.push('**Quem produz nunca roda `npm run revisao`.** O veredito é de quem revisa, e registrar o próprio trabalho como aprovado suja a fila de revisão sem ninguém ter olhado a peça.');
  L.push('');

  // -------------------------------------------------------------------------------------------
  // AS PARTES ENXUTAS. Cada uma imprime linhas que a parte inteira também imprime (as mesmas funções de
  // tabela, os mesmos parágrafos extraídos): o que muda é quanto vem, nunca o que está escrito.
  // -------------------------------------------------------------------------------------------

  // --- A moldura enxuta: a linha do canvas do modelo, a linha da moldura que vale para ele e a tabela
  // do passo. A fórmula do corpo não se repete aqui: ela está na §13, recortada na especificação.
  L = abrir('molduraEnxuta');
  const presetsDoModelo = [...new Set(disco.versoes.map((v) => v.canvas_sugerido).filter((p) => CANVAS_PRESETS[p]))];
  const classesDeLargura = new Set(presetsDoModelo.map((p) => CANVAS_PRESETS[p].width >= 560));
  // Sem canvas conhecido no catálogo entram todas as linhas: filtrar por um canvas que não existe
  // publicaria tabela vazia com cara de medição.
  const gruposDoModelo = moldura.grupos.filter((g) => !classesDeLargura.size || classesDeLargura.has(g.folgado));
  if (gruposDoModelo.length || passo.length) {
    L.push('---');
    L.push('');
    L.push('## A geometria da moldura, medida');
    L.push('');
    L.push(
      (presetsDoModelo.length
        ? `Canvas sugerido nas versões deste modelo: ${presetsDoModelo.map((p) => `\`${p}\` ${CANVAS_PRESETS[p].width}x${CANVAS_PRESETS[p].height}`).join(', ')}. `
        : 'O catálogo não sugere canvas conhecido para este modelo, então a tabela traz todas as molduras. ') +
        `O desconto da moldura, medido em ${moldura.medidos} de ${moldura.previews} previews do catálogo; a conta do corpo é a da §13, acima.`,
    );
    L.push('');
    if (gruposDoModelo.length) {
      L.push(...CABECALHO_DA_TABELA_DA_MOLDURA);
      for (const g of gruposDoModelo) L.push(linhaDaMoldura(g));
      L.push('');
    }
    if (passo.length) {
      L.push(`Do canvas ao passo, com o piso \`ESP_PISO_GERAL = ${pisoEspessura}\` da \`ESPESSURA-MARCA\`:`);
      L.push('');
      L.push(...tabelaDoPasso());
      L.push('');
    }
  }

  // --- A paleta enxuta: as duas tabelas que decidem cor antes de desenhar, com a legenda de cada uma.
  L = abrir('paletaEnxuta');
  if (opacidade || textoSobreMarca) {
    L.push('---');
    L.push('');
    L.push('## As lacunas medidas da paleta');
    L.push('');
    L.push('Medido nesta geração contra `app/src/styles/tokens.css`, pela fórmula da WCAG que as guardas usam.');
    L.push('');
    if (opacidade) {
      L.push('### A opacidade mínima de cada cor, para a marca composta ficar em 3:1');
      L.push('');
      L.push(
        `É a conta que a \`ACE-5\` cobra: piso de ${raz(opacidade.piso)}:1 pela WCAG 1.4.11, arredondada para cima em passo de 0,01. ` +
          '**nenhuma** quer dizer que a cor não alcança o piso nem opaca.',
      );
      L.push('');
      L.push(...tabelaDeOpacidade());
      L.push('');
    }
    if (textoSobreMarca) {
      L.push('### Que texto é legível sobre cada preenchimento de marca');
      L.push('');
      L.push(
        `Piso de **${raz(textoSobreMarca.piso)}:1**, que é o de TEXTO da \`ACE-3\`. A célula traz o valor do ` +
          '**tema que reprova primeiro**, que é o que decide, e o aprovado vem em negrito.',
      );
      L.push('');
      L.push(...tabelaDeTextoSobreMarca());
      L.push('');
      if (paragrafoDaComposta()) {
        L.push(paragrafoDaComposta());
        L.push('');
      }
    }
  }

  // --- As guardas resumidas: uma por seção, com o que o item de cada uma responde. Sem o corpo, sem
  // trecho de código e sem a fonte dos leitores, que viram caminho.
  L = abrir('guardasResumidas');
  const reguas = reguaPorGuarda(tabelaGuardas);
  L.push('---');
  L.push('');
  L.push(`## As ${guardas.length} guardas do \`npm run check\`, resumidas`);
  L.push('');
  L.push(
    'Extraídas de `_render/scripts/lib/guardas.mjs`. De cada uma vem a régua que ela cobra, onde olha, o que mede, ' +
      'o piso como está no código, o escape e os motivos de não medição. O corpo inteiro de cada guarda é o ' +
      'comentário do banner dela em `guardas.mjs`, na linha citada, e os leitores citados moram em ' +
      '`_render/scripts/lib/`.',
  );
  L.push('');
  L.push(
    '> Fora do escopo de uma guarda **a medição é sua**: o que ela não julga sai do `check` sem uma palavra, e ' +
      'isso não é aprovação. Confira na linha de cobertura do `check` se ela mediu a sua peça.',
  );
  L.push('');
  if (blocoEscape) {
    L.push('### O escape');
    L.push('');
    L.push(blocoEscape);
    L.push('');
  }
  for (const g of guardas) {
    const resumo = resumirGuarda(g);
    const regua = reguas.get(g.codigo);
    L.push(`### ${g.codigo}${g.fila ? ' · com fila de dívida' : ''}${g.escapavel ? '' : ' · sem escape'}`);
    L.push('');
    const leitores = g.arquivos.filter((a) => a !== 'guardas.mjs').map((a) => `\`${a}\``);
    L.push(
      `- **Régua:** ${regua?.regra ?? '(fora da tabela do cabeçalho)'}. **Onde olha:** ${regua?.onde ?? '(fora da tabela do cabeçalho)'}. ` +
        `**Vive em** \`guardas.mjs:${g.linha}\`${g.funcao ? ` (\`${g.funcao}\`)` : ''}${leitores.length ? `, com ${leitores.join(', ')}` : ''}.`,
    );
    // O parágrafo que já abre com o próprio rótulo (`O QUE ELA MEDE`, `PISO`, `ESCAPE`, `NÃO MEDIDA`) sai
    // como está, sem um segundo rótulo na frente; o rótulo em negrito só entra onde a origem não tem.
    if (resumo.oQueMede) L.push(RE_PARAGRAFO_O_QUE_MEDE.test(resumo.oQueMede) ? `- ${resumo.oQueMede}` : `- **O que mede:** ${resumo.oQueMede}`);
    if (resumo.piso) L.push(`- ${resumo.piso}`);
    if (g.constantes.length) {
      L.push(`- **Piso e limiares no código:** ${g.constantes.map((c) => `\`${c.nome} = ${c.valor}\`${c.comentario ? ` (${c.comentario})` : ''}`).join('; ')}`);
    }
    if (!g.escapavel) L.push('- **Escape:** não aceita.');
    else L.push(resumo.escape ? `- ${resumo.escape}` : `- **Escape:** aceita \`check-ok: ${g.codigo} motivo\`, com o alcance do bloco do escape, acima.`);
    if (resumo.naoMedida) L.push(`- ${resumo.naoMedida}`);
    else {
      L.push(
        `- **Não medida por:** ${g.motivos.length ? `${g.motivos.map((m) => `\`${m}\``).join(', ')}.` : 'nenhum motivo declarado no trecho da guarda.'}`,
      );
    }
    L.push('');
  }
  L.push(...oQueAsGuardasLeem());

  // --- As guardas em tabela (F0.1b, 2026-10-02): o que o produtor recebe. Uma linha por guarda, e em
  // prosa, depois da tabela, a guarda que `celulasDaGuarda` diz que não cabe. O que encolhe é o "o que
  // mede" (frases inteiras até o orçamento) e o comentário de cada constante; o parágrafo de piso, o de
  // escape e o de não medição entram INTEIROS nas duas formas.
  L = abrir('guardasEmTabela');
  const linhasDeGuarda = guardas.map((g) => ({ g, ...celulasDaGuarda(g, reguas.get(g.codigo)) }));
  const emTabela = linhasDeGuarda.filter((l) => l.cabe);
  const emProsa = linhasDeGuarda.filter((l) => !l.cabe);
  L.push('---');
  L.push('');
  L.push(`## As ${guardas.length} guardas do \`npm run check\`, em tabela`);
  L.push('');
  L.push(
    'Extraídas de `guardas.mjs`, em `_render/scripts/lib/`, com a linha do banner de cada uma. O que mede vem em ' +
      'frases inteiras da origem, e `[…]` marca onde o recorte parou; piso, escape e não medição vêm sem corte.' +
      (emProsa.length ? ` Depois da tabela, em prosa, as que não cabem numa linha: ${emProsa.map((l) => `\`${l.g.codigo}\``).join(', ')}.` : ''),
  );
  L.push('');
  L.push(
    '> Fora do escopo de uma guarda **a medição é sua**: o que ela não julga sai do `check` sem uma palavra, e ' +
      'isso não é aprovação. Confira na linha de cobertura do `check` se ela mediu a sua peça.',
  );
  L.push('');
  if (blocoEscape) {
    L.push('### O escape');
    L.push('');
    L.push(blocoEscape);
    L.push('');
  }
  if (emTabela.length) {
    L.push('| Guarda, em `guardas.mjs` | Régua e onde olha | O que mede | Piso e limiares no código | Escape | Não medida por |');
    L.push('|---|---|---|---|---|---|');
    for (const l of emTabela) {
      L.push(`| \`${l.g.codigo}\` \`:${l.g.linha}\`${l.g.fila ? ', com fila de dívida' : ''} | ${l.regua} | ${l.mede} | ${l.piso} | ${l.escape} | ${l.naoMedida} |`);
    }
    L.push('');
  }
  // Na prosa, o parágrafo que já abre com o próprio rótulo sai como está, sem um segundo rótulo na
  // frente: é a mesma regra da guarda resumida.
  const rotular = (rotulo, texto, re) => (re.test(texto) ? `- ${texto}` : `- **${rotulo}:** ${texto}`);
  for (const l of emProsa) {
    L.push(`**\`${l.g.codigo}\`** \`:${l.g.linha}\`${l.g.fila ? ', com fila de dívida' : ''}. ${l.regua}.`);
    L.push(rotular('O que mede', l.mede, RE_PARAGRAFO_O_QUE_MEDE));
    L.push(rotular('Piso e limiares no código', l.piso, RE_PARAGRAFO_PISO));
    L.push(rotular('Escape', l.escape, RE_PARAGRAFO_ESCAPE));
    L.push(rotular('Não medida por', l.naoMedida, RE_PARAGRAFO_NAO_MEDIDA));
    L.push('');
  }
  L.push(...oQueAsGuardasLeem());

  // --- Antes de entregar: recorte literal do ARMADILHAS.md, só quando o papel leva a parte, para o
  // papel que não a promete não falhar por uma seção que ele não usa.
  L = abrir('antesDeEntregar');
  if (entra('antesDeEntregar')) {
    const antes = extrairAntesDeEntregar(armadilhas);
    L.push('---');
    L.push('');
    L.push(`## ${antes.titulo}`);
    L.push('');
    L.push('Recorte literal da seção de mesmo nome do `ARMADILHAS.md`.');
    L.push('');
    L.push(antes.corpo);
    L.push('');
  }

  const faltantes = composicao.filter((nome) => !partes.has(nome));
  if (faltantes.length) throw new Error(`a composição do papel "${papel}" pede parte que não é montada: ${faltantes.join(', ')}`);
  const texto = `${composicao.flatMap((nome) => partes.get(nome)).join('\n').replace(/\n{3,}/g, '\n\n')}\n`;
  return {
    texto,
    contagem: {
      papel,
      partes: [...composicao],
      regras: regras.length,
      codigosRegra: regras.map((r) => r.codigo),
      armadilhasAplicaveis: aplicaveis.length,
      armadilhasTotal: todasArmadilhas.length,
      codigosArmadilha: aplicaveis.map((a) => a.codigo),
      prefixos,
      secoes: secoes.map((s) => s.num),
      versoes: disco.versoes.length,
      produzidas: produzidas.length,
      guardas: guardas.length,
      codigosGuarda: guardas.map((g) => g.codigo),
      // As guardas que a tabela do produtor não comportou, com o motivo: sai da montagem, não de lista.
      guardasEmProsa: entra('guardasEmTabela') ? emProsa.map((l) => ({ codigo: l.g.codigo, motivo: l.motivo })) : [],
      formatadores: formatadores.itens.length,
      importsRecharts: imports.recharts.length,
      hooks: [...hooks.keys()],
      pecasVarridas: imports.pecas,
      versoesComColisao: colisoesNoModelo,
      bytes: Buffer.byteLength(texto, 'utf8'),
    },
  };
}

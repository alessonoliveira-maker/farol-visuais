/**
 * A FILA DE DÍVIDA das guardas novas: o mecanismo que deixa uma guarda nascer sem parar a produção.
 *
 * O PROBLEMA QUE ELE RESOLVE. Uma guarda nova encontra, no primeiro dia, tudo o que o acervo
 * acumulou enquanto ela não existia. Com 347 versões, ligar a guarda como erro reprova dezenas de
 * peças de uma vez, e o que acontece então é sempre a mesma coisa: a guarda é desligada, e um defeito
 * real volta a passar verde. Transformar tudo em aviso tem o mesmo desfecho por outro caminho, porque
 * aviso não barra peça nova e a dívida cresce para sempre.
 *
 * A SAÍDA. Na entrada da guarda, o que o acervo já carrega é REGISTRADO em `divida-guardas.json`, com
 * o caminho da versão, o código da guarda e QUANTAS mensagens havia. Daí em diante:
 *
 *   PEÇA NOVA, ou peça sem registro, é BARRADA: a mensagem é erro e o `check` falha. Nenhum defeito
 *   novo entra no catálogo por esta porta.
 *
 *   PEÇA REGISTRADA sai com AVISO, e o aviso diz que ela está na fila. A produção não para e o
 *   trabalho fica visível em toda execução do `check`.
 *
 *   DÍVIDA QUE CRESCE volta a ser erro. Se a versão registrada com 2 mensagens passa a ter 5, as 3
 *   novas reprovam. Sem isso o registro seria anistia geral: bastaria uma peça estar na fila para ela
 *   poder acumular defeito à vontade.
 *
 *   DÍVIDA QUITADA vira AVISO DE LIMPEZA. Versão registrada que não acusa mais nada pede a remoção da
 *   CHAVE daquela guarda, e é assim que a fila encurta à vista de quem roda o `check`, em vez de
 *   virar um arquivo que ninguém mais lê. A CHAVE e não a linha: uma versão pode dever a mais de uma
 *   guarda, e apagar a linha inteira ao quitar uma delas anistiaria as outras em silêncio. A linha só
 *   sai quando o objeto dela fica vazio. Em 2026-09-28 três versões deviam a duas guardas ao mesmo
 *   tempo, então isto não é hipótese.
 *
 * ESTE MECANISMO NÃO É ESCAPE. O escape (`// check-ok: CODIGO motivo`) existe para o caso legítimo
 * raro, é escrito na peça, carrega o motivo e é contado no relatório. A fila é o contrário: ela diz
 * "isto está errado e ainda não foi consertado". Um item da fila nunca deve virar escape por
 * conveniência, e o número de linhas do arquivo só pode cair.
 *
 * O ARQUIVO é JSON porque JSON não aceita comentário, e aqui isso é vantagem: cada linha é um dado,
 * e o texto explicativo mora nas chaves que começam com sublinhado, que o leitor ignora.
 */
import fs from 'node:fs';
import path from 'node:path';

import { RENDER_DIR } from './paths.mjs';

/**
 * O arquivo da fila. `FAROL_FILA_DIVIDA` troca o caminho e existe SÓ para o `npm run selftest`, que
 * precisa provar os quatro comportamentos da fila (aviso, barra, cresce, quita) sem escrever no
 * arquivo de verdade: um teste que edita e restaura o arquivo real deixa a fila corrompida se o
 * processo morrer no meio.
 */
function arquivoDaFila() {
  return process.env.FAROL_FILA_DIVIDA ?? path.join(RENDER_DIR, 'scripts', 'lib', 'divida-guardas.json');
}

/** Guardas que nasceram com fila. Guarda antiga não entra aqui: ela já reprova desde sempre. */
export const GUARDAS_COM_FILA = ['AGREGACAO-ZERO', 'CONTRASTE-MARCA', 'REGUA-CONSTANTE', 'FORMATO-ACESSIVEL', 'EIXO-CALMO', 'OPACIDADE-MARCA', 'TEXTO-NA-MARCA'];

let cache = null;

/** Lê o arquivo da fila. Ausente ou inválido devolve fila vazia, e nesse caso tudo reprova. */
export function lerDivida() {
  if (cache) return cache;
  cache = new Map();
  const arquivo = arquivoDaFila();
  if (!fs.existsSync(arquivo)) return cache;
  let bruto;
  try {
    bruto = JSON.parse(fs.readFileSync(arquivo, 'utf8'));
  } catch {
    return cache;
  }
  for (const [rel, codigos] of Object.entries(bruto)) {
    if (rel.startsWith('_') || !codigos || typeof codigos !== 'object') continue;
    const porCodigo = new Map();
    for (const [code, n] of Object.entries(codigos)) {
      if (Number.isInteger(n) && n > 0) porCodigo.set(code, n);
    }
    if (porCodigo.size) cache.set(rel, porCodigo);
  }
  return cache;
}

/**
 * Retrato da fila para relatório: quantas PEÇAS ela carrega e quantas mensagens por guarda.
 *
 * POR QUE ELE EXISTE. Quem quisesse o tamanho da fila contava as chaves de topo do JSON e chegava a
 * 67, contra as 63 peças que a fila de fato tem: as outras quatro são as chaves de instrução, que
 * começam com sublinhado e existem para o arquivo se explicar sozinho. A diferença virou dois falsos
 * alarmes de contradição, de dois agentes diferentes, no mesmo dia. O número da fila é PEÇA, sempre;
 * a chave de instrução não é dívida e não some quando a dívida é quitada.
 */
export function resumoDaFila() {
  const fila = lerDivida();
  const porCodigo = new Map();
  for (const codigos of fila.values()) {
    for (const [code, n] of codigos) {
      const atual = porCodigo.get(code) ?? { pecas: 0, mensagens: 0 };
      atual.pecas += 1;
      atual.mensagens += n;
      porCodigo.set(code, atual);
    }
  }
  const arquivo = arquivoDaFila();
  let metaChaves = [];
  if (fs.existsSync(arquivo)) {
    try {
      metaChaves = Object.keys(JSON.parse(fs.readFileSync(arquivo, 'utf8'))).filter((k) => k.startsWith('_'));
    } catch {
      metaChaves = [];
    }
  }
  return {
    arquivo,
    pecas: fila.size,
    metaChaves,
    // A soma por guarda pode passar do total de peças: uma peça registrada em duas guardas conta nas duas.
    porCodigo: [...porCodigo].sort((a, b) => b[1].pecas - a[1].pecas).map(([codigo, dados]) => ({ codigo, ...dados })),
  };
}

/** Só para o selftest: esquece o que já foi lido. */
export function esquecerDivida() {
  cache = null;
}

/** Quantas mensagens desta guarda a fila registra para esta versão. */
export function naFila(rel, code) {
  return lerDivida().get(rel)?.get(code) ?? 0;
}

/**
 * Reparte as mensagens de uma guarda entre erro e aviso, segundo a fila.
 *
 * `mensagens` é a lista de textos já prontos. Devolve `{ errors, warnings }`.
 * `rel` é o caminho da versão relativo a VISUAIS, do jeito que o arquivo da fila o escreve.
 */
export function repartirPelaFila(rel, code, mensagens) {
  const errors = [];
  const warnings = [];
  const registrado = naFila(rel, code);
  if (!mensagens.length) {
    if (registrado) {
      warnings.push(
        `${code}: esta versão está na fila de dívida com ${registrado} mensagem(ns) e não acusa mais nenhuma. ` +
          `Apague a CHAVE "${code}" desta versão em _render/scripts/lib/divida-guardas.json; a linha só sai quando o objeto dela fica vazio, ` +
          'porque uma versão pode dever a mais de uma guarda e apagar a linha inteira anistiaria as outras em silêncio. ' +
          'A fila só encurta quando quem conserta tira o registro.',
      );
    }
    return { errors, warnings };
  }
  if (!registrado) {
    errors.push(...mensagens);
    return { errors, warnings };
  }
  if (mensagens.length <= registrado) {
    warnings.push(
      ...mensagens.map(
        (texto) =>
          `${texto} [dívida conhecida: esta versão entrou na fila de ${code} com ${registrado} mensagem(ns), então aqui a guarda ORIENTA e não reprova. ` +
          'Peça nova com este defeito é barrada.]',
      ),
    );
    return { errors, warnings };
  }
  errors.push(
    `${code}: a dívida desta versão CRESCEU, de ${registrado} mensagem(ns) registradas para ${mensagens.length}. ` +
      `As ${mensagens.length - registrado} novas reprovam: estar na fila não autoriza acumular. Mensagens: ${mensagens.join(' | ')}`,
  );
  return { errors, warnings };
}

export { arquivoDaFila };

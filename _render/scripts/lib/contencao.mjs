/**
 * O CRITÉRIO DE CONTENÇÃO entre a caixa de tinta de um texto e uma forma preenchida, num lugar só.
 *
 * POR QUE ELE EXISTE, E POR QUE NÃO PODE HAVER DOIS. A mesma pergunta geométrica aparece nas duas
 * pontas do catálogo, virada do avesso em cada uma:
 *
 *   NA `CONTRASTE-MARCA`, por `marca.mjs`: a FORMA é isentada de julgamento quando tem texto escrito
 *   por cima, porque ali ela é suporte e a informação está na letra. Quem pergunta é a forma.
 *
 *   NA `TEXTO-NA-MARCA`, por `guardas.mjs`: o TEXTO é julgado contra a forma que está por baixo dele,
 *   porque ali o halo da `ROT-7` não tem o que separar e a `ROT-7b` manda escolher entre halo e cor.
 *   Quem pergunta é o texto.
 *
 * Duas implementações do mesmo critério divergiriam no primeiro ajuste, e o desfecho seria pior que
 * divergência de número: uma forma isentada pela primeira régua e um texto não acusado pela segunda
 * deixariam o defeito sem nenhuma guarda, sem que nada aparecesse no relatório.
 *
 * O CRITÉRIO É CONTENÇÃO, NÃO INTERSEÇÃO, com um pixel de folga. A interseção abriria a porteira
 * exatamente onde ela não pode abrir: num gráfico de barras o rótulo de valor encosta na barra e às
 * vezes a invade um pouco, e a barra É marca de dado. Contenção separa os dois casos pelo que os
 * distingue no desenho: a plaquinha de nome e a fatia de pizza CABEM o texto, com respiro em volta; a
 * barra não cabe o rótulo dela.
 *
 * DUAS MECÂNICAS PARA UM CRITÉRIO, e a diferença não é de régua, é de quanto cada chamador sabe da
 * forma:
 *
 *   `caixaDentroDaCaixa`, quando a forma DECLARA a caixa em atributo (`rect`, `circle`, `ellipse`).
 *   É o caminho de `marca.mjs`, que lê atributo e não interpreta traçado.
 *
 *   `formaConteCaixa`, quando a forma sabe responder "pinta neste ponto?" mas não tem caixa
 *   declarada. É o caminho de `guardas.mjs` sobre as formas de `lerFundos`, e existe porque a fatia de
 *   pizza e o anel de sunburst são `path`: sem ele, a classe inteira de defeito que nasceu nessas duas
 *   famílias ficaria fora de alcance. A caixa envolvente de uma fatia não serve como aproximação,
 *   porque ela cobre o centro do disco, que é de outra fatia.
 *
 * A AMOSTRAGEM É A MESMA DE `fundosDaCaixa`, de propósito: quem diz "o texto está dentro desta forma"
 * e quem diz "o fundo desta tinta é esta cor" precisam olhar os mesmos pontos, ou uma guarda acusaria
 * contra uma cor que a outra não vê. Por isso as constantes vêm de `contraste.mjs` em vez de serem
 * escolhidas aqui.
 */
import { AMOSTRA_COLUNAS_MAX, AMOSTRA_COLUNAS_MIN, AMOSTRA_LINHAS, AMOSTRA_PASSO } from './contraste.mjs';

/**
 * Folga, em px, ao perguntar se a caixa do texto cai DENTRO da caixa da forma.
 *
 * A caixa do texto é estimativa: a altura vem de `ASCENDENTE`/`DESCENDENTE` de `colisao.mjs` e a
 * largura de uma tabela de avanço por caractere. Um pixel absorve esse erro e o arredondamento do
 * serializador sem abrir a porteira: texto que apenas ENCOSTA na forma, ou que está ao lado dela,
 * tem a caixa inteira fora e continua não isentando nada.
 */
export const FOLGA_DE_SOBREPOSICAO = 1;

/** A caixa `interna` cabe dentro da `externa`, com a folga? */
export function caixaDentroDaCaixa(interna, externa) {
  if (!interna || !externa) return false;
  const f = FOLGA_DE_SOBREPOSICAO;
  return interna.x0 >= externa.x0 - f && interna.x1 <= externa.x1 + f && interna.y0 >= externa.y0 - f && interna.y1 <= externa.y1 + f;
}

/**
 * Alguma linha de texto do preview cai DENTRO da caixa desta forma?
 *
 * É a isenção "tem texto por cima" da `CONTRASTE-MARCA`, do lado da FORMA. Medida em 2026-09-28 nos
 * dois casos que a guarda acusava por engano, ambos pelo ramo SVG, em que o `<text>` é IRMÃO do
 * `<rect>` e do `<circle>` e o parentesco no DOM não diz nada:
 * `12_hierarquia/02_treemap-aninhado/v1` escreve o nome do executivo numa plaquinha de 90,28 x 18 px
 * e o texto ocupa 66 x 9 px dentro dela; `12_hierarquia/04_arvore-de-indicadores/v1` põe o glifo de
 * operador no centro de um círculo de raio 12 px.
 */
export function temTextoDentro(caixa, linhas) {
  if (!caixa) return false;
  return linhas.some((linha) => caixaDentroDaCaixa(linha, caixa));
}

/**
 * Esta forma de `lerFundos` pinta em TODOS os pontos amostrados da caixa, isto é, contém a caixa?
 *
 * Amostra a caixa já encolhida pela folga, na mesma grade de `fundosDaCaixa`, e exige `true` em todo
 * ponto: `false` é ponto fora da forma e `'incerto'` é recorte que o leitor não sabe testar, e
 * nenhum dos dois autoriza afirmar contenção. Preferir a dúvida aqui é o erro certo a cometer, porque
 * esta função só ACRESCENTA informação à mensagem de uma guarda que já acusou por outro caminho.
 */
export function formaConteCaixa(forma, caixa) {
  if (!forma || typeof forma.contem !== 'function') return false;
  const f = FOLGA_DE_SOBREPOSICAO;
  const x0 = caixa.x0 + f;
  const x1 = caixa.x1 - f;
  const y0 = caixa.y0 + f;
  const y1 = caixa.y1 - f;
  if (x1 < x0 || y1 < y0) return false;
  if (forma.bbox && !caixaDentroDaCaixa({ x0, x1, y0, y1 }, forma.bbox)) return false;
  const colunas = Math.max(AMOSTRA_COLUNAS_MIN, Math.min(AMOSTRA_COLUNAS_MAX, Math.round((x1 - x0) / AMOSTRA_PASSO) + 1));
  for (let i = 0; i < colunas; i += 1) {
    const px = colunas === 1 ? (x0 + x1) / 2 : x0 + ((x1 - x0) * i) / (colunas - 1);
    for (const fracao of AMOSTRA_LINHAS) {
      if (forma.contem(px, y0 + (y1 - y0) * fracao) !== true) return false;
    }
  }
  return true;
}

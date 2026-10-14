/**
 * npm run dossie -- <familia>/<modelo> [outro modelo...] [--papel produtor|revisor] [--json]
 *
 * Grava o dossiê de produção de cada modelo pedido em `_render/.qa/dossie/<familia>__<modelo>.md` e
 * imprime onde gravou. Aceita a família inteira como alvo. Alvo que não resolve é falha explícita,
 * com o caminho impresso e código de saída diferente de zero, e não leva os alvos válidos embora.
 *
 * `--papel` escolhe a composição (padrão `produtor`): o do produtor é enxuto (formatadores sem o corpo
 * de `format.ts`, Recharts sem a contagem de imports, guardas em tabela), o do revisor traz só o
 * modelo, as versões, as regras, as armadilhas e as guardas resumidas. O dossiê do produtor acima do
 * teto de 110 KB (`TETO_DO_PRODUTOR`) sai com uma linha de aviso e `acimaDoTeto` no JSON; é aviso, o
 * arquivo é gravado e o código de saída não muda (quem reprova é o `selftest`). O do produtor fica sem sufixo
 * no nome, que é o caminho que os agentes já leem; os outros gravam `<familia>__<modelo>.<papel>.md`,
 * para um papel não sobrescrever o outro. Existe um terceiro valor, `completo`, que não é leitura de
 * produção: é o endereço do que os papéis enxutos deixaram fora, e o dossiê enxuto o cita. Valor fora
 * da lista é erro, com a lista impressa: papel digitado errado não pode cair calado no padrão.
 *
 * O dossiê é um arquivo só, para ser lido EM VEZ de `CONTRATO.md`, `ARMADILHAS.md` e `PRODUCAO.md`:
 * é a alavanca de custo das 467 versões que faltam. Ele é derivado por EXTRAÇÃO, nunca por reescrita;
 * o motivo está no comentário de `lib/dossie.mjs`.
 *
 * O destino é `.qa/` porque dossiê é saída de ferramenta, regenerável e fora do git (o `.gitignore`
 * já ignora `.qa/*`), e o nome `<familia>__<modelo>.md` repete o do veredito de revisão, que é o
 * único outro artefato da ferramenta com grão de modelo. Dentro da pasta da versão ele seria peça, e
 * peça é o que o check confere: um sexto arquivo na versão viraria aviso a cada check.
 */
import path from 'node:path';

import {
  ARMADILHAS_PATH,
  CATALOGO_PATH,
  CONTRATO_PATH,
  PAPEIS,
  PAPEL_PADRAO,
  TETO_DO_PRODUTOR,
  avisoDoTeto,
  lerCatalogo,
  lerFonte,
  montarDossie,
  planModelos,
  sufixoDoPapel,
} from './lib/dossie.mjs';
import { QA_DIR, parseArgs, relToVisuais, writeFileAtomic } from './lib/paths.mjs';

const DOSSIE_DIR = path.join(QA_DIR, 'dossie');

function kb(bytes) {
  return `${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(bytes / 1024)} KB`;
}

function main() {
  const { positional, flags } = parseArgs(process.argv.slice(2), { booleanFlags: ['json'] });
  const asJson = Boolean(flags.json);
  // `--papel` sem valor chega como `true`, e valor fora da lista chega como texto: os dois são erro
  // antes de qualquer gravação, porque dossiê do papel errado com nome de arquivo certo é pior que nenhum.
  const papel = flags.papel === undefined ? PAPEL_PADRAO : String(flags.papel);
  if (!PAPEIS.includes(papel)) {
    throw new Error(`--papel aceita ${PAPEIS.join(', ')} (padrão ${PAPEL_PADRAO}); recebi "${flags.papel === true ? '' : papel}".`);
  }
  const catalogo = lerCatalogo();
  const { alvos, modelos } = planModelos(catalogo, positional);
  const contrato = lerFonte(CONTRATO_PATH);
  const armadilhas = lerFonte(ARMADILHAS_PATH);

  // Uma linha por alvo pedido, antes de gravar nada: o alvo que não resolveu aparece com o caminho e
  // o motivo, em vez de sumir calado.
  if (!asJson) {
    for (const [i, a] of alvos.entries()) {
      if (a.motivo) console.log(`[dossie] alvo ${i + 1}/${alvos.length} ${a.arg}: FALHOU; ${a.motivo}`);
      else console.log(`[dossie] alvo ${i + 1}/${alvos.length} ${a.escopo}: ${a.modelos.length} modelo(s).`);
    }
  }
  const alvosComFalha = alvos.filter((a) => a.motivo || a.modelos.length === 0).length;

  const gravados = [];
  for (const { familia, modelo } of modelos) {
    const { texto, contagem } = montarDossie({ familia, modelo, contrato, armadilhas, papel });
    const destino = path.join(DOSSIE_DIR, `${familia.slug}__${modelo.slug}${sufixoDoPapel(papel)}.md`);
    writeFileAtomic(destino, texto);
    // O teto do produtor só AVISA aqui: o dossiê é gravado do mesmo jeito e o código de saída não muda.
    // Quem reprova acima do teto é o `selftest`, pelo modelo de prova.
    const teto = avisoDoTeto(contagem);
    gravados.push({ modelo: `${familia.slug}/${modelo.slug}`, arquivo: relToVisuais(destino), ...contagem, acimaDoTeto: teto !== null });
    if (!asJson) {
      console.log(
        `[dossie] ${familia.slug}/${modelo.slug} (${modelo.abordagem_stack}, papel ${papel}): ${kb(contagem.bytes)} em ${relToVisuais(destino)}; ` +
          `${contagem.produzidas} de ${contagem.versoes} versão(ões) no disco, ${contagem.regras} regra(s), ` +
          `${contagem.armadilhasAplicaveis} de ${contagem.armadilhasTotal} armadilha(s).`,
      );
      if (teto) console.log(`[dossie] aviso, ${familia.slug}/${modelo.slug}: ${teto}.`);
    }
  }

  if (asJson) {
    process.stdout.write(
      `${JSON.stringify(
        {
          alvos: alvos.map((a) => ({ caminho: a.arg, escopo: a.escopo, modelos: a.modelos.length, falhou: Boolean(a.motivo) || a.modelos.length === 0, motivo: a.motivo })),
          alvosComFalha,
          papel,
          fontes: [CONTRATO_PATH, ARMADILHAS_PATH, CATALOGO_PATH].map((f) => relToVisuais(f)),
          dossies: gravados,
        },
        null,
        2,
      )}\n`,
    );
    return alvosComFalha ? 1 : 0;
  }

  const media = gravados.length ? gravados.reduce((s, g) => s + g.bytes, 0) / gravados.length : 0;
  console.log(`\n[dossie] ${alvos.length} alvo(s) pedido(s): ${alvos.length - alvosComFalha} processado(s), ${alvosComFalha} com falha.`);
  for (const a of alvos.filter((a) => a.motivo || a.modelos.length === 0)) {
    console.log(`[dossie] alvo com falha: ${a.arg}; ${a.motivo ?? 'nenhum modelo do catálogo sob o caminho'}.`);
  }
  const acima = gravados.filter((g) => g.acimaDoTeto).length;
  console.log(
    `[dossie] ${gravados.length} dossiê(s) em ${relToVisuais(DOSSIE_DIR)}/; tamanho médio ${kb(media)}` +
      (acima ? `; ${acima} acima do teto de ${kb(TETO_DO_PRODUTOR)} do produtor (aviso, não falha).` : '.'),
  );
  return alvosComFalha ? 1 : 0;
}

try {
  process.exit(main());
} catch (error) {
  console.error(`[dossie] ${error.message}`);
  process.exit(1);
}

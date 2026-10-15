# F3.1 e F3.2: galeria depois da última leva e tabela de famílias (2026-10-15)

Agente `visuais-ferramenta`, Lote 24, Fase 3. Nenhum arquivo da ferramenta foi alterado.

## O que mudou

* `README.md`, seção Estado, linhas 19 a 23: o parágrafo das quatro contagens deixa 491, 308 e 124 e
  passa a dar a medição de 2026-10-15 (814 planejadas, 814 no disco, 784 prontas, 205 modelos
  completos), mantendo a frase de que as quatro não são intercambiáveis.
* `README.md`, seção Famílias: parágrafo de abertura (linha 101) diz a data da medição e de onde saem as
  colunas novas; tabela (linhas 103 a 132) ganha **Versões no disco**, **Prontas** e **Reprovadas em
  pendência conhecida**. Totais: 814, 784 e 30.
* `galeria.html` regenerada por `npm run galeria` (o arquivo é ignorado pelo git).

## Como as colunas foram calculadas

Por script fora do repositório, lendo só `_render/.qa/pendencias.json` (gerado em
2026-10-15T12:17:33Z; não foi regenerado): `prontasLista` (784) mais `versoes` (30) dão as 814 do
catálogo. No disco é a versão sem `sem_pasta` nem `sem_chart`; pronta é a versão sem motivo; reprovada
conta `revisao_reprovada`. Conferências do script: planejadas por família iguais à coluna antiga e a
`_estudo/catalogo.json` nas 27 famílias; modelos por família iguais; tabela do README igual, linha a
linha, à saída do script (fora o cabeçalho); somas 814, 814, 784 e 30, iguais a `catalogo.versoes`,
`prontas`, `pendentes` e `porMotivo.revisao_reprovada` do arquivo.

**Aprovada e pronta coincidem.** O `pendencias.json` não guarda "aprovada" à parte; ela se deriva como
versão sem `sem_revisao`, `revisao_reprovada` e `revisao_desatualizada`. Em 2026-10-15 o único motivo
aberto é `revisao_reprovada` (30), então aprovadas = prontas = 784, e a tabela traz uma coluna só.

**Pendência conhecida.** As 30 reprovadas têm, cada uma, linha de revisão reprovada no
`_operacao/LOG.md` (conferido por script, 30 de 30). Em 29 delas a linha diz "pendência conhecida"; a
`05/07` v1 (2026-10-02, ACE-5) está como "reprovado", com a régua devolvida ao dono.

## Galeria

`npm run galeria` às 09:20 (hora local), depois do commit do Lote 23 e da medição das 09:17; nenhum
`preview*.svg` é mais novo que a galeria. Saída: "814 versão(ões) do catálogo e 3 molde(s); 2.373,9 KB".
A unidade é a versão: 817 cartões, 814 do catálogo (todo caminho de `pendencias.json` tem exatamente um
cartão) e 3 moldes de `_render/exemplos`. Todos os 817 com estado "preview em dia"; nenhum sem preview,
sem README ou com `meta.json` em problema.

Referências locais conferidas contra o disco, por script: **5110, faltando 0**. São 817 `src`, 817
`data-claro`, 817 `data-escuro` e 2659 `href` (817 `Chart.tsx`, 817 `data.ts`, 817 `meta.json` e 208
README de modelo). Fora da conta: 238 âncoras internas (`#`); nenhuma referência externa.

## Medições

| | Antes | Depois |
|---|---|---|
| `npm run selftest` | 653 linhas `ok`, saída 0, 10 de 10 grupos | 653 linhas `ok`, saída 0, 10 de 10 grupos, subtotais idênticos |
| `git status --short -- .` em VISUAIS | vazio | meus: `M README.md` e `??` desta nota |

No depois aparecem também `M _operacao/LOG.md` (uma linha do F3.5, gravada às 09:24) e `??
validation/ferramenta_f3-devolver-pedidos-ao-projeto-26_2026-10-15.md` (09:23), do trabalho paralelo;
não são deste item. O check do acervo não foi rodado: não há guarda nova nem limiar novo.

## Fora do escopo, visto e deixado

* README, linha 3: "Atualizado em 2026-09-30".
* README, seção Estado, primeiro parágrafo: "este índice não repete números para não envelhecer", que
  agora convive com as contagens datadas do segundo parágrafo e com as colunas da tabela.

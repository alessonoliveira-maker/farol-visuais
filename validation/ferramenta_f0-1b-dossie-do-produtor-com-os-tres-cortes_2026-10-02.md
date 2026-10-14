# Ferramenta: F0.1b, dossiê do produtor com os três cortes (2026-10-02)

**Aceite PARCIAL.** (a), (b), (d), (e) e (f) atendidos. (c) **não atendido por 0,5 KB**: o produtor de
`16_distribuicao/05_histograma-comparativo` ficou em **100,5 KB** (102.909 B contra 102.400). Nenhuma regra,
armadilha, piso, escape ou motivo de não medição foi cortado para caber. O teto ainda não reprova no
`selftest`: a prova nasceria vermelha, então ele imprime o tamanho e a ponta avisa. Sem commit.

## O que mudou
- **Formatadores:** sai o corpo de `format.ts` (7,5 KB); fica a tabela de assinatura e do que devolve, mais o
  parágrafo do sinal do cabeçalho da origem, literal (U+2212, sinal antes do símbolo na moeda). A extração
  passou a ler comentário em bloco: `formatCurrencyAxis` saía como "(sem comentário na origem)".
- **Recharts:** sai a contagem de imports (três listas); ficam os hooks e o comportamento conferido no pacote.
- **Guardas:** tabela com régua e onde olha, linha, o que mede, piso, escape e não medição. Encolhem o "o que
  mede" (frases inteiras até 180 B, `[…]` no corte) e o comentário das constantes; parágrafo de `PISO`, de
  `ESCAPE` e de `NÃO MEDIDA` entram inteiros. **Em prosa, 5 de 15:** `ESPESSURA-MARCA`, `COLISAO-TEXTO`,
  `CONTRASTE-TEXTO` e `TEXTO-NA-MARCA` (não medição maior que a célula de 360 B) e `AGREGACAO-ZERO` (barra
  vertical no texto, `number | null`).
- **Texto do F0.5c:** o gerador escreve `−R$ 200 mil`, explica a sobrecarga pelo `<Text>` que mede palavra por
  palavra e lê os limiares (62 e 81 px) da tabela da emenda da `EIX-6`; sem a tabela, não escreve número.

## Arquivos e linhas
- `_render/scripts/lib/dossie.mjs`: papéis, teto e aviso (86 a 138); `celulasDaGuarda` (666 a 708); formatadores
  e limiares do tique (1525 a 1602); texto do F0.5c (2341 a 2424); formatadores e Recharts (2692 a 2909);
  guardas em tabela (3256 a 3305). `_render/scripts/dossie.mjs`: aviso e `acimaDoTeto` (8 a 12, 80 a 91, 115
  a 119). `_render/scripts/selftest.mjs`: 1809 a 1846, 1871 a 1909, 1964 a 1980, 2001 a 2088, 2185 a 2188.

## Medições
- `selftest`: 521 provas, verde, antes; 581 provas, verde, depois.
- `check -- . --sem-tipos`: 0 erros, 1371 avisos, 982 de biblioteca, antes e depois.
- Dossiê de `16/05`, em KB: produtor 115,3 para **100,5**; revisor 49,1 para 49,1 (idêntico byte a byte);
  completo 177,2 para 178,5. Regras e armadilhas por código no produtor: 82 de 82 e 73 de 73, antes e depois.
- **Por seção, produtor, em KB:** cabeçalho 1,8; modelo 1,5; versões 4,4; estrutural 37,5; moldura 1,5; paleta
  3,8; formatadores 4,1 (era 10,9); Recharts 7,1 (era 8,8); regras 16,4; armadilhas 7,7; guardas 11,2 (era
  17,6); comandos 0,8; Antes de entregar 2,7.

## Por que 100 KB não saiu, e as opções medidas
O menu estimava 10,5 KB nas guardas; saíram 6,4. A diferença é o que o item mandou manter: não medição 2,8
KB, escape 1,2 KB e o bloco geral do escape 1,0 KB. No catálogo inteiro o produtor vai de **88,9 a 106,1
KB**, e **47 dos 205 modelos passam de 100 KB**, todos de Recharts.
1. Subir o teto (102 KB fecha `16/05` com 1,5 KB de folga; não fecha os 47).
2. Tirar do produtor o parágrafo do gerador sobre a `DAD-4`, 1,1 KB: 99,4 KB.
3. "O que mede" só onde a origem rotulou o parágrafo (6 guardas); nas outras 9 fica régua e onde olha,
   1,4 KB: 99,1 KB. Nessas 9 o recorte de hoje repete a regra e corta a frase que diz o que a guarda recusa.

## Provas (60 a mais, nenhuma retirada) e decisões além do texto do item
- **Acusa:** parágrafo maior que a célula e texto com barra tiram a guarda da tabela; contrato sem a tabela
  de limiares não gera número; produtor acima do teto recebe aviso. **Passa:** guarda curta cabe; comentário
  em bloco sai pelo primeiro parágrafo; produtor no teto exato sem aviso. **Reescritas:** "o dossiê nomeia o
  tickSize como parte da sobrecarga" fixava a explicação que o F0.5c derrubou e virou duas; "traz toda
  guarda como seção" virou "traz toda guarda do código". **Reapontadas** ao revisor: as da guarda resumida.
- **Para confirmar ou desfazer:** o teto avisa na ponta e no `selftest`, sem reprovar; a prova que reprova é
  uma linha, escrita no comentário de `selftest.mjs:2082`. Célula sem parágrafo e sem motivo achado diz "sem
  parágrafo na origem", não "nenhum", pelo defeito abaixo.

## Fora do escopo, visto e deixado
- **A extração de motivos é incompleta em 5 guardas.** Ela só vê `naoMedida('x')`; `AGREGACAO-ZERO`,
  `REGUA-CONSTANTE`, `EIXO-CALMO`, `OPACIDADE-MARCA` e `FORMATO-ACESSIVEL` devolvem `motivo: 'sem_codigo'`, e
  os leitores têm os seus (`eixo.mjs`: `sem_grade`, `sem_eixo_cartesiano`, `sem_eixo_com_axis_props`;
  `opacidade.mjs`: 2; `formato.mjs`: 3). O revisor segue dizendo "nenhum motivo declarado" em 4 delas.
- A moldura ainda cita os 80 px de 2026-09-28 para moeda negativa, que a emenda diz quebrarem `−R$ 200 mil`.

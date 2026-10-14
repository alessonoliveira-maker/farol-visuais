/**
 * Receita reconhecida por oportunidade encerrada, em reais. Dado fictício, determinístico, sem
 * nenhuma correspondência com base real e sem nome de pessoa ou de empresa.
 *
 * Uma observação por oportunidade **encerrada**, ganha ou perdida. O zero aqui é medição: a
 * oportunidade fechou e a receita apurada deu zero. Não é ausência e não é oportunidade em aberto,
 * que é a terceira coisa e a única que fica fora da lista, contada em WITHOUT_OUTCOME.
 */

/**
 * Oportunidades que seguiam sem desfecho no momento da extração. Elas não têm receita apurada e
 * não podem entrar na acumulada: incluí-las como zero afirmaria que fecharam sem receita, e
 * descartá-las em silêncio empurraria a curva para cima de graça. A pergunta delas é outra, de
 * tempo até o desfecho, e a forma dela é a curva de sobrevivência.
 */
export const WITHOUT_OUTCOME = 87;

/** Receita reconhecida por oportunidade encerrada, em reais, em ordem crescente. */
export const data: readonly number[] = [
       0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,
       0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,
       0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,
       0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,
       0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,
       0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,
       0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,
       0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,      0,
       0,      0,      0,      0,   2400,   4500,   5800,   5900,   6100,   6800,   6900,   7100,
    7200,   7300,   7700,   7800,   7800,   8000,   8200,   8700,   9200,   9800,  10300,  10900,
   10900,  11300,  11500,  12200,  12300,  12400,  12900,  13500,  13600,  13700,  14700,  14900,
   15600,  16600,  16700,  16900,  17200,  17800,  18000,  18600,  18600,  18700,  19800,  20000,
   20100,  20400,  20800,  21700,  22000,  22300,  22500,  23000,  23100,  23200,  23300,  23400,
   23700,  23800,  25300,  25500,  26100,  26100,  28100,  28300,  29600,  30400,  32000,  33900,
   34900,  35000,  36100,  36700,  37100,  39800,  42700,  42800,  43900,  43900,  44300,  44500,
   45000,  45100,  45300,  46800,  47900,  48500,  48700,  50700,  52200,  52800,  53900,  54700,
   55000,  55600,  57900,  65500,  65600,  66800,  68400,  73900,  74000,  76600,  76900,  79000,
   79900,  81100,  85300,  88600,  89400,  90500,  94300,  98200, 101100, 102300, 102400, 121500,
  122200, 128700, 130200, 131900, 144200, 145000, 152700, 153900, 154300, 154500, 158300, 167300,
  168700, 169900, 182000, 190300, 199800, 243900, 250900, 266300, 267800, 269400, 290800, 303800,
  321100, 354200, 421700, 440200,
];

/**
 * Receita reconhecida por oportunidade ganha no período, em reais. Dado fictício, determinístico,
 * sem nenhuma correspondência com a base real: nasceu de um gerador de semente fixa e o array final
 * está escrito aqui, para o preview desenhar a mesma coisa em qualquer máquina e em qualquer data.
 *
 * A distinção que esta versão inteira existe para desenhar mora **no dado**, e por isso ela está
 * declarada aqui e não só no componente.
 *
 * O valor `0` é **medição**: a oportunidade foi ganha, o campo de receita foi apurado e o que
 * entrou no período foi R$ 0. Acontece em negócio sem taxa de entrada, em contrato que só passa a
 * faturar no exercício seguinte e em ganho registrado para efeito de meta. Zero é um número
 * observado e fica na amostra.
 *
 * Já a oportunidade **sem o campo apurado** não está neste array. Ela não é zero, é ausência de
 * medição, e vira a constante `WITHOUT_REVENUE`, contada no rodapé. Somar as duas seria afirmar que
 * 123 negócios renderam nada, quando o que se sabe é que 89 renderam nada e de 34 não se sabe.
 *
 * A ordem é a de fechamento, não a crescente, e os zeros estão espalhados por ela: agrupá-los no
 * começo do array faria parecer que a ausência de receita é um efeito de período.
 */

/** Largura da faixa de valor, em reais. Vem da régua da métrica e não muda com o filtro. */
export const BIN_WIDTH = 50000;

/**
 * Onde a última faixa deixa de ter fim. Acima deste valor tudo cai numa faixa aberta, desenhada com
 * a mesma largura das outras e contada no rodapé: sem ela o eixo teria que ir até o maior valor
 * observado, e a régua passaria a mudar a cada recorte.
 */
export const OPEN_FROM = 600000;

/**
 * Oportunidades ganhas **sem o campo de receita apurado**. Não entram na amostra e não viram faixa
 * zero: saem do gráfico e são contadas no rodapé com o rótulo de indisponível.
 */
export const WITHOUT_REVENUE = 34;

/** Um valor por oportunidade ganha com receita apurada, em reais, na ordem de fechamento. */
export const data: readonly number[] = [
   232000,  927500,   88000,   92500,       0,  222500,       0,  111500,
        0,       0,       0,       0,       0,  201000,  303500,       0,
        0,       0,  239000,  423500,   76500,       0,   37000,       0,
   172000,       0,  308500,       0,   25500,       0,  154000,       0,
        0,   66500,       0,  143500,       0,       0,  187500,   69500,
        0,   67000,       0,   18000,       0,       0,       0,  209500,
   152000,       0,       0,       0,  640500,       0,  282000,       0,
    65500,   40500,       0,   88000,  269000,  218500,       0,  145000,
   295500,  428500,  333000,       0,  252000,   94500,       0,       0,
        0,  163500,  224500,       0,  101500,       0,  160000,  215000,
   145000,   93000,  236500,   36000,   26500,   49500,       0,   59000,
   274000,  206000,  401500,  593500,       0,   65000,  191000,       0,
   135000,   57500,   33500,  140000,       0,   94500,  149500,       0,
    31000,       0,       0,       0,   70000,       0,       0,  145500,
   108500,       0,   29000,       0,       0,       0,   21000,   32000,
    21500,   84000,   17500,       0,       0,   82000,       0,  313000,
   107500,       0,  102500,       0,  838500,       0,  253500,       0,
   256500,       0,  301500,  159000,       0,   29000,   73000,   46000,
   236000,  285500,       0,       0,  132500,  213000,   80000,       0,
    84000,   52500,   40000,   71000,       0,  119500,       0,  179000,
   630000,       0,       0,       0,  299000,   44500,   27500,       0,
    65000,   46500,  202000,       0,  999000,       0,       0,   65500,
   555500,  984500,  319500,  232500,       0,   11000,       0,  184500,
        0,   86000,  193000,   75000,  152500,       0,  967000,    8000,
        0,  133000,  249000,  653500,       0,       0,   82000,       0,
    61500,  203500,  204000,       0,       0,  173000,       0,       0,
        0,       0,  394500,  106000,       0,  346500,  145500,       0,
   161500,
];

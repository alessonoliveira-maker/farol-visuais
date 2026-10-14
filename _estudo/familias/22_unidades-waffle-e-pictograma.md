# Família 22: unidades, waffle e pictograma

Catálogo VISUAIS do Farol · estudo de pesquisa · 2026-09-14
Stack alvo: React 18.3, TypeScript strict, Recharts 3.10 (instalado 3.10.1), Tailwind 4, lucide-react (instalado 1.39.0). Tema escuro por padrão.
Todos os casos de uso abaixo são fictícios; nenhum nome de pessoa, empresa ou plataforma real.

## O que a família responde

Gráfico de unidades codifica quantidade **pelo número de marcadores iguais**, não pelo tamanho de um marcador.
A SWD agrupa sob "unit chart" o isotype, o waffle (square area), o symbol chart e o pictorial chart. A
documentação do waffle do Observable Plot destaca a força: permite **ler quantidades exatas contando**. A
gramática ATOM (Park, Drucker, Fernandez, Elmqvist) define o caso extremo, a unit visualization, em que cada
item de dado vira um marcador próprio. Duas regras antigas atravessam a família: o Isotype de Otto e Marie
Neurath manda repetir o ícone, nunca aumentá-lo; e o FT manda usar isotype só com inteiros ("não corte um braço
para representar um decimal").

Perguntas típicas no Farol:

- **Comercial:** de cada 100 oportunidades encerradas, quantas foram ganhas? Quantas contas cada executivo carrega
  contra o teto de 150?
- **Pré-vendas:** das 90 agendas da meta semanal, quantas estão marcadas? Quais oportunidades abertas estão paradas
  há mais de 30 dias?
- **Marketing:** de cada 100 leads, quantos têm telefone e origem declarada? Das 38 vitórias, quantas vieram de
  mídia paga?
- **Diretoria:** "3 em cada 10 vitórias vieram de indicação". Custo e receita do trimestre em blocos de R$ 10 mil.

Quando não usar: valores grandes sem unidade agregada (contar 1.284 quadrados não informa); diferenças finas
entre categorias próximas (barra, 02); séries com muitas dimensões ao mesmo tempo (a SWD adverte que somar tempo e
outras variáveis sobrecarrega); público que lê unidades como infantil, ponto que a própria SWD registra.

## Decisões transversais da família

1. **Unidade declarada e sempre visível.** Legenda "1 quadrado = 1 lead" ou "1 ícone = 10 leads" (SWD). Mudar a
   unidade entre peças do mesmo painel exige aviso.
2. **Arredondamento que fecha o total.** Distribuir células pelo método do maior resto; nunca `Math.round` por
   categoria, que dá 99 ou 101 células.

   ```ts
   export function largestRemainder(values: number[], cells = 100): number[] {
     const total = values.reduce((s, v) => s + v, 0);
     if (total <= 0) return values.map(() => 0);
     const raw = values.map((v) => (v / total) * cells);
     const base = raw.map((r) => Math.floor(r));
     let left = cells - base.reduce((s, v) => s + v, 0);
     const order = raw.map((r, i) => [r - Math.floor(r), i] as const).sort((a, b) => b[0] - a[0]);
     for (const [, i] of order) {
       if (left <= 0) break;
       base[i] += 1;
       left -= 1;
     }
     return base;
   }
   ```
3. **Ordem de preenchimento fixa.** Padrão do kit: por colunas, de baixo para cima, da esquerda para a direita.
   Cada categoria forma um bloco contíguo e a fronteira vira uma escada de um degrau, o que atenua a dificuldade
   de linhas parciais que a SWD aponta. O `waffleY` do Observable Plot também cresce na vertical, como coluna empilhada.
4. **Unidade parcial.** Quadrado pode ter preenchimento parcial só na última célula e com aviso (o Observable Plot
   permite célula parcial na primeira ou última posição, e expõe `round` para arredondar). Ícone nunca é fatiado
   (FT; Data Visualisation Catalogue).
5. **Mesma grade entre small multiples.** Mesmas dimensões, mesma unidade, mesmo tamanho de célula.
6. **Vazio não é ausente.** Célula vazia em `var(--surface-overlay)`; dado ausente em contorno tracejado
   `var(--line-strong)` com o texto "indisponível" (`formatUnavailable()`); zero é grade vazia com "0".
7. **Performance.** Até uns 400 elementos, `div` em grid resolve; de 400 a uns 2.000, um SVG com `rect`; acima,
   agregar a unidade. Nada de um `PieChart` ou `BarChart` por célula.
8. **Acessibilidade.** Contêiner com `role="img"` e `aria-label` com a frase ("62 de 100 leads com telefone");
   células e ícones com `aria-hidden`. Quando a unidade é entidade clicável (modelo 7), cada marcador vira botão
   com rótulo, e a navegação por teclado segue a ordem de preenchimento.
9. **Ícones do lucide-react são contorno.** Tamanho 24 e `strokeWidth` 2 por padrão; reduzidos para 12 px viram
   ruído. Mínimo de 14 px com `strokeWidth` perto de 2,5, ou quadrado e círculo simples, que têm massa.
10. **Animação ajuda a leitura.** A SWD sugere construir o gráfico por partes ao vivo; a ATOM trata o
    reagrupamento animado como parte do desenho. Respeitar `prefers-reduced-motion`.

## Tabela de modelos

| # | Modelo | Quando usar | Quando evitar | Erro comum |
|---|---|---|---|---|
| 1 | Waffle 10x10 | uma fração em "x de 100" | fração com decimal que importa | preencher na ordem do DOM e espalhar a categoria |
| 2 | Waffle empilhado multicategoria | composição de 3 a 5 partes em 100 células | categoria abaixo de 1% relevante | `Math.round` por categoria fechando em 99 |
| 3 | Waffles comparativos | a mesma fração em vários grupos | grupos com n muito diferente sem n escrito | trocar a unidade entre waffles |
| 4 | Waffle em barras | contagem por categoria que o leitor quer contar | contagens acima de uns 300 por barra | número de células por linha variando entre barras |
| 5 | Pictograma isotype | contagem pequena com ícone que tem relação com a unidade | valores grandes ou decimais | ícone escalado ou fatiado |
| 6 | Matriz de ícones | "x em cada 100" para público amplo | quando a unidade não é pessoa | colorir ícones espalhados sem motivo |
| 7 | Unit chart por entidade | cada item real importa e pode ser aberto | mais de uns 1.500 itens | reordenar marcadores ao filtrar e perder a identidade |
| 8 | Parlamento | composição de um conjunto fixo de assentos ou vagas | contagem sem teto natural | atribuir grupos fileira por fileira |
| 9 | Área quadrada proporcional | totais de magnitude diferente na mesma unidade | diferença de 100 vezes ou mais | esquecer que a última linha parcial muda a forma |

---

## 1. Waffle 10x10

**Descrição.** Grade de 100 quadrados em que cada um vale 1%; colore-se a fração. A SWD o apresenta como
alternativa à pizza: as linhas da grade dão régua para contar e o retângulo é mais fácil de comparar que a
fatia. A Wikipedia registra estudo em que a pizza quadrada foi a mais precisa entre os formatos de pizza.

**Anatomia.** 10 por 10 quadrados com vão de 2 px; preenchidos em acento; vazios em superfície; número grande ao
lado; legenda de unidade; n real no rodapé ("n = 312").

**Abordagem na stack.** `html-tailwind`: `grid grid-cols-10 grid-rows-10 gap-0.5 aspect-square` com 100 `div`.
O CSS grid desenha por linha, de cima para baixo; a ordem de preenchimento vem do índice calculado:

```tsx
export function Waffle({ filled }: { filled: number }) {
  return (
    <div role="img" aria-label={`${filled} de 100`} className="grid aspect-square grid-cols-10 grid-rows-10 gap-0.5">
      {Array.from({ length: 100 }, (_, pos) => {
        const row = Math.floor(pos / 10);
        const col = pos % 10;
        const k = col * 10 + (9 - row); // colunas da esquerda para a direita, de baixo para cima
        return (
          <div key={pos} aria-hidden
            className={k < filled ? 'rounded-[2px] bg-[var(--chart-1)]' : 'rounded-[2px] bg-[var(--surface-overlay)]'} />
        );
      })}
    </div>
  );
}
```

**Ponto delicado.** Com decimal (62,4%), a grade mostra 62 e o número escreve 62,4%. `aspect-square` com `gap`
exige `grid-rows-10` explícito para as células não esticarem. Fração de 0,6% não ganha célula inteira: célula
parcial com aviso "menos de 1%".

**Versões sugeridas.**
- **V1 básica:** 62% dos leads do mês com telefone válido.
- **V2 com anotação:** contorno de 2 px na fronteira das 80 células da meta; a distância entre o bloco e o contorno é o que falta.
- **V3 densa do Farol:** "de cada 100 entradas da fila inbound, 71 foram tratadas no SLA", com tooltip por bloco trazendo a contagem real (221 de 312).
- **V4 caso limite:** 0,6% vira uma célula com 60% de preenchimento e o texto "menos de 1%"; dado indisponível vira grade tracejada com "indisponível".

**Referências.**
- Praticante: [Storytelling with Data, what is a square area chart](https://www.storytellingwithdata.com/blog/what-is-a-square-area-chart): observar o argumento da grade como régua e a sugestão de montar ao vivo.
- Catálogo: [FT Visual Vocabulary, README](https://raw.githubusercontent.com/Financial-Times/chart-doctor/main/visual-vocabulary/README.md): observar o gridplot "bom para percentual, melhor com inteiros".
- Catálogo: [Python Graph Gallery, waffle chart](https://python-graph-gallery.com/waffle-chart/): observar linhas, colunas e legenda com proporções.
- Portal de design: [Behance, Waffle Chart](https://www.behance.net/gallery/145150905/Waffle-Chart): infográfico de preço comparado entre países; observar a escolha de comunicar diferença relativa sem despejar números crus.
- Portal de design: [Figma Community, waffles](https://www.figma.com/community/file/1271360341439247258/waffles) (não abriu): arquivo dedicado a waffle, segundo a varredura de portais do projeto.

**Mora melhor em outra família?** Uma fração contra meta que pode passar de 100%: progresso (13).

---

## 2. Waffle empilhado multicategoria

**Descrição.** As 100 células divididas entre três a cinco categorias contíguas: composição contável. A SWD
alerta que categorias em linhas parciais dificultam a comparação e pede anotação; a Python Graph Gallery mostra a
legenda com proporção ao lado do nome.

**Anatomia.** Blocos contíguos na ordem da legenda; legenda com contagem e percentual; "Sem informação" no fim,
hachurado.

**Abordagem na stack.** `html-tailwind` com o `largestRemainder` das decisões transversais para as contagens e um
mapa índice para categoria montado em ordem.

**Ponto delicado.** A soma precisa fechar em 100. Categoria de 0,4% some no arredondamento; a regra "todo valor
positivo ganha ao menos uma célula" distorce, e o kit prefere listar a categoria na legenda com "menos de uma
célula". Ordem: maior primeiro, ou ordem natural quando existir.

**Versões sugeridas.**
- **V1 básica:** 100 oportunidades encerradas: ganhas 18, perdidas 64, desqualificadas 18.
- **V2 com destaque:** só "ganhas" em acento; as outras em dois neutros.
- **V3 densa do Farol:** leads do trimestre por origem (formulário, mídia paga, indicação, evento, outros), 1 célula = 1% de 1.284, contagem absoluta na legenda.
- **V4 caso limite:** "Sem informação" com 9% hachurado no fim, fora da ordem; "parceiro" com 0,3% listado na legenda sem célula.

**Referências.**
- Catálogo: [R Graph Gallery, waffle](https://r-graph-gallery.com/waffle.html): observar o waffle empilhado e as alternativas listadas (treemap, pizza, barra empilhada).
- Catálogo: [Python Graph Gallery, waffle chart](https://python-graph-gallery.com/waffle-chart/): observar legenda com proporção e waffles com ícone.
- Praticante: [Storytelling with Data, what is a square area chart](https://www.storytellingwithdata.com/blog/what-is-a-square-area-chart): observar o alerta sobre linhas parciais e a anotação extra.
- Portal de design: [Behance, Legislativas 2022: Resultados (Waffle Chart)](https://www.behance.net/gallery/148772539/Legislativas-2022-Resultados-%28Waffle-Chart%29): resultado eleitoral em waffle feito em ferramenta de BI (a página traz só metadados).

**Mora melhor em outra família?** Com mais de cinco categorias, barra 100% (02) ou treemap (12).

---

## 3. Waffles comparativos

**Descrição.** Um waffle por grupo, todos com a mesma grade e a mesma unidade. O FT diz que o gridplot "funciona
bem em forma de múltiplos"; o Observable Plot mostra a comparação de demografia por sexo com waffles lado a lado.

**Anatomia.** Grade de waffles alinhados; número e n sobre cada um; legenda única; grupos ordenados pela fração
ou pela ordem natural.

**Abordagem na stack.** `html-tailwind`: `grid grid-cols-2 md:grid-cols-4 gap-4` repetindo o componente `Waffle`.
Quando a grade vira matriz (linhas e colunas com significado), cabeçalhos de linha e coluna em `grid` externo.

**Ponto delicado.** A grade igual esconde o tamanho da amostra: n escrito em cada waffle, e selo de amostra
pequena abaixo de um mínimo (n menor que 30). Nunca misturar "1 célula = 1%" num e "1 célula = 1 lead" em outro.

**Versões sugeridas.**
- **V1 básica:** taxa de comparecimento por fila, três waffles.
- **V2 com destaque:** grupos ordenados pela fração e o pior em cor cheia.
- **V3 densa do Farol:** cobertura de origem por plataforma de mídia e mês, 3 plataformas por 3 meses, nove waffles em matriz com rótulos.
- **V4 caso limite:** grupo com n = 7: waffle cinza com "n = 7, fração não exibida", ou troca para 1 célula = 1 lead com sete células e nota.

**Referências.**
- Catálogo: [FT Visual Vocabulary, README](https://raw.githubusercontent.com/Financial-Times/chart-doctor/main/visual-vocabulary/README.md): observar o gridplot em múltiplos.
- Catálogo: [Observable Plot, documentação do waffle (fonte)](https://raw.githubusercontent.com/observablehq/plot/main/docs/marks/waffle.md): observar os exemplos por grupo e a opção `multiple`.
- Catálogo: [Python Graph Gallery, waffle chart](https://python-graph-gallery.com/waffle-chart/): observar waffles empilhados para comparar conjuntos.
- Portal de design: nenhuma referência específica aberta nesta pesquisa.

**Mora melhor em outra família?** Muitos grupos com uma fração cada: tabela com barra em célula (14).

---

## 4. Waffle em barras

**Descrição.** Colunas ou barras feitas de células contáveis, sobre um eixo de categorias. O Observable Plot tem
`waffleY` e `waffleX`, escolhe sozinho quantas células por linha para mantê-las quadradas, e expõe `unit`
(quanto vale cada célula), `multiple` (células por linha), `gap` e `round`. No Behance, um projeto de waffle em
barras acompanha reuniões ao longo do tempo com um brush de período.

**Anatomia.** Eixo de categorias; colunas de células; valor no topo; legenda de unidade; linha de referência
opcional.

**Abordagem na stack.** `recharts-custom`: `BarChart` normal para eixos, tooltip, ordenação e `ReferenceLine`, com
`Bar shape={WaffleBar}`; o `WaffleBar` recebe `x`, `y`, `width`, `height` e o `payload`, e desenha os `rect`
empilhados de baixo para cima:

```tsx
type ShapeProps = { x?: number; y?: number; width?: number; height?: number; payload?: { value: number } };

export function makeWaffleBar(unit: number, perRow: number, gap = 1) {
  return function WaffleBar({ x = 0, y = 0, width = 0, height = 0, payload }: ShapeProps) {
    const units = (payload?.value ?? 0) / unit;
    const cell = (width - gap * (perRow - 1)) / perRow;
    const base = y + height;
    const cells = Array.from({ length: Math.ceil(units) }, (_, i) => {
      const col = i % perRow;
      const row = Math.floor(i / perRow);
      const frac = Math.min(1, units - i); // última célula pode ser parcial
      return (
        <rect key={i} x={x + col * (cell + gap)} y={base - (row + 1) * (cell + gap) + gap}
          width={cell * frac} height={cell} rx={1} fill="var(--chart-1)" />
      );
    });
    return <g aria-hidden>{cells}</g>;
  };
}
```

**Ponto delicado.** A altura que o Recharts calcula para a barra precisa bater com a altura das células; com
células quadradas isso só acontece se o domínio do `YAxis` for escolhido para a razão entre largura de banda e
altura do gráfico. Na prática o kit fixa `perRow` e deixa o eixo Y oculto, com o valor escrito no topo. A largura
de banda muda com o número de categorias; `perRow` precisa ser o mesmo para todas as barras.

**Versões sugeridas.**
- **V1 básica:** agendas por dia útil da semana, 1 célula = 1 agenda.
- **V2 com anotação:** meta diária de 18 como `ReferenceLine` atravessando as colunas.
- **V3 densa do Farol:** oportunidades ganhas por mês de 2026 empilhadas por origem, 1 célula = 1 oportunidade; clicar numa célula abre a oportunidade.
- **V4 caso limite:** mês com 347 leads: 1 célula = 10 leads e a última com 70% de largura, legenda "1 célula = 10 leads, última parcial".

**Referências.**
- Catálogo: [Observable Plot, documentação do waffle (fonte)](https://raw.githubusercontent.com/observablehq/plot/main/docs/marks/waffle.md): observar `unit`, `multiple`, `gap`, `round` e as células parciais.
- Portal de design: [Behance, D3.js Waffle Bar](https://www.behance.net/gallery/235904365/D3js-Waffle-Bar): barras de células para reuniões com partes interessadas, com brush de período e contêiner responsivo.
- Catálogo: [FT Visual Vocabulary, README](https://raw.githubusercontent.com/Financial-Times/chart-doctor/main/visual-vocabulary/README.md): observar a regra de inteiros para unidades.

**Mora melhor em outra família?** Contagem grande por categoria sem necessidade de contar: colunas (03).

---

## 5. Pictograma isotype

**Descrição.** Fileiras de ícones iguais, cada um valendo uma quantidade fixa; mais quantidade é mais ícones,
nunca ícone maior. O princípio vem do Isotype (Otto Neurath, Marie Neurath como transformadora dos dados, Gerd
Arntz nos símbolos). A Vega-Lite mostra o "Isotype Dot Plot" de rebanhos por país com um `shape` SVG por animal.
A Data Visualisation Catalogue alerta contra conjuntos grandes (difíceis de contar) e ícones parciais.

**Anatomia.** Rótulo de categoria à esquerda; fileira de ícones com espaçamento fixo; número no fim da fileira;
legenda "1 ícone = N".

**Abordagem na stack.** `html-tailwind` com `lucide-react`: `flex flex-wrap gap-1` e
`Array.from({ length: n }, (_, i) => <User key={i} size={16} strokeWidth={2.5} aria-hidden />)`, cor por
`className="text-[var(--chart-1)]"`. Para agendas, `CalendarCheck`; para contas, quadrado simples.

**Ponto delicado.** O ícone precisa ter relação com a unidade: pessoa para contato, não para oportunidade. Nunca
cortar ícone (FT): arredondar para ícones inteiros e escrever o valor exato no fim da fileira. Acima de uns 50
ícones por fileira, aumentar a unidade. Ícone de contorno em tema escuro perde massa; testar a 14 px contra
`--surface-raised`.

**Versões sugeridas.**
- **V1 básica:** vitórias do semestre por origem, 1 ícone = 1 vitória: indicação 14, cliente ativo 11, mídia paga 3.
- **V2 com anotação:** a fileira de mídia paga em destaque com a nota "3 vitórias com 56% do volume de leads".
- **V3 densa do Farol:** composição da área por função (SDR 5, executivo 6, marketing 3, gestão 2) com ícone de pessoa, e o custo mensal da função escrito ao lado.
- **V4 caso limite:** 347 leads com 1 ícone = 10 leads: 34 ícones inteiros e o número "347"; sem 35º ícone cortado.

**Referências.**
- Praticante: [Wikipedia, Isotype (picture language)](https://en.wikipedia.org/wiki/Isotype_(picture_language)): observar a regra de repetir o pictograma em vez de aumentá-lo.
- Praticante: [Isotype Revisited](https://isotyperevisited.org/): acervo de pesquisa sobre o método; observar a seção sobre estatística pictórica e o método de Viena.
- Catálogo: [Vega-Lite, galeria](https://vega.github.io/vega-lite/examples/) e [Isotype Dot Plot](https://vega.github.io/vega-lite/examples/isotype_bar_chart.html): observar o `shape` por categoria e a linha por país.
- Catálogo: [Data Visualisation Catalogue, pictogram chart](https://datavizcatalogue.com/methods/pictogram.html): observar os dois alertas (conjunto grande e ícone parcial).
- Portal de design: [Behance, FB ITALIAN USERS, Isotype](https://www.behance.net/gallery/20150529/FB-ITALIAN-USERS_-Isotype): exercício acadêmico que aplica as regras do Isotype a dados de uso de rede social.
- Portal de design: [Behance, Information Design, Isotype poster](https://www.behance.net/gallery/59642365/Information-Design-Isotype-poster): cartaz de saúde pública com repetição de ícones padronizados.

**Mora melhor em outra família?** Valores grandes: barra (02) com o número.

---

## 6. Matriz de ícones

**Descrição.** Grade de 10 por 10 pessoas em que parte está colorida: "x em cada 100". A Vega-Lite mostra o
"Isotype Grid" com 100 figuras em dez colunas e seleção por arraste que acende as marcadas. A SWD aponta a
conexão humana que o formato provoca; o Nightingale ("Showing Human Stories Behind Data Points") trata a
desagregação em indivíduos como recurso de contexto.

**Anatomia.** 100 ícones; os x coloridos em bloco; frase de leitura ("3 em cada 10"); segunda cor opcional para
subgrupo.

**Abordagem na stack.** `html-tailwind` com `grid grid-cols-10` e `User` do lucide-react, usando o mesmo mapa de
preenchimento do waffle.

**Ponto delicado.** Pessoa só quando a unidade é pessoa (lead, contato); para oportunidade ou conta, quadrado.
Densidade: 100 ícones em 240 px são 24 px por ícone, o limite prático. Colorir em bloco facilita contar; colorir
espalhado sugere acaso e só cabe quando a mensagem é probabilidade.

**Versões sugeridas.**
- **V1 básica:** 3 em cada 10 vitórias vieram de indicação.
- **V2 com destaque:** hover na legenda acende os ícones da categoria, como a seleção da Vega-Lite.
- **V3 densa do Farol:** de cada 100 leads de mídia paga, 58 com telefone, 21 qualificados e 4 com agenda; a venda (0,6) aparece só como texto.
- **V4 caso limite:** fração de 0,4 em 100: nenhum ícone colorido e a frase "menos de 1 em cada 100 (4 em 1.000)".

**Referências.**
- Catálogo: [Vega-Lite, Isotype Grid](https://vega.github.io/vega-lite/examples/isotype_grid.html): observar o cálculo de coluna e linha por `id` e a seleção por intervalo.
- Praticante: [Storytelling with Data, what is a unit chart](https://www.storytellingwithdata.com/blog/what-is-a-unit-chart): observar símbolo reconhecível, legenda de unidade e o alerta contra dimensões demais.
- Praticante: [Nightingale, Showing Human Stories Behind Data Points](https://nightingaledvs.com/showing-human-stories-behind-data-points/): observar desagregar para indivíduos e anotar pontos específicos.
- Portal de design: [Behance, Como as pessoas estão se exercitando na quarentena?](https://www.behance.net/gallery/115376469/Como-as-pessoas-estao-se-exercitando-na-quarentena): pictograma isométrico em português; descrição pelo título na busca do Behance.

**Mora melhor em outra família?** Fração sem apelo humano: waffle 10x10 (modelo 1).

---

## 7. Unit chart por entidade

**Descrição.** Um marcador por item real (oportunidade, conta, lead), agrupado e ordenado por categorias; o
marcador abre o item. A ATOM descreve o layout por divisões recursivas até cada item ter tamanho e posição. É
diferente do waffle: a unidade é a entidade, não uma fração.

**Anatomia.** Grupos lado a lado (colunas por etapa); marcadores quadrados de 8 a 12 px; cor por atributo (dias
sem movimento); contagem no topo do grupo; tooltip com os dados do item; moldura opcional de teto.

**Abordagem na stack.** `svg-puro` com layout em TypeScript (grade dentro de cada grupo, de baixo para cima), ou
`html-tailwind` com `flex flex-wrap-reverse content-start` por grupo quando são até uns 300 itens. Reagrupamento
animado por `transform` com chave estável por entidade (técnica de medir antes e depois e interpolar).

**Ponto delicado.** Chave estável por entidade, senão a animação embaralha. Ordem dentro do grupo pelo atributo
de cor, para formar gradiente legível. Filtrar remove marcadores, não os reposiciona ao acaso. Acima de uns 1.500
itens, agregar a unidade e avisar.

**Versões sugeridas.**
- **V1 básica:** 58 oportunidades abertas por etapa, 1 quadrado cada.
- **V2 com anotação:** cor por dias sem movimento (até 15, 16 a 30, mais de 30 em `--warning`), ordem por dias dentro da etapa e a nota "19 paradas há mais de 30 dias".
- **V3 densa do Farol:** carteira de contas por executivo, seis colunas com até 150 quadrados, moldura do teto de 150; trocar o agrupamento para segmento anima o reagrupamento.
- **V4 caso limite:** item sem etapa vai para o grupo "sem etapa" com contorno tracejado; recorte de 1.900 leads passa sozinho para 1 quadrado = 10 leads, com aviso.

**Referências.**
- Praticante: [Microsoft Research, ATOM: A Grammar for Unit Visualizations](https://www.microsoft.com/en-us/research/publication/atom-a-grammar-for-unit-visualizations/): observar a definição de unit visualization e as operações recursivas de layout.
- Praticante: [Storytelling with Data, what is a unit chart](https://www.storytellingwithdata.com/blog/what-is-a-unit-chart): observar animação para apresentação e tamanho de símbolo constante.
- Praticante: [Nightingale, Showing Human Stories Behind Data Points](https://nightingaledvs.com/showing-human-stories-behind-data-points/): observar variação estética leve sem sugerir significado e a escala como decisão do projeto.
- Portal de design: nenhuma referência específica aberta nesta pesquisa.

**Mora melhor em outra família?** Distribuição de um valor contínuo por item: beeswarm (16).

---

## 8. Parlamento

**Descrição.** Assentos em fileiras concêntricas de um semicírculo, coloridos por grupo em ordem angular. O FT
define o "arc" como hemiciclo usado para resultados de parlamento. A ferramenta de diagramas de parlamento da
Wikimedia gera arco, disposição em fileiras compactas e estilo de bancadas opostas, com saída SVG.

**Anatomia.** Fileiras de pontos; grupos da esquerda para a direita; total no centro da base; linha de maioria
ou de teto opcional.

**Abordagem na stack.** `svg-puro`. Assentos por fileira proporcionais ao raio, e grupos atribuídos pela ordem
angular de todos os assentos:

```ts
export type Seat = { a: number; x: number; y: number };

export function hemicycle(total: number, rows: number, r0: number, r1: number): Seat[] {
  const radii = Array.from({ length: rows }, (_, i) => r0 + ((r1 - r0) * i) / Math.max(rows - 1, 1));
  const sum = radii.reduce((s, r) => s + r, 0);
  const perRow = radii.map((r) => Math.floor((total * r) / sum));
  let rest = total - perRow.reduce((s, n) => s + n, 0);
  for (let i = rows - 1; rest > 0; i = (i - 1 + rows) % rows, rest--) perRow[i] += 1;
  const seats = radii.flatMap((r, i) =>
    Array.from({ length: perRow[i] }, (_, j) => {
      const a = Math.PI * (1 - (perRow[i] === 1 ? 0.5 : j / (perRow[i] - 1)));
      return { a, x: r * Math.cos(a), y: -r * Math.sin(a) };
    }),
  );
  return seats.sort((p, q) => q.a - p.a); // da esquerda (ângulo π) para a direita (ângulo 0)
}
```

Depois, os `total` assentos ordenados recebem os grupos em sequência (os primeiros N1 para o grupo 1 e assim por
diante), e cada assento vira um `circle` com raio limitado pelo menor espaçamento entre vizinhos.

**Ponto delicado.** Atribuir grupos fileira por fileira produz faixas radiais que não se leem como blocos; a
atribuição é global por ângulo. Raio do ponto calculado pelo menor espaçamento, senão pontos se sobrepõem na
fileira interna. Acima de uns 400 assentos os pontos somem; abaixo de uns 10, uma fileira só com pontos grandes.

**Versões sugeridas.**
- **V1 básica:** 150 contas da carteira de um executivo por segmento.
- **V2 com anotação:** 150 assentos como teto de capacidade; ocupados por status (ativa, em risco) e vazios em superfície, com "132 de 150".
- **V3 densa do Farol:** 66 vitórias do ano por origem em hemiciclo, com a linha de maioria em 34: indicação e cliente ativo juntos passam da metade.
- **V4 caso limite:** total 7 (uma fileira, pontos grandes) e total 900 (trocar para waffle ou 1 assento = 10).

**Referências.**
- Catálogo: [Highcharts, parliament chart](https://www.highcharts.com/demo/highcharts/parliament-chart): a página abriu só com título; é a série de itens em arco.
- Catálogo: [FT Visual Vocabulary, README](https://raw.githubusercontent.com/Financial-Times/chart-doctor/main/visual-vocabulary/README.md): observar a definição de arc.
- Praticante: [Parliament diagram tool (Wikimedia Toolforge)](https://parliamentdiagram.toolforge.org/): observar as disposições em arco, estilo americano e bancadas opostas, e a opção de fileiras compactas.
- Portal de design: [Behance, Women's Representation in Romanian Parliament](https://www.behance.net/gallery/223305443/Womens-Representation-in-Romanian-Parliament): tema parlamentar resolvido com barras e percentuais em vez de hemiciclo; bom contraponto sobre quando o arco não precisa entrar.

**Mora melhor em outra família?** Contagem sem teto natural: waffle em barras (modelo 4).

---

## 9. Área quadrada proporcional

**Descrição.** Quadrados de grade com a mesma célula e totais diferentes: o lado cresce com a raiz do total. A
SWD destaca que o quadrado usa altura e largura e compara números de magnitudes diferentes em menos espaço.

**Anatomia.** Dois ou mais quadrados de grade alinhados pela base; mesma célula ("1 célula = 5 leads"); número
sob cada quadrado.

**Abordagem na stack.** `html-tailwind`: `grid` com `gridTemplateColumns: repeat(side, 8px)`, onde
`side = Math.ceil(Math.sqrt(n))`, e a última linha incompleta.

**Ponto delicado.** A última linha parcial muda a forma; declarar a unidade e escrever o n. Comparar áreas é
aproximado (Few cita a lei de Stevens), por isso o número é obrigatório. Diferença de 100 vezes ou mais deixa o
menor com uma célula; aí o formato já não serve.

**Versões sugeridas.**
- **V1 básica:** funil do semestre com 1 célula = 5: leads 1.284 (257 células), oportunidades 212 (43), vitórias 38 (8).
- **V2 com destaque:** dentro do quadrado de leads, as células que viraram oportunidade acesas.
- **V3 densa do Farol:** custo do trimestre (R$ 1.930 mil, 193 células de R$ 10 mil) ao lado da receita reconhecida (R$ 2.480 mil, 248 células), para a diretoria.
- **V4 caso limite:** um total 200 vezes menor que o outro: o menor vira uma célula, e a peça troca para número com barra (01 ou 13).

**Referências.**
- Praticante: [Storytelling with Data, what is a square area chart](https://www.storytellingwithdata.com/blog/what-is-a-square-area-chart): observar a comparação de magnitudes diferentes com altura e largura.
- Praticante: [Stephen Few, Save the Pies for Dessert (PDF)](https://www.perceptualedge.com/articles/visual_business_intelligence/save_the_pies_for_dessert.pdf): observar a subestimação de área (círculo 16 vezes maior).
- Catálogo: [Data Visualisation Catalogue, índice](https://datavizcatalogue.com/): observar o gráfico de área proporcional listado como vizinho da família.
- Portal de design: nenhuma referência específica aberta nesta pesquisa.

**Mora melhor em outra família?** Funil de etapas: família 10.

---

## Modelos vistos nas fontes que moram em outra família

- **Calendário de células (1 célula por dia):** 15.
- **Mapa de densidade de pontos:** 23.
- **Beeswarm e dot plot de Wilkinson:** 16.
- **Anel segmentado em unidades:** 07, modelo 13.
- **Faixa de status temporal em célula:** 14.
- **Pizza quadrada:** é o waffle 10x10 (modelo 1); a família 06 só cita.

## Fontes consultadas

- Storytelling with Data, guia de gráficos: https://www.storytellingwithdata.com/chart-guide
- Storytelling with Data, what is a unit chart: https://www.storytellingwithdata.com/blog/what-is-a-unit-chart
- Storytelling with Data, what is a square area chart: https://www.storytellingwithdata.com/blog/what-is-a-square-area-chart
- Observable Plot, documentação do waffle (fonte no GitHub): https://raw.githubusercontent.com/observablehq/plot/main/docs/marks/waffle.md
- FT Visual Vocabulary (pasta): https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary
- FT Visual Vocabulary (README): https://raw.githubusercontent.com/Financial-Times/chart-doctor/main/visual-vocabulary/README.md
- Data Visualisation Catalogue, índice: https://datavizcatalogue.com/
- Data Visualisation Catalogue, pictogram chart: https://datavizcatalogue.com/methods/pictogram.html
- From Data to Viz, caveat pie (waffle como alternativa): https://www.data-to-viz.com/caveat/pie.html
- Vega-Lite, galeria: https://vega.github.io/vega-lite/examples/
- Vega-Lite, Isotype Dot Plot: https://vega.github.io/vega-lite/examples/isotype_bar_chart.html
- Vega-Lite, Isotype Grid: https://vega.github.io/vega-lite/examples/isotype_grid.html
- Nivo, waffle: https://nivo.rocks/waffle/ (componente em SVG, HTML e canvas, célula customizável e séries ocultáveis)
- Highcharts, parliament chart: https://www.highcharts.com/demo/highcharts/parliament-chart
- Python Graph Gallery, waffle chart: https://python-graph-gallery.com/waffle-chart/
- R Graph Gallery, waffle: https://r-graph-gallery.com/waffle.html
- Wikipedia, Isotype (picture language): https://en.wikipedia.org/wiki/Isotype_(picture_language)
- Wikipedia, pie chart (pizza quadrada): https://en.wikipedia.org/wiki/Pie_chart
- Isotype Revisited: https://isotyperevisited.org/
- Microsoft Research, ATOM: https://www.microsoft.com/en-us/research/publication/atom-a-grammar-for-unit-visualizations/
- Parliament diagram tool: https://parliamentdiagram.toolforge.org/
- Nightingale, Showing Human Stories Behind Data Points: https://nightingaledvs.com/showing-human-stories-behind-data-points/
- Stephen Few, Save the Pies for Dessert: https://www.perceptualedge.com/articles/visual_business_intelligence/save_the_pies_for_dessert.pdf
- Behance, Waffle Chart: https://www.behance.net/gallery/145150905/Waffle-Chart
- Behance, D3.js Waffle Bar: https://www.behance.net/gallery/235904365/D3js-Waffle-Bar
- Behance, Legislativas 2022: Resultados (Waffle Chart): https://www.behance.net/gallery/148772539/Legislativas-2022-Resultados-%28Waffle-Chart%29
- Behance, FB ITALIAN USERS, Isotype: https://www.behance.net/gallery/20150529/FB-ITALIAN-USERS_-Isotype
- Behance, Information Design, Isotype poster: https://www.behance.net/gallery/59642365/Information-Design-Isotype-poster
- Behance, Women's Representation in Romanian Parliament: https://www.behance.net/gallery/223305443/Womens-Representation-in-Romanian-Parliament
- Behance, Como as pessoas estão se exercitando na quarentena? (apareceu na busca, não aberto por mim): https://www.behance.net/gallery/115376469/Como-as-pessoas-estao-se-exercitando-na-quarentena
- Dribbble, Waffle chart (não abriu): https://dribbble.com/shots/24115728-Waffle-chart
- Figma Community, waffles (não abriu): https://www.figma.com/community/file/1271360341439247258/waffles

Buscas no Nightingale por "waffle", "unit chart" e "parliament" não trouxeram artigo específico da família; o
único aproveitado foi o de histórias humanas. O verbete de parlamento da Wikipedia no endereço tentado deu 404.

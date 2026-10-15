# Revisão de 14_tabelas-visuais/04_scorecard-tabular, 2026-10-14

Julgada: `v4_cobertura-denominador-pequeno-e-lacuna`, em `revisao_desatualizada` (o `Chart.tsx` mudou depois do aceite de 2026-09-19: o trilho da barra passou de `bg-surface-overlay` a `bg-surface-sunken`). Julgado o arquivo de hoje, não a nota antiga. `check` com 0 erros e 0 avisos; PNGs de 2026-10-02, mais novos que o `Chart.tsx` de 2026-09-28.

Resultado: `v4` reprovada, com três bloqueantes da mesma classe da seção 14.1, "versão que não demonstra o que o catálogo diz". Os três já constavam como "Não resolvido nesta rodada" na seção "Correção de 2026-09-19" do README e passaram como observação no aceite anterior; o catálogo (`_estudo/catalogo/14_tabelas-visuais/04_scorecard-tabular.json`) não mudou e continua pedindo os três. O `meta.json` reescreveu os itens 3 e 4 de `o_que_demonstra` para caber no código, o mesmo mecanismo que escondeu a barra ausente no primeiro reprovo. Observações não bloqueantes no README, parágrafo de 2026-10-14.

## v4_cobertura-denominador-pequeno-e-lacuna: reprovada

```
Versão: 14_tabelas-visuais/04_scorecard-tabular/v4_cobertura-denominador-pequeno-e-lacuna
Data: 2026-10-14
Resultado: reprovada
Não: 1
Correções:
  1. Catálogo, item 4 e resumo do modelo: declarar a lacuna de Cidade uma vez no cabeçalho da coluna, sem repetir "indisponível" nas sete células.
  1. Catálogo, item 4, EST-4 e NUM-4: demonstrar a métrica nova que escreve "sem base".
  1. Catálogo, item 3: esmaecer com ícone a taxa de agendamento das origens com telefone abaixo de 50% de cobertura.
Não se aplica: 3, 6, 13, 18, 26, 27, 28, 29, 30, 31, 32
```

### Bloqueante 1: pergunta 1, catálogo item 4 ("Coluna inteira LACUNA declarada uma vez no cabeçalho")

- **O que o catálogo pede.** Item 4: "Coluna inteira LACUNA declarada uma vez no cabeçalho". Resumo do modelo: "declarando a lacuna uma vez em vez de repetir a palavra em cada célula". Estudo da família, `_estudo/familias/14_tabelas-visuais.md:679`: "Uma coluna inteira LACUNA vira um único aviso no cabeçalho, não 14 células repetindo a palavra."
- **O que a peça faz.** O `<th>` de Cidade (`Chart.tsx:104` a `109`) leva só o ícone `Unplug`, sem palavra e sem motivo. Cada uma das sete linhas escreve ícone mais `formatUnavailable()` (`Chart.tsx:128` a `133`), e o motivo mora no rodapé (`Chart.tsx:148`). Nos dois PNGs a coluna tem 8 ícones e 7 vezes "indisponível"; `preview.svg` e `preview-claro.svg` têm 7 ocorrências da palavra cada.
- **Por que reprova.** A versão desenha justamente o que o catálogo diz que o modelo evita. O comentário do topo (`Chart.tsx:13`) ainda afirma que o motivo "mora só no cabeçalho da coluna", o que o desenho não faz.
- **O que mudar.** O aviso único sobe para o `<th>` de Cidade: ícone, `formatUnavailable()` e o motivo curto (por exemplo "campo não coletado em nenhuma origem", em 11 px numa segunda linha do cabeçalho se não couber na primeira). O corpo da coluna vira uma única célula com `rowSpan={data.length}`, sem repetir a palavra linha a linha; a EST-2 continua atendida porque a ausência está escrita uma vez, com o ícone. O rodapé, o comentário do topo e a frase acessível passam a dizer onde o aviso está; a frase hoje lista "cidade" entre os campos de cobertura como se fosse medida, e deve dizer que é indisponível em toda origem. A coluna estreita libera largura para o bloqueante 2.

### Bloqueante 2: pergunta 1, catálogo item 4 ("métrica nova escreve sem base"), EST-4 e NUM-4

- **O que o catálogo pede.** Segunda metade do item 4: "métrica nova escreve sem base". O "Quando evitar" do modelo repete: "Métrica nova sem período anterior exibida com percentual de variação: escreva sem base".
- **O que a peça faz.** Não há variação contra período anterior em lugar nenhum: o `data.ts` não tem campo de mês anterior e o `Chart.tsx` não tem coluna nem linha de apoio de variação. O `meta.json` tirou o item da lista ("motivo declarado uma vez no rodapé, não por célula"). Nenhuma outra versão do modelo demonstra o caso (observação de 2026-09-19 no README), então ele não tem casa no acervo.
- **Por que reprova.** É item do catálogo para esta versão, e a versão não o demonstra.
- **O que mudar.** Acrescentar ao `data.ts` os leads do mês anterior por origem (`previousVolume: number | null`) e escrever a variação dos leads com sinal tipográfico e base nomeada na mesma linha (NUM-3, NUM-4: "+12% contra 368 em jul/26"), na célula de Leads como linha de apoio de 11 px ou numa coluna estreita. Uma origem nova (o `Webinar piloto` cabe no papel, com `previousVolume: null`) escreve "sem base" no lugar do percentual (EST-4), nunca 0% nem +100%. O `meta.json` volta a listar o item como o catálogo o escreve. Se o dono preferir tirar o caso do catálogo, a decisão é dele; até lá, vale o catálogo.

### Bloqueante 3: pergunta 1, catálogo item 3 ("Taxa com cobertura abaixo de 50% em text-muted com ícone")

- **O que o catálogo pede.** Item 3: "Taxa com cobertura abaixo de 50% em text-muted com ícone, sem opacidade". O "Quando usar" do modelo diz para que serve: "para não ler taxa de 20% da base como a base inteira". O estudo da família, de onde o item vem, desfaz a dúvida de leitura: "abaixo de cobertura mínima, taxa esmaecida com ícone" (`14_tabelas-visuais.md:678`) e "taxa de agenda, esmaecida onde a cobertura de telefone está abaixo de 50%" (`:688`). A taxa esmaecida é a de agendamento, pela cobertura do campo de que ela depende.
- **O que a peça faz.** Esmaece o próprio percentual de cobertura (`low = flagLow && coverage < LOW_COVERAGE`, `Chart.tsx:52`) e chama a coluna de agendamento com `flagLow={false}` (`Chart.tsx:135`), de modo que a taxa nunca esmaece. O rodapé publica a regra contrária: "Agendamento não leva barra nem aviso: taxa baixa é o KPI, não falha de coleta." Nos dois PNGs, Rede profissional (telefone 45%) e Formulário do site (telefone 32%) escrevem o agendamento "22% (19 de 88)" e "14% (9 de 63)" em `text-primary`, peso 600, com a mesma firmeza da Indicação, que tem 93% de telefone.
- **Por que reprova.** O item não é sobre a taxa ser baixa, é sobre a confiança dela: com mais da metade dos leads sem telefone, agendamento baixo pode ser justamente falha de coleta. A peça diz ao leitor o oposto, que essas duas taxas valem tanto quanto as outras, que é a leitura que o modelo existe para impedir.
- **O que mudar.** Passar a cobertura de telefone da linha para a célula de agendamento e, abaixo de `LOW_COVERAGE`, escrever a taxa em `text-text-muted` com `TriangleAlert` (`aria-hidden`), sem opacidade (ACE-4). Reescrever o rodapé com a regra certa ("abaixo de 50% de telefone, a taxa de agendamento fica cinza com aviso: foi medida numa base em que mais da metade dos leads não tem telefone") e fazer a frase acessível nomear as origens afetadas. Manter ou tirar o cinza da própria cobertura fica a critério do produtor, desde que o rodapé descreva o que a tela faz. O item 4 do `meta.json` volta ao texto do catálogo.

### O que foi conferido e está certo na v4

Barra de 0 a 100% com o percentual ao lado em telefone e cargo: domínio fixo, trilho de 38 px internos igual em toda linha (73% de Mídia social pinta 27,84 px), zero medido desenha o trilho vazio e escreve "0 de 2 (0%)" (EST-3), trilho de 0% visível nos dois temas pela borda `line-subtle`. Fração e percentual sempre juntos, com a fração em destaque abaixo de 10 leads (Evento regional "3 de 4", Webinar piloto "2 de 2"). Cor única `--chart-1` para a única série, nenhum semântico, nenhum `--prov-*` em marca, sem opacidade. Tamanhos 12 e 11 px, pesos 400, 500 e 600, nenhum 700, texto horizontal, número à direita. Pares de texto (`text-primary`, `text-secondary`, `text-muted` sobre `--surface-raised`) todos aprovados na 17.10; medidos à mão porque `CONTRASTE-TEXTO` não mede texto em HTML. Frase acessível de 164 caracteres começando por "Tabela". Dado fictício, nenhum corte ou transbordo no canvas `largo`.

### Observações que podem ir junto (não bloqueiam)

Estão no README: fração entre parênteses sem `tabular-nums` (TIP-1); barra pintada de 10 px de altura contra os 12 px que o comentário de `BAR_HEIGHT` promete; deriva de linha de base entre colunas da mesma linha; `RatePair` com denominador zero sem o ícone `Unplug`; frase acessível que não nomeia origens nem cita o cargo; `role="table"` na raiz que envolve outro `<table>`. Seguem valendo as de 2026-09-19: vazio sem bloco `role="status"` (EST-1), barras sem origem comum entre linhas e agendamento com percentual inteiro em vez de uma casa (NUM-1).

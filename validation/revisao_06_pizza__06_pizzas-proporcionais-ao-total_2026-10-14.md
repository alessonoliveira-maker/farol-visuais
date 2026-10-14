# Revisão de 06_pizza/06_pizzas-proporcionais-ao-total, 2026-10-14

Julgadas: `v2_legenda-de-tamanho`, `v3_leads-por-plataforma-e-qualificacao` e `v4_mes-com-campanha-pausada`, as três `sem_revisao`. `check` com 0 erros; os 3 avisos são da `v1` (dívida conhecida de TEXTO-NA-MARCA), fora deste julgamento. PNGs de 2026-10-02, mais novos que os `Chart.tsx` de 2026-09-29.

Resultado: `v2` aprovada, `v3` reprovada, `v4` aprovada. As observações não bloqueantes das três estão no README do modelo, na seção final.

## v3_leads-por-plataforma-e-qualificacao: reprovada

```
Versão: 06_pizza/06_pizzas-proporcionais-ao-total/v3_leads-por-plataforma-e-qualificacao
Data: 2026-10-14
Resultado: reprovada
Não: 19
Correções:
  19. ACE-1 e catálogo: a frase acessível tem de trazer o total e a fração qualificada de cada plataforma.
Não se aplica: 4, 18, 28, 29, 30, 31, 32
```

### Bloqueante único: pergunta 19, ACE-1, item 4 do "O que demonstra" do catálogo

- **O que o catálogo pede.** O quarto item do "O que demonstra" desta versão é literal: "Frase acessível com o total e a fração qualificada de cada plataforma". O `meta.json` repete a promessa no quinto item de `demonstrates`.
- **O que a peça entrega.** A frase gravada em `data-farol-ace` no `preview.svg` é: "3 pizzas proporcionais ao total com os leads do semestre por plataforma e estado de qualificação. Rede social traz 2.480 leads, o maior volume; Busca paga qualifica 46,0% (570 de 1.240), a melhor fração." O volume aparece só para Rede social, a fração qualificada só para Busca paga, e Portal de notícias não é nomeado. O `summary` do `Chart.tsx`, linha 95, monta a frase só com `biggest` e `bestRate`.
- **Por que reprova.** A seção 14.1 e o papel do revisor tratam como bloqueante a versão que não demonstra o que o catálogo diz; aqui o `meta.json` afirma uma demonstração que o código não faz, o mesmo sintoma da `DAD-10` (promessa que o desenho não cumpre). A conta cabe: não há motivo de espaço para a falta.
- **O que mudar.** Montar a frase percorrendo `measured`, uma entrada por plataforma com `formatRateWithVolume(qualified, total)`, que é o mesmo formatador do corpo (a `FORMATO-ACESSIVEL` continua limpa), e manter a conclusão da melhor fração no fim. Com o dado padrão, por exemplo: "3 pizzas proporcionais ao total de leads do semestre, com a fração qualificada: Rede social 34,1% (846 de 2.480), Busca paga 46,0% (570 de 1.240) e Portal de notícias 21,0% (130 de 620). Busca paga tem a melhor fração." São 218 caracteres, dentro da faixa de 100 a 250 e abaixo dos 235 do aviso. Como o modelo aceita até seis todos, prever o teto: acima de três ou quatro plataformas, cair para a fração sem o volume, ou para a maior e a menor fração, sem passar de 250. Atualizar o `notes` do `meta.json` com a nova contagem de caracteres e renderizar por último.

### O que foi conferido e está certo na v3

Nenhuma outra pergunta deu "não". Área pela raiz do volume (RAIO-CONTRA-AREA mediu e passou); bases alinhadas, porque as três listas têm a mesma altura; ordem das fatias igual à das listas (qualificado, em análise, desqualificado); um destaque só em `--chart-1`, com a linha de leitura nomeando a fração qualificada como segundo canal (COR-2); vão de 2 px em `--surface-raised` entre fatias (COR-5); toda parte com nome e número sem interação, e as contagens impressas somam o volume de cada pizza (ROT-10); taxa sempre com volume (DAD-1); textos de 12 e 11 px, nenhum peso 700; nenhum texto sobre marca. As três guardas de tinta saíram `texto_em_html`; conferi no PNG de 2x o par mais apertado, "Desqualificado" contra "40,9%", com cerca de 8 px de vão, e as colunas vizinhas a 24 px.

## v2_legenda-de-tamanho e v4_mes-com-campanha-pausada: aprovadas

Sem "não" em nenhuma das 32 perguntas. Em `v2`: régua pela mesma `radiusForTotal`, degrau de cima no maior total observado (ROT-5b), base comum entre régua e pizzas, rótulo "R$ 500,0 mil" inteiro dentro do círculo grande e acima do pequeno sem tocar traço (GEO-19), percentuais 45/33/22, 43/34/23, 42/33/25 e 42/34/24. Em `v4`: o ponto de jul/26 conserva o raio da escala comum, ago/26 escreve `formatUnavailable()` com `Unplug` e sem marca, percentuais 42/35/23, 43/36/21 e 42/35/23. Nas duas, o texto dentro da fatia é vazado em `--surface-raised` e sem halo, medido pela TEXTO-NA-MARCA nos dois temas.

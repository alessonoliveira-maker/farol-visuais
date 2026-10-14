/**
 * Ticket de cada venda ganha no semestre, em reais, por origem do lead. Dado fictício e fixo: as
 * quatro origens grandes nascem de um gerador com semente fixa (mulberry32), e as três pequenas
 * são escritas à mão. Parcerias fechou 7 negócios (faixa, sem mediana), Redes sociais 4 e Mailing
 * frio 2 (só os casos), e Feira regional não fechou nenhum: a lista vazia é ausência, não R$ 0.
 */
export interface OriginSample {
  readonly id: string;
  readonly name: string;
  /** Um ticket por negócio ganho; lista vazia quer dizer que a origem não vendeu no período. */
  readonly deals: readonly number[];
}

/** Gerador de números em [0, 1) com semente fixa. */
function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Tickets lognormais em torno de uma mediana, arredondados a R$ 500. */
function sample(seed: number, count: number, medianTicket: number, spread: number): number[] {
  const next = mulberry32(seed);
  const tickets: number[] = [];
  for (let i = 0; i < count; i += 1) {
    const u1 = Math.max(next(), 1e-9);
    const u2 = next();
    const normal = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    tickets.push(Math.round((medianTicket * Math.exp(spread * normal)) / 500) * 500);
  }
  return tickets;
}

export const data: readonly OriginSample[] = [
  { id: 'org-inbound', name: 'Inbound do site', deals: sample(11, 31, 42_000, 0.35) },
  { id: 'org-indicacao', name: 'Indicação de clientes', deals: sample(23, 24, 68_000, 0.3) },
  { id: 'org-outbound', name: 'Outbound ativo', deals: sample(37, 18, 55_000, 0.4) },
  { id: 'org-eventos', name: 'Eventos e congressos', deals: sample(41, 12, 74_000, 0.3) },
  { id: 'org-parcerias', name: 'Parcerias', deals: [41_000, 52_500, 38_000, 66_000, 47_500, 58_000, 44_000] },
  { id: 'org-redes', name: 'Redes sociais', deals: [38_500, 61_200, 47_000, 98_800] },
  { id: 'org-mailing', name: 'Mailing frio', deals: [29_000, 94_500] },
  { id: 'org-feira', name: 'Feira regional', deals: [] },
];

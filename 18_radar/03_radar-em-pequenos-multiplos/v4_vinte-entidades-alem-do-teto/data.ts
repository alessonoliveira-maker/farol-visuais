/**
 * Vinte origens de lead de 2026-08, em seis dimensões de qualidade, em índice de 0 a 100 pelo
 * percentil entre as origens (100 é a melhor, 0 é a pior). `scores` segue a ordem de `dimensions`.
 * `leads` é o volume do mês e decide quais origens a grade mostra, porque a grade tem teto de
 * miniaturas. O dado vem fora de ordem de propósito: quem ordena é o componente. Fictício e fixo.
 */
export interface Dimension {
  readonly id: string;
  readonly label: string;
}

export interface LeadSource {
  readonly id: string;
  readonly name: string;
  readonly leads: number;
  readonly scores: readonly number[];
}

export const dimensions: readonly Dimension[] = [
  { id: 'phone', label: 'Cobertura de telefone' },
  { id: 'email', label: 'E-mail corporativo' },
  { id: 'role', label: 'Cargo informado' },
  { id: 'fit', label: 'Fit com o perfil' },
  { id: 'reply', label: 'Resposta em 24 h' },
  { id: 'booking', label: 'Agenda marcada' },
];

export const data: readonly LeadSource[] = [
  { id: 'src-01', name: 'Anúncio em busca', leads: 2140, scores: [62, 48, 55, 70, 66, 58] },
  { id: 'src-02', name: 'Material rico', leads: 1320, scores: [38, 72, 60, 64, 45, 40] },
  { id: 'src-03', name: 'Evento presencial', leads: 540, scores: [90, 66, 78, 82, 74, 88] },
  { id: 'src-04', name: 'Formulário do site', leads: 1860, scores: [70, 58, 52, 68, 72, 64] },
  { id: 'src-05', name: 'Indicação de cliente', leads: 410, scores: [94, 80, 86, 92, 90, 95] },
  { id: 'src-06', name: 'Webinar', leads: 780, scores: [44, 84, 76, 58, 50, 46] },
  { id: 'src-07', name: 'Lista outbound', leads: 960, scores: [82, 30, 42, 36, 28, 24] },
  { id: 'src-08', name: 'Reengajamento', leads: 690, scores: [56, 52, 48, 40, 34, 0] },
  { id: 'src-09', name: 'Parceiro revendedor', leads: 360, scores: [76, 70, 82, 78, 68, 72] },
  { id: 'src-10', name: 'Anúncio em rede social', leads: 1580, scores: [34, 28, 30, 46, 60, 32] },
  { id: 'src-11', name: 'Chat do site', leads: 1040, scores: [58, 44, 50, 54, 88, 62] },
  { id: 'src-12', name: 'Landing de oferta', leads: 880, scores: [48, 60, 46, 52, 56, 50] },
  { id: 'src-13', name: 'Newsletter', leads: 470, scores: [30, 76, 68, 60, 42, 36] },
  { id: 'src-14', name: 'Mala direta', leads: 290, scores: [64, 22, 34, 40, 26, 30] },
  { id: 'src-15', name: 'Marketplace', leads: 620, scores: [52, 40, 38, 44, 64, 54] },
  { id: 'src-16', name: 'Telefone receptivo', leads: 330, scores: [100, 36, 58, 66, 92, 80] },
  { id: 'src-17', name: 'Feira regional', leads: 240, scores: [86, 62, 70, 74, 58, 66] },
  { id: 'src-18', name: 'Programa de afiliados', leads: 520, scores: [42, 54, 44, 50, 38, 34] },
  { id: 'src-19', name: 'Cadastro em loja', leads: 210, scores: [74, 26, 32, 48, 70, 56] },
  { id: 'src-20', name: 'Pesquisa de satisfação', leads: 180, scores: [66, 68, 72, 62, 54, 60] },
];

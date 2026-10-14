/**
 * Leads e leads qualificados de 22 origens em agosto e em setembro de 2026, em contagem. Origem
 * nova tem `leadsAnterior` zero e `qualificadosAnterior` nulo: não existia em agosto, então a taxa
 * anterior não existe. Dado fictício e fixo: nenhuma origem corresponde a um canal real.
 */
export interface OriginMonths {
  readonly id: string;
  readonly name: string;
  readonly leadsAnterior: number;
  readonly qualificadosAnterior: number | null;
  readonly leadsAtual: number;
  readonly qualificadosAtual: number;
}

export const data: readonly OriginMonths[] = [
  { id: 'org-01', name: 'Busca paga', leadsAnterior: 410, qualificadosAnterior: 82, leadsAtual: 468, qualificadosAtual: 79 },
  { id: 'org-02', name: 'Redes sociais pagas', leadsAnterior: 360, qualificadosAnterior: 54, leadsAtual: 540, qualificadosAtual: 70 },
  { id: 'org-03', name: 'Indicação de clientes', leadsAnterior: 120, qualificadosAnterior: 42, leadsAtual: 138, qualificadosAtual: 53 },
  { id: 'org-04', name: 'E-mail para a base', leadsAnterior: 300, qualificadosAnterior: 51, leadsAtual: 255, qualificadosAtual: 48 },
  { id: 'org-05', name: 'Parceiros de revenda', leadsAnterior: 90, qualificadosAnterior: 27, leadsAtual: 76, qualificadosAtual: 20 },
  { id: 'org-06', name: 'Eventos presenciais', leadsAnterior: 64, qualificadosAnterior: 22, leadsAtual: 48, qualificadosAtual: 14 },
  { id: 'org-07', name: 'Webinários', leadsAnterior: 140, qualificadosAnterior: 35, leadsAtual: 196, qualificadosAtual: 41 },
  { id: 'org-08', name: 'Busca orgânica', leadsAnterior: 520, qualificadosAnterior: 78, leadsAtual: 559, qualificadosAtual: 95 },
  { id: 'org-09', name: 'Marketplace de serviços', leadsAnterior: 210, qualificadosAnterior: 25, leadsAtual: 335, qualificadosAtual: 36 },
  { id: 'org-10', name: 'Página de oferta', leadsAnterior: 180, qualificadosAnterior: 36, leadsAtual: 250, qualificadosAtual: 40 },
  { id: 'org-11', name: 'Conteúdo patrocinado', leadsAnterior: 75, qualificadosAnterior: 12, leadsAtual: 135, qualificadosAtual: 17 },
  { id: 'org-12', name: 'Lista adquirida', leadsAnterior: 260, qualificadosAnterior: 20, leadsAtual: 149, qualificadosAtual: 7 },
  { id: 'org-13', name: 'Programa de afiliados', leadsAnterior: 35, qualificadosAnterior: 7, leadsAtual: 203, qualificadosAtual: 36 },
  { id: 'org-14', name: 'Indicação de parceiros', leadsAnterior: 85, qualificadosAnterior: 17, leadsAtual: 102, qualificadosAtual: 24 },
  { id: 'org-15', name: 'Chat do site', leadsAnterior: 230, qualificadosAnterior: 46, leadsAtual: 218, qualificadosAtual: 52 },
  { id: 'org-16', name: 'Anúncio em vídeo', leadsAnterior: 150, qualificadosAnterior: 18, leadsAtual: 212, qualificadosAtual: 21 },
  { id: 'org-17', name: 'Newsletter parceira', leadsAnterior: 110, qualificadosAnterior: 11, leadsAtual: 96, qualificadosAtual: 13 },
  { id: 'org-18', name: 'Telefone ativo', leadsAnterior: 100, qualificadosAnterior: 25, leadsAtual: 82, qualificadosAtual: 17 },
  { id: 'org-19', name: 'Rádio local', leadsAnterior: 70, qualificadosAnterior: 7, leadsAtual: 62, qualificadosAtual: 5 },
  { id: 'org-20', name: 'Cadastro em feira', leadsAnterior: 44, qualificadosAnterior: 9, leadsAtual: 58, qualificadosAtual: 12 },
  { id: 'org-21', name: 'Concurso cultural', leadsAnterior: 28, qualificadosAnterior: 4, leadsAtual: 22, qualificadosAtual: 3 },
  { id: 'org-22', name: 'Podcast patrocinado', leadsAnterior: 0, qualificadosAnterior: null, leadsAtual: 41, qualificadosAtual: 9 },
];

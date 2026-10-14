import { CircleCheck, Filter, OctagonAlert, TriangleAlert } from 'lucide-react';
import type { ReactElement } from 'react';

import { formatInt, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type CapacityArea, type CapacityRole } from './data';

/**
 * Organograma de capacidade: a área no topo, as funções numa fileira abaixo, cada uma num cartão
 * de Tailwind posicionado por coordenada calculada aqui, e os conectores ortogonais em SVG por
 * baixo dos cartões (tronco até o barramento, barramento até a coluna de cada filho, descida).
 *
 * O SVG dos conectores declara `width` e `height` em pixel e **não** tem `viewBox`, de propósito:
 * assim ele nunca escala, o texto dos cartões chega à tela no tamanho declarado, e a escala que
 * encolheria o rótulo (o caso da `TAMANHO-TEXTO`, em que 11 px declarados chegam a 10,34 px)
 * simplesmente não existe aqui. O cartão mede 200 x 126 px, o da área 232 x 80 px, e o conteúdo
 * inteiro 872 x 250 px, dentro do corpo de 894 x 281,5 px do canvas declarado no `meta.json`.
 *
 * A microbarra é comprimento puro: a largura pintada é a fração exata do uso contra o teto, sem
 * vão absoluto nenhum entre trilho e preenchimento, então a participação de tinta de cada cartão
 * é igual à participação do valor dele (a `GEO-16` fala de respiro absoluto quebrando codificação
 * por área, e aqui não há respiro a subtrair). Acima do teto a barra fica cheia e quem carrega o
 * excedente é o percentual escrito, que passa de 100%.
 *
 * Cor pela faixa de uso, sempre com um segundo canal (ACE-2): a faixa também tem palavra escrita
 * ("com folga", "perto do teto", "acima do teto") e ícone próprio. `--accent-amber` repete o hex
 * de `--warning` nos dois temas (`#f5a524` no escuro, `#945808` no claro), então mede 8,36:1 e
 * 5,74:1 contra o cartão; `--negative` mede 5,50:1 e 6,36:1; `--text-muted` mede 5,21:1 e 5,37:1.
 * Os três passam o piso de 3:1 da WCAG 1.4.11 sem depender de isenção.
 */
export interface CapacityOrgChartProps {
  readonly data?: CapacityArea;
  readonly height?: number;
  readonly className?: string;
}

const CARD_WIDTH = 200;
const CARD_HEIGHT = 126;
const CARD_GAP = 24;
const AREA_CARD_WIDTH = 232;
const AREA_CARD_HEIGHT = 80;
/** Altura do vão entre o cartão da área e a fileira de funções, onde o conector desenha. */
const TRUNK_HEIGHT = 44;
/** Acima desta fração do teto a função entra na faixa de atenção. */
const NEAR_CEILING = 0.85;
/** Acima desta fração do teto a função passou da capacidade declarada. */
const OVER_CEILING = 1;

type Band = 'folga' | 'perto' | 'acima';

interface BandStyle {
  readonly word: string;
  readonly color: string;
  readonly Icon: typeof CircleCheck;
  readonly iconClass: string;
}

const BAND_STYLE: Record<Band, BandStyle> = {
  folga: {
    word: 'com folga',
    color: 'var(--text-muted)',
    Icon: CircleCheck,
    iconClass: 'text-text-muted',
  },
  perto: {
    word: 'perto do teto',
    color: 'var(--accent-amber)',
    Icon: TriangleAlert,
    iconClass: 'text-warning',
  },
  acima: {
    word: 'acima do teto',
    color: 'var(--negative)',
    Icon: OctagonAlert,
    iconClass: 'text-negative',
  },
};

function bandOf(role: CapacityRole): Band {
  const ratio = role.used / role.ceiling;
  if (ratio > OVER_CEILING) return 'acima';
  if (ratio >= NEAR_CEILING) return 'perto';
  return 'folga';
}

/** "1 pessoa" no singular, "N pessoas" no plural: contagem nunca sai crua (NUM-6). */
function formatPeople(value: number): string {
  return `${formatInt(value)} ${value === 1 ? 'pessoa' : 'pessoas'}`;
}

/** "1 função" no singular, "N funções" no plural (NUM-6). */
function formatRoles(value: number): string {
  return `${formatInt(value)} ${value === 1 ? 'função' : 'funções'}`;
}

/**
 * Soma de pessoas das funções. Devolve `null` para lista vazia, nunca `0` (EST-1b): área sem
 * função declarada não tem zero pessoa, tem ausência de estrutura, e quem desenha isso é o
 * estado vazio.
 */
function totalPeople(roles: readonly CapacityRole[]): number | null {
  if (roles.length === 0) return null;
  return roles.reduce((sum, role) => sum + role.people, 0);
}

/** Quantas funções passaram do teto. `null` para lista vazia (EST-1b); zero medido é zero. */
function countOverCeiling(roles: readonly CapacityRole[]): number | null {
  if (roles.length === 0) return null;
  return roles.filter((role) => bandOf(role) === 'acima').length;
}

/** A função com o maior uso contra o teto. `null` para lista vazia. */
function mostPressed(roles: readonly CapacityRole[]): CapacityRole | null {
  if (roles.length === 0) return null;
  return [...roles].sort((a, b) => b.used / b.ceiling - a.used / a.ceiling)[0] ?? null;
}

interface RoleCardProps {
  readonly role: CapacityRole;
  readonly left: number;
  readonly top: number;
}

/** Cartão de uma função: nome, pessoas, faixa de uso, microbarra, uso contra teto e procedência. */
function RoleCard({ role, left, top }: RoleCardProps): ReactElement {
  const band = BAND_STYLE[bandOf(role)];
  const fill = Math.min(1, role.used / role.ceiling);
  const { Icon } = band;
  return (
    <div
      className="absolute rounded-lg border border-line-subtle bg-surface-raised p-3"
      style={{ height: CARD_HEIGHT, left, top, width: CARD_WIDTH }}
    >
      <p className="text-xs leading-4 font-semibold text-text-primary">{role.label}</p>
      <p className="mt-1 text-[0.6875rem] leading-[14px] text-text-muted">
        <span className="tabular-nums">{formatPeople(role.people)}</span>
        {` · ${band.word}`}
      </p>
      {/* Trilho em `--surface-sunken`, que é o que a TOK-1 endossa para trilho; `--surface-overlay`
          é proibido aqui porque no tema claro é o mesmo branco do cartão. */}
      <div aria-hidden className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken">
        <div
          className="h-full rounded-full"
          style={{ backgroundColor: band.color, width: `${String(fill * 100)}%` }}
        />
      </div>
      <p className="mt-1 flex items-center gap-1 text-xs leading-4 font-medium tabular-nums text-text-primary">
        <Icon aria-hidden className={cn('size-3.5 shrink-0', band.iconClass)} />
        {formatRateWithVolume(role.used, role.ceiling)}
      </p>
      <p className="mt-0.5 text-[0.6875rem] leading-[14px] text-text-muted">{role.unit}</p>
      <p className="mt-1 text-[0.6875rem] leading-[14px]">
        <span className="text-prov-medido">uso MEDIDO</span>
        <span className="text-text-muted">{' · '}</span>
        <span className="text-prov-premissa">teto PREMISSA</span>
      </p>
    </div>
  );
}

export default function CapacityOrgChart({ data = defaultData, height, className }: CapacityOrgChartProps) {
  const style = height === undefined ? undefined : { height };
  const roles = data.roles;
  const people = totalPeople(roles);
  const overCount = countOverCeiling(roles);
  const pressed = mostPressed(roles);

  if (people === null || overCount === null || pressed === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma função neste recorte: sem estrutura declarada, não há capacidade a comparar.</span>
      </div>
    );
  }

  const contentWidth = roles.length * CARD_WIDTH + (roles.length - 1) * CARD_GAP;
  const contentHeight = AREA_CARD_HEIGHT + TRUNK_HEIGHT + CARD_HEIGHT;
  const areaLeft = (contentWidth - AREA_CARD_WIDTH) / 2;
  const trunkX = areaLeft + AREA_CARD_WIDTH / 2;
  const busY = AREA_CARD_HEIGHT + TRUNK_HEIGHT / 2;
  const rowTop = AREA_CARD_HEIGHT + TRUNK_HEIGHT;

  const summary = [
    `Organograma de capacidade da ${data.label} com ${formatRoles(roles.length)} e ${formatPeople(people)}.`,
    `${pressed.label} tem o maior uso contra o teto, com ${formatRateWithVolume(pressed.used, pressed.ceiling)} ${pressed.unit}.`,
    `${formatRoles(overCount)} acima do teto declarado.`,
  ].join(' ');

  return (
    <div
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col items-center justify-center gap-3', className)}
      role="group"
      style={style}
    >
      <p aria-hidden className="w-full shrink-0 text-xs leading-4 text-text-secondary">
        <span className="font-semibold text-text-primary">{pressed.label}</span>
        {overCount > 0
          ? ' passou do teto, e a área fecha o mês com '
          : ' é a função mais pressionada, e a área fecha o mês com '}
        <span className="tabular-nums text-text-primary">{formatRateWithVolume(overCount, roles.length)}</span>
        {' das funções acima da capacidade declarada.'}
      </p>
      <div className="relative shrink-0" style={{ height: contentHeight, width: contentWidth }}>
        {/* Conectores ortogonais por baixo dos cartões. Sem `viewBox`, então sem escala: o tamanho
            declarado do texto é o que chega à tela. A cor é `--text-muted` (5,21:1 e 5,37:1), e
            não `--line-strong` (1,79:1 e 1,83:1), porque o traço carrega a relação (ACE-6). */}
        <svg aria-hidden className="absolute inset-0" height={contentHeight} width={contentWidth}>
          {roles.map((role, index) => {
            const childX = index * (CARD_WIDTH + CARD_GAP) + CARD_WIDTH / 2;
            return (
              <path
                d={`M ${String(trunkX)} ${String(AREA_CARD_HEIGHT)} V ${String(busY)} H ${String(childX)} V ${String(rowTop)}`}
                fill="none"
                key={`edge-${role.id}`}
                stroke="var(--text-muted)"
                strokeWidth={1.5}
              />
            );
          })}
        </svg>
        <div
          className="absolute rounded-lg border border-line-subtle bg-surface-raised p-3"
          style={{ height: AREA_CARD_HEIGHT, left: areaLeft, top: 0, width: AREA_CARD_WIDTH }}
        >
          <p className="text-xs leading-4 font-semibold text-text-primary">{data.label}</p>
          <p className="mt-1 text-[0.6875rem] leading-[14px] text-text-muted">
            <span className="tabular-nums">{formatPeople(people)}</span>
            {' em '}
            <span className="tabular-nums">{formatRoles(roles.length)}</span>
          </p>
          <p className="mt-1 text-xs leading-4 font-medium tabular-nums text-text-primary">
            {`${formatRateWithVolume(overCount, roles.length)} acima do teto`}
          </p>
        </div>
        {roles.map((role, index) => (
          <RoleCard
            key={role.id}
            left={index * (CARD_WIDTH + CARD_GAP)}
            role={role}
            top={rowTop}
          />
        ))}
      </div>
    </div>
  );
}

import { BedDouble, Check, Flame, Store, Swords } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { MapNode, NodeKind, RunState } from '@game/types'

const NODE_COPY: Record<NodeKind, { label: string; hint: string; Icon: LucideIcon }> = {
  COMBAT: { label: 'Combate', hint: 'Jogue cartas até derrubar o inimigo', Icon: Swords },
  SHOP: { label: 'Banca', hint: 'Gaste ouro numa chapa nova', Icon: Store },
  REST: { label: 'Descanso', hint: 'Recupera 25 de vida', Icon: BedDouble },
  BOSS: { label: 'Fornalha Fria', hint: 'O chefe. Mate-a para vencer a run', Icon: Flame },
}

const OFFSETS = [0, -56, 48, -40, 36, 0]

interface ForgeMapProps {
  run: RunState
  busy: boolean
  onEnter: () => void
}

export function ForgeMap({ run, busy, onEnter }: ForgeMapProps) {
  const current = run.map[run.floor]
  const copy = NODE_COPY[current?.kind ?? 'COMBAT']

  return (
    <section className="forge-map">
      <header className="forge-map-head">
        <div>
          <p className="forge-map-kicker">Descida ao Cinzeiro</p>
          <h2>Caminho da forja</h2>
        </div>
        <p className="forge-map-status">
          Vida {run.hp}/{run.maxHp} · {run.gold} ouro
        </p>
      </header>

      <div className="forge-shaft" aria-label="Mapa da run">
        <svg className="forge-rail" viewBox="0 0 320 560" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M160 28 C104 100 216 170 160 240 C104 310 216 380 160 448 C160 480 160 510 160 536"
            fill="none"
            stroke="#3d2618"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M160 28 C104 100 216 170 160 240 C104 310 216 380 160 448 C160 480 160 510 160 536"
            fill="none"
            stroke="#f97316"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="6 10"
            opacity="0.55"
          />
        </svg>

        <ol className="forge-stops">
          {run.map.map((node, index) => (
            <ForgeStop
              key={node.id}
              node={node}
              offset={OFFSETS[index] ?? 0}
              current={node.index === run.floor && !node.cleared}
              busy={busy}
              onEnter={onEnter}
            />
          ))}
        </ol>
      </div>

      <div className="forge-map-cta">
        <p className="text-sm font-semibold text-ember">
          Agora: {copy.label}
        </p>
        <p className="mt-1 text-sm text-soot-500">{copy.hint}</p>
        <button type="button" disabled={busy} className="forge-enter" onClick={onEnter}>
          Descer — {copy.label}
        </button>
      </div>
    </section>
  )
}

function ForgeStop({
  node,
  offset,
  current,
  busy,
  onEnter,
}: {
  node: MapNode
  offset: number
  current: boolean
  busy: boolean
  onEnter: () => void
}) {
  const { label, Icon } = NODE_COPY[node.kind]
  const boss = node.kind === 'BOSS'
  const state = node.cleared ? 'done' : current ? 'now' : 'next'

  return (
    <li className={`forge-stop forge-stop-${state} ${boss ? 'forge-stop-boss' : ''}`} style={{ transform: `translateX(${offset}px)` }}>
      <button
        type="button"
        className="forge-plate"
        disabled={!current || busy}
        onClick={current ? onEnter : undefined}
        aria-current={current ? 'step' : undefined}
        title={current ? `Entrar em ${label}` : label}
      >
        {node.cleared ? <Check size={boss ? 26 : 22} /> : <Icon size={boss ? 26 : 22} />}
      </button>
      <div className="forge-stop-copy">
        <p className="forge-stop-name">
          {node.index + 1}. {label}
        </p>
        <p className="forge-stop-meta">
          {node.cleared ? 'Já passou' : current ? 'Você está aqui' : 'Mais abaixo'}
        </p>
      </div>
    </li>
  )
}

import { useEffect, useState } from 'react'
import { Layers } from 'lucide-react'
import { CLASSES, cardById } from '@game/catalog'
import type { CombatState, RunState, ScoreEntry } from '@game/types'
import { BrandMark } from '@/components/BrandMark'
import { CardFace } from '@/components/CardFace'
import { ForgeMap } from '@/components/ForgeMap'
import { HeroPortrait } from '@/components/HeroPortrait'
import { HowToPlay } from '@/components/HowToPlay'
import { ManaPips } from '@/components/ManaPips'
import { PrepScreen } from '@/components/PrepScreen'
import { api, errorMessage, unwrap } from '@/lib/api'
import type { Envelope } from '@/lib/types'

export default function PlayPage() {
  const [run, setRun] = useState<RunState | null>(null)
  const [scores, setScores] = useState<ScoreEntry[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function loadScores() {
    const { data } = await api.get<Envelope<ScoreEntry[]>>('/scores')
    setScores(unwrap(data))
  }

  async function command(path: string, body?: object) {
    setBusy(true)
    setError('')
    try {
      const { data } = await api.post<Envelope<RunState>>(path, body ?? {})
      setRun(unwrap(data))
      await loadScores()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    void (async () => {
      try {
        const { data } = await api.get<Envelope<RunState>>('/runs/current')
        setRun(unwrap(data))
      } catch {
        const { data } = await api.post<Envelope<RunState>>('/runs')
        setRun(unwrap(data))
      }
      await loadScores()
    })()
  }, [])

  useEffect(() => {
    document.body.classList.toggle('in-combat', Boolean(run?.phase === 'COMBAT' && run.combat))
    return () => document.body.classList.remove('in-combat')
  }, [run])

  if (!run) {
    return <p className="text-soot-500">Acendendo os foles…</p>
  }

  if (run.phase === 'COMBAT' && run.combat) {
    return (
      <CombatBoard
        combat={run.combat}
        error={error}
        busy={busy}
        onPlay={(instanceId) => command('/runs/current/play', { instanceId })}
        onEndTurn={() => command('/runs/current/end-turn')}
      />
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3 text-sm text-soot-500">
        <span>
          {run.classId
            ? `${CLASSES.find((item) => item.id === run.classId)?.name ?? 'Foleiro'} · `
            : ''}
          Vida {run.hp}/{run.maxHp} · ouro {run.gold} · {run.score} pts
        </span>
        {(run.phase === 'WON' || run.phase === 'LOST') && (
          <button
            type="button"
            className="rounded-lg bg-ember px-3 py-1.5 text-sm font-medium text-soot-950"
            onClick={() => command('/runs')}
          >
            Nova run
          </button>
        )}
      </header>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
      )}

      {(run.phase === 'CLASS' || run.phase === 'DECK') && (
        <PrepScreen
          run={run}
          busy={busy}
          onChoose={(classId) => command('/runs/current/class', { classId })}
          onConfirm={(cardIds) => command('/runs/current/deck', { cardIds })}
        />
      )}

      {run.phase === 'MAP' && <ForgeMap run={run} busy={busy} onEnter={() => command('/runs/current/enter')} />}

      {run.phase === 'REWARD' && (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Recompensa: escolha 1 carta</h2>
            <p className="text-sm text-soot-500">Ela entra no baralho desta run. Ou recuse se nenhuma servir.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {run.rewardOffer.map((cardId) => (
              <CardFace key={cardId} cardId={cardId} playable onClick={() => command('/runs/current/reward', { cardId })} />
            ))}
          </div>
          <button type="button" className="text-sm text-soot-500 underline" onClick={() => command('/runs/current/skip-reward')}>
            Não quero carta
          </button>
        </section>
      )}

      {run.phase === 'SHOP' && (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Banca de sucata</h2>
            <p className="text-sm text-soot-500">Você tem {run.gold} ouro. Clique na chapa para comprar, depois saia.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {run.shopOffer.map((cardId) => {
              const price = cardById(cardId).shopCost ?? 50
              return (
                <CardFace
                  key={cardId}
                  cardId={cardId}
                  price={price}
                  playable={run.gold >= price}
                  disabled={run.gold < price}
                  onClick={() => command('/runs/current/shop', { cardId })}
                />
              )
            })}
          </div>
          <button
            type="button"
            className="rounded-lg bg-ember px-4 py-2 text-sm font-medium text-soot-950"
            onClick={() => command('/runs/current/leave-shop')}
          >
            Sair da banca
          </button>
        </section>
      )}

      {run.phase === 'REST' && (
        <section className="space-y-3 rounded-2xl border border-white/10 bg-soot-900 p-6">
          <h2 className="text-lg font-semibold">Ponto de descanso</h2>
          <p className="text-sm text-soot-500">Recupera 25 de vida (hoje {run.hp}/{run.maxHp}).</p>
          <button type="button" className="rounded-lg bg-ember px-4 py-2 font-medium text-soot-950" onClick={() => command('/runs/current/rest')}>
            Descansar e seguir
          </button>
        </section>
      )}

      {(run.phase === 'WON' || run.phase === 'LOST') && (
        <section className="rounded-2xl border border-white/10 bg-soot-900 p-6">
          <h2 className="text-2xl font-semibold">
            {run.phase === 'WON' ? 'Você venceu a Fornalha Fria.' : 'Você morreu. A brasa apagou.'}
          </h2>
          <p className="mt-2 text-soot-500">Pontuação {run.score}</p>
        </section>
      )}

      <aside className="rounded-2xl border border-white/10 bg-soot-900/70 p-4">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <BrandMark size={18} /> Ranking
        </h3>
        {scores.length === 0 ? (
          <p className="text-sm text-soot-500">Termine uma run para aparecer aqui.</p>
        ) : (
          <ol className="space-y-1 text-sm text-soot-500">
            {scores.map((entry) => (
              <li key={entry.id} className="flex justify-between">
                <span>
                  {entry.playerName} · {entry.won ? 'vitória' : 'queda'}
                </span>
                <span className="text-soot-300">{entry.score}</span>
              </li>
            ))}
          </ol>
        )}
      </aside>
    </div>
  )
}

function CombatBoard({
  combat,
  error,
  busy,
  onPlay,
  onEndTurn,
}: {
  combat: CombatState
  error: string
  busy: boolean
  onPlay: (instanceId: string) => void
  onEndTurn: () => void
}) {
  const enemy = combat.enemies[0]
  const playableCount = combat.hand.filter((card) => {
    const def = cardById(card.cardId)
    return !def.effect.unplayable && def.cost <= combat.energy
  }).length
  const coach =
    playableCount > 0
      ? 'Clique numa carta com brilho dourado para jogar'
      : 'Sem jogadas. Encerrar turno — o inimigo faz o que avisou'
  const lastLog = combat.log[combat.log.length - 1] ?? 'Seu turno. Jogue cartas ou encerre.'

  return (
    <div className="battlefield">
      <div className="board-chrome">
        <p className="turn-ribbon">Seu turno {combat.turn}</p>
        <HowToPlay autoOpen />
      </div>
      {error && (
        <p className="mb-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
      )}

      <div className="enemy-row">
        {enemy && <HeroPortrait fighter={enemy} side="enemy" intent={enemy.intent} />}
      </div>

      <div className="mid-row">
        <p className="combat-banner">{lastLog}</p>
        <button type="button" disabled={busy} className={`end-turn-btn ${playableCount === 0 ? 'end-turn-ready' : ''}`} onClick={onEndTurn}>
          Encerrar
          <span>turno</span>
        </button>
      </div>

      <div className="player-row">
        <div className="pile-col">
          <Pile label="Compra" count={combat.drawPile.length} />
          <Pile label="Descarte" count={combat.discardPile.length} />
        </div>
        <HeroPortrait fighter={combat.player} side="player" intent={enemy?.intent} />
        <ManaPips energy={combat.energy} max={combat.maxEnergy} />
      </div>

      <p className="coach-line">{coach}</p>

      <div className="hand-row">
        {combat.hand.map((card, index) => {
          const def = cardById(card.cardId)
          const playable = !busy && !def.effect.unplayable && def.cost <= combat.energy
          const locked = busy || def.effect.unplayable || def.cost > combat.energy
          const tilt = (index - (combat.hand.length - 1) / 2) * 5
          return (
            <div key={card.instanceId} className="hand-card" style={{ transform: `rotate(${tilt}deg)` }}>
              <CardFace
                cardId={card.cardId}
                playable={playable}
                disabled={locked}
                onClick={playable ? () => onPlay(card.instanceId) : undefined}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Pile({ label, count }: { label: string; count: number }) {
  return (
    <div className="deck-pile" title={label}>
      <div className="deck-back">
        <Layers size={16} />
        <strong>{count}</strong>
      </div>
      <span>{label}</span>
    </div>
  )
}


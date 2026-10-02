import { useEffect, useState } from 'react'
import { Flame, Heart, Coins, Zap } from 'lucide-react'
import { cardById } from '@game/catalog'
import type { RunState, ScoreEntry } from '@game/types'
import { CardFace } from '@/components/CardFace'
import { api, errorMessage, unwrap } from '@/lib/api'
import type { Envelope } from '@/lib/types'

const NODE_LABEL = {
  COMBAT: 'Combate',
  SHOP: 'Banca',
  REST: 'Descanso',
  BOSS: 'Chefe',
} as const

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

  if (!run) {
    return <p className="text-soot-500">Acendendo os foles…</p>
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-soot-500">
          <Heart size={16} className="text-ember" /> {run.hp}/{run.maxHp}
          <Coins size={16} className="ml-2 text-amber-300" /> {run.gold}
          <span className="ml-2 rounded-full bg-white/5 px-2 py-0.5 text-xs">{run.score} pts</span>
        </div>
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

      {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

      {run.phase === 'MAP' && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">O Cinzeiro</h2>
          <div className="grid gap-2 sm:grid-cols-3">
            {run.map.map((node) => {
              const current = node.index === run.floor && !node.cleared
              return (
                <div
                  key={node.id}
                  className={`rounded-xl border px-4 py-3 text-sm ${
                    current ? 'border-ember/50 bg-ember/10 text-ember' : 'border-white/10 bg-soot-900 text-soot-500'
                  }`}
                >
                  <p className="font-medium">{NODE_LABEL[node.kind]}</p>
                  <p className="text-xs">{node.cleared ? 'limpo' : current ? 'próximo' : 'à frente'}</p>
                </div>
              )
            })}
          </div>
          <button
            type="button"
            disabled={busy}
            className="rounded-lg bg-ember px-4 py-2 font-medium text-soot-950 disabled:opacity-50"
            onClick={() => command('/runs/current/enter')}
          >
            Entrar no próximo nó
          </button>
        </section>
      )}

      {run.phase === 'COMBAT' && run.combat && (
        <section className="space-y-5">
          <div className="grid gap-3 md:grid-cols-2">
            {run.combat.enemies.map((enemy) => (
              <article key={enemy.id} className="rounded-2xl border border-white/10 bg-soot-900 p-4">
                <h3 className="font-semibold">{enemy.name}</h3>
                <p className="mt-1 text-sm text-soot-500">
                  {enemy.hp}/{enemy.maxHp} vida · bloco {enemy.block}
                  {enemy.burn > 0 ? ` · queima ${enemy.burn}` : ''}
                </p>
                <p className="mt-2 text-sm text-ember">
                  Intenção: {enemy.intent?.kind === 'DEFEND' ? `defende ${enemy.intent.value}` : `ataca ${enemy.intent?.value}`}
                </p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full bg-ember" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }} />
                </div>
              </article>
            ))}
            <article className="rounded-2xl border border-ember/30 bg-ember/5 p-4">
              <h3 className="font-semibold">Você</h3>
              <p className="mt-1 flex flex-wrap items-center gap-3 text-sm text-soot-500">
                <span className="inline-flex items-center gap-1"><Heart size={14} /> {run.combat.player.hp}</span>
                <span>bloco {run.combat.player.block}</span>
                <span className="inline-flex items-center gap-1"><Zap size={14} className="text-ember" /> {run.combat.energy}</span>
              </p>
            </article>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {run.combat.hand.map((card) => {
              const def = cardById(card.cardId)
              const locked = busy || def.effect.unplayable || def.cost > run.combat!.energy
              return (
                <CardFace
                  key={card.instanceId}
                  cardId={card.cardId}
                  disabled={locked}
                  onClick={() => command('/runs/current/play', { instanceId: card.instanceId })}
                />
              )
            })}
          </div>
          <div className="flex justify-center">
            <button
              type="button"
              disabled={busy}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm hover:bg-white/5 disabled:opacity-50"
              onClick={() => command('/runs/current/end-turn')}
            >
              Encerrar turno
            </button>
          </div>
          <ul className="max-h-28 space-y-1 overflow-auto text-xs text-soot-500">
            {run.combat.log.slice(-6).map((line, index) => (
              <li key={`${line}-${index}`}>{line}</li>
            ))}
          </ul>
        </section>
      )}

      {run.phase === 'REWARD' && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">A forja oferece uma chapa</h2>
          <div className="flex flex-wrap gap-3">
            {run.rewardOffer.map((cardId) => (
              <CardFace
                key={cardId}
                cardId={cardId}
                onClick={() => command('/runs/current/reward', { cardId })}
              />
            ))}
          </div>
          <button type="button" className="text-sm text-soot-500 underline" onClick={() => command('/runs/current/skip-reward')}>
            Recusar
          </button>
        </section>
      )}

      {run.phase === 'SHOP' && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Banca de sucata · {run.gold} ouro</h2>
          <div className="flex flex-wrap gap-3">
            {run.shopOffer.map((cardId) => (
              <CardFace
                key={cardId}
                cardId={cardId}
                price={cardById(cardId).shopCost}
                onClick={() => command('/runs/current/shop', { cardId })}
              />
            ))}
          </div>
          <button type="button" className="rounded-lg bg-ember px-4 py-2 text-sm font-medium text-soot-950" onClick={() => command('/runs/current/leave-shop')}>
            Sair da banca
          </button>
        </section>
      )}

      {run.phase === 'REST' && (
        <section className="space-y-3 rounded-2xl border border-white/10 bg-soot-900 p-6">
          <h2 className="text-lg font-semibold">Brasa residual</h2>
          <p className="text-sm text-soot-500">Aquece os ossos. Recupera 25 de vida.</p>
          <button type="button" className="rounded-lg bg-ember px-4 py-2 font-medium text-soot-950" onClick={() => command('/runs/current/rest')}>
            Descansar
          </button>
        </section>
      )}

      {(run.phase === 'WON' || run.phase === 'LOST') && (
        <section className="rounded-2xl border border-white/10 bg-soot-900 p-6">
          <h2 className="text-2xl font-semibold">
            {run.phase === 'WON' ? 'A Fornalha Fria apagou.' : 'A brasa morreu.'}
          </h2>
          <p className="mt-2 text-soot-500">Pontuação {run.score}</p>
        </section>
      )}

      <aside className="rounded-2xl border border-white/10 bg-soot-900/70 p-4">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <Flame size={14} className="text-ember" /> Ranking da forja
        </h3>
        {scores.length === 0 ? (
          <p className="text-sm text-soot-500">Nenhuma run encerrada ainda.</p>
        ) : (
          <ol className="space-y-1 text-sm text-soot-500">
            {scores.map((entry) => (
              <li key={entry.id} className="flex justify-between">
                <span>{entry.playerName} · {entry.won ? 'vitória' : 'queda'}</span>
                <span className="text-soot-300">{entry.score}</span>
              </li>
            ))}
          </ol>
        )}
      </aside>
    </div>
  )
}

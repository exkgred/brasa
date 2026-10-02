import { CLASSES, MAX_COPIES, MAX_DECK, MIN_DECK, cardById, classById, classPool } from '@game/catalog'
import type { ClassId, RunState } from '@game/types'
import { useEffect, useMemo, useState } from 'react'
import { CardFace } from '@/components/CardFace'

interface PrepScreenProps {
  run: RunState
  busy: boolean
  onChoose: (classId: string) => void
  onConfirm: (cardIds: string[]) => void
}

export function PrepScreen({ run, busy, onChoose, onConfirm }: PrepScreenProps) {
  const picking = run.phase === 'CLASS' || !run.classId
  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ember">Preparação</p>
        <h2 className="text-xl font-semibold">{picking ? 'Escolha sua classe' : 'Monte o baralho'}</h2>
        <p className="mt-1 text-sm text-soot-500">
          {picking
            ? 'Cada classe tem vida, mana e cartas próprias. Depois você ajusta o deck.'
            : `De ${MIN_DECK} a ${MAX_DECK} cartas. No máximo ${MAX_COPIES} cópias iguais. Clique na reserva para adicionar, no baralho para tirar.`}
        </p>
      </div>
      <ClassGrid selected={run.classId} busy={busy} onChoose={onChoose} />
      {!picking && run.classId && (
        <DeckBuilder
          classId={run.classId}
          initial={run.draft}
          busy={busy}
          onConfirm={onConfirm}
        />
      )}
    </section>
  )
}

function ClassGrid({
  selected,
  busy,
  onChoose,
}: {
  selected: string | null
  busy: boolean
  onChoose: (classId: string) => void
}) {
  return (
    <div className="class-grid">
      {CLASSES.map((cls) => {
        const active = selected === cls.id
        return (
          <button
            key={cls.id}
            type="button"
            disabled={busy}
            className={`class-card ${active ? 'class-card-on' : ''}`}
            onClick={() => onChoose(cls.id)}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-ember">{cls.title}</p>
            <p className="mt-1 text-lg font-semibold text-soot-300">{cls.name}</p>
            <p className="mt-2 text-sm leading-relaxed text-soot-500">{cls.blurb}</p>
            <p className="mt-3 text-xs font-medium text-soot-300">
              {cls.maxHp} vida · {cls.energy} mana · {cls.starter.length} cartas iniciais
            </p>
          </button>
        )
      })}
    </div>
  )
}

function DeckBuilder({
  classId,
  initial,
  busy,
  onConfirm,
}: {
  classId: ClassId
  initial: string[]
  busy: boolean
  onConfirm: (cardIds: string[]) => void
}) {
  const [draft, setDraft] = useState<string[]>(initial)
  const cls = classById(classId)
  const pool = useMemo(() => classPool(classId), [classId])

  useEffect(() => {
    setDraft(initial)
  }, [initial, classId])

  const copies = useMemo(() => {
    const map = new Map<string, number>()
    for (const id of draft) map.set(id, (map.get(id) ?? 0) + 1)
    return map
  }, [draft])

  function add(cardId: string) {
    if (draft.length >= MAX_DECK) return
    if ((copies.get(cardId) ?? 0) >= MAX_COPIES) return
    setDraft((current) => [...current, cardId])
  }

  function removeAt(index: number) {
    setDraft((current) => current.filter((_, item) => item !== index))
  }

  const ready = draft.length >= MIN_DECK && draft.length <= MAX_DECK

  return (
    <div className="deck-builder">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm text-soot-500">
          Baralho do {cls.name}:{' '}
          <strong className={ready ? 'text-ember' : 'text-red-300'}>
            {draft.length}/{MAX_DECK}
          </strong>
          {draft.length < MIN_DECK ? ` · faltam ${MIN_DECK - draft.length}` : ''}
        </p>
        <div className="flex gap-2">
          <button type="button" className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-soot-500" onClick={() => setDraft([...cls.starter])}>
            Restaurar inicial
          </button>
          <button
            type="button"
            disabled={busy || !ready}
            className="rounded-lg bg-ember px-4 py-1.5 text-sm font-semibold text-soot-950 disabled:opacity-40"
            onClick={() => onConfirm(draft)}
          >
            Descer com este baralho
          </button>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Seu baralho</h3>
        <div className="flex flex-wrap gap-2">
          {draft.map((cardId, index) => (
            <CardFace
              key={`${cardId}-${index}`}
              cardId={cardId}
              compact
              playable
              onClick={() => removeAt(index)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Reserva da classe</h3>
        <div className="flex flex-wrap gap-2">
          {pool.map((cardId) => {
            const used = copies.get(cardId) ?? 0
            const locked = draft.length >= MAX_DECK || used >= MAX_COPIES
            return (
              <div key={cardId} className="relative">
                <CardFace
                  cardId={cardId}
                  compact
                  playable={!locked}
                  disabled={locked}
                  onClick={locked ? undefined : () => add(cardId)}
                />
                <span className="copy-pip">
                  {used}/{MAX_COPIES}
                </span>
                {cardById(cardId).classIds ? (
                  <span className="class-pip">Classe</span>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

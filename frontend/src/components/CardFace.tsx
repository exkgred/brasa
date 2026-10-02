import { cardById } from '@game/catalog'
import type { CardType } from '@game/types'
import { cardHint } from '@/lib/card-copy'
import { sigilArt } from '@/lib/art'

const TYPE_THEME: Record<CardType, { label: string; rim: string }> = {
  golpe: { label: 'Golpe', rim: '#fb923c' },
  guarda: { label: 'Guarda', rim: '#94a3b8' },
  fluxo: { label: 'Fluxo', rim: '#fbbf24' },
  escoria: { label: 'Escória', rim: '#a3e635' },
}

interface CardFaceProps {
  cardId: string
  disabled?: boolean
  playable?: boolean
  compact?: boolean
  onClick?: () => void
  price?: number
}

export function CardFace({ cardId, disabled, playable, compact, onClick, price }: CardFaceProps) {
  const card = cardById(cardId)
  const theme = TYPE_THEME[card.type]
  const art = sigilArt(card.sigil)
  const damage = card.effect.damage
  const block = card.effect.block

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !onClick}
      title={cardHint(cardId)}
      className={`card-face group relative overflow-hidden text-left ${compact ? 'card-compact' : ''} ${
        playable ? 'card-playable' : ''
      } ${disabled ? 'card-locked' : ''}`}
    >
      <div className={`mana-crystal ${playable ? 'mana-crystal-ready' : ''}`}>{card.cost}</div>
      {art ? (
        <img src={art} alt={card.name} className={`card-art ${compact ? 'card-art-compact' : ''}`} />
      ) : (
        <div className={`card-art ${compact ? 'card-art-compact' : ''}`} />
      )}
      <div className="relative border-t border-white/10 px-2.5 pb-7 pt-2">
        <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: theme.rim }}>
          {theme.label}
        </span>
        <p className="text-[13px] font-semibold leading-tight text-soot-300">{card.name}</p>
        <p className="mt-0.5 text-[11px] leading-snug text-soot-500">{card.text}</p>
        {price !== undefined && <p className="mt-1 text-[11px] font-medium text-ember">{price} ouro</p>}
      </div>
      {(damage || block) && (
        <div className="card-stats">
          {damage ? (
            <span className="stat-dmg" title="Dano">
              {damage}
            </span>
          ) : (
            <span />
          )}
          {block ? (
            <span className="stat-blk" title="Bloco">
              {block}
            </span>
          ) : (
            <span />
          )}
        </div>
      )}
    </button>
  )
}

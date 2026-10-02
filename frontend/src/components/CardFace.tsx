import { cardById } from '@game/catalog'
import type { CardType, Sigil } from '@game/types'

const TYPE_THEME: Record<CardType, { wash: string; label: string; rim: string }> = {
  golpe: { wash: '#9a3412', label: 'Golpe', rim: '#fb923c' },
  guarda: { wash: '#334155', label: 'Guarda', rim: '#94a3b8' },
  fluxo: { wash: '#92400e', label: 'Fluxo', rim: '#fbbf24' },
  escoria: { wash: '#3f6212', label: 'Escória', rim: '#a3e635' },
}

function SigilMark({ sigil, color }: { sigil: Sigil; color: string }) {
  const common = { fill: 'none', stroke: color, strokeWidth: 3.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (sigil) {
    case 'malho':
      return (
        <g>
          <rect x="28" y="22" width="36" height="16" rx="3" {...common} />
          <line x1="46" y1="38" x2="46" y2="78" {...common} />
        </g>
      )
    case 'placa':
      return <path d="M24 30 L46 18 L68 30 V70 L46 82 L24 70 Z" {...common} />
    case 'fole':
      return (
        <g>
          <ellipse cx="46" cy="40" rx="18" ry="14" {...common} />
          <path d="M32 50 L28 78 H64 L60 50" {...common} />
        </g>
      )
    case 'brasa':
      return <path d="M46 20 C58 36 64 48 46 80 C28 48 34 36 46 20 Z" {...common} />
    case 'pinca':
      return <path d="M28 78 L46 22 L64 78 M34 58 H58" {...common} />
    case 'lingote':
      return <path d="M26 38 L66 38 L58 74 H34 Z M30 38 L36 26 H56 L62 38" {...common} />
    case 'rebite':
      return (
        <g>
          <circle cx="46" cy="50" r="16" {...common} />
          <circle cx="46" cy="50" r="5" {...common} />
        </g>
      )
    case 'faisca':
      return <path d="M52 18 L34 52 H48 L40 82 L66 42 H50 Z" {...common} />
    case 'sucata':
      return <path d="M22 34 H70 L62 78 H30 Z M28 34 L36 22 H56 L64 34" {...common} />
    default:
      return <path d="M24 70 Q46 20 68 70" {...common} />
  }
}

interface CardFaceProps {
  cardId: string
  disabled?: boolean
  compact?: boolean
  onClick?: () => void
  price?: number
}

export function CardFace({ cardId, disabled, compact, onClick, price }: CardFaceProps) {
  const card = cardById(cardId)
  const theme = TYPE_THEME[card.type]
  const Tag = onClick ? 'button' : 'div'

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      disabled={disabled}
      className={`relative overflow-hidden rounded-xl border text-left shadow-ember transition ${
        compact ? 'w-[132px]' : 'w-[168px]'
      } ${disabled ? 'opacity-50' : onClick ? 'hover:-translate-y-1 hover:border-ember/70' : ''} border-white/10`}
      style={{ background: '#1a100b' }}
    >
      <div className="absolute inset-0 opacity-80" style={{ background: `radial-gradient(circle at 50% 30%, ${theme.wash}, transparent 70%)` }} />
      <div className="relative flex items-center justify-between px-2.5 pt-2">
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold"
          style={{ background: theme.rim, color: '#1a100b' }}
        >
          {card.cost}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: theme.rim }}>
          {theme.label}
        </span>
      </div>
      <svg viewBox="0 0 92 100" className={`relative mx-auto block ${compact ? 'h-20' : 'h-28'}`} aria-hidden="true">
        <SigilMark sigil={card.sigil} color={theme.rim} />
      </svg>
      <div className="relative border-t border-white/10 px-2.5 py-2">
        <p className="text-[13px] font-semibold text-soot-300">{card.name}</p>
        <p className="mt-0.5 text-[11px] leading-snug text-soot-500">{card.text}</p>
        {price !== undefined && (
          <p className="mt-1 text-[11px] font-medium text-ember">{price} ouro</p>
        )}
      </div>
    </Tag>
  )
}

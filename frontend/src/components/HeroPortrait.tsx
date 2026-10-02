import { Shield, Sword } from 'lucide-react'
import { BrandMark } from '@/components/BrandMark'
import type { Combatant, Intent } from '@game/types'
import { incomingDamage, intentCaption } from '@/lib/card-copy'
import { classArt, enemyArt } from '@/lib/art'

interface HeroPortraitProps {
  fighter: Combatant
  side: 'enemy' | 'player'
  intent?: Intent
}

export function HeroPortrait({ fighter, side, intent }: HeroPortraitProps) {
  const enemy = side === 'enemy'
  const incoming = enemy ? 0 : incomingDamage(intent, fighter.block)
  const attacking = intent && intent.kind !== 'DEFEND'
  const art = enemy ? enemyArt(fighter.id) : classArt(fighter.id)

  return (
    <div className={`hero-stack ${enemy ? 'hero-enemy' : 'hero-player'}`}>
      {enemy && (
        <div className={`intent-badge ${attacking ? 'intent-attack' : 'intent-defend'}`}>
          <span className="intent-icon">{attacking ? <Sword size={22} /> : <Shield size={22} />}</span>
          <span className="intent-value">{intent?.value ?? '?'}</span>
          <span className="intent-caption">{intentCaption(intent)}</span>
        </div>
      )}
      <div className="relative">
        <div className={`hero-frame ${enemy ? 'hero-frame-enemy' : 'hero-frame-player'}`}>
          {art ? (
            <img src={art} alt={fighter.name} className="hero-art" />
          ) : enemy ? (
            <span className="text-5xl font-black tracking-tight text-red-200/80">{fighter.name.slice(0, 1)}</span>
          ) : (
            <BrandMark size={76} />
          )}
        </div>
        <div className="hp-orb" title="Vida">
          {fighter.hp}
        </div>
        {fighter.block > 0 && (
          <div className="block-orb" title="Bloco absorve dano neste turno">
            <Shield size={13} />
            {fighter.block}
          </div>
        )}
      </div>
      <div className="text-center">
        <p className="font-semibold text-soot-300">{enemy ? fighter.name : 'Você'}</p>
        <p className="text-xs text-soot-500">
          {fighter.hp}/{fighter.maxHp}
          {fighter.burn > 0 ? ` · queima ${fighter.burn}` : ''}
        </p>
        {!enemy && incoming > 0 && (
          <p className="incoming-warn">Vai tomar {incoming} se encerrar agora</p>
        )}
        {!enemy && incoming === 0 && intent && intent.kind !== 'DEFEND' && fighter.block >= (intent.value ?? 0) && (
          <p className="text-xs font-medium text-sky-300">Bloco cobre o ataque</p>
        )}
      </div>
    </div>
  )
}

import { cardById } from '@game/catalog'
import type { Intent } from '@game/types'

export function cardHint(cardId: string): string {
  const { effect } = cardById(cardId)
  const parts: string[] = []
  if (effect.unplayable) return 'Não pode ser jogada. Só ocupa espaço na mão.'
  if (effect.damage) parts.push(`Causa ${effect.damage} de dano no inimigo`)
  if (effect.block) parts.push(`Você ganha ${effect.block} de bloco`)
  if (effect.draw) parts.push(`Compra ${effect.draw} carta${effect.draw > 1 ? 's' : ''}`)
  if (effect.burn) parts.push(`Aplica ${effect.burn} de queima (dano no fim do turno dele)`)
  if (effect.energyGain) parts.push(`Devolve ${effect.energyGain} de mana neste turno`)
  if (effect.selfDamage) parts.push(`Você perde ${effect.selfDamage} de vida`)
  if (effect.exhaust) parts.push('Some depois de jogar')
  return parts.join('. ') + '.'
}

export function intentCaption(intent?: Intent): string {
  if (!intent) return 'Preparando…'
  if (intent.kind === 'DEFEND') return 'Vai ganhar bloco'
  if (intent.kind === 'HEAVY') return 'Golpe pesado neste turno'
  return 'Vai atacar você'
}

export function incomingDamage(intent: Intent | undefined, block: number): number {
  if (!intent || intent.kind === 'DEFEND') return 0
  return Math.max(0, intent.value - block)
}

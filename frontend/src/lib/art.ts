const CLASS_ART = new Set(['foleiro', 'malhador', 'guarda-fogo', 'temperador'])
const SIGIL_ART = new Set([
  'malho',
  'placa',
  'fole',
  'brasa',
  'pinca',
  'lingote',
  'faisca',
  'sucata',
  'rebite',
  'fuligem',
])
const ENEMY_ART = new Set([
  'fera-ferrugem',
  'fera-espinhos',
  'aranha-vidro',
  'aranha-caldeira',
  'padre-forno',
  'fornalha-fria',
])

export const BOARD_ART = [
  '/art/board-1.jpg',
  '/art/board-2.jpg',
  '/art/board-3.jpg',
  '/art/board-4.jpg',
] as const

export function classArt(classId: string): string | undefined {
  if (!CLASS_ART.has(classId)) return undefined
  return `/art/class-${classId}.png`
}

export function sigilArt(sigil: string): string | undefined {
  if (!SIGIL_ART.has(sigil)) return undefined
  return `/art/sigil-${sigil}.jpg`
}

export function enemyArt(enemyId: string): string | undefined {
  if (!ENEMY_ART.has(enemyId)) return undefined
  return `/art/enemy-${enemyId}.png`
}

export function pickBoard(seed?: string): string {
  if (!seed) {
    return BOARD_ART[Math.floor(Math.random() * BOARD_ART.length)]
  }
  let hash = 0
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0
  }
  return BOARD_ART[hash % BOARD_ART.length]
}


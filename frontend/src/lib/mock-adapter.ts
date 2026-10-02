import type { AxiosAdapter, AxiosResponse } from 'axios'
import { startRun, enterNode, playCard, endTurn, pickReward, skipReward, buyShop, leaveShop, rest, chooseClass, confirmDeck } from '@game/engine'
import type { RunState, ScoreEntry } from '@game/types'
import type { Envelope, PublicUser } from './types'

const STORAGE = 'brasa-demo-v2'

interface DemoState {
  user: PublicUser
  run: RunState | null
  scores: ScoreEntry[]
}

const player: PublicUser = {
  id: 'user-foleiro',
  name: 'Foleiro',
  email: 'player@brasa.dev',
  role: 'PLAYER',
}

function load(): DemoState {
  const raw = localStorage.getItem(STORAGE)
  if (raw) {
    try {
      return JSON.parse(raw) as DemoState
    } catch {
      /* seed */
    }
  }
  return { user: player, run: null, scores: [] }
}

function save(state: DemoState) {
  localStorage.setItem(STORAGE, JSON.stringify(state))
}

function ok<T>(data: T, config: AxiosResponse['config']): AxiosResponse<Envelope<T>> {
  return {
    data: { success: true, data },
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  }
}

function fail(message: string, status: number): Promise<never> {
  return Promise.reject({
    isAxiosError: true,
    response: {
      status,
      data: { success: false, error: { code: 'DEMO', message } },
    },
  })
}

function rememberScore(state: DemoState, previous: RunState | null, next: RunState) {
  const finished = next.phase === 'WON' || next.phase === 'LOST'
  const wasOpen = previous?.phase !== 'WON' && previous?.phase !== 'LOST'
  if (!finished || !wasOpen) return
  state.scores.unshift({
    id: `score-${Date.now()}`,
    userId: next.userId,
    playerName: state.user.name,
    score: next.score,
    floors: next.map.filter((node) => node.cleared).length,
    won: next.phase === 'WON',
    createdAt: new Date().toISOString(),
  })
  state.scores = state.scores.sort((a, b) => b.score - a.score).slice(0, 10)
}

export const demoAdapter: AxiosAdapter = async (config) => {
  const url = `${config.baseURL ?? ''}${config.url ?? ''}`.replace(/https?:\/\/[^/]+/, '')
  const method = (config.method ?? 'get').toLowerCase()
  const body = typeof config.data === 'string' ? JSON.parse(config.data) : (config.data ?? {})
  const state = load()

  if (url.endsWith('/auth/login') && method === 'post') {
    if (body.email !== player.email || body.password !== 'password123') {
      return fail('Credenciais inválidas', 401)
    }
    return ok({ user: player, tokens: { accessToken: 'demo-access', refreshToken: 'demo-refresh' } }, config)
  }
  if (url.endsWith('/auth/me')) return ok(player, config)
  if (url.endsWith('/auth/logout') || url.endsWith('/auth/refresh')) {
    return ok({ accessToken: 'demo-access', refreshToken: 'demo-refresh', ok: true }, config)
  }
  if (url.endsWith('/scores') && method === 'get') return ok(state.scores, config)

  if (url.endsWith('/runs') && method === 'post') {
    if (state.run && state.run.phase !== 'WON' && state.run.phase !== 'LOST') {
      return ok(state.run, config)
    }
    state.run = startRun({ id: `run-${Date.now()}`, userId: player.id, seed: Date.now() % 10000 })
    save(state)
    return ok(state.run, config)
  }
  if (url.endsWith('/runs/current') && method === 'get') {
    if (!state.run) return fail('Run not found', 404)
    return ok(state.run, config)
  }

  if (!state.run) return fail('Run not found', 404)
  const previous = state.run
  try {
    if (url.endsWith('/enter')) state.run = enterNode(state.run)
    else if (url.endsWith('/class')) state.run = chooseClass(state.run, body.classId)
    else if (url.endsWith('/deck')) state.run = confirmDeck(state.run, body.cardIds)
    else if (url.endsWith('/play')) state.run = playCard(state.run, body.instanceId)
    else if (url.endsWith('/end-turn')) state.run = endTurn(state.run)
    else if (url.endsWith('/skip-reward')) state.run = skipReward(state.run)
    else if (url.endsWith('/reward')) state.run = pickReward(state.run, body.cardId)
    else if (url.endsWith('/leave-shop')) state.run = leaveShop(state.run)
    else if (url.endsWith('/shop')) state.run = buyShop(state.run, body.cardId)
    else if (url.endsWith('/rest')) state.run = rest(state.run)
    else return fail('Rota não mockada', 404)
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Jogada inválida', 422)
  }
  rememberScore(state, previous, state.run)
  save(state)
  return ok(state.run, config)
}

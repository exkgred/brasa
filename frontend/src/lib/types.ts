import type { RunState, ScoreEntry } from '@game/types'

export type UserRole = 'PLAYER'

export interface PublicUser {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt?: string
  updatedAt?: string
}

export interface Envelope<T> {
  success: boolean
  data: T
  error?: { code: string; message: string }
}

export type { RunState, ScoreEntry }

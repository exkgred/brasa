import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrandMark } from '@/components/BrandMark'
import { api, unwrap } from '@/lib/api'
import type { Envelope, PublicUser } from '@/lib/types'
import { useAuthStore } from '@/stores/auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const [email, setEmail] = useState('player@brasa.dev')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const { data } = await api.post<
        Envelope<{ user: PublicUser; tokens: { accessToken: string; refreshToken: string } }>
      >('/auth/login', { email, password })
      const session = unwrap(data)
      setSession(session.user, session.tokens.accessToken, session.tokens.refreshToken)
      navigate('/')
    } catch {
      setError('Credenciais inválidas')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_0.9fr]">
      <aside className="forge-grid relative hidden flex-col justify-between overflow-hidden border-r border-white/10 px-12 py-12 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(249,115,22,0.18),transparent_42%)]" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-soot-500">
            <BrandMark size={18} />
            Roguelike de cartas · Caldeira
          </div>
          <h1 className="mt-8 max-w-md text-4xl font-semibold tracking-tight text-soot-300">
            Os foles estão apagando.
            <span className="block text-ember">Desça ao Cinzeiro.</span>
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-soot-500">
            Quatro classes, um baralho que você monta, combate no estilo Hearthstone: mana, cartas na mão, inimigo em cima.
          </p>
        </div>
        <ol className="relative grid gap-3 text-sm text-soot-500">
          <li className="rounded-xl border border-white/10 bg-soot-900/50 px-4 py-3">
            <strong className="text-soot-300">Classe.</strong> Foleiro, Malhador, Guarda-fogo ou Temperador — vida e cartas diferentes.
          </li>
          <li className="rounded-xl border border-white/10 bg-soot-900/50 px-4 py-3">
            <strong className="text-soot-300">Baralho.</strong> 10 a 14 cartas. Clique para incluir ou tirar, depois desça.
          </li>
          <li className="rounded-xl border border-white/10 bg-soot-900/50 px-4 py-3">
            <strong className="text-soot-300">Combate.</strong> Cartas douradas jogam na hora. Encerrar turno: o inimigo faz o que avisou.
          </li>
        </ol>
      </aside>

      <div className="flex items-center justify-center px-4 py-10">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-md space-y-5 rounded-2xl border border-white/10 bg-soot-900/80 p-8 shadow-ember backdrop-blur"
        >
          <div>
            <div className="mb-4">
              <BrandMark size={48} />
            </div>
            <h2 className="text-2xl font-semibold text-soot-300">Entrar na forja</h2>
            <p className="mt-1 text-sm text-soot-500">A senha já vem preenchida.</p>
          </div>
          <label className="block text-sm font-medium text-soot-500">
            E-mail
            <input
              className="mt-1 w-full rounded-lg border border-soot-700 bg-soot-800 px-3 py-2.5 text-sm text-soot-300 outline-none focus:border-ember"
              value={email}
              autoComplete="username"
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-soot-500">
            Senha
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-soot-700 bg-soot-800 px-3 py-2.5 text-sm text-soot-300 outline-none focus:border-ember"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-ember py-2.5 font-medium text-soot-950 hover:bg-ember-hover disabled:opacity-60"
          >
            {busy ? 'Acendendo…' : 'Descer ao Cinzeiro'}
          </button>
          <p className="text-center text-xs text-soot-500">player@brasa.dev · password123</p>
        </form>
      </div>
    </div>
  )
}

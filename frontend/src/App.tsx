import { useEffect } from 'react'
import { Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { Flame, LogOut } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import LoginPage from '@/pages/LoginPage'
import PlayPage from '@/pages/PlayPage'

function Layout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-soot-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <NavLink to="/" className="flex items-center gap-2 font-semibold text-soot-300">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ember text-soot-950">
              <Flame size={16} />
            </span>
            Brasa
          </NavLink>
          <div className="flex items-center gap-3 text-sm text-soot-500">
            {user && <span>{user.name}</span>}
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md px-3 py-2 hover:bg-white/5 hover:text-soot-300"
              onClick={() => {
                logout()
                navigate('/login')
              }}
            >
              <LogOut size={14} /> Sair
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  )
}

function Private({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.accessToken)
  if (!token) return <Navigate to="/login" replace />
  return <Layout>{children}</Layout>
}

export default function App() {
  useEffect(() => {
    document.title = 'Brasa'
  }, [])

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Private><PlayPage /></Private>} />
    </Routes>
  )
}

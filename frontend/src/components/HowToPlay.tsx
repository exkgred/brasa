import { useEffect, useState } from 'react'
import { HelpCircle, X } from 'lucide-react'

const STORAGE = 'brasa-howto-v1'

const STEPS = [
  {
    title: '1. Classe e baralho',
    body: 'Escolha Foleiro, Malhador, Guarda-fogo ou Temperador. Monte 10 a 14 cartas. Depois desça ao mapa.',
  },
  {
    title: '2. Seu turno',
    body: 'Você joga primeiro. Os cristais azuis são mana. Cada carta mostra o custo no círculo do canto.',
  },
  {
    title: '3. Clique para jogar',
    body: 'Cartas com brilho dourado cabem na mana. Elas resolvem na hora: dano no inimigo ou bloco em você.',
  },
  {
    title: '4. O inimigo avisa',
    body: 'O número grande acima dele é o que fará ao Encerrar turno. Ataque vermelho, defesa cinza.',
  },
]

interface HowToPlayProps {
  autoOpen?: boolean
}

export function HowToPlay({ autoOpen = false }: HowToPlayProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!autoOpen) return
    if (localStorage.getItem(STORAGE) === '1') return
    setOpen(true)
  }, [autoOpen])

  function close() {
    localStorage.setItem(STORAGE, '1')
    setOpen(false)
  }

  return (
    <>
      <button type="button" className="howto-toggle" onClick={() => setOpen(true)} title="Como jogar">
        <HelpCircle size={18} />
        <span>Como jogar</span>
      </button>
      {open && (
        <div className="howto-backdrop" role="dialog" aria-modal="true" aria-labelledby="howto-title">
          <div className="howto-panel">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ember">Brasa</p>
                <h2 id="howto-title" className="text-xl font-semibold text-soot-300">
                  Como o combate funciona
                </h2>
              </div>
              <button type="button" className="rounded-md p-1 text-soot-500 hover:bg-white/5" onClick={close}>
                <X size={18} />
              </button>
            </div>
            <ol className="space-y-3">
              {STEPS.map((step) => (
                <li key={step.title} className="rounded-xl border border-white/10 bg-soot-950/70 px-4 py-3">
                  <p className="font-semibold text-soot-300">{step.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-soot-500">{step.body}</p>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-center text-xs text-soot-500">Azul = mana · vermelho = dano · cinza = bloco</p>
            <button type="button" className="mt-4 w-full rounded-lg bg-ember py-2.5 font-semibold text-soot-950" onClick={close}>
              Entendi — jogar
            </button>
          </div>
        </div>
      )}
    </>
  )
}

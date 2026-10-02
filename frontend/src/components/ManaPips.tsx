interface ManaPipsProps {
  energy: number
  max: number
}

export function ManaPips({ energy, max }: ManaPipsProps) {
  return (
    <div className="mana-tray">
      <div className="flex items-end justify-center gap-1">
        {Array.from({ length: max }, (_, index) => {
          const filled = index < energy
          return <span key={index} className={`mana-pip ${filled ? 'mana-pip-on' : ''}`} />
        })}
      </div>
      <p className="mana-count">
        {energy}/{max} mana
      </p>
    </div>
  )
}

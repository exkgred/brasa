interface BrandMarkProps {
  size?: number
  className?: string
}

export function BrandMark({ size = 32, className }: BrandMarkProps) {
  return (
    <img
      src="/art/logo-brasa.png"
      alt="Brasa"
      height={size}
      className={className}
      style={{ height: size, width: 'auto' }}
    />
  )
}

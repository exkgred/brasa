interface BrandMarkProps {
  size?: number
  className?: string
}

export function BrandMark({ size = 32, className }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="#1c120c" />
      <rect x="1" y="1" width="30" height="30" rx="7" fill="none" stroke="#3d2618" strokeWidth="1" />
      <path
        d="M16 6.5C20.2 12.2 22.4 16.4 16 26.5C9.6 16.4 11.8 12.2 16 6.5Z"
        fill="#f97316"
      />
      <path
        d="M16 10.2C18.4 13.6 19.4 16 16 21.8C12.6 16 13.6 13.6 16 10.2Z"
        fill="#ffedd5"
      />
      <circle cx="16" cy="16.5" r="1.6" fill="#9a3412" />
    </svg>
  )
}

interface BrandPanelProps {
  className?: string
}

export function BrandPanel({ className }: BrandPanelProps) {
  // Intentionally empty: the first page branding panel is removed.
  void className
  return null
}

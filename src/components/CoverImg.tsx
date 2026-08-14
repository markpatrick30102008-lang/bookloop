import { useState } from "react"

export function CoverImg({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div className={`flex items-center justify-center bg-mist ${className ?? ""}`}>
        <span className="font-display text-3xl text-forest/50">📖</span>
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className ?? ""}
    />
  )
}

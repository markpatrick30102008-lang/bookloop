import { useState } from "react"

const BASE = "aspect-[2/3] w-full rounded-xl object-cover"

export function CoverImg({
  src,
  alt,
  className,
  ratio = true,
}: {
  src: string
  alt: string
  className?: string
  ratio?: boolean
}) {
  const [failed, setFailed] = useState(false)
  const cls = `${ratio ? BASE : "object-cover"} ${className ?? ""}`
  if (failed) {
    return (
      <div className={`flex items-center justify-center bg-mist ${cls}`}>
        <span className="font-display text-3xl text-forest/50">📖</span>
      </div>
    )
  }
  return <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} className={cls} />
}
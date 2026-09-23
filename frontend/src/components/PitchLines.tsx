/** Decorative pitch diagram; no canvas, textures, timers or WebGL context. */
export default function PitchLines() {
  return (
    <div className="pitch-scene" aria-hidden="true">
      <svg className="pitch-lines" viewBox="0 0 640 380" fill="none">
        <rect x="22" y="22" width="596" height="336" rx="2" />
        <path d="M320 22v336M22 102h100v176H22M618 102H518v176h100M22 146h40v88H22M618 146h-40v88h40" />
        <circle cx="320" cy="190" r="58" />
        <circle cx="320" cy="190" r="3" fill="currentColor" stroke="none" />
        <path d="M122 144a58 58 0 0 1 0 92M518 144a58 58 0 0 0 0 92" />
      </svg>
    </div>
  )
}

import { useId } from 'react'

/** Stylised placeholder kit, coloured by the surrounding club identity. */
export default function KitIllustration({ number }: { number: number }) {
  const id = useId()
  return (
    <svg className="kit-illustration" viewBox="0 0 240 260" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="white" stopOpacity=".28" />
          <stop offset=".45" stopColor="white" stopOpacity="0" />
          <stop offset="1" stopColor="black" stopOpacity=".4" />
        </linearGradient>
      </defs>
      <path
        d="M76 28 42 42 9 101 49 122 65 96 58 232 Q120 250 182 232 L175 96 191 122 231 101 198 42 164 28 Q120 51 76 28Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M84 36 99 240 M143 39 156 239"
        fill="none"
        stroke="#0c192a"
        strokeWidth="22"
        opacity=".2"
      />
      <path d="M76 28 Q120 75 164 28 L151 24 Q120 46 89 24Z" fill="#132236" />
      <path d="M13 94 52 115 M188 115 227 94" stroke="#132236" strokeWidth="8" />
      <path
        d="M76 28 42 42 9 101 49 122 65 96 58 232 Q120 250 182 232 L175 96 191 122 231 101 198 42 164 28 Q120 51 76 28Z"
        fill={'url(#' + id + ')'}
      />
      <text
        x="120"
        y="87"
        textAnchor="middle"
        fill="#111f32"
        fontSize="12"
        letterSpacing="3"
        fontFamily="sans-serif"
        fontWeight="700"
      >
        MUSU
      </text>
      <text
        x="120"
        y="181"
        textAnchor="middle"
        fill="#102038"
        fontSize="91"
        fontFamily="Barlow Condensed, sans-serif"
        fontWeight="700"
      >
        {number}
      </text>
    </svg>
  )
}

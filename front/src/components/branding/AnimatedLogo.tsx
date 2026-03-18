export function AnimatedLogo({ className = "h-28 w-28" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 512 512"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Animated EPAS logo"
    >
      <defs>
        <radialGradient id="animBgGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(345 142) rotate(134.092) scale(352.423)">
          <stop offset="0" stopColor="#1E5DCA" />
          <stop offset="0.33" stopColor="#0F326F" />
          <stop offset="0.72" stopColor="#091737" />
          <stop offset="1" stopColor="#050C1F" />
        </radialGradient>
        <linearGradient id="animSurface" x1="88" y1="84" x2="424" y2="446" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#163D81" />
          <stop offset="0.28" stopColor="#0D2250" />
          <stop offset="0.62" stopColor="#081632" />
          <stop offset="1" stopColor="#050B1C" />
        </linearGradient>
        <linearGradient id="animEpasGradient" x1="136" y1="376" x2="400" y2="132" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#174CCB" />
          <stop offset="0.46" stopColor="#12A6E3" />
          <stop offset="1" stopColor="#27D8BE" />
        </linearGradient>
        <linearGradient id="animNibGradient" x1="238" y1="322" x2="334" y2="188" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0E78C8" />
          <stop offset="1" stopColor="#1CA6D7" />
        </linearGradient>
        <filter id="animBadgeShadow" x="22" y="34" width="468" height="470" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="22" stdDeviation="22" floodColor="#020617" floodOpacity=".34" />
        </filter>
        <clipPath id="animHexClip">
          <path d="M171 111 380 166 435 247 336 396 149 347 93 266Z" />
        </clipPath>
        <clipPath id="animLeftHalf">
          <rect x="85" y="80" width="160" height="360" />
        </clipPath>
        <clipPath id="animRightHalf">
          <rect x="245" y="80" width="200" height="360" />
        </clipPath>
      </defs>

      <g filter="url(#animBadgeShadow)">
        <rect x="48" y="48" width="416" height="416" rx="88" fill="url(#animBgGlow)" />
        <rect x="48" y="48" width="416" height="416" rx="88" fill="url(#animSurface)" fillOpacity=".9" />
        <rect x="49.5" y="49.5" width="413" height="413" rx="86.5" stroke="white" strokeOpacity=".06" strokeWidth="3" />
      </g>

      <g transform="translate(8 6) scale(.92)">
        <g transform="rotate(-14 256 256)">
          <g clipPath="url(#animHexClip)">
            <g clipPath="url(#animLeftHalf)">
              <g stroke="url(#animEpasGradient)" strokeWidth="13" strokeLinecap="square">
                <line x1="124" y1="82" x2="124" y2="424" />
                <line x1="149" y1="82" x2="149" y2="424" />
                <line x1="174" y1="82" x2="174" y2="424" />
                <line x1="199" y1="82" x2="199" y2="424" />
                <line x1="224" y1="82" x2="224" y2="424" />
              </g>
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 0; -14 10; -24 16; 0 0"
                keyTimes="0;0.36;0.68;1"
                dur="4.8s"
                repeatCount="indefinite"
              />
              <animateTransform
                attributeName="transform"
                additive="sum"
                type="rotate"
                values="0 214 252; -8 214 252; -14 214 252; 0 214 252"
                keyTimes="0;0.36;0.68;1"
                dur="4.8s"
                repeatCount="indefinite"
              />
            </g>

            <g clipPath="url(#animRightHalf)">
              <g stroke="url(#animEpasGradient)" strokeWidth="13" strokeLinecap="square">
                <line x1="249" y1="82" x2="249" y2="424" />
                <line x1="274" y1="82" x2="274" y2="424" />
                <line x1="299" y1="82" x2="299" y2="424" />
                <line x1="324" y1="82" x2="324" y2="424" />
                <line x1="349" y1="82" x2="349" y2="424" />
                <line x1="374" y1="82" x2="374" y2="424" />
                <line x1="399" y1="82" x2="399" y2="424" />
              </g>
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 0; 12 -8; 22 -14; 0 0"
                keyTimes="0;0.36;0.68;1"
                dur="4.8s"
                repeatCount="indefinite"
              />
              <animateTransform
                attributeName="transform"
                additive="sum"
                type="rotate"
                values="0 305 252; 8 305 252; 12 305 252; 0 305 252"
                keyTimes="0;0.36;0.68;1"
                dur="4.8s"
                repeatCount="indefinite"
              />
            </g>
          </g>

          <path d="M188 316 247 208 303 173 278 286 221 344Z" fill="#DDF8FF">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0; -8 6; -15 10; 0 0"
              keyTimes="0;0.36;0.68;1"
              dur="4.8s"
              repeatCount="indefinite"
            />
          </path>
          <path d="M247 208 343 173 280 287 221 344Z" fill="url(#animNibGradient)">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0; 8 -5; 14 -9; 0 0"
              keyTimes="0;0.36;0.68;1"
              dur="4.8s"
              repeatCount="indefinite"
            />
          </path>
        </g>

        <circle cx="120" cy="298" r="10" fill="url(#animEpasGradient)">
          <animate attributeName="opacity" values="1;0.45;1;1" keyTimes="0;0.48;0.82;1" dur="4.8s" repeatCount="indefinite" />
          <animate attributeName="r" values="10;13;10;10" keyTimes="0;0.48;0.82;1" dur="4.8s" repeatCount="indefinite" />
        </circle>
      </g>
    </svg>
  );
}

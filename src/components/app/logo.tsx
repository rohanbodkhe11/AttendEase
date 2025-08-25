
export function Logo() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div style={{ width: '150px', height: '60px' }}>
        <svg viewBox="0 0 160 65" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Green Orbit */}
          <path d="M 80,15 C 40,15 10,45 10,45 C 10,45 40,75 80,45 C 120,15 150,45 150,45 C 150,45 120,-15 80,15 Z" fill="none" stroke="#6EBE44" strokeWidth="4" />
          
          {/* M */}
          <path d="M25 45 L25 25 L30 20 L35 25 L35 45 L40 45 L40 25 L47.5 20 L55 25 L55 45 L60 45 L60 20 L20 20 Z" fill="#003C5A" />

          {/* I */}
          <g transform="translate(65, 18)">
            <rect x="0" y="2" width="5" height="25" fill="#003C5A" />
            <polygon points="2.5,0 12.5,0 7.5,-10" fill="#F58220" />
            <rect x="10" y="2" width="5" height="25" fill="#003C5A" />
          </g>
          
          {/* T */}
          <path d="M85 20 L105 20 L105 25 L97.5 25 L97.5 45 L92.5 45 L92.5 25 L85 25 Z" fill="#003C5A" />

          {/* CSN */}
          <text x="115" y="42" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="bold" fill="#003C5A" >
            CSN
          </text>
          
           {/* Trademark symbol */}
          <text x="147" y="28" fontFamily="Arial, sans-serif" fontSize="8" fill="#003C5A">TM</text>
        </svg>
      </div>
      <span className="text-lg font-bold tracking-tight text-foreground">MIT CSN Attendance</span>
    </div>
  );
}

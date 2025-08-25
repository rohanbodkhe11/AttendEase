
export function Logo() {
  return (
    <div className="flex items-center gap-2" style={{ width: '200px', height: '40px' }}>
      <svg viewBox="0 0 250 40" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <style>
          {`
            .mit-csn-text {
              font-family: "Helvetica Neue", "Arial", sans-serif;
              font-weight: 700;
              font-size: 38px;
              fill: #003C5A;
              letter-spacing: -2px;
            }
            .mit-i-triangle {
              fill: #F58220;
            }
            .mit-csn-tm {
                font-family: "Helvetica Neue", "Arial", sans-serif;
                font-size: 10px;
                font-weight: 600;
                fill: #003C5A;
            }
          `}
        </style>
        
        {/* M */}
        <path d="M 0,35 L 0,8 L 5,0 L 10,8 L 10,35 L 20,35 L 20,8 L 30,35 L 40,35 L 40,8 L 45,0 L 50,8 L 50,35 L 60, 35 L 60, 0 L 0, 0 Z" fill="#003C5A" transform="translate(0, 2) scale(0.9)" />

        <g transform="translate(65, 0) scale(0.9)">
            {/* I replacement */}
            <rect x="0" y="8" width="8" height="27" fill="#003C5A" />
            <polygon points="0,6 18,6 9,0" className="mit-i-triangle" />
            <rect x="10" y="8" width="8" height="27" fill="#003C5A" />
        </g>
        
        <text x="100" y="32" className="mit-csn-text">
            <tspan>CSN</tspan>
        </text>
        <text x="195" y="15" className="mit-csn-tm">TM</text>
      </svg>
    </div>
  );
}

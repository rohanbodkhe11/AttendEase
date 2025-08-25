
export function Logo() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div style={{ width: '150px', height: '40px' }}>
        <svg viewBox="0 0 300 70" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <style>
              {`.mit-csn-blue { fill: #003C5A; } .mit-csn-orange { fill: #F58220; }`}
            </style>
          </defs>
          
          {/* M */}
          <path className="mit-csn-blue" d="M10 10 L20 10 L20 50 L10 50 Z" />
          <path className="mit-csn-blue" d="M22 25 L38 10 L43 10 L27 25 Z" />
          <path className="mit-csn-blue" d="M48 10 L64 25 L59 25 L43 10 Z" />
          <path className="mit-csn-blue" d="M66 10 L76 10 L76 50 L66 50 Z" />
          
          {/* I */}
          <path className="mit-csn-blue" d="M83 20 L93 20 L93 50 L83 50 Z" />
          <polygon className="mit-csn-orange" points="83,18 93,18 98,10 88,10" />
          
          {/* T */}
          <path className="mit-csn-blue" d="M100 10 L110 20 L120 20 L120 10 Z" />
          <path className="mit-csn-blue" d="M113 22 L113 50 L103 50 L103 22 Z" />
          
          {/* C */}
          <path className="mit-csn-blue" d="M152.6,40.1c-6.8,6.8-16.5,8.8-25,6.5l2.6-9.1c5.9,1.5,12.2-0.1,16.7-4.6c4.5-4.5,6-10.8,4.6-16.7l9.1-2.6C163.5,19.5,161.4,31.2,152.6,40.1z M132,12.2l-3.2,11c-0.4-0.1-0.9-0.2-1.3-0.2c-5.5,0-10,4.5-10,10s4.5,10,10,10c0.5,0,1-0.1,1.5-0.2l3.2,11.1c-1,0.2-2,0.3-3,0.3c-11.6,0-21-9.4-21-21S119,12,130.5,12C131,12,131.5,12.1,132,12.2z" />
          
          {/* S */}
          <path className="mit-csn-blue" d="M196.1,28.8c0-5.5-4.5-10-10-10h-12.3c-4.9,0-9,3.6-9.8,8.4l-9.1-2.6c1.7-8.8,9.7-15.8,18.9-15.8h12.3c11.6,0,21,9.4,21,21c0,10-7.2,18.3-16.7,20.4l-2.6-9.1C193.3,40.1,196.1,34.8,196.1,28.8z M186.1,43.2c5.5,0,10,4.5,10,10c0,4.3-2.7,8-6.5,9.4l9.1,2.6c8.8-3.4,15.4-11.8,15.4-22c0-11.6-9.4-21-21-21c-1.3,0-2.6,0.1-3.9,0.4L186.1,43.2z" />
          
          {/* N */}
          <path className="mit-csn-blue" d="M220,10 L230,10 L230,50 L220,50 Z" />
          <path className="mit-csn-blue" d="M220,10 L245,50 L255,50 L230,10 Z" />
          <path className="mit-csn-blue" d="M245,10 L255,10 L255,50 L245,50 Z" />
          
          {/* .TM */}
          <circle className="mit-csn-blue" cx="260" cy="50" r="3" />
          <text x="268" y="40" fontFamily="sans-serif" fontSize="12" className="mit-csn-blue">TM</text>
        </svg>
      </div>
      <span className="text-lg font-bold tracking-tight text-foreground">MIT CSN Attendance</span>
    </div>
  );
}

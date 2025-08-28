
export function Logo() {
  return (
    <div className="flex items-center gap-2">
       <svg width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.5 9V33H10.5V16.5H16.5V33H22.5V9C22.5 6.75 20.7 4.5 18 4.5H9C6.3 4.5 4.5 6.75 4.5 9Z" fill="hsl(var(--primary))"/>
        <path d="M22.5 19.5V33H28.5V27H34.5V19.5C34.5 17.25 32.7 15 30 15H27C24.3 15 22.5 17.25 22.5 19.5Z" fill="hsl(var(--accent))"/>
        </svg>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        AttendEase
      </h1>
    </div>
  );
}

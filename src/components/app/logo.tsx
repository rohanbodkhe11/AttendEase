import { CheckSquare } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <CheckSquare className="h-8 w-8 text-primary" />
      <h1 className="text-2xl font-bold text-primary">
        AttendEase
      </h1>
    </div>
  );
}

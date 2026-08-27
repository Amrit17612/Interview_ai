
import { Sun } from 'lucide-react';
import { Button } from './Button';

// ThemeToggle Placeholder - Light mode only for Version 1
export function ThemeToggle() {
  return (
    <Button variant="ghost" size="sm" className="w-9 px-0" aria-label="Toggle theme">
      <Sun className="h-[1.2rem] w-[1.2rem] text-brand-600" />
      <span className="sr-only">Toggle theme (Placeholder)</span>
    </Button>
  );
}

interface LogoMarkProps {
  className?: string;
  variant?: 'icon' | 'full';
}

export function LogoMark({ className = 'w-8 h-8', variant = 'icon' }: LogoMarkProps) {
  if (variant === 'full') {
    return (
      <div className="flex items-center gap-2">
        <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" className="text-primary" />
          <path d="M12 14h8M14 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent" />
        </svg>
        <span className="font-bold font-display text-ink text-lg">HireAI</span>
      </div>
    );
  }

  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" className="text-primary" />
      <path d="M12 14h8M14 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent" />
    </svg>
  );
}

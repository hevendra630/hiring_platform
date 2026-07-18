interface LogoMarkProps {
  className?: string;
  variant?: 'icon' | 'full';
}

export function LogoMark({ className = 'w-8 h-8', variant = 'icon' }: LogoMarkProps) {
  if (variant === 'full') {
    return (
      <div className="flex items-center gap-3">
        <img src="/hireai_logo.png" alt="HireAI Logo" className={`${className} object-contain`} />
        <span className="font-bold font-display text-white text-xl tracking-wide">Hire<span className="text-primary">AI</span></span>
      </div>
    );
  }

  return (
    <img src="/hireai_logo.png" alt="HireAI Logo" className={`${className} object-contain`} />
  );
}

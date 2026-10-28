import React from 'react';

interface ProgressBarProps {
  progress: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'brand' | 'indigo' | 'emerald' | 'amber' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  showPercentage = true,
  color = 'brand',
  size = 'md',
}) => {
  const clamped = Math.max(0, Math.min(100, Math.round(progress)));

  const heightClass = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }[size];

  const colorGradient = {
    brand: 'bg-gradient-to-r from-brand-500 to-brand-600',
    indigo: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
    emerald: 'bg-gradient-to-r from-emerald-500 to-teal-600',
    amber: 'bg-gradient-to-r from-amber-500 to-orange-500',
    gradient: 'bg-gradient-to-r from-brand-500 via-purple-500 to-royal-600',
  }[color];

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-xs font-medium text-slate-600 mb-1.5">
          {label && <span>{label}</span>}
          {showPercentage && <span className="font-semibold text-slate-800">{clamped}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`${heightClass} ${colorGradient} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};


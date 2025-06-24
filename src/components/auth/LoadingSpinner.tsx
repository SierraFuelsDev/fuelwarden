interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div 
        className={`${sizeClasses[size]} border-2 border-[#ff8e01] border-t-transparent rounded-full animate-spin`}
      />
    </div>
  );
}

export function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1c1c1e]">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-white text-lg font-medium">Loading...</p>
      </div>
    </div>
  );
} 
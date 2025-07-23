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
      <div className="relative">
        {/* Outer ring */}
        <div 
          className={`${sizeClasses[size]} border-2 border-[#ff8e01] rounded-full animate-spin`}
        />
        {/* Inner pulsing dot */}
        <div 
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-[#ff8e01] rounded-full animate-pulse`}
          style={{
            animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
        />
        {/* Glow effect */}
        <div 
          className={`absolute inset-0 ${sizeClasses[size]} bg-[#ff8e01] rounded-full opacity-20 animate-ping`}
          style={{
            animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
          }}
        />
      </div>
    </div>
  );
}

export function FullPageSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#1c1c1e] z-50">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mb-6" />
        <p className="text-white text-lg font-medium animate-pulse">Loading...</p>
      </div>
    </div>
  );
} 
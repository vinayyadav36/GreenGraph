interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  className?: string;
  lines?: number;
}

export function Skeleton({ variant = 'text', width, height, className = '', lines = 1 }: SkeletonProps) {
  const baseClass = 'animate-pulse bg-gray-200 rounded';

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  if (variant === 'circular') {
    const size = width || height || 40;
    return (
      <div
        className={`${baseClass} rounded-full ${className}`}
        style={{ width: size, height: size, ...style }}
        aria-hidden="true"
      />
    );
  }

  if (variant === 'rectangular') {
    return (
      <div
        className={`${baseClass} rounded-lg ${className}`}
        style={{ width: width || '100%', height: height || 120, ...style }}
        aria-hidden="true"
      />
    );
  }

  // text variant
  if (lines > 1) {
    return (
      <div className={`flex flex-col gap-2 ${className}`} aria-hidden="true">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${baseClass} h-4`}
            style={{ width: i === lines - 1 ? '70%' : '100%' }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClass} h-4 ${className}`}
      style={{ width: width || '100%', ...style }}
      aria-hidden="true"
    />
  );
}

export default Skeleton;

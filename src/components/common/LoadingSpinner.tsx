interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'gray';
  text?: string;
}

export function LoadingSpinner({ size = 'md', color = 'blue', text }: LoadingSpinnerProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4 border-2';
      case 'lg':
        return 'w-8 h-8 border-4';
      case 'md':
      default:
        return 'w-6 h-6 border-2';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return 'border-ptt-green border-t-transparent';
      case 'gray':
        return 'border-gray-300 border-t-transparent';
      case 'blue':
      default:
        return 'border-ptt-blue border-t-transparent';
    }
  };

  return (
    <div className="flex items-center justify-center gap-3">
      <div 
        className={`${getSizeClasses()} ${getColorClasses()} rounded-full animate-spin`}
      />
      {text && (
        <span className="text-sm text-ptt-gray">{text}</span>
      )}
    </div>
  );
} 
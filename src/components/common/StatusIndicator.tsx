interface StatusIndicatorProps {
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusIndicator({ status, text, size = 'md' }: StatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          color: 'bg-ptt-green',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          animation: 'animate-pulse-slow',
        };
      case 'connecting':
        return {
          color: 'bg-yellow-500',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          animation: 'animate-pulse',
        };
      case 'error':
        return {
          color: 'bg-ptt-red',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          animation: '',
        };
      case 'disconnected':
      default:
        return {
          color: 'bg-gray-500',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          animation: '',
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          dot: 'w-1.5 h-1.5',
          container: 'px-2 py-1 text-xs',
        };
      case 'lg':
        return {
          dot: 'w-3 h-3',
          container: 'px-4 py-2 text-base',
        };
      case 'md':
      default:
        return {
          dot: 'w-2 h-2',
          container: 'px-3 py-1.5 text-sm',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const sizeClasses = getSizeClasses();

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border ${statusConfig.bgColor} ${statusConfig.textColor} ${sizeClasses.container} font-medium`}>
      <div className={`${sizeClasses.dot} ${statusConfig.color} rounded-full ${statusConfig.animation}`}></div>
      {text && <span>{text}</span>}
    </div>
  );
} 
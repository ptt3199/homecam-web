import { VolumeSlider } from './VolumeSlider';
import { AudioControlsProps } from '@/types/camera';

export function AudioControls({
  microphoneEnabled,
  speakerEnabled,
  microphoneVolume,
  speakerVolume,
  isRecording,
  onToggleMicrophone,
  onToggleSpeaker,
  onVolumeChange,
}: AudioControlsProps) {
  return (
    <div className="space-y-6">
      {/* Microphone Controls */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Microphone
          </label>
          <button
            onClick={onToggleMicrophone}
            className={`relative w-12 h-6 rounded-full transition-all duration-200 ptt-button-hover ${
              microphoneEnabled 
                ? 'bg-blue-500 shadow-lg shadow-blue-500/25' 
                : 'bg-slate-300 dark:bg-slate-600'
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                microphoneEnabled ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
        
        <VolumeSlider
          volume={microphoneVolume}
          onVolumeChange={(volume) => onVolumeChange('microphone', volume)}
          disabled={!microphoneEnabled}
          label="Mic Volume"
        />
        
        {isRecording && (
          <div className="flex items-center space-x-2 text-xs text-red-600 dark:text-red-400">
            <div className="w-2 h-2 bg-red-500 rounded-full ptt-recording-pulse" />
            <span>Recording active</span>
          </div>
        )}
      </div>

      {/* Speaker Controls */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Speaker
          </label>
          <button
            onClick={onToggleSpeaker}
            className={`relative w-12 h-6 rounded-full transition-all duration-200 ptt-button-hover ${
              speakerEnabled 
                ? 'bg-green-500 shadow-lg shadow-green-500/25' 
                : 'bg-slate-300 dark:bg-slate-600'
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                speakerEnabled ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
        
        <VolumeSlider
          volume={speakerVolume}
          onVolumeChange={(volume) => onVolumeChange('speaker', volume)}
          disabled={!speakerEnabled}
          label="Speaker Volume"
        />
      </div>

      {/* Audio Status */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <div className="flex justify-between">
            <span>Microphone:</span>
            <span className={`font-medium ${
              microphoneEnabled 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-slate-400'
            }`}>
              {microphoneEnabled ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Speaker:</span>
            <span className={`font-medium ${
              speakerEnabled 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-slate-400'
            }`}>
              {speakerEnabled ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 
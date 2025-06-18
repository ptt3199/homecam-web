import { useState, useCallback, useRef, useEffect } from 'react';
import { AudioState } from '@/types/camera';
import { DEFAULTS, STORAGE_KEYS } from '@/lib/constants';
import { useLocalStorage } from './useLocalStorage';

export function useAudio() {
  const [microphoneEnabled, setMicrophoneEnabledStorage] = useLocalStorage<boolean>(STORAGE_KEYS.MICROPHONE_ENABLED, true);
  const [speakerEnabled, setSpeakerEnabledStorage] = useLocalStorage<boolean>(STORAGE_KEYS.SPEAKER_ENABLED, true);
  const [microphoneVolume, setMicrophoneVolumeStorage] = useLocalStorage<number>(STORAGE_KEYS.MICROPHONE_VOLUME, DEFAULTS.MICROPHONE_VOLUME);
  const [speakerVolume, setSpeakerVolumeStorage] = useLocalStorage<number>(STORAGE_KEYS.SPEAKER_VOLUME, DEFAULTS.SPEAKER_VOLUME);

  const [audioState, setAudioState] = useState<AudioState>({
    microphoneEnabled,
    speakerEnabled,
    microphoneVolume,
    speakerVolume,
    isRecording: false,
  });

  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Update audio state when localStorage values change
  useEffect(() => {
    setAudioState(prev => ({
      ...prev,
      microphoneEnabled,
      speakerEnabled,
      microphoneVolume,
      speakerVolume,
    }));
  }, [microphoneEnabled, speakerEnabled, microphoneVolume, speakerVolume]);

  // Request microphone access
  const requestMicrophoneAccess = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      setMediaStream(stream);
      return true;
    } catch (error) {
      console.error('Microphone access denied:', error);
      return false;
    }
  }, []);

  // Initialize audio context
  const initializeAudioContext = useCallback(() => {
    if (!audioContext) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);
      return ctx;
    }
    return audioContext;
  }, [audioContext]);

  // Toggle microphone
  const toggleMicrophone = useCallback(async () => {
    const newEnabled = !audioState.microphoneEnabled;
    
    if (newEnabled) {
      const hasAccess = await requestMicrophoneAccess();
      if (!hasAccess) {
        return false;
      }
    } else {
      // Stop microphone stream
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        setMediaStream(null);
      }
    }

    setMicrophoneEnabledStorage(newEnabled);
    setAudioState(prev => ({ ...prev, microphoneEnabled: newEnabled, isRecording: newEnabled }));
    return true;
  }, [audioState.microphoneEnabled, mediaStream, requestMicrophoneAccess, setMicrophoneEnabledStorage]);

  // Toggle speaker
  const toggleSpeaker = useCallback(() => {
    const newEnabled = !audioState.speakerEnabled;
    setSpeakerEnabledStorage(newEnabled);
    setAudioState(prev => ({ ...prev, speakerEnabled: newEnabled }));

    // Apply speaker mute to audio element if exists
    if (audioElementRef.current) {
      audioElementRef.current.muted = !newEnabled;
    }
  }, [audioState.speakerEnabled, setSpeakerEnabledStorage]);

  // Set microphone volume
  const setMicrophoneVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(100, volume));
    setMicrophoneVolumeStorage(clampedVolume);
    setAudioState(prev => ({ ...prev, microphoneVolume: clampedVolume }));

    // Apply volume to media stream if exists
    if (mediaStream && audioContext) {
      try {
        const source = audioContext.createMediaStreamSource(mediaStream);
        const gainNode = audioContext.createGain();
        gainNode.gain.value = clampedVolume / 100;
        source.connect(gainNode);
      } catch (error) {
        console.warn('Failed to apply microphone volume:', error);
      }
    }
  }, [mediaStream, audioContext, setMicrophoneVolumeStorage]);

  // Set speaker volume
  const setSpeakerVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(100, volume));
    setSpeakerVolumeStorage(clampedVolume);
    setAudioState(prev => ({ ...prev, speakerVolume: clampedVolume }));

    // Apply volume to audio element if exists
    if (audioElementRef.current) {
      audioElementRef.current.volume = clampedVolume / 100;
    }
  }, [setSpeakerVolumeStorage]);

  // Set volume for both microphone and speaker
  const setVolume = useCallback((type: 'microphone' | 'speaker', volume: number) => {
    if (type === 'microphone') {
      setMicrophoneVolume(volume);
    } else {
      setSpeakerVolume(volume);
    }
  }, [setMicrophoneVolume, setSpeakerVolume]);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!audioState.microphoneEnabled) {
      const hasAccess = await requestMicrophoneAccess();
      if (!hasAccess) return false;
    }

    setAudioState(prev => ({ ...prev, isRecording: true }));
    return true;
  }, [audioState.microphoneEnabled, requestMicrophoneAccess]);

  // Stop recording
  const stopRecording = useCallback(() => {
    setAudioState(prev => ({ ...prev, isRecording: false }));
  }, []);

  // Get audio element for speaker output
  const getAudioElement = useCallback(() => {
    if (!audioElementRef.current) {
      audioElementRef.current = new Audio();
      audioElementRef.current.volume = audioState.speakerVolume / 100;
      audioElementRef.current.muted = !audioState.speakerEnabled;
    }
    return audioElementRef.current;
  }, [audioState.speakerVolume, audioState.speakerEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      if (audioContext) {
        audioContext.close();
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
    };
  }, [mediaStream, audioContext]);

  return {
    audioState,
    mediaStream,
    toggleMicrophone,
    toggleSpeaker,
    setMicrophoneVolume,
    setSpeakerVolume,
    setVolume,
    startRecording,
    stopRecording,
    requestMicrophoneAccess,
    initializeAudioContext,
    getAudioElement,
  };
} 
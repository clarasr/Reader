import { useState, useEffect } from 'react';

// Web Speech API types
interface SpeechSynthesisUtterance {
  text: string;
  lang: string;
  pitch: number;
  rate: number;
  voice: SpeechSynthesisVoice | null;
  volume: number;
  onend: () => void;
  onpause: () => void;
  onresume: () => void;
  onstart: () => void;
}

interface SpeechSynthesis {
  speaking: boolean;
  paused: boolean;
  pending: boolean;
  onvoiceschanged: () => void;
  getVoices: () => SpeechSynthesisVoice[];
  speak: (utterance: SpeechSynthesisUtterance) => void;
  cancel: () => void;
  pause: () => void;
  resume: () => void;
}

interface SpeechSynthesisVoice {
  default: boolean;
  lang: string;
  localService: boolean;
  name: string;
  voiceURI: string;
}

interface TextToSpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
}

export default function useTextToSpeech() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [currentText, setCurrentText] = useState('');

  useEffect(() => {
    // Check if the browser supports speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
      
      const synth = window.speechSynthesis as SpeechSynthesis;
      
      // Load available voices
      const loadVoices = () => {
        const availableVoices = synth.getVoices();
        setVoices(availableVoices);
        
        // Set default voice (prefer English)
        const englishVoice = availableVoices.find(voice => voice.lang.includes('en-'));
        setSelectedVoice(englishVoice || availableVoices[0] || null);
      };
      
      // Chrome loads voices asynchronously
      if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = loadVoices;
      }
      
      // Initial load of voices
      loadVoices();
      
      // Clean up
      return () => {
        if (synth.speaking) {
          synth.cancel();
        }
      };
    }
  }, []);

  const speak = (text: string, options: TextToSpeechOptions = {}) => {
    if (!isSupported) return false;
    
    const synth = window.speechSynthesis as SpeechSynthesis;
    
    // Cancel any ongoing speech
    if (synth.speaking) {
      synth.cancel();
    }
    
    // Create a new utterance
    const utterance = new window.SpeechSynthesisUtterance() as SpeechSynthesisUtterance;
    utterance.text = text;
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
    utterance.lang = options.lang || 'en-US';
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    // Set event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      setCurrentText(text);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentText('');
    };
    
    utterance.onpause = () => {
      setIsPaused(true);
    };
    
    utterance.onresume = () => {
      setIsPaused(false);
    };
    
    // Start speaking
    synth.speak(utterance);
    
    return true;
  };

  const pause = () => {
    if (!isSupported || !isSpeaking) return false;
    
    const synth = window.speechSynthesis as SpeechSynthesis;
    synth.pause();
    setIsPaused(true);
    
    return true;
  };

  const resume = () => {
    if (!isSupported || !isPaused) return false;
    
    const synth = window.speechSynthesis as SpeechSynthesis;
    synth.resume();
    setIsPaused(false);
    
    return true;
  };

  const stop = () => {
    if (!isSupported || !isSpeaking) return false;
    
    const synth = window.speechSynthesis as SpeechSynthesis;
    synth.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentText('');
    
    return true;
  };

  const setVoice = (voice: SpeechSynthesisVoice) => {
    setSelectedVoice(voice);
  };

  return {
    speak,
    pause,
    resume,
    stop,
    voices,
    selectedVoice,
    setVoice,
    isSpeaking,
    isPaused,
    isSupported,
    currentText
  };
}

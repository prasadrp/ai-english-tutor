
import { useState, useCallback, useEffect } from 'react';

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

  useEffect(() => {
    if (!synth) return;

    const getVoices = () => {
      const voiceList = synth.getVoices();
      if (voiceList.length > 0) {
        setVoices(voiceList);
      }
    };
    
    getVoices();
    // Voices can load asynchronously.
    synth.onvoiceschanged = getVoices;

    return () => {
        if(synth) {
            synth.onvoiceschanged = null;
        }
    }
  }, [synth]);

  const speak = useCallback((text: string, voice: SpeechSynthesisVoice | null) => {
    if (!synth || isSpeaking || !text) {
      return;
    }
    
    synth.cancel(); // Cancel any previous speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    if (voice) {
        utterance.voice = voice;
    }
    
    synth.speak(utterance);
  }, [synth, isSpeaking]);

  const cancel = useCallback(() => {
    if(synth) {
        synth.cancel();
        setIsSpeaking(false);
    }
  }, [synth]);

  useEffect(() => {
    return () => {
      if (synth) {
        synth.cancel();
      }
    };
  }, [synth]);

  return { speak, cancel, isSpeaking, voices };
};

import { useState, useCallback, useEffect } from 'react';
import * as Speech from 'expo-speech';

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<Speech.Voice[]>([]);

  useEffect(() => {
    let isMounted = true;
    Speech.getAvailableVoicesAsync().then(availableVoices => {
        if (isMounted) {
            setVoices(availableVoices);
        }
    });
    return () => { isMounted = false; }
  }, []);

  const speak = useCallback((text: string, voice: Speech.Voice | null) => {
    if (isSpeaking || !text) {
      return;
    }
    
    Speech.stop(); 

    const options: Speech.SpeechOptions = {};
    if (voice) {
        options.voice = voice.identifier;
    }

    Speech.speak(text, {
        ...options,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
        onStart: () => setIsSpeaking(true),
    });
  }, [isSpeaking]);

  const cancel = useCallback(() => {
    Speech.stop();
    setIsSpeaking(false);
  }, []);

  return { speak, cancel, isSpeaking, voices };
};

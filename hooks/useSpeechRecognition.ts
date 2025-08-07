import React, { useState, useRef, useEffect, useCallback } from 'react';

// Type definitions for Web Speech API to fix TypeScript errors.
// These interfaces describe the shape of the API for TypeScript.
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

// Extend the Window interface to include vendor-prefixed SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}


interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  hasRecognitionSupport: boolean;
  error: string | null;
  setTranscript: React.Dispatch<React.SetStateAction<string>>;
}

interface UseSpeechRecognitionOptions {
    onAutoSend?: (transcript: string) => void;
}

export const useSpeechRecognition = (options?: UseSpeechRecognitionOptions): SpeechRecognitionHook => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef<string>('');
  const onAutoSendRef = useRef(options?.onAutoSend);
  const endOfSpeechTimer = useRef<number | null>(null);
  const manualStopRef = useRef<boolean>(false);

  useEffect(() => {
    onAutoSendRef.current = options?.onAutoSend;
  });

  const hasRecognitionSupport = !!(
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  );

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      manualStopRef.current = true;
      recognitionRef.current.stop();
    }
  }, [isListening]);

  useEffect(() => {
    if (!hasRecognitionSupport) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        setIsListening(true);
        manualStopRef.current = false;
    };
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += event.results[i][0].transcript + ' ';
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscriptRef.current + interimTranscript);

      if (onAutoSendRef.current) {
        if (endOfSpeechTimer.current) clearTimeout(endOfSpeechTimer.current);
        
        endOfSpeechTimer.current = window.setTimeout(() => {
          if (recognitionRef.current) {
            recognitionRef.current.stop();
          }
        }, 1200); // Send after 1.2s of silence
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (endOfSpeechTimer.current) {
        clearTimeout(endOfSpeechTimer.current);
        endOfSpeechTimer.current = null;
      }
      
      const transcriptToSend = finalTranscriptRef.current.trim();
      if (onAutoSendRef.current && !manualStopRef.current && transcriptToSend) {
        onAutoSendRef.current(transcriptToSend);
      }
    };
    
    return () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };
  // isListening is intentionally omitted to avoid re-creating recognition on state change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasRecognitionSupport]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      finalTranscriptRef.current = '';
      setError(null);
      recognitionRef.current.start();
    }
  }, [isListening]);

  return { isListening, transcript, startListening, stopListening, hasRecognitionSupport, error, setTranscript };
};

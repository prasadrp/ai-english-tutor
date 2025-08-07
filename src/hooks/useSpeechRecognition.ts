import { useState, useEffect, useCallback, useRef } from 'react';
import Voice, { SpeechResultsEvent, SpeechErrorEvent, SpeechRecognizedEvent } from '@react-native-voice/voice';

interface UseSpeechRecognitionOptions {
    onAutoSend?: (transcript: string) => void;
}

export const useSpeechRecognition = (options?: UseSpeechRecognitionOptions) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);

    const onAutoSendRef = useRef(options?.onAutoSend);
    const manualStopRef = useRef<boolean>(false);
    const finalTranscriptRef = useRef('');

    useEffect(() => {
        onAutoSendRef.current = options?.onAutoSend;
    });

    const onSpeechStart = () => {
        setIsListening(true);
        setError(null);
        manualStopRef.current = false;
    };
    
    const onSpeechEnd = () => {
        setIsListening(false);
        const transcriptToSend = finalTranscriptRef.current.trim();
        if (onAutoSendRef.current && !manualStopRef.current && transcriptToSend) {
          onAutoSendRef.current(transcriptToSend);
        }
    };
    
    const onSpeechError = (e: SpeechErrorEvent) => {
        setError(e.error?.message ?? 'Unknown speech error');
        setIsListening(false);
    };
    
    const onSpeechResults = (e: SpeechResultsEvent) => {
        if (e.value && e.value.length > 0) {
            const finalTranscript = e.value[0];
            finalTranscriptRef.current = finalTranscript;
            setTranscript(finalTranscript);
        }
    };

    const onSpeechPartialResults = (e: SpeechResultsEvent) => {
        if (e.value && e.value.length > 0) {
            setTranscript(e.value[0]);
        }
    };
    
    useEffect(() => {
        Voice.onSpeechStart = onSpeechStart;
        Voice.onSpeechEnd = onSpeechEnd;
        Voice.onSpeechError = onSpeechError;
        Voice.onSpeechResults = onSpeechResults;
        Voice.onSpeechPartialResults = onSpeechPartialResults;
        
        // Check if the service is available
        Voice.isAvailable().then(isAvailable => {
            if (!isAvailable) {
                setError("Speech recognition service is not available on this device.");
            }
        });

        return () => {
            Voice.destroy().catch(() => {}); // Suppress errors on unmount
            Voice.removeAllListeners();
        };
    }, []);

    const startListening = useCallback(async () => {
        if (isListening) return;
        try {
            setTranscript('');
            finalTranscriptRef.current = '';
            setError(null);
            await Voice.start('en-US');
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        }
    }, [isListening]);

    const stopListening = useCallback(async () => {
        if (!isListening) return;
        try {
            manualStopRef.current = true;
            await Voice.stop();
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        }
    }, [isListening]);

    const [hasRecognitionSupport, setHasRecognitionSupport] = useState(false);
    useEffect(() => {
        Voice.isAvailable().then(setHasRecognitionSupport);
    }, []);


    return { isListening, transcript, startListening, stopListening, hasRecognitionSupport, error, setTranscript };
};

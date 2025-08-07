import React, { useState, useEffect, useCallback } from 'react';
import MicrophoneIcon from './icons/MicrophoneIcon';
import SendIcon from './icons/SendIcon';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface ChatInputProps {
    onSendMessage: (text: string) => void;
    isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
    const [inputValue, setInputValue] = useState('');

    const handleAutoSend = useCallback((transcript: string) => {
        if (transcript && !isLoading) {
            onSendMessage(transcript);
            setInputValue('');
            // The transcript in the hook will be cleared on the next `startListening` call.
            setTranscript('');
        }
    }, [isLoading, onSendMessage]);

    const { 
        isListening, 
        transcript, 
        startListening, 
        stopListening, 
        hasRecognitionSupport,
        setTranscript 
    } = useSpeechRecognition({ onAutoSend: handleAutoSend });

    useEffect(() => {
        setInputValue(transcript);
    }, [transcript]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() && !isLoading) {
            if (isListening) {
                stopListening();
            }
            onSendMessage(inputValue.trim());
            setInputValue('');
            setTranscript('');
        }
    };

    const handleMicClick = () => {
        if (isListening) {
            stopListening();
            // User manually stops. The current transcript remains in the input for editing.
        } else {
            // Before starting, clear any previous text.
            setInputValue('');
            setTranscript('');
            startListening();
        }
    };

    return (
        <div className="bg-secondary p-4 w-full shadow-inner">
            <form onSubmit={handleSubmit} className="flex items-center space-x-3">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        if (isListening) {
                            stopListening(); // Stop listening if user starts typing
                        }
                    }}
                    placeholder={isListening ? "Listening... auto-sends on pause" : "Type or press mic to speak"}
                    className="flex-1 bg-primary text-light placeholder-accent p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-highlight transition-all duration-200"
                    disabled={isLoading}
                    aria-label="Chat input"
                />
                {hasRecognitionSupport && (
                    <button 
                        type="button" 
                        onClick={handleMicClick}
                        disabled={isLoading}
                        className={`p-3 rounded-full transition-colors duration-200 text-light ${isListening ? 'bg-red-500 animate-pulse-fast' : 'bg-highlight hover:bg-opacity-80'}`}
                        aria-label={isListening ? 'Stop recording' : 'Start recording, message will send on pause'}
                    >
                        <MicrophoneIcon />
                    </button>
                )}
                <button 
                    type="submit" 
                    disabled={isLoading || !inputValue.trim()}
                    className="p-3 rounded-full bg-highlight text-light hover:bg-opacity-80 disabled:bg-accent disabled:cursor-not-allowed transition-colors duration-200"
                    aria-label="Send message"
                >
                    <SendIcon />
                </button>
            </form>
        </div>
    );
};

export default ChatInput;

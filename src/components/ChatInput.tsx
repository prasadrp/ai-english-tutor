import React, { useState, useEffect, useCallback } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import MicrophoneIcon from './icons/MicrophoneIcon';
import SendIcon from './icons/SendIcon';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface ChatInputProps {
    onSendMessage: (text: string) => void;
    isLoading: boolean;
    hasRecognitionSupport: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, hasRecognitionSupport }) => {
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
        setTranscript 
    } = useSpeechRecognition({ onAutoSend: handleAutoSend });

    useEffect(() => {
        if (isListening) {
            setInputValue(transcript);
        }
    }, [transcript, isListening]);

    const handleSubmit = () => {
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
        } else {
            setInputValue('');
            setTranscript('');
            startListening();
        }
    };

    return (
        <StyledView className="bg-secondary p-4 w-full flex-row items-center space-x-3">
            <StyledTextInput
                value={inputValue}
                onChangeText={(text) => {
                    setInputValue(text);
                    if (isListening) {
                        stopListening();
                    }
                }}
                placeholder={isListening ? "Listening..." : "Type or press mic to speak"}
                placeholderTextColor="#778DA9"
                className="flex-1 bg-primary text-light p-3 rounded-full"
                editable={!isLoading}
                aria-label="Chat input"
            />
            {hasRecognitionSupport && (
                <StyledTouchableOpacity 
                    onPress={handleMicClick}
                    disabled={isLoading}
                    className={`p-3 rounded-full ${isListening ? 'bg-red-500' : 'bg-highlight'}`}
                    aria-label={isListening ? 'Stop recording' : 'Start recording'}
                >
                    <MicrophoneIcon className="text-light" />
                </StyledTouchableOpacity>
            )}
            <StyledTouchableOpacity 
                onPress={handleSubmit}
                disabled={isLoading || !inputValue.trim()}
                className="p-3 rounded-full bg-highlight disabled:bg-accent"
                aria-label="Send message"
            >
                <SendIcon className="text-light" />
            </StyledTouchableOpacity>
        </StyledView>
    );
};

export default ChatInput;

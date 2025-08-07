import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Message, Sender, VoiceGender } from '../types';
import { startChat } from '../services/geminiService';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import type { Chat } from '@google/genai';
import Header from '../components/Header';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';

const App: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isVoiceOutputEnabled, setIsVoiceOutputEnabled] = useState<boolean>(true);
    const [voiceGender, setVoiceGender] = useState<VoiceGender>('female');
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
    
    const chatRef = useRef<Chat | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const lastSpokenMessageIdRef = useRef<string | null>(null);
    
    const { speak, cancel, isSpeaking, voices } = useSpeechSynthesis();

    const hasVoiceOptions = useMemo(() => {
        if (!voices.length) return false;
        const englishVoices = voices.filter(v => v.lang.startsWith('en'));
        const maleVoices = englishVoices.filter(v => /male|man/i.test(v.name) || (v as any).gender === 'male');
        const femaleVoices = englishVoices.filter(v => /female|woman/i.test(v.name) || (v as any).gender === 'female');
        return maleVoices.length > 0 && femaleVoices.length > 0;
    }, [voices]);
    
    useEffect(() => {
        if (!voices.length) return;

        const englishVoices = voices.filter(v => v.lang.startsWith('en-'));
        if (!englishVoices.length) {
            setSelectedVoice(voices.find(v => v.default) || null);
            return;
        }

        let bestMatch: SpeechSynthesisVoice | undefined;

        if (voiceGender === 'female') {
            bestMatch = englishVoices.find(v => /female|zira|eva|susan/i.test(v.name.toLowerCase())) ||
                        englishVoices.find(v => (v as any).gender?.toLowerCase() === 'female');
        } else {
            bestMatch = englishVoices.find(v => /male|david|mark/i.test(v.name.toLowerCase())) ||
                        englishVoices.find(v => (v as any).gender?.toLowerCase() === 'male');
        }
        
        if (!bestMatch) {
            if(voiceGender === 'female') {
                 bestMatch = englishVoices.find(v => !/male|david|mark/i.test(v.name.toLowerCase()));
            } else {
                 bestMatch = englishVoices.find(v => !/female|zira|eva|susan/i.test(v.name.toLowerCase()));
            }
        }
        
        setSelectedVoice(bestMatch || englishVoices.find(v => v.default) || englishVoices[0]);

    }, [voices, voiceGender]);

    const scrollToBottom = () => {
        chatContainerRef.current?.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    useEffect(() => {
        setIsLoading(true);
        try {
            chatRef.current = startChat();
            const firstMessage = `Hello! I'm Echo, your AI English tutor. Let's start with a simple question: What did you do for fun last weekend?`;
            setMessages([{ id: 'init', text: firstMessage, sender: Sender.AI }]);
        } catch (e) {
            setError('Failed to initialize chat session. Please check your API key and refresh.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }

        return () => {
          cancel();
        }
    }, [cancel]);

    useEffect(() => {
        if (!isVoiceOutputEnabled || !selectedVoice || isLoading || isSpeaking) return;

        const lastAiMessage = [...messages].reverse().find(m => m.sender === Sender.AI && m.id !== 'typing');

        if (lastAiMessage && lastAiMessage.id !== lastSpokenMessageIdRef.current) {
            speak(lastAiMessage.text, selectedVoice);
            lastSpokenMessageIdRef.current = lastAiMessage.id;
        }
    }, [messages, selectedVoice, isVoiceOutputEnabled, isLoading, isSpeaking, speak]);

    const handleSendMessage = async (text: string) => {
        if (!chatRef.current) {
            setError("Chat is not initialized.");
            return;
        }

        cancel();
        setIsLoading(true);
        const userMessage: Message = { id: Date.now().toString(), text, sender: Sender.User };
        
        setMessages(prev => [...prev, userMessage, { id: 'typing', text: '', sender: Sender.AI }]);
        
        try {
            const stream = await chatRef.current.sendMessageStream({ message: text });
            
            let fullResponse = '';
            let finalMessage = {};
            for await (const chunk of stream) {
                fullResponse += chunk.text;
                
                finalMessage = { id: 'typing', text: fullResponse, sender: Sender.AI };
                setMessages(prev => {
                    const newMessages = [...prev];
                    const typingIndex = newMessages.findIndex(m => m.id === 'typing');
                    if (typingIndex !== -1) {
                         newMessages[typingIndex] = finalMessage as Message;
                    }
                    return newMessages;
                });
            }
            
            setMessages(prev => prev.map(msg => msg.id === 'typing' ? { ...msg, id: Date.now().toString() + '-ai' } : msg));

        } catch (e) {
            const errorMessage = "Sorry, I encountered an error. Please try again.";
            setMessages(prev => prev.filter(m => m.id !== 'typing').concat({ id: Date.now().toString() + '-err', text: errorMessage, sender: Sender.AI }));
            setError(e instanceof Error ? e.message : "An unknown error occurred.");
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleVoiceOutput = () => {
        setIsVoiceOutputEnabled(prev => {
            if (prev) cancel();
            return !prev;
        });
    };
    
    const handleVoiceGenderChange = (gender: VoiceGender) => {
        if (isSpeaking) {
            cancel();
            lastSpokenMessageIdRef.current = null; 
        }
        setVoiceGender(gender);
    };
    
    return (
        <div className="flex flex-col h-screen w-screen max-w-2xl mx-auto bg-primary text-light font-sans">
            <Header 
                isVoiceOutputEnabled={isVoiceOutputEnabled}
                onToggleVoiceOutput={handleToggleVoiceOutput}
                isSpeaking={isSpeaking}
                voiceGender={voiceGender}
                onVoiceGenderChange={handleVoiceGenderChange}
                hasVoiceOptions={hasVoiceOptions}
            />
            <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto">
                {messages.map((msg) => (
                    <ChatMessage 
                        key={msg.id} 
                        message={msg} 
                        isTyping={msg.id === 'typing'} 
                    />
                ))}
                {error && <div className="text-red-400 text-center text-sm my-2">{error}</div>}
            </div>
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
    );
};

export default App;
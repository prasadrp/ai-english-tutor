import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SafeAreaView, View, FlatList, Text, StatusBar, AppState } from 'react-native';
import { Message, Sender, VoiceGender } from './src/types';
import { startChat } from './src/services/geminiService';
import { useSpeechSynthesis } from './src/hooks/useSpeechSynthesis';
import { useSpeechRecognition } from './src/hooks/useSpeechRecognition';
import type { Chat } from '@google/genai';
import * as Speech from 'expo-speech';
import Header from './src/components/Header';
import ChatMessage from './src/components/ChatMessage';
import ChatInput from './src/components/ChatInput';

const App: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isVoiceOutputEnabled, setIsVoiceOutputEnabled] = useState<boolean>(true);
    const [voiceGender, setVoiceGender] = useState<VoiceGender>('female');
    const [selectedVoice, setSelectedVoice] = useState<Speech.Voice | null>(null);
    
    const chatRef = useRef<Chat | null>(null);
    const flatListRef = useRef<FlatList>(null);
    const lastSpokenMessageIdRef = useRef<string | null>(null);
    
    const { speak, cancel, isSpeaking, voices } = useSpeechSynthesis();

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
            for await (const chunk of stream) {
                fullResponse += chunk.text;
                
                setMessages(prev => {
                    const newMessages = [...prev];
                    const typingIndex = newMessages.findIndex(m => m.id === 'typing');
                    if (typingIndex !== -1) {
                         newMessages[typingIndex] = { ...newMessages[typingIndex], text: fullResponse };
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

     const { hasRecognitionSupport } = useSpeechRecognition({ onAutoSend: handleSendMessage });


    const hasVoiceOptions = useMemo(() => {
        if (!voices.length) return false;
        const englishVoices = voices.filter(v => v.language.startsWith('en'));
        const maleVoices = englishVoices.filter(v => /male|man/i.test(v.name));
        const femaleVoices = englishVoices.filter(v => /female|woman/i.test(v.name));
        return maleVoices.length > 0 && femaleVoices.length > 0;
    }, [voices]);
    
    useEffect(() => {
        if (!voices.length) return;

        const englishVoices = voices.filter(v => v.language.startsWith('en-'));
        if (!englishVoices.length) {
            setSelectedVoice(voices.find(v => v.language.startsWith('en')) || voices[0]);
            return;
        }

        let bestMatch: Speech.Voice | undefined;

        if (voiceGender === 'female') {
            bestMatch = englishVoices.find(v => /female|zira|eva|susan/i.test(v.name.toLowerCase()));
        } else {
            bestMatch = englishVoices.find(v => /male|david|mark/i.test(v.name.toLowerCase()));
        }
        
        if (!bestMatch) {
            if(voiceGender === 'female') {
                 bestMatch = englishVoices.find(v => !/male|david|mark/i.test(v.name.toLowerCase()));
            } else {
                 bestMatch = englishVoices.find(v => !/female|zira|eva|susan/i.test(v.name.toLowerCase()));
            }
        }
        
        setSelectedVoice(bestMatch || englishVoices.find(v => v.language.includes('US')) || englishVoices[0]);

    }, [voices, voiceGender]);
    
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

        const subscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState === 'background') {
                cancel();
            }
        });

        return () => {
          cancel();
          subscription.remove();
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
        <SafeAreaView className="flex-1 bg-primary">
            <StatusBar barStyle="light-content" backgroundColor="#1B263B" />
            <View className="flex-1 w-full max-w-2xl mx-auto">
                <Header 
                    isVoiceOutputEnabled={isVoiceOutputEnabled}
                    onToggleVoiceOutput={handleToggleVoiceOutput}
                    isSpeaking={isSpeaking}
                    voiceGender={voiceGender}
                    onVoiceGenderChange={handleVoiceGenderChange}
                    hasVoiceOptions={hasVoiceOptions}
                />
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={({ item }) => (
                        <ChatMessage 
                            key={item.id} 
                            message={item} 
                            isTyping={item.id === 'typing'} 
                        />
                    )}
                    keyExtractor={(item) => item.id}
                    className="flex-1 p-4"
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    ListFooterComponent={error ? <Text className="text-red-400 text-center text-sm my-2">{error}</Text> : null}
                />
                <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} hasRecognitionSupport={hasRecognitionSupport} />
            </View>
        </SafeAreaView>
    );
};

export default App;

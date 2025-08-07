import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import SoundOnIcon from './icons/SoundOnIcon';
import SoundOffIcon from './icons/SoundOffIcon';
import SettingsIcon from './icons/SettingsIcon';
import { VoiceGender } from '../types';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface HeaderProps {
    isVoiceOutputEnabled: boolean;
    onToggleVoiceOutput: () => void;
    isSpeaking: boolean;
    voiceGender: VoiceGender;
    onVoiceGenderChange: (gender: VoiceGender) => void;
    hasVoiceOptions: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
    isVoiceOutputEnabled, 
    onToggleVoiceOutput, 
    isSpeaking,
    voiceGender,
    onVoiceGenderChange,
    hasVoiceOptions
}) => {
    const [showSettings, setShowSettings] = useState(false);
    const settingsButtonRef = useRef<View>(null);
    const [settingsPosition, setSettingsPosition] = useState({ top: 0, right: 0 });

    const handleSettingsPress = () => {
        settingsButtonRef.current?.measure((fx, fy, width, height, px, py) => {
            setSettingsPosition({ top: py + height + 5, right: 20 });
            setShowSettings(true);
        });
    };

    return (
        <StyledView className="bg-secondary p-4 flex-row justify-between items-center shadow-lg w-full">
            <StyledText className="text-xl font-bold text-light">AI English Tutor</StyledText>
            <StyledView className="flex-row items-center space-x-2">
                <StyledTouchableOpacity 
                    onPress={onToggleVoiceOutput} 
                    className={`p-2 rounded-full`}
                    aria-label={isVoiceOutputEnabled ? 'Disable voice output' : 'Enable voice output'}
                >
                    {isVoiceOutputEnabled ? 
                        <SoundOnIcon className={`w-6 h-6 ${isSpeaking ? 'text-green-400' : 'text-highlight'}`} /> : 
                        <SoundOffIcon className="w-6 h-6 text-accent" />
                    }
                </StyledTouchableOpacity>
                
                {isVoiceOutputEnabled && hasVoiceOptions && (
                    <StyledView>
                        <StyledTouchableOpacity
                            ref={settingsButtonRef}
                            onPress={handleSettingsPress}
                            className="p-2 rounded-full"
                            aria-label="Voice settings"
                        >
                            <SettingsIcon className="w-6 h-6 text-accent" />
                        </StyledTouchableOpacity>

                        <Modal
                            transparent={true}
                            visible={showSettings}
                            onRequestClose={() => setShowSettings(false)}
                            animationType="fade"
                        >
                            <Pressable onPress={() => setShowSettings(false)} className="flex-1">
                                <StyledView 
                                    className="absolute top-20 right-5 mt-2 w-48 bg-accent rounded-lg shadow-xl z-10 p-2"
                                >
                                    <StyledText className="text-light font-semibold text-sm px-2 pb-2">Voice</StyledText>
                                    <StyledView className="space-y-1">
                                        <StyledTouchableOpacity
                                            onPress={() => { onVoiceGenderChange('female'); setShowSettings(false); }}
                                            className={`w-full text-left px-3 py-2 rounded-md ${voiceGender === 'female' ? 'bg-highlight' : 'hover:bg-secondary'}`}
                                        >
                                           <StyledText className="text-sm text-white">Female</StyledText>
                                        </StyledTouchableOpacity>
                                        <StyledTouchableOpacity
                                            onPress={() => { onVoiceGenderChange('male'); setShowSettings(false); }}
                                            className={`w-full text-left px-3 py-2 rounded-md ${voiceGender === 'male' ? 'bg-highlight' : 'hover:bg-secondary'}`}
                                        >
                                            <StyledText className="text-sm text-white">Male</StyledText>
                                        </StyledTouchableOpacity>
                                    </StyledView>
                                </StyledView>
                            </Pressable>
                        </Modal>
                    </StyledView>
                )}
            </StyledView>
        </StyledView>
    );
};

export default Header;


import React, { useState, useRef, useEffect } from 'react';
import SoundOnIcon from './icons/SoundOnIcon';
import SoundOffIcon from './icons/SoundOffIcon';
import SettingsIcon from './icons/SettingsIcon';
import { VoiceGender } from '../types';

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
    const settingsRef = useRef<HTMLDivElement>(null);

    // Close settings dropdown if clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
                setShowSettings(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <header className="bg-secondary p-4 flex justify-between items-center shadow-lg w-full">
            <h1 className="text-xl font-bold text-light">AI English Tutor</h1>
            <div className="flex items-center space-x-2">
                <button 
                    onClick={onToggleVoiceOutput} 
                    className={`p-2 rounded-full transition-colors duration-200 ${isVoiceOutputEnabled ? 'text-highlight' : 'text-accent hover:bg-accent hover:text-light'}`}
                    aria-label={isVoiceOutputEnabled ? 'Disable voice output' : 'Enable voice output'}
                >
                    {isVoiceOutputEnabled ? 
                        <SoundOnIcon className={`w-6 h-6 ${isSpeaking ? 'animate-pulse text-green-400' : ''}`} /> : 
                        <SoundOffIcon className="w-6 h-6" />
                    }
                </button>
                
                {isVoiceOutputEnabled && hasVoiceOptions && (
                    <div ref={settingsRef} className="relative">
                        <button
                            onClick={() => setShowSettings(prev => !prev)}
                            className="p-2 rounded-full text-accent hover:bg-accent hover:text-light transition-colors duration-200"
                            aria-label="Voice settings"
                        >
                            <SettingsIcon className="w-6 h-6" />
                        </button>

                        {showSettings && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-accent rounded-lg shadow-xl z-10 p-2">
                                <p className="text-light font-semibold text-sm px-2 pb-2">Voice</p>
                                <div className="space-y-1">
                                    <button
                                        onClick={() => { onVoiceGenderChange('female'); setShowSettings(false); }}
                                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${voiceGender === 'female' ? 'bg-highlight text-white' : 'text-light hover:bg-secondary'}`}
                                    >
                                        Female
                                    </button>
                                    <button
                                        onClick={() => { onVoiceGenderChange('male'); setShowSettings(false); }}
                                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${voiceGender === 'male' ? 'bg-highlight text-white' : 'text-light hover:bg-secondary'}`}
                                    >
                                        Male
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;

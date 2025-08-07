import * as Speech from 'expo-speech';

export enum Sender {
  User = 'user',
  AI = 'ai',
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
}

export type VoiceGender = 'female' | 'male';

// This type can be used if we need to pass expo-speech voices around,
// but for now, it's handled within the hooks and App component.
export type NativeVoice = Speech.Voice;

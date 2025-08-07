import React from 'react';
import { View } from 'react-native';

const TypingIndicator: React.FC = () => {
  return (
    <View className="flex-row items-center space-x-1 p-2">
      <View className="w-2 h-2 bg-highlight rounded-full animate-bounce" style={{ animationDelay: '-0.3s' }} />
      <View className="w-2 h-2 bg-highlight rounded-full animate-bounce" style={{ animationDelay: '-0.15s' }}/>
      <View className="w-2 h-2 bg-highlight rounded-full animate-bounce" />
    </View>
  );
};

export default TypingIndicator;

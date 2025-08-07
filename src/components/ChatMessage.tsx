import React from 'react';
import { View, Text } from 'react-native';
import { Message, Sender } from '../types';
import TypingIndicator from './TypingIndicator';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);

interface ChatMessageProps {
  message: Message;
  isTyping?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isTyping = false }) => {
  const isUser = message.sender === Sender.User;

  const bubbleClasses = isUser
    ? 'bg-highlight self-end rounded-l-xl rounded-t-xl'
    : 'bg-secondary self-start rounded-r-xl rounded-t-xl';
  
  const containerClasses = isUser ? 'justify-end' : 'justify-start';

  return (
    <StyledView className={`flex-row w-full my-2 ${containerClasses}`}>
        <StyledView className={`flex-col max-w-xs md:max-w-md ${isUser ? 'items-end' : 'items-start'}`}>
            <StyledView className={`px-4 py-3 shadow-md ${bubbleClasses}`}>
                {isTyping ? <TypingIndicator /> : <StyledText className="text-sm text-light">{message.text}</StyledText>}
            </StyledView>
        </StyledView>
    </StyledView>
  );
};

export default ChatMessage;


import React from 'react';
import { Message, Sender } from '../types';
import TypingIndicator from './TypingIndicator';

interface ChatMessageProps {
  message: Message;
  isTyping?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isTyping = false }) => {
  const isUser = message.sender === Sender.User;

  const bubbleClasses = isUser
    ? 'bg-highlight text-white self-end rounded-l-xl rounded-t-xl'
    : 'bg-secondary text-light self-start rounded-r-xl rounded-t-xl';
  
  const containerClasses = isUser ? 'justify-end' : 'justify-start';

  return (
    <div className={`flex w-full my-2 ${containerClasses}`}>
        <div className={`flex flex-col max-w-xs md:max-w-md ${isUser ? 'items-end' : 'items-start'}`}>
            <div className={`px-4 py-3 shadow-md ${bubbleClasses}`}>
                {isTyping ? <TypingIndicator /> : <p className="text-sm">{message.text}</p>}
            </div>
        </div>
    </div>
  );
};

export default ChatMessage;

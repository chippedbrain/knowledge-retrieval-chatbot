'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, BookOpen, Search, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ChatMessage = ({ message, isUser, retrievedChunks, category }) => {
  return (
    <div className={`mb-6 ${isUser ? 'flex justify-end' : 'flex justify-start'}`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Message Bubble */}
        <div className={`rounded-2xl px-5 py-3 shadow-sm ${
          isUser 
            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' 
            : 'bg-white text-gray-800 border border-gray-200'
        }`}>
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
          ) : (
            <div className="text-sm prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  a: ({ node, ...props }) => <a {...props} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" />,
                  ul: ({ node, ...props }) => <ul {...props} className="list-disc ml-4 space-y-1" />,
                  ol: ({ node, ...props }) => <ol {...props} className="list-decimal ml-4 space-y-1" />,
                  strong: ({ node, ...props }) => <strong {...props} className="font-semibold" />,
                  p: ({ node, ...props }) => <p {...props} className="mb-2 last:mb-0" />
                }}
              >
                {message}
              </ReactMarkdown>
            </div>
          )}
        </div>
        
        {/* Retrieved Knowledge Indicator */}
        {!isUser && retrievedChunks && retrievedChunks.length > 0 && (
          <div className="mt-3 ml-2">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100">
                  <Search className="w-3 h-3 text-blue-600" />
                </div>
                <span className="text-xs font-medium text-blue-700">
                  Retrieved from {category} resources
                </span>
              </div>
              <div className="space-y-1.5">
                {retrievedChunks.map((chunk, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                    <BookOpen className="w-3 h-3 mt-0.5 flex-shrink-0 text-blue-500" />
                    <span>{chunk.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function EducationQuestChatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm here to help you with planning, applying, and paying for college. What can I help you with today?",
      isUser: false,
      retrievedChunks: null,
      category: null
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;
    
    const userMessage = inputValue.trim();
    setInputValue('');
    
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: userMessage,
      isUser: true,
      retrievedChunks: null,
      category: null
    }]);
    
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: data.response,
        isUser: false,
        retrievedChunks: data.retrievedChunks,
        category: data.category
      }]);
      
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "I'm sorry, I encountered an error. Please try again.",
        isUser: false,
        retrievedChunks: null,
        category: null
      }]);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const quickQuestions = [
    "I need help finding scholarships",
    "How do I apply to the FAFSA",
    "How much does college cost",
    "How do I apply to college"
  ];
  
  const handleQuickQuestion = (question) => {
    setInputValue(question);
  };
  
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">EducationQuest Assistant</h1>
              <p className="text-sm text-gray-600">Nebraska's College Planning Resource</p>
            </div>
          </div>
          <div className="mt-3 inline-flex items-center gap-2 bg-blue-100 rounded-full px-3 py-1">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-xs font-medium text-blue-700">AI-Powered • RAG System</span>
          </div>
        </div>
      </div>
      
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message.text}
              isUser={message.isUser}
              retrievedChunks={message.retrievedChunks}
              category={message.category}
            />
          ))}
          
          {isProcessing && (
            <div className="mb-6 flex justify-start">
              <div className="max-w-[80%]">
                <div className="bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-sm text-gray-600">Searching knowledge base...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Quick Questions */}
      {messages.length === 1 && (
        <div className="px-4 pb-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">Suggested Questions</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickQuestion(q)}
                  className="bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-700 text-sm px-4 py-2 rounded-xl transition-all duration-200 shadow-sm hover:shadow"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-4 py-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-1 shadow-sm">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about planning, applying, or paying for college..."
                className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-sm text-gray-900 placeholder-gray-400"
                disabled={isProcessing}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isProcessing}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-md disabled:shadow-none"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span className="font-medium text-sm">Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
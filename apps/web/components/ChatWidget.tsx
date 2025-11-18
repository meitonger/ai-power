import { useState, useRef, useEffect } from 'react';
import { apiPost } from '../lib/api';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m here to help. Ask me about appointments, services, or general questions.',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [similarQuestions, setSimilarQuestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Fetch similar questions when user types
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (inputText.trim().length > 2) {
      debounceTimerRef.current = setTimeout(async () => {
        try {
          const response = await apiPost('/chat/similar-questions', { message: inputText });
          if (response.questions && response.questions.length > 0) {
            setSimilarQuestions(response.questions);
            setShowSuggestions(true);
          } else {
            setSimilarQuestions([]);
            setShowSuggestions(false);
          }
        } catch (error) {
          console.error('Error fetching similar questions:', error);
          setSimilarQuestions([]);
          setShowSuggestions(false);
        }
      }, 500); // Debounce for 500ms
    } else {
      setSimilarQuestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputText]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputText;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setShowSuggestions(false);
    setSimilarQuestions([]);
    setIsLoading(true);

    try {
      const response = await apiPost('/chat', { message: textToSend });
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.reply,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I\'m having trouble responding right now. Please call us at (555) 123-4567 for immediate assistance.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (question: string) => {
    setInputText(question);
    setShowSuggestions(false);
    handleSendMessage(question);
  };

  return (
    <>
      <style jsx>{`
        .chat-widget-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen;
        }

        .chat-button {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .chat-button:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }

        .chat-button:active {
          transform: scale(0.95);
        }

        .chat-window {
          position: fixed;
          bottom: 90px;
          right: 20px;
          width: 380px;
          height: 500px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .chat-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chat-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .chat-header p {
          margin: 4px 0 0 0;
          font-size: 12px;
          opacity: 0.9;
        }

        .close-button {
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .close-button:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .message {
          display: flex;
          flex-direction: column;
          max-width: 80%;
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message.user {
          align-self: flex-end;
        }

        .message.bot {
          align-self: flex-start;
        }

        .message-bubble {
          padding: 10px 14px;
          border-radius: 12px;
          word-wrap: break-word;
          font-size: 14px;
          line-height: 1.4;
        }

        .message.user .message-bubble {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .message.bot .message-bubble {
          background: #f1f3f5;
          color: #333;
          border-bottom-left-radius: 4px;
        }

        .message-time {
          font-size: 11px;
          color: #999;
          margin-top: 4px;
          padding: 0 4px;
        }

        .input-container {
          padding: 16px;
          border-top: 1px solid #e9ecef;
          display: flex;
          gap: 8px;
          background: white;
        }

        .message-input {
          flex: 1;
          border: 1px solid #dee2e6;
          border-radius: 20px;
          padding: 10px 16px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }

        .message-input:focus {
          border-color: #667eea;
        }

        .send-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
          font-size: 18px;
        }

        .send-button:hover:not(:disabled) {
          transform: scale(1.05);
        }

        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .loading-dots {
          display: flex;
          gap: 4px;
          padding: 8px;
        }

        .loading-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #999;
          animation: bounce 1.4s infinite ease-in-out both;
        }

        .loading-dot:nth-child(1) {
          animation-delay: -0.32s;
        }

        .loading-dot:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }

        .suggestions-container {
          position: absolute;
          bottom: 100%;
          left: 0;
          right: 0;
          background: white;
          border-top: 1px solid #e9ecef;
          max-height: 200px;
          overflow-y: auto;
          box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
        }

        .suggestions-header {
          padding: 8px 16px;
          font-size: 12px;
          color: #666;
          font-weight: 600;
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
        }

        .suggestion-item {
          padding: 12px 16px;
          cursor: pointer;
          border-bottom: 1px solid #f1f3f5;
          font-size: 14px;
          color: #333;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .suggestion-item:hover {
          background: #f8f9fa;
        }

        .suggestion-item:last-child {
          border-bottom: none;
        }

        .suggestion-icon {
          color: #667eea;
          font-size: 16px;
        }

        @media (max-width: 480px) {
          .chat-window {
            width: calc(100vw - 40px);
            height: calc(100vh - 120px);
            right: 20px;
            bottom: 90px;
          }
        }
      `}</style>

      <div className="chat-widget-container">
        {isOpen && (
          <div className="chat-window">
            <div className="chat-header">
              <div>
                <h3>Customer Support</h3>
                  <p>We&apos;re here to help!</p>
              </div>
              <button className="close-button" onClick={() => setIsOpen(false)}>
                ×
              </button>
            </div>

            <div className="messages-container">
              {messages.map((message) => (
                <div key={message.id} className={`message ${message.sender}`}>
                  <div className="message-bubble">{message.text}</div>
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="message bot">
                  <div className="message-bubble">
                    <div className="loading-dots">
                      <div className="loading-dot"></div>
                      <div className="loading-dot"></div>
                      <div className="loading-dot"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="input-container" style={{ position: 'relative' }}>
              {showSuggestions && similarQuestions.length > 0 && (
                <div className="suggestions-container">
                  <div className="suggestions-header">
                    Similar questions you might ask:
                  </div>
                  {similarQuestions.map((question, index) => (
                    <div
                      key={index}
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(question)}
                    >
                      <span className="suggestion-icon">💡</span>
                      <span>{question}</span>
                    </div>
                  ))}
                </div>
              )}
              <input
                type="text"
                className="message-input"
                placeholder="Type your message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <button
                className="send-button"
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputText.trim()}
              >
                ➤
              </button>
            </div>
          </div>
        )}

        <button
          className="chat-button"
          onClick={() => setIsOpen(!isOpen)}
          title="Chat with us"
        >
          {isOpen ? '✕' : '💬'}
        </button>
      </div>
    </>
  );
}

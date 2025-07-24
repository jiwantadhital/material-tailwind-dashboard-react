import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, ChevronUp, ChevronDown } from 'lucide-react';
import { authService } from '../services/apiService';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState(null);
  const messagesEndRef = useRef(null);

  // Quick reply options
  const quickReplies = [
    "What services do you offer?",
    "How much does notary service cost?",
    "What documents do I need?",
    "How long does the process take?",
    "How do I get started?",
    "Contact information"
  ];

  // Initialize knowledge base from your website data
  useEffect(() => {
    initializeKnowledgeBase();
  }, []);

  const initializeKnowledgeBase = async () => {
    try {
      // Fetch services data
      const servicesResponse = await authService.getAllServicesPublic();
      const services = servicesResponse.success ? servicesResponse.data : [];

      // Fetch homepage content
      const [heroResponse, featuresResponse, testimonialsResponse] = await Promise.all([
        authService.getHeroSection().catch(() => ({ success: false })),
        authService.getFeaturesSection().catch(() => ({ success: false })),
        authService.getTestimonialsSection().catch(() => ({ success: false }))
      ]);

      const knowledgeData = {
        services: services.map(service => ({
          name: service.name,
          description: service.description || service.short_description,
          price_range: service.price_range,
          code: service.code
        })),
        hero: heroResponse.success ? heroResponse.data : null,
        features: featuresResponse.success ? featuresResponse.data : null,
        testimonials: testimonialsResponse.success ? testimonialsResponse.data : null,
        faq: [
          {
            question: "What is Sajilo Notary?",
            answer: "Sajilo Notary is a digital notarization platform that provides secure, streamlined notary services for businesses and individuals. We offer document authentication, translation services, SOP preparation, and property document services."
          },
          {
            question: "How does the process work?",
            answer: "1. Upload your documents through our secure platform. 2. Our team reviews and processes your request. 3. You'll receive a cost estimate and timeline. 4. Make payment and track progress. 5. Receive your completed documents."
          },
          {
            question: "Is it secure?",
            answer: "Yes, we use advanced encryption and authentication protocols to ensure your documents remain secure and tamper-proof throughout the entire process."
          },
          {
            question: "What payment methods do you accept?",
            answer: "We accept various payment methods including credit cards, digital wallets, and bank transfers. Payment is processed securely through our integrated payment system."
          },
          {
            question: "How long does it take?",
            answer: "Processing times vary by service type. Standard notary services typically take 1-3 business days, while express services can be completed within 24 hours. You'll receive a specific timeline when you submit your request."
          }
        ],
        contact: {
          email: "support@sajilonotary.com",
          phone: "+977-1-4XXXXXX",
          address: "Kathmandu, Nepal"
        }
      };

      setKnowledgeBase(knowledgeData);
    } catch (error) {
      console.error('Error initializing knowledge base:', error);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 1,
          text: "Hello! I'm your Sajilo Notary assistant. How can I help you today? You can ask me about our services, pricing, process, or anything else!",
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
    }
  }, [isOpen]);

  const generateResponse = async (userMessage) => {
    setIsLoading(true);
    
    try {
      // Call our backend API which handles both predefined responses and Hugging Face API
      const response = await authService.generateChatbotResponse(userMessage);
      
      if (response.success) {
        return response.data.response || "I'm sorry, I couldn't process that request. Please try rephrasing your question or contact our support team.";
      } else {
        // Fallback response if API fails
        return "I'm here to help with questions about our notary services, pricing, process, or general inquiries. Could you please rephrasing your question or try one of the quick reply options?";
      }
    } catch (error) {
      console.error('Error generating response:', error);
      return "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment or contact our support team directly.";
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Generate bot response
    const botResponse = await generateResponse(message);
    
    const botMessage = {
      id: Date.now() + 1,
      text: botResponse,
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMessage]);
  };

  const handleQuickReply = (reply) => {
    handleSendMessage(reply);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
        >
          {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div>
                <h3 className="font-semibold">Sajilo Notary Assistant</h3>
                <p className="text-xs text-blue-100">Online • 24/7 Support</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 rounded-2xl px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length === 1 && (
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply)}
                    className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot; 
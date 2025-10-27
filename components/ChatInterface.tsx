import React, { useState, useRef, useEffect } from 'react';
import { Message, Account, Budget, Transaction } from '../types';
import { getFinancialAdvice } from '../services/aiService';

interface ChatInterfaceProps {
    accounts: Account[];
    budget: Budget;
    transactions: Transaction[];
    onAddTransactionClick: () => void;
}

const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

const AIIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
  </svg>
);

const LoadingDots: React.FC = () => (
    <div className="flex space-x-1">
        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"></div>
    </div>
);

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ accounts, budget, transactions, onAddTransactionClick }) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: 'Здравствуйте! Задайте мне вопрос о ваших финансах (режим "Анализ") или на любую другую тему (режим "Поиск").', sender: 'ai' }
    ]);
    const [input, setInput] = useState<string>('');
    const [mode, setMode] = useState<'chat' | 'search'>('chat');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: Message = { id: Date.now().toString(), text: input, sender: 'user', mode };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const aiLoadingMessage: Message = { id: 'loading', text: '...', sender: 'ai' };
        setMessages(prev => [...prev, aiLoadingMessage]);

        const financialContext = { accounts, budget, transactions };
        const aiResponse = await getFinancialAdvice(input, financialContext, mode);
        
        const newAiMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: aiResponse.text,
            sender: 'ai',
            sources: aiResponse.sources,
            mode,
        };

        setMessages(prev => prev.filter(m => m.id !== 'loading'));
        setMessages(prev => [...prev, newAiMessage]);
        setIsLoading(false);
    };

    const placeholderText = mode === 'chat' ? 'Спросить о моих финансах...' : 'Что найти в интернете?';

    return (
        <div className="bg-gray-800/50 rounded-lg flex flex-col h-[85vh] max-h-[85vh]">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Помощник</h3>
                <div className="flex rounded-md shadow-sm">
                    <button
                        onClick={() => setMode('chat')}
                        className={`px-3 py-1 text-xs rounded-l-md transition-colors ${mode === 'chat' ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                        Анализ
                    </button>
                    <button
                        onClick={() => setMode('search')}
                        className={`px-3 py-1 text-xs rounded-r-md transition-colors ${mode === 'search' ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                        Поиск
                    </button>
                </div>
            </div>
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                         {msg.sender === 'ai' && <div className="bg-emerald-500/20 p-2 rounded-full"><AIIcon className="text-emerald-400"/></div>}
                        <div className={`max-w-xs md:max-w-md rounded-lg p-3 text-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                            {msg.id === 'loading' ? <LoadingDots /> : <p className="whitespace-pre-wrap">{msg.text}</p>}
                            {msg.sources && msg.sources.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-600">
                                    <h4 className="text-xs font-semibold text-gray-400 mb-1">Источники:</h4>
                                    <ul className="space-y-1">
                                        {msg.sources.map((source, index) => (
                                            <li key={index}>
                                                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400 hover:underline break-all">
                                                    {source.title}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                         {msg.sender === 'user' && <div className="bg-blue-500/20 p-2 rounded-full"><UserIcon className="text-blue-400"/></div>}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
             <div className="p-4 border-t border-gray-700 mt-auto">
                 <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs py-1 px-3 rounded-full bg-gray-700 text-gray-300">
                       Режим: {mode === 'chat' ? 'Анализ финансов' : 'Поиск'}
                    </span>
                    <div className="flex-grow border-t border-gray-700 mx-2"></div>
                     <button onClick={onAddTransactionClick} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 py-1 px-3 rounded-full transition-colors">
                       + Добавить операцию
                    </button>
                 </div>
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={placeholderText}
                        disabled={isLoading}
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-full py-2 px-4 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                    />
                    <button onClick={handleSend} disabled={!input.trim() || isLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-2 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};
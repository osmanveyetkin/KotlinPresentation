
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { type Message, Sender } from './types';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import { GeminiIcon } from './components/icons/GeminiIcon';
import { startChatSession } from './services/geminiService';
import { type Chat } from '@google/genai';

const INITIAL_PROMPT = `
Ben bir 'OOP 2' dersi alan üniversite öğrencisiyim. Sınıfta Java'yı yeni bitirdik. Şimdi ise sınıf arkadaşlarıma Kotlin'i anlatacağım bir sunum hazırlamam gerekiyor. Lütfen benim için kapsamlı bir araştırma çıktısı oluştur. Anlatım 'Kotlin 101' tadında, temelleri açıklayan bir yapıda olmalı. İçerik şu konuları kapsamalı:
1.  **Genel Yapısı:** Bir Kotlin projesinin yapısı nasıldır?
2.  **Çıkış Sebebi:** Kotlin neden oluşturuldu? Özellikle Java'ya kıyasla hangi sorunları çözüyor?
3.  **Çalışma Mantığı:** Nasıl derleniyor ve çalışıyor (örneğin JVM üzerinde)?
4.  **Kullanım Alanları:** Kotlin günümüzde nerelerde kullanılıyor (Android, sunucu tarafı, çoklu platform vb.)?
5.  **Kod Örnekleri:** Kitlemin Java bildiğini göz önünde bulundurarak, anahtar kavramlar için net ve basit kod örnekleri sun. Null safety, data class'lar, extension fonksiyonlar ve coroutine'ler gibi konuları başlangıç seviyesinde vurgula.

Bu çıktı tamamen Türkçe olmalı.
`;

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = useCallback(async () => {
    try {
      chatRef.current = startChatSession();
      const userMessage: Message = {
        id: Date.now(),
        text: INITIAL_PROMPT,
        sender: Sender.User,
      };
      // Hide initial long prompt from UI for cleaner start
      // setMessages([userMessage]);

      const geminiMessageId = Date.now() + 1;
      const geminiPlaceholder: Message = {
        id: geminiMessageId,
        text: '...',
        sender: Sender.Gemini,
        isLoading: true,
      };
      setMessages([geminiPlaceholder]);
      
      const stream = await chatRef.current.sendMessageStream({ message: INITIAL_PROMPT });

      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk.text;
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === geminiMessageId ? { ...msg, text: fullResponse, isLoading: true } : msg
          )
        );
      }

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === geminiMessageId ? { ...msg, text: fullResponse, isLoading: false } : msg
        )
      );
    } catch (error) {
      console.error('Error initializing chat:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: 'Üzgünüm, bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
        sender: Sender.Gemini,
      };
      setMessages((prev) => [...prev.filter(m => m.id !== (Date.now() + 1)), errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      initializeChat();
    }
  }, [initializeChat]);


  const handleSendMessage = async (text: string) => {
    if (isLoading || !text.trim() || !chatRef.current) return;

    setIsLoading(true);

    const userMessage: Message = {
      id: Date.now(),
      text,
      sender: Sender.User,
    };
    
    const geminiMessageId = Date.now() + 1;
    const geminiPlaceholder: Message = {
      id: geminiMessageId,
      text: '...',
      sender: Sender.Gemini,
      isLoading: true,
    };

    setMessages((prevMessages) => [...prevMessages, userMessage, geminiPlaceholder]);
    
    try {
      const stream = await chatRef.current.sendMessageStream({ message: text });
      let fullResponse = '';

      for await (const chunk of stream) {
        fullResponse += chunk.text;
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === geminiMessageId ? { ...msg, text: fullResponse, isLoading: true } : msg
          )
        );
      }
      
       setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === geminiMessageId ? { ...msg, text: fullResponse, isLoading: false } : msg
        )
      );

    } catch (error) {
      console.error('Mesaj gönderilirken hata:', error);
      const errorMessage: Message = {
        id: geminiMessageId,
        text: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
        sender: Sender.Gemini,
      };
       setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === geminiMessageId ? errorMessage : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 font-sans">
      <header className="bg-gray-800/50 backdrop-blur-sm p-4 border-b border-gray-700 shadow-lg flex items-center space-x-3 fixed top-0 w-full z-10">
        <GeminiIcon className="w-8 h-8" />
        <div>
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            Kotlin Sunum Asistanı
            </h1>
            <p className="text-xs text-gray-400">Gemini 2.5 Pro ile güçlendirilmiştir</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pt-24 pb-32">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="fixed bottom-0 w-full bg-gray-900/70 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto p-4">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </footer>
    </div>
  );
};

export default App;

import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Message {
  id: number;
  senderType: "visitor" | "ai" | "admin";
  content: string;
  adminName?: string | null;
  createdAt: Date;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const createSession = trpc.chat.getOrCreateSession.useMutation();
  const sendMessage = trpc.chat.sendMessage.useMutation();

  // Initialize session when chat opens
  useEffect(() => {
    if (isOpen && !sessionId) {
      const storedSessionId = localStorage.getItem("chatSessionId");
      createSession.mutate(
        { sessionId: storedSessionId || undefined },
        {
          onSuccess: (data) => {
            setSessionId(data.session.sessionId);
            localStorage.setItem("chatSessionId", data.session.sessionId);
            
            // Add welcome message
            setMessages([
              {
                id: 0,
                senderType: "ai",
                content: "Hello! I'm here to help you learn about +1 Chopsticks and answer any questions about booking authentic home dining experiences in Shanghai. How can I assist you today?",
                createdAt: new Date(),
              },
            ]);
          },
        }
      );
    }
  }, [isOpen, sessionId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !sessionId || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setIsLoading(true);

    // Add user message immediately
    const tempUserMessage: Message = {
      id: Date.now(),
      senderType: "visitor",
      content: userMessage,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    // Send to backend
    try {
      const response = await sendMessage.mutateAsync({
        sessionId,
        content: userMessage,
      });

      // Add AI response
      setMessages((prev) => [
        ...prev,
        {
          id: response.message.id,
          senderType: response.message.senderType as "visitor" | "ai" | "admin",
          content: response.message.content,
          adminName: response.message.adminName,
          createdAt: new Date(response.message.createdAt),
        },
      ]);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          senderType: "ai",
          content: "I apologize, but I'm having trouble connecting right now. Please try again or email us at plusonechopsticks@gmail.com.",
          createdAt: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-[#8B4513] hover:bg-[#723A0F] z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[380px] h-[600px] shadow-2xl flex flex-col z-50 border-2">
      {/* Header */}
      <div className="bg-[#8B4513] text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <div>
            <h3 className="font-semibold">+1 Chopsticks Support</h3>
            <p className="text-xs opacity-90">We're here to help!</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderType === "visitor" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.senderType === "visitor"
                  ? "bg-[#8B4513] text-white"
                  : "bg-white border border-gray-200 text-gray-900"
              }`}
            >
              {message.senderType === "admin" && message.adminName && (
                <p className="text-xs font-semibold text-[#8B4513] mb-1">
                  {message.adminName}
                </p>
              )}
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white rounded-b-lg">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your question..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            size="icon"
            className="bg-[#8B4513] hover:bg-[#723A0F]"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Powered by AI • Responses may take a few seconds
        </p>
      </div>
    </Card>
  );
}

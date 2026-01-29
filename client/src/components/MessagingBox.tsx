import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, MessageCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface MessagingBoxProps {
  conversationId: number;
  senderType: "host" | "guest";
  senderName: string;
  senderEmail: string;
  otherPartyName: string;
}

export default function MessagingBox({
  conversationId,
  senderType,
  senderName,
  senderEmail,
  otherPartyName,
}: MessagingBoxProps) {
  const [messageContent, setMessageContent] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);

  // Fetch messages
  const { data: fetchedMessages } = trpc.messaging.getMessages.useQuery(
    { conversationId },
    {
      onSuccess: (data) => {
        setMessages(data);
        setIsLoadingMessages(false);
      },
    }
  );

  // Send message mutation
  const sendMessageMutation = trpc.messaging.sendMessage.useMutation({
    onSuccess: (newMessage) => {
      setMessages([...messages, newMessage]);
      setMessageContent("");
      toast.success("Message sent");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send message");
    },
  });

  // Mark as read
  const markAsReadMutation = trpc.messaging.markAsRead.useMutation();

  // Mark messages as read when component mounts
  useEffect(() => {
    markAsReadMutation.mutate({ conversationId });
  }, [conversationId]);

  const handleSendMessage = () => {
    if (!messageContent.trim()) {
      toast.error("Please enter a message");
      return;
    }

    sendMessageMutation.mutate({
      conversationId,
      senderType,
      senderName,
      senderEmail,
      content: messageContent,
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border">
      {/* Header */}
      <div className="bg-gradient-to-r from-burgundy-50 to-burgundy-100 p-4 border-b">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-burgundy-600" />
          <div>
            <h3 className="font-semibold text-gray-900">Chat with {otherPartyName}</h3>
            <p className="text-sm text-gray-600">
              {senderType === "host" ? "Guest" : "Host"} conversation
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingMessages ? (
          <div className="text-center text-gray-500 py-8">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderType === senderType ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  message.senderType === senderType
                    ? "bg-burgundy-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="text-sm font-semibold mb-1">{message.senderName}</p>
                <p className="text-sm">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.senderType === senderType
                      ? "text-burgundy-100"
                      : "text-gray-500"
                  }`}
                >
                  {new Date(message.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      <div className="border-t p-4 bg-gray-50">
        <div className="flex gap-2">
          <Textarea
            placeholder="Type your message..."
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && e.ctrlKey) {
                handleSendMessage();
              }
            }}
            rows={3}
            className="resize-none"
          />
          <Button
            onClick={handleSendMessage}
            disabled={sendMessageMutation.isPending || !messageContent.trim()}
            className="bg-burgundy-600 hover:bg-burgundy-700 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Ctrl+Enter to send</p>
      </div>
    </div>
  );
}

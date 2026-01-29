import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { MessageSquare, LogOut, Send, Calendar, MapPin, Users } from "lucide-react";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Booking {
  id: number;
  hostName: string;
  hostEmail: string;
  requestedDate: string;
  mealType: "lunch" | "dinner";
  numberOfGuests: number;
  specialRequests: string | null;
  status: "pending" | "confirmed" | "cancelled" | "rejected";
}

export default function GuestDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("bookings");
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [messages, setMessages] = useState<any[]>([]);

  // Fetch guest bookings
  const { data: bookings, isLoading: bookingsLoading } = trpc.booking.getGuestBookings.useQuery(
    { guestEmail: user?.email || "" },
    { enabled: !!user?.email }
  );

  // Fetch conversations for guest
  const { data: conversations, isLoading: conversationsLoading, refetch: refetchConversations } = trpc.messaging.getGuestConversations.useQuery(
    { guestEmail: user?.email || "" },
    { enabled: !!user?.email }
  );

  // Fetch messages for selected conversation
  const { data: conversationMessages, refetch: refetchMessages } = trpc.messaging.getMessages.useQuery(
    { conversationId: selectedConversation?.id || 0 },
    { enabled: !!selectedConversation?.id }
  );

  // Auto-poll messages every 3 seconds when conversation is selected
  useEffect(() => {
    if (!selectedConversation?.id) return;
    
    const interval = setInterval(() => {
      refetchMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedConversation?.id, refetchMessages]);

  // Auto-poll conversations every 5 seconds
  useEffect(() => {
    if (!user?.email) return;
    
    const interval = setInterval(() => {
      refetchConversations();
    }, 5000);

    return () => clearInterval(interval);
  }, [user?.email, refetchConversations]);

  // Update messages when conversation changes
  useEffect(() => {
    if (conversationMessages) {
      setMessages(conversationMessages);
    }
  }, [conversationMessages]);

  // Send message mutation
  const sendMessageMutation = trpc.messaging.sendMessage.useMutation({
    onSuccess: () => {
      setMessageContent("");
      toast.success("Message sent");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send message");
    },
  });

  const handleLogout = async () => {
    toast.info("Logout functionality coming soon");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <p className="text-gray-600 mb-4">Please log in to access your dashboard</p>
            <Button className="w-full">Log In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="bookings">
              My Bookings
              {bookings?.filter((b: Booking) => b.status === "pending").length > 0 && (
                <Badge className="ml-2 bg-yellow-600">
                  {bookings.filter((b: Booking) => b.status === "pending").length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="messages">
              Messages
              {conversations?.length > 0 && (
                <Badge className="ml-2 bg-blue-600">{conversations.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            {bookingsLoading ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="pt-8 pb-8 text-center">
                  <p className="text-gray-600">Loading your bookings...</p>
                </CardContent>
              </Card>
            ) : !bookings || bookings.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="pt-8 pb-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No bookings yet</p>
                  <p className="text-sm text-gray-500 mt-2">Browse hosts and make your first booking!</p>
                </CardContent>
              </Card>
            ) : (
              bookings.map((booking: Booking) => (
                <Card key={booking.id} className="border-0 shadow-lg">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                          {booking.hostName}
                        </h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-600" />
                            <div>
                              <p className="text-sm text-gray-600">Date</p>
                              <p className="font-semibold text-gray-900">
                                {new Date(booking.requestedDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-600" />
                            <div>
                              <p className="text-sm text-gray-600">Guests</p>
                              <p className="font-semibold text-gray-900">{booking.numberOfGuests}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-1">Meal Type</p>
                          <p className="font-semibold text-gray-900 capitalize">{booking.mealType}</p>
                        </div>

                        {booking.specialRequests && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Special Requests</p>
                            <p className="text-gray-900">{booking.specialRequests}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Badge
                          className={
                            booking.status === "pending"
                              ? "bg-yellow-600"
                              : booking.status === "confirmed"
                              ? "bg-green-600"
                              : booking.status === "rejected"
                              ? "bg-red-600"
                              : "bg-gray-600"
                          }
                        >
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-4">
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-1">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Conversations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                    {conversationsLoading ? (
                      <div className="text-sm text-gray-600 text-center py-8">
                        <p>Loading conversations...</p>
                      </div>
                    ) : !conversations || conversations.length === 0 ? (
                      <div className="text-sm text-gray-600 text-center py-8">
                        <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p>No conversations yet</p>
                      </div>
                    ) : (
                      conversations.map((conv: any) => (
                        <div
                          key={conv.id}
                          onClick={() => setSelectedConversation(conv)}
                          className={`p-3 rounded-lg cursor-pointer transition ${
                            selectedConversation?.id === conv.id
                              ? "bg-burgundy-100 border-l-4 border-burgundy-600"
                              : "bg-gray-50 hover:bg-gray-100"
                          }`}
                        >
                          <p className="font-semibold text-sm text-gray-900">{conv.guestName}</p>
                          <p className="text-xs text-gray-600 truncate">{conv.lastMessage || "No messages yet"}</p>
                          {conv.lastMessageAt && (
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(conv.lastMessageAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
              <div className="col-span-2">
                {selectedConversation ? (
                  <Card className="border-0 shadow-lg h-96 flex flex-col">
                    <CardHeader className="border-b">
                      <CardTitle className="text-lg">Chat with {selectedConversation.guestName}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                          <p>No messages yet</p>
                        </div>
                      ) : (
                        messages.map((msg: any, idx: number) => (
                          <div
                            key={idx}
                            className={`flex ${msg.senderType === 'guest' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs px-4 py-2 rounded-lg ${
                                msg.senderType === 'guest'
                                  ? 'bg-burgundy-600 text-white'
                                  : 'bg-gray-200 text-gray-900'
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <p className="text-xs mt-1 opacity-70">
                                {new Date(msg.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                    <div className="border-t p-4 flex gap-2">
                      <input
                        type="text"
                        placeholder="Type a message..."
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <Button
                        size="sm"
                        className="bg-burgundy-600 hover:bg-burgundy-700 text-white"
                        disabled={!messageContent.trim() || sendMessageMutation.isPending}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <Card className="border-0 shadow-lg h-96 flex items-center justify-center">
                    <CardContent className="text-center">
                      <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Select a conversation to start messaging</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

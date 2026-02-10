import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Edit2, Calendar, MessageSquare, LogOut, Save, X, Send } from "lucide-react";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import BookingCalendar from "@/components/BookingCalendar";
import AvailabilityEditor from "@/components/AvailabilityEditor";

interface HostProfile {
  id: number;
  hostName: string;
  email: string;
  district: string;
  profilePhotoUrl: string | null;
  bio: string | null;
  cuisineStyle: string;
  menuDescription: string | null;
  maxGuests: number;
  pricePerPerson: number;
  availability: Record<string, string[]>;
  foodPhotoUrls: string[];
  status: "pending" | "approved" | "rejected";
}

interface Booking {
  id: number;
  guestName: string;
  guestEmail: string;
  date: string;
  numberOfGuests: number;
  specialRequests: string | null;
  status: "pending" | "confirmed" | "cancelled";
}

export default function HostDashboard() {
  const { user } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editData, setEditData] = useState<Partial<HostProfile>>({});
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch host profile FIRST before using it
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = trpc.host.getProfile.useQuery(
    { userId: String(user?.id || "") },
    { enabled: !!user?.id }
  );

  // Fetch conversations for host
  const { data: conversations, isLoading: conversationsLoading, refetch: refetchConversations } = trpc.messaging.getHostConversations.useQuery(
    { hostListingId: profile?.id || 0 },
    { enabled: !!profile?.id }
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
    if (!profile?.id) return;
    
    const interval = setInterval(() => {
      refetchConversations();
    }, 5000);

    return () => clearInterval(interval);
  }, [profile?.id, refetchConversations]);

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

  // Fetch bookings
  const { data: bookings = [], isLoading: bookingsLoading, refetch: refetchBookings } = trpc.host.getBookings.useQuery(
    { hostId: profile?.id || 0 },
    { enabled: !!profile?.id }
  );

  // Update profile mutation
  const updateProfileMutation = trpc.host.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully");
      refetchProfile();
      setIsEditingProfile(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  // Logout mutation
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
  });

  if (profileLoading) {
    return <div className="p-8 text-center">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="p-8 text-center">No profile found</div>;
  }

  const handleEditProfile = () => {
    setEditData(profile);
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        id: profile.id,
        bio: editData.bio || undefined,
        menuDescription: editData.menuDescription || undefined,
        pricePerPerson: editData.pricePerPerson,
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !selectedConversation) return;

    try {
      await sendMessageMutation.mutateAsync({
        conversationId: selectedConversation.id,
        senderType: "host",
        senderName: profile.hostName,
        senderEmail: profile.email,
        content: messageContent,
      });
      refetchMessages();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{profile.hostName}'s Dashboard</h1>
            <p className="text-gray-600 mt-1">{profile.district}, Shanghai</p>
          </div>
          <Button
            variant="outline"
            onClick={() => logoutMutation.mutate()}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Edit2 className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Messages {conversations && conversations.length > 0 && `(${conversations.length})`}
            </TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="overview">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Host Profile</CardTitle>
                <Button onClick={handleEditProfile} className="flex items-center gap-2">
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Name</p>
                    <p className="text-lg font-semibold">{profile.hostName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Email</p>
                    <p className="text-lg font-semibold">{profile.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cuisine Style</p>
                    <p className="text-lg font-semibold">{profile.cuisineStyle}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Price per Person</p>
                    <p className="text-lg font-semibold">¥{profile.pricePerPerson}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Bio</p>
                  <p className="text-gray-700 mt-1">{profile.bio || "No bio provided"}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Your Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <p>Loading bookings...</p>
                ) : bookings.length === 0 ? (
                  <p className="text-gray-600">No bookings yet</p>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking: Booking) => (
                      <Card key={booking.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{booking.guestName}</p>
                            <p className="text-sm text-gray-600">{booking.guestEmail}</p>
                            <p className="text-sm text-gray-600">Date: {booking.date}</p>
                            <p className="text-sm text-gray-600">Guests: {booking.numberOfGuests}</p>
                          </div>
                          <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                            {booking.status}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <div className="grid grid-cols-3 gap-4">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Conversations</CardTitle>
                </CardHeader>
                <CardContent>
                  {conversationsLoading ? (
                    <p>Loading...</p>
                  ) : !conversations || conversations.length === 0 ? (
                    <p className="text-gray-600 text-sm">No conversations yet</p>
                  ) : (
                    <div className="space-y-2">
                      {conversations.map((conv: any) => (
                        <button
                          key={conv.id}
                          onClick={() => setSelectedConversation(conv)}
                          className={`w-full text-left p-3 rounded-lg transition ${
                            selectedConversation?.id === conv.id
                              ? "bg-primary text-white"
                              : "bg-gray-100 hover:bg-gray-200"
                          }`}
                        >
                          <p className="font-medium text-sm">{conv.guestName || "Guest"}</p>
                          <p className="text-xs text-gray-600 truncate">{conv.lastMessage || "No messages"}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {selectedConversation ? `Chat with ${selectedConversation.guestName || "Guest"}` : "Select a conversation"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col h-96">
                  {selectedConversation ? (
                    <>
                      <div className="flex-1 overflow-y-auto mb-4 space-y-3 p-3 bg-gray-50 rounded-lg">
                        {messages.map((msg: any, idx: number) => (
                          <div
                            key={idx}
                            className={`flex ${msg.senderType === "host" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-xs px-4 py-2 rounded-lg ${
                                msg.senderType === "host"
                                  ? "bg-primary text-white"
                                  : "bg-gray-200 text-gray-900"
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {new Date(msg.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={messageContent}
                          onChange={(e) => setMessageContent(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                          placeholder="Type a message..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <Button onClick={handleSendMessage} className="flex items-center gap-2">
                          <Send className="w-4 h-4" />
                          Send
                        </Button>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-600 text-center">Select a conversation to start messaging</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Availability Tab */}
          <TabsContent value="availability">
            <Card>
              <CardHeader>
                <CardTitle>Manage Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gray-100 rounded-lg">
                <p className="text-gray-600">Availability management coming soon</p>
              </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={editData.hostName || ""}
                onChange={(e) => setEditData({ ...editData, hostName: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={editData.email || ""}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Cuisine Style</Label>
              <Input
                value={editData.cuisineStyle || ""}
                onChange={(e) => setEditData({ ...editData, cuisineStyle: e.target.value })}
              />
            </div>
            <div>
              <Label>Price per Person</Label>
              <Input
                type="number"
                value={editData.pricePerPerson || ""}
                onChange={(e) => setEditData({ ...editData, pricePerPerson: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label>Bio</Label>
              <Textarea
                value={editData.bio || ""}
                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

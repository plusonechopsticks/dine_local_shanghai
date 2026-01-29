import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Edit2, Calendar, MessageSquare, LogOut, Save, X } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch host profile
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = trpc.host.getProfile.useQuery(
    { userId: user?.id || "" },
    { enabled: !!user?.id }
  );

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

  // Update booking status mutation
  const updateBookingMutation = trpc.host.updateBookingStatus.useMutation({
    onSuccess: () => {
      toast.success("Booking status updated");
      refetchBookings();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update booking");
    },
  });

  const handleEditProfile = () => {
    if (profile) {
      setEditData(profile);
      setIsEditingProfile(true);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    updateProfileMutation.mutate({
      id: profile.id,
      bio: editData.bio,
      menuDescription: editData.menuDescription,
      pricePerPerson: editData.pricePerPerson,
    });
  };

  const handleLogout = async () => {
    // TODO: Implement logout
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

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <p className="text-gray-600 mb-4">You don't have a host profile yet</p>
            <Button className="w-full">Create Host Profile</Button>
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
          <div className="flex items-center gap-4">
            {profile.profilePhotoUrl && (
              <img
                src={profile.profilePhotoUrl}
                alt={profile.hostName}
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.hostName}</h1>
              <p className="text-sm text-gray-600">{profile.district}</p>
            </div>
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
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">
              Bookings
              {bookings.filter((b: Booking) => b.status === "pending").length > 0 && (
                <Badge className="ml-2 bg-red-500">
                  {bookings.filter((b: Booking) => b.status === "pending").length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Profile Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle>Your Profile</CardTitle>
                <Button
                  onClick={handleEditProfile}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Cuisine Style</p>
                    <p className="font-semibold text-gray-900">{profile.cuisineStyle}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Max Guests</p>
                    <p className="font-semibold text-gray-900">{profile.maxGuests}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Price Per Person</p>
                    <p className="font-semibold text-gray-900">¥{profile.pricePerPerson}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge className="bg-green-600">Approved</Badge>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Bio</p>
                  <p className="text-gray-900">{profile.bio}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Menu Description</p>
                  <p className="text-gray-900">{profile.menuDescription}</p>
                </div>

                {profile.foodPhotoUrls && profile.foodPhotoUrls.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Food Photos</p>
                    <div className="grid grid-cols-4 gap-2">
                      {profile.foodPhotoUrls.map((url: string, idx: number) => (
                        <img
                          key={idx}
                          src={url}
                          alt={`Food ${idx + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600 mb-2">Availability</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.availability &&
                      Object.entries(profile.availability).map(([day, meals]: [string, any]) => (
                        <Badge key={day} variant="secondary">
                          {day}: {meals.join(", ")}
                        </Badge>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary mb-1">
                      {bookings.filter((b: Booking) => b.status === "confirmed").length}
                    </p>
                    <p className="text-sm text-gray-600">Confirmed Bookings</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-yellow-600 mb-1">
                      {bookings.filter((b: Booking) => b.status === "pending").length}
                    </p>
                    <p className="text-sm text-gray-600">Pending Requests</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600 mb-1">
                      {bookings.length}
                    </p>
                    <p className="text-sm text-gray-600">Total Bookings</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            {bookingsLoading ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="pt-8 pb-8 text-center">
                  <p className="text-gray-600">Loading bookings...</p>
                </CardContent>
              </Card>
            ) : bookings.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="pt-8 pb-8 text-center">
                  <p className="text-gray-600">No bookings yet</p>
                </CardContent>
              </Card>
            ) : (
              bookings.map((booking: Booking) => (
                <Card key={booking.id} className="border-0 shadow-lg">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {booking.guestName}
                        </h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Date</p>
                            <p className="font-semibold text-gray-900">
                              {new Date(booking.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Guests</p>
                            <p className="font-semibold text-gray-900">{booking.numberOfGuests}</p>
                          </div>
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
                              : "bg-red-600"
                          }
                        >
                          {booking.status}
                        </Badge>

                        {booking.status === "pending" && (
                          <>
                            <Button
                              onClick={() =>
                                updateBookingMutation.mutate({
                                  bookingId: booking.id,
                                  status: "confirmed",
                                })
                              }
                              className="bg-green-600 hover:bg-green-700 text-white"
                              size="sm"
                              disabled={updateBookingMutation.isPending}
                            >
                              Confirm
                            </Button>
                            <Button
                              onClick={() =>
                                updateBookingMutation.mutate({
                                  bookingId: booking.id,
                                  status: "cancelled",
                                })
                              }
                              variant="destructive"
                              size="sm"
                              disabled={updateBookingMutation.isPending}
                            >
                              Decline
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-8 pb-8 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Messaging system coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Your Profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell guests about yourself..."
                value={editData.bio || ""}
                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                rows={4}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="menu">Menu Description</Label>
              <Textarea
                id="menu"
                placeholder="Describe your menu and specialties..."
                value={editData.menuDescription || ""}
                onChange={(e) =>
                  setEditData({ ...editData, menuDescription: e.target.value })
                }
                rows={4}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="price">Price Per Person (¥)</Label>
              <Input
                id="price"
                type="number"
                placeholder="e.g., 200"
                value={editData.pricePerPerson || ""}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    pricePerPerson: parseInt(e.target.value) || 0,
                  })
                }
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditingProfile(false)}
              disabled={updateProfileMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveProfile}
              disabled={updateProfileMutation.isPending}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

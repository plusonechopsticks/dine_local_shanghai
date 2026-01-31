import { trpc } from "@/lib/trpc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Edit2 } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function AdminDashboard() {
  const { data: listings = [], isLoading: listingsLoading } = trpc.host.listAll.useQuery();
  const { data: bookings = [], isLoading: bookingsLoading } = trpc.booking.listAll.useQuery();

  const [editingHost, setEditingHost] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});

  // Mutations
  const updateStatusMutation = trpc.host.updateStatus.useMutation({
    onSuccess: () => {
      trpc.useUtils().host.listAll.invalidate();
    },
  });

  const updateHostMutation = trpc.host.updateHost.useMutation({
    onSuccess: () => {
      trpc.useUtils().host.listAll.invalidate();
      setEditingHost(null);
    },
  });

  // Handlers
  const handleApprove = (hostId: number) => {
    updateStatusMutation.mutate({
      id: hostId,
      status: "approved",
    });
  };

  const handleReject = (hostId: number) => {
    updateStatusMutation.mutate({
      id: hostId,
      status: "rejected",
    });
  };

  const handleEditOpen = (host: any) => {
    setEditingHost(host);
    setEditFormData({
      hostName: host.hostName,
      email: host.email,
      wechatOrPhone: host.wechatOrPhone,
      district: host.district,
      fullAddress: host.fullAddress,
      title: host.title,
      cuisineStyle: host.cuisineStyle,
      bio: host.bio,
      profilePhotoUrl: host.profilePhotoUrl,
      menuDescription: host.menuDescription,
      pricePerPerson: host.pricePerPerson,
      maxGuests: host.maxGuests,
      availability: host.availability,
      activities: host.activities?.join(", ") || "",
      householdFeatures: host.householdFeatures?.join(", ") || "",
      otherHouseholdInfo: host.otherHouseholdInfo,
      dietaryNote: host.dietaryNote,
      otherNotes: host.otherNotes,
      languages: host.languages?.join(", ") || "",
      mealDurationMinutes: host.mealDurationMinutes,
      hasPets: host.hasPets,
      petDetails: host.petDetails,
      kidsFriendly: host.kidsFriendly,
    });
  };

  const handleEditSave = () => {
    if (!editingHost) return;
    updateHostMutation.mutate({
      id: editingHost.id,
      data: {
        hostName: editFormData.hostName,
        email: editFormData.email,
        wechatOrPhone: editFormData.wechatOrPhone,
        district: editFormData.district,
        fullAddress: editFormData.fullAddress,
        title: editFormData.title,
        cuisineStyle: editFormData.cuisineStyle,
        bio: editFormData.bio,
        profilePhotoUrl: editFormData.profilePhotoUrl,
        menuDescription: editFormData.menuDescription,
        pricePerPerson: parseInt(editFormData.pricePerPerson),
        maxGuests: parseInt(editFormData.maxGuests),
        activities: editFormData.activities?.split(",").map((a: string) => a.trim()).filter((a: string) => a) || [],
        householdFeatures: editFormData.householdFeatures?.split(",").map((h: string) => h.trim()).filter((h: string) => h) || [],
        otherHouseholdInfo: editFormData.otherHouseholdInfo,
        dietaryNote: editFormData.dietaryNote,
        otherNotes: editFormData.otherNotes,
        languages: editFormData.languages?.split(",").map((l: string) => l.trim()).filter((l: string) => l) || [],
        mealDurationMinutes: parseInt(editFormData.mealDurationMinutes),
        hasPets: editFormData.hasPets,
        petDetails: editFormData.petDetails,
        kidsFriendly: editFormData.kidsFriendly,
      },
    });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-gray-600 mb-6">Manage host applications and guest bookings</p>

      <Tabs defaultValue="applications" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="applications">Host Applications</TabsTrigger>
          <TabsTrigger value="bookings">Guest Bookings</TabsTrigger>
        </TabsList>

        {/* Host Applications Tab */}
        <TabsContent value="applications" className="space-y-4">
          {listingsLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : listings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No host applications</div>
          ) : (
            listings.map((host: any) => (
              <Card key={host.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {host.title && (
                        <p className="text-sm font-semibold text-primary mb-1">{host.title}</p>
                      )}
                      <CardTitle className="text-xl">{host.hostName}</CardTitle>
                      <CardDescription>{host.email}</CardDescription>
                    </div>
                    <Badge
                      variant={host.status === "approved" ? "default" : host.status === "rejected" ? "destructive" : "secondary"}
                    >
                      {host.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Host Profile Section */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3 text-sm">Host Profile</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-600">WeChat/Phone</p>
                        <p className="text-sm">{host.wechatOrPhone || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600">Languages</p>
                        <p className="text-sm">{host.languages?.join(", ") || "-"}</p>
                      </div>
                      {host.profilePhotoUrl && (
                        <div className="col-span-2">
                          <p className="text-xs font-semibold text-gray-600 mb-2">Profile Photo</p>
                          <img src={host.profilePhotoUrl} alt="Profile" className="w-24 h-24 object-cover rounded" />
                        </div>
                      )}
                      <div className="col-span-2">
                        <p className="text-xs font-semibold text-gray-600">Bio</p>
                        <p className="text-sm text-gray-700">{host.bio || "-"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Dining Details Section */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3 text-sm">Dining Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-600">Location</p>
                        <p className="text-sm">{host.district}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600">Cuisine</p>
                        <p className="text-sm">{host.cuisineStyle}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600">Price per Person</p>
                        <p className="text-sm">¥{host.pricePerPerson}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600">Max Guests</p>
                        <p className="text-sm">{host.maxGuests}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600">Meal Duration</p>
                        <p className="text-sm">{host.mealDurationMinutes || "-"} minutes</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs font-semibold text-gray-600">Menu Description</p>
                        <p className="text-sm text-gray-700">{host.menuDescription || "-"}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs font-semibold text-gray-600">Dietary Notes</p>
                        <p className="text-sm text-gray-700">{host.dietaryNote || "-"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Availability Section */}
                  {host.availability && Object.keys(host.availability).length > 0 && (
                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-3 text-sm">Availability</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(host.availability).map(([day, meals]: any) => (
                          <div key={day}>
                            <p className="text-xs font-semibold text-gray-600 capitalize">{day}</p>
                            <p className="text-sm">{meals.join(", ")}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Activities Section */}
                  {host.activities && host.activities.length > 0 && (
                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-3 text-sm">Activities</h3>
                      <div className="flex flex-wrap gap-2">
                        {host.activities.map((activity: string) => (
                          <Badge key={activity} variant="outline">{activity}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Household Info Section */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3 text-sm">Household Info</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-600">Kids Friendly</p>
                        <p className="text-sm">{host.kidsFriendly ? "Yes" : "No"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600">Has Pets</p>
                        <p className="text-sm">{host.hasPets ? "Yes" : "No"}</p>
                      </div>
                      {host.petDetails && (
                        <div className="col-span-2">
                          <p className="text-xs font-semibold text-gray-600">Pet Details</p>
                          <p className="text-sm">{host.petDetails}</p>
                        </div>
                      )}
                      {host.householdFeatures && host.householdFeatures.length > 0 && (
                        <div className="col-span-2">
                          <p className="text-xs font-semibold text-gray-600">Household Features</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {host.householdFeatures.map((feature: string) => (
                              <Badge key={feature} variant="outline">{feature}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {host.otherHouseholdInfo && (
                        <div className="col-span-2">
                          <p className="text-xs font-semibold text-gray-600">Other Household Info</p>
                          <p className="text-sm text-gray-700">{host.otherHouseholdInfo}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Food Photos Section */}
                  {host.foodPhotoUrls && host.foodPhotoUrls.length > 0 && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-semibold text-gray-600 mb-2">Food Photos</p>
                      <div className="grid grid-cols-3 gap-2">
                        {host.foodPhotoUrls.map((photo: string, idx: number) => (
                          <img
                            key={idx}
                            src={photo}
                            alt={`Food photo ${idx + 1}`}
                            className="w-full h-24 object-cover rounded"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Notes */}
                  {host.otherNotes && (
                    <div className="border-t pt-4">
                      <p className="text-xs font-semibold text-gray-600">Other Notes</p>
                      <p className="text-sm text-gray-700">{host.otherNotes}</p>
                    </div>
                  )}

                  {/* Address (if available) */}
                  {host.fullAddress && (
                    <div className="border-t pt-4">
                      <p className="text-xs font-semibold text-gray-600">Full Address</p>
                      <p className="text-sm">{host.fullAddress}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t">
                    {host.status === "rejected" ? (
                      <Button
                        onClick={() => handleApprove(host.id)}
                        disabled={updateStatusMutation.isPending}
                        className="flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleReject(host.id)}
                        disabled={updateStatusMutation.isPending}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    )}

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => handleEditOpen(host)}
                          variant="outline"
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                        <DialogHeader>
                          <DialogTitle>Edit Host Application</DialogTitle>
                          <DialogDescription>Update all host details</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 overflow-y-auto flex-1 pr-4">
                          {/* Host Profile Fields */}
                          <div className="border-b pb-4">
                            <h3 className="font-semibold text-sm mb-3">Host Profile</h3>
                            <div className="space-y-3">
                              <div>
                                <Label htmlFor="hostName">Name</Label>
                                <Input
                                  id="hostName"
                                  value={editFormData.hostName || ""}
                                  onChange={(e) => setEditFormData({ ...editFormData, hostName: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                  id="email"
                                  value={editFormData.email || ""}
                                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="wechatOrPhone">WeChat/Phone</Label>
                                <Input
                                  id="wechatOrPhone"
                                  value={editFormData.wechatOrPhone || ""}
                                  onChange={(e) => setEditFormData({ ...editFormData, wechatOrPhone: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="languages">Languages (comma-separated)</Label>
                                <Input
                                  id="languages"
                                  value={editFormData.languages || ""}
                                  onChange={(e) => setEditFormData({ ...editFormData, languages: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                  id="bio"
                                  value={editFormData.bio || ""}
                                  onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                                  rows={3}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Dining Details Fields */}
                          <div className="border-b pb-4">
                            <h3 className="font-semibold text-sm mb-3">Dining Details</h3>
                            <div className="space-y-3">
                              <div>
                                <Label htmlFor="title">Experience Title</Label>
                                <Input
                                  id="title"
                                  value={editFormData.title || ""}
                                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="district">District</Label>
                                <Input
                                  id="district"
                                  value={editFormData.district || ""}
                                  onChange={(e) => setEditFormData({ ...editFormData, district: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="fullAddress">Full Address</Label>
                                <Input
                                  id="fullAddress"
                                  value={editFormData.fullAddress || ""}
                                  onChange={(e) => setEditFormData({ ...editFormData, fullAddress: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="cuisineStyle">Cuisine Style</Label>
                                <Input
                                  id="cuisineStyle"
                                  value={editFormData.cuisineStyle || ""}
                                  onChange={(e) => setEditFormData({ ...editFormData, cuisineStyle: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="menuDescription">Menu Description</Label>
                                <Textarea
                                  id="menuDescription"
                                  value={editFormData.menuDescription || ""}
                                  onChange={(e) => setEditFormData({ ...editFormData, menuDescription: e.target.value })}
                                  rows={4}
                                />
                              </div>
                              <div>
                                <Label htmlFor="dietaryNote">Dietary Notes</Label>
                                <Textarea
                                  id="dietaryNote"
                                  value={editFormData.dietaryNote || ""}
                                  onChange={(e) => setEditFormData({ ...editFormData, dietaryNote: e.target.value })}
                                  rows={2}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label htmlFor="pricePerPerson">Price per Person (¥)</Label>
                                  <Input
                                    id="pricePerPerson"
                                    type="number"
                                    value={editFormData.pricePerPerson || ""}
                                    onChange={(e) => setEditFormData({ ...editFormData, pricePerPerson: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="maxGuests">Max Guests</Label>
                                  <Input
                                    id="maxGuests"
                                    type="number"
                                    value={editFormData.maxGuests || ""}
                                    onChange={(e) => setEditFormData({ ...editFormData, maxGuests: e.target.value })}
                                  />
                                </div>
                              </div>
                              <div>
                                <Label htmlFor="mealDurationMinutes">Meal Duration (minutes)</Label>
                                <Input
                                  id="mealDurationMinutes"
                                  type="number"
                                  value={editFormData.mealDurationMinutes || ""}
                                  onChange={(e) => setEditFormData({ ...editFormData, mealDurationMinutes: e.target.value })}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Household Info Fields */}
                          <div className="border-b pb-4">
                            <h3 className="font-semibold text-sm mb-3">Household Info</h3>
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id="kidsFriendly"
                                  checked={editFormData.kidsFriendly || false}
                                  onChange={(e) => setEditFormData({ ...editFormData, kidsFriendly: e.target.checked })}
                                />
                                <Label htmlFor="kidsFriendly">Kids Friendly</Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id="hasPets"
                                  checked={editFormData.hasPets || false}
                                  onChange={(e) => setEditFormData({ ...editFormData, hasPets: e.target.checked })}
                                />
                                <Label htmlFor="hasPets">Has Pets</Label>
                              </div>
                              <div>
                                <Label htmlFor="petDetails">Pet Details</Label>
                                <Input
                                  id="petDetails"
                                  value={editFormData.petDetails || ""}
                                  onChange={(e) => setEditFormData({ ...editFormData, petDetails: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="householdFeatures">Household Features (comma-separated)</Label>
                                <Input
                                  id="householdFeatures"
                                  value={editFormData.householdFeatures || ""}
                                  onChange={(e) => setEditFormData({ ...editFormData, householdFeatures: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="otherHouseholdInfo">Other Household Info</Label>
                                <Textarea
                                  id="otherHouseholdInfo"
                                  value={editFormData.otherHouseholdInfo || ""}
                                  onChange={(e) => setEditFormData({ ...editFormData, otherHouseholdInfo: e.target.value })}
                                  rows={2}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Activities & Other Notes */}
                          <div>
                            <h3 className="font-semibold text-sm mb-3">Activities & Notes</h3>
                            <div className="space-y-3">
                              <div>
                                <Label htmlFor="activities">Activities (comma-separated)</Label>
                                <Input
                                  id="activities"
                                  value={editFormData.activities || ""}
                                  onChange={(e) => setEditFormData({ ...editFormData, activities: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="otherNotes">Other Notes</Label>
                                <Textarea
                                  id="otherNotes"
                                  value={editFormData.otherNotes || ""}
                                  onChange={(e) => setEditFormData({ ...editFormData, otherNotes: e.target.value })}
                                  rows={2}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Dialog Footer */}
                        <div className="flex gap-2 pt-4 border-t">
                          <Button
                            onClick={handleEditSave}
                            disabled={updateHostMutation.isPending}
                            className="flex-1"
                          >
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={() => setEditingHost(null)}>
                            Cancel
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Guest Bookings Tab */}
        <TabsContent value="bookings" className="space-y-4">
          {bookingsLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No bookings</div>
          ) : (
            bookings.map((booking: any) => (
              <Card key={booking.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{booking.guestName}</CardTitle>
                      <CardDescription>{booking.guestEmail}</CardDescription>
                    </div>
                    <Badge variant="outline">{booking.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Host</p>
                      <p className="text-sm">{booking.hostName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Date</p>
                      <p className="text-sm">{new Date(booking.requestedDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Meal Type</p>
                      <p className="text-sm capitalize">{booking.mealType}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Number of Guests</p>
                      <p className="text-sm">{booking.numberOfGuests}</p>
                    </div>
                  </div>
                  {booking.guestPhone && (
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Guest Phone</p>
                      <p className="text-sm">{booking.guestPhone}</p>
                    </div>
                  )}
                  {booking.specialRequests && (
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Special Requests</p>
                      <p className="text-sm">{booking.specialRequests}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

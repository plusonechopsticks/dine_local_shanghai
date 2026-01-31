import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Edit2 } from "lucide-react";
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
      cuisineStyle: host.cuisineStyle,
      pricePerPerson: host.pricePerPerson,
      maxGuests: host.maxGuests,
      menuDescription: host.menuDescription,
      district: host.district,
    });
  };

  const handleEditSave = () => {
    if (editingHost) {
      updateHostMutation.mutate({
        id: editingHost.id,
        ...editFormData,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage host applications and guest bookings</p>
      </div>

      <Tabs defaultValue="applications" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="applications">Host Applications</TabsTrigger>
          <TabsTrigger value="bookings">Guest Bookings</TabsTrigger>
        </TabsList>

        {/* Host Applications Tab */}
        <TabsContent value="applications" className="space-y-4">
          {listingsLoading ? (
            <div className="text-center py-8">Loading host applications...</div>
          ) : listings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No host applications found</div>
          ) : (
            <div className="grid gap-4">
              {listings.map((host: any) => (
                <Card key={host.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{host.hostName}</CardTitle>
                        <CardDescription>{host.email}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(host.status)}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Host Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Location</p>
                        <p className="font-medium">{host.district}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Cuisine</p>
                        <p className="font-medium">{host.cuisineStyle}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Price per Person</p>
                        <p className="font-medium">¥{host.pricePerPerson}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Max Guests</p>
                        <p className="font-medium">{host.maxGuests}</p>
                      </div>
                    </div>

                    {/* Description */}
                    {host.menuDescription && (
                      <div>
                        <p className="text-gray-600 text-sm mb-1">Menu Description</p>
                        <p className="text-sm line-clamp-3">{host.menuDescription}</p>
                      </div>
                    )}

                    {/* Food Photos */}
                    {host.foodPhotoUrls && host.foodPhotoUrls.length > 0 && (
                      <div>
                        <p className="text-gray-600 text-sm mb-2">Food Photos</p>
                        <div className="grid grid-cols-3 gap-2">
                          {host.foodPhotoUrls.map((photo: string, idx: number) => (
                            <img
                              key={idx}
                              src={photo}
                              alt={`Food ${idx + 1}`}
                              className="w-full h-24 object-cover rounded"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t">
                      {host.status !== "approved" && (
                        <Button
                          onClick={() => handleApprove(host.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          disabled={updateStatusMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                      )}

                      {host.status !== "rejected" && (
                        <Button
                          onClick={() => handleReject(host.id)}
                          variant="destructive"
                          className="flex-1"
                          disabled={updateStatusMutation.isPending}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      )}

                      {/* Edit Dialog */}
                      <Dialog open={editingHost?.id === host.id} onOpenChange={(open) => {
                        if (!open) setEditingHost(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={() => handleEditOpen(host)}
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit Host Application</DialogTitle>
                            <DialogDescription>
                              Update host information
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Name</Label>
                                <Input
                                  value={editFormData.hostName || ""}
                                  onChange={(e) =>
                                    setEditFormData({ ...editFormData, hostName: e.target.value })
                                  }
                                />
                              </div>
                              <div>
                                <Label>Email</Label>
                                <Input
                                  value={editFormData.email || ""}
                                  onChange={(e) =>
                                    setEditFormData({ ...editFormData, email: e.target.value })
                                  }
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Location</Label>
                                <Input
                                  value={editFormData.district || ""}
                                  onChange={(e) =>
                                    setEditFormData({ ...editFormData, district: e.target.value })
                                  }
                                />
                              </div>
                              <div>
                                <Label>Cuisine</Label>
                                <Input
                                  value={editFormData.cuisineStyle || ""}
                                  onChange={(e) =>
                                    setEditFormData({ ...editFormData, cuisineStyle: e.target.value })
                                  }
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Price per Person (¥)</Label>
                                <Input
                                  type="number"
                                  value={editFormData.pricePerPerson || ""}
                                  onChange={(e) =>
                                    setEditFormData({ ...editFormData, pricePerPerson: parseInt(e.target.value) })
                                  }
                                />
                              </div>
                              <div>
                                <Label>Max Guests</Label>
                                <Input
                                  type="number"
                                  value={editFormData.maxGuests || ""}
                                  onChange={(e) =>
                                    setEditFormData({ ...editFormData, maxGuests: parseInt(e.target.value) })
                                  }
                                />
                              </div>
                            </div>

                            <div>
                              <Label>Menu Description</Label>
                              <Textarea
                                value={editFormData.menuDescription || ""}
                                onChange={(e) =>
                                  setEditFormData({ ...editFormData, menuDescription: e.target.value })
                                }
                                rows={4}
                              />
                            </div>

                            <div className="flex gap-2 justify-end pt-4">
                              <Button
                                variant="outline"
                                onClick={() => setEditingHost(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleEditSave}
                                disabled={updateHostMutation.isPending}
                              >
                                Save Changes
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Guest Bookings Tab */}
        <TabsContent value="bookings" className="space-y-4">
          {bookingsLoading ? (
            <div className="text-center py-8">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No bookings found</div>
          ) : (
            <div className="grid gap-4">
              {bookings.map((booking: any) => {
                // Format the date properly
                const bookingDate = new Date(booking.requestedDate);
                const formattedDate = bookingDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                });
                
                return (
                  <Card key={booking.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{booking.guestName}</CardTitle>
                          <CardDescription>{booking.guestEmail}</CardDescription>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">
                          {booking.status || "Pending"}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Host</p>
                          <p className="font-medium">{booking.hostName || "Unknown"}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Guest Phone</p>
                          <p className="font-medium">{booking.guestPhone || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Date</p>
                          <p className="font-medium">{formattedDate}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Meal Type</p>
                          <p className="font-medium capitalize">{booking.mealType}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Number of Guests</p>
                          <p className="font-medium">{booking.numberOfGuests}</p>
                        </div>
                      </div>

                      {booking.specialRequests && (
                        <div>
                          <p className="text-gray-600 text-sm mb-1">Special Requests</p>
                          <p className="text-sm">{booking.specialRequests}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

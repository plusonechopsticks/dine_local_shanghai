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
      // Invalidate to trigger immediate refetch
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

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage host applications and guest bookings</p>
      </div>

      <Tabs defaultValue="applications" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Location</p>
                      <p className="text-sm">{host.district}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Cuisine</p>
                      <p className="text-sm">{host.cuisineStyle}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Price per Person</p>
                      <p className="text-sm">¥{host.pricePerPerson}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Max Guests</p>
                      <p className="text-sm">{host.maxGuests}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-2">Menu Description</p>
                    <p className="text-sm text-gray-700">{host.menuDescription}</p>
                  </div>

                  {host.photos && host.photos.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-2">Food Photos</p>
                      <div className="grid grid-cols-3 gap-2">
                        {host.photos.map((photo: any, idx: number) => (
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

                  <div className="flex gap-2 pt-4">
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
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Host Application</DialogTitle>
                          <DialogDescription>Update host details</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="hostName">Name</Label>
                            <Input
                              id="hostName"
                              value={editFormData.hostName || ""}
                              onChange={(e) =>
                                setEditFormData({ ...editFormData, hostName: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              value={editFormData.email || ""}
                              onChange={(e) =>
                                setEditFormData({ ...editFormData, email: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="district">Location</Label>
                            <Input
                              id="district"
                              value={editFormData.district || ""}
                              onChange={(e) =>
                                setEditFormData({ ...editFormData, district: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="cuisineStyle">Cuisine</Label>
                            <Input
                              id="cuisineStyle"
                              value={editFormData.cuisineStyle || ""}
                              onChange={(e) =>
                                setEditFormData({ ...editFormData, cuisineStyle: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="pricePerPerson">Price per Person</Label>
                            <Input
                              id="pricePerPerson"
                              type="number"
                              value={editFormData.pricePerPerson || ""}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  pricePerPerson: parseInt(e.target.value),
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="maxGuests">Max Guests</Label>
                            <Input
                              id="maxGuests"
                              type="number"
                              value={editFormData.maxGuests || ""}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  maxGuests: parseInt(e.target.value),
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="menuDescription">Menu Description</Label>
                            <Textarea
                              id="menuDescription"
                              value={editFormData.menuDescription || ""}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  menuDescription: e.target.value,
                                })
                              }
                              rows={4}
                            />
                          </div>
                          <div className="flex gap-2 pt-4">
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
                      <p className="text-sm">
                        {new Date(booking.requestedDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
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

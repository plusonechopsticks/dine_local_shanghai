import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronDown, Check, X, MessageSquare, Edit } from "lucide-react";
import { AdminHostEditForm } from "@/components/AdminHostEditForm";

export default function AdminDashboard() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [editingListing, setEditingListing] = useState<any | null>(null);

  const { data: listings = [], isLoading } = trpc.host.listAll.useQuery();
  const { data: bookings = [] } = trpc.booking.listAll.useQuery();

  const approveMutation = trpc.host.updateStatus.useMutation({
    onSuccess: () => {
      trpc.useUtils().host.listAll.invalidate();
    },
  });

  const rejectMutation = trpc.host.updateStatus.useMutation({
    onSuccess: () => {
      trpc.useUtils().host.listAll.invalidate();
    },
  });

  const handleApprove = (listing: any) => {
    console.log('Approving listing:', listing.id, typeof listing.id);
    approveMutation.mutate({
      id: typeof listing.id === 'string' ? parseInt(listing.id) : listing.id,
      status: "approved",
    });
  };

  const handleReject = (listing: any) => {
    console.log('Rejecting listing:', listing.id, typeof listing.id);
    rejectMutation.mutate({
      id: typeof listing.id === 'string' ? parseInt(listing.id) : listing.id,
      status: "rejected",
    });
  };

  const filteredListings = listings.filter((listing: any) => {
    if (filter === "all") return true;
    return listing.status === filter;
  });

  const pendingCount = listings.filter((l: any) => l.status === "pending").length;
  const approvedCount = listings.filter((l: any) => l.status === "approved").length;
  const rejectedCount = listings.filter((l: any) => l.status === "rejected").length;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-gray-600 mb-6">Manage host applications and messages</p>

      <Tabs defaultValue="listings" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="listings">Host Applications</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>

        {/* Host Applications Tab */}
        <TabsContent value="listings" className="space-y-6">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              onClick={() => setFilter("pending")}
            >
              Pending {pendingCount}
            </Button>
            <Button
              variant={filter === "approved" ? "default" : "outline"}
              onClick={() => setFilter("approved")}
            >
              Approved {approvedCount}
            </Button>
            <Button
              variant={filter === "rejected" ? "default" : "outline"}
              onClick={() => setFilter("rejected")}
            >
              Rejected {rejectedCount}
            </Button>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <p className="text-center py-8 text-gray-600">Loading listings...</p>
            ) : filteredListings.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-600">
                  No applications found
                </CardContent>
              </Card>
            ) : (
              filteredListings.map((listing: any) => (
                <Card key={listing.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          {listing.profilePhotoUrl && (
                            <img
                              src={listing.profilePhotoUrl}
                              alt={listing.hostName}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <h3 className="font-semibold text-lg">{listing.hostName}</h3>
                            <p className="text-sm text-gray-600">{listing.email}</p>
                            <p className="text-sm text-gray-600">{listing.district}</p>
                          </div>
                        </div>

                        {/* Title */}
                        {listing.title && (
                          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm font-medium text-blue-900">{listing.title}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Cuisine</p>
                            <p className="font-semibold text-base text-gray-900">{listing.cuisineStyle}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Price</p>
                            <p className="font-medium">¥{listing.pricePerPerson}/person</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Max Guests</p>
                            <p className="font-medium">{listing.maxGuests}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Status</p>
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                listing.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : listing.status === "rejected"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {listing.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          setExpandedId(expandedId === listing.id ? null : listing.id)
                        }
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                      >
                        <ChevronDown
                          className={`w-5 h-5 transition-transform ${
                            expandedId === listing.id ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {/* Expanded View */}
                    {expandedId === listing.id && (
                      <div className="mt-6 pt-6 border-t space-y-6">
                        {/* Host Bio */}
                        {listing.bio && (
                          <div>
                            <h4 className="font-semibold mb-2">About the Host</h4>
                            <p className="text-sm text-gray-700">{listing.bio}</p>
                          </div>
                        )}

                        {/* Availability */}
                        {listing.availability && Object.keys(listing.availability).length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Availability</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {Object.entries(listing.availability).map(([day, meals]: [string, any]) => (
                                <div key={day} className="text-gray-700">
                                  <span className="capitalize font-medium">{day}:</span> {Array.isArray(meals) ? meals.join(", ") : meals}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Menu Description */}
                        <div>
                          <h4 className="font-semibold mb-2">Menu Description</h4>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{listing.menuDescription}</p>
                        </div>

                        {/* Dietary Notes */}
                        {listing.dietaryNote && (
                          <div>
                            <h4 className="font-semibold mb-2">Dietary Accommodations</h4>
                            <p className="text-sm text-gray-700">{listing.dietaryNote}</p>
                          </div>
                        )}

                        {/* Activities */}
                        {listing.activities && listing.activities.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Activities</h4>
                            <p className="text-sm text-gray-700">{listing.activities.join(", ")}</p>
                          </div>
                        )}

                        {/* Other Notes */}
                        {listing.otherNotes && (
                          <div>
                            <h4 className="font-semibold mb-2">Other Notes</h4>
                            <p className="text-sm text-gray-700">{listing.otherNotes}</p>
                          </div>
                        )}

                        {/* Food Photos */}
                        {listing.foodPhotoUrls && listing.foodPhotoUrls.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Food Photos</h4>
                            <div className="grid grid-cols-3 gap-2">
                              {listing.foodPhotoUrls.map((url: string, idx: number) => (
                                <img key={idx} src={url} alt={`Food ${idx + 1}`} className="w-full h-24 object-cover rounded" />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-4 border-t flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingListing(listing)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          {listing.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleApprove(listing)}
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(listing)}
                              >
                                <X className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                            </>
                          )}
                          {listing.status === "rejected" && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprove(listing)}
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                          )}
                          {listing.status === "approved" && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(listing)}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Host Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-600">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Messages feature coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>All Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  <p>No bookings found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Guest Name</th>
                        <th className="text-left py-2 px-4">Email</th>
                        <th className="text-left py-2 px-4">Host</th>
                        <th className="text-left py-2 px-4">Date</th>
                        <th className="text-left py-2 px-4">Meal Type</th>
                        <th className="text-left py-2 px-4">Guests</th>
                        <th className="text-left py-2 px-4">Status</th>
                        <th className="text-left py-2 px-4">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking: any) => (
                        <tr key={booking.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-4">{booking.guestName}</td>
                          <td className="py-2 px-4">{booking.guestEmail}</td>
                          <td className="py-2 px-4">{booking.hostName || "N/A"}</td>
                          <td className="py-2 px-4">{new Date(booking.requestedDate).toLocaleDateString()}</td>
                          <td className="py-2 px-4 capitalize">{booking.mealType}</td>
                          <td className="py-2 px-4">{booking.numberOfGuests}</td>
                          <td className="py-2 px-4">
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                booking.status === "confirmed"
                                  ? "bg-green-100 text-green-800"
                                  : booking.status === "rejected"
                                    ? "bg-red-100 text-red-800"
                                    : booking.status === "cancelled"
                                      ? "bg-gray-100 text-gray-800"
                                      : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {booking.status}
                            </span>
                          </td>
                          <td className="py-2 px-4">{new Date(booking.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Modal */}
      <Dialog open={!!editingListing} onOpenChange={(open) => !open && setEditingListing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Host Listing</DialogTitle>
          </DialogHeader>
          {editingListing && (
            <AdminHostEditForm
              listing={editingListing}
              onSave={() => {
                setEditingListing(null);
                trpc.useUtils().host.listAll.invalidate();
              }}
              onCancel={() => setEditingListing(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

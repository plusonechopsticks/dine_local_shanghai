import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { ChevronDown, Check, X, Eye, Edit, MessageSquare, Send } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AdminHostEditForm } from "@/components/AdminHostEditForm";

interface HostListing {
  id: number;
  hostName: string;
  email: string;
  district: string;
  cuisineStyle: string;
  title: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  profilePhotoUrl: string | null;
  bio: string | null;
  menuDescription: string | null;
  foodPhotoUrls: string[];
  maxGuests: number;
  pricePerPerson: number;
  activities: string[];
  availability: Record<string, string[]>;
  otherNotes: string | null;
  dietaryNote: string | null;
}

interface Booking {
  id: number;
  hostListingId: number;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  requestedDate: Date | string;
  mealType: "lunch" | "dinner";
  numberOfGuests: number;
  specialRequests?: string;
  status: "pending" | "confirmed" | "cancelled" | "rejected";
  hostNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  hostName?: string;
}

export default function AdminDashboard() {
  const [selectedListing, setSelectedListing] = useState<HostListing | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"listings" | "messages" | "bookings">("listings");

  // Fetch all host listings
  const { data: listings = [], isLoading, refetch } = trpc.host.listAll.useQuery();

  // Fetch all bookings
  const { data: bookings = [], isLoading: bookingsLoading } = trpc.booking.listAll.useQuery();

  // Format date for display
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Format time for display
  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Update status mutation
  const updateStatusMutation = trpc.host.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated successfully");
      refetch();
      setShowDetailsModal(false);
      setAdminNotes("");
      setSelectedListing(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  // Send host approval email mutation
  const sendHostApprovalEmailMutation = trpc.host.sendHostApprovalEmail.useMutation({
    onSuccess: () => {
      toast.success("Approval email sent to host");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send email");
    },
  });

  const handleApprove = async (listing: HostListing) => {
    setSelectedListing(listing);
    setAdminNotes("");
    setShowDetailsModal(true);
  };

  const handleReject = async (listing: HostListing) => {
    setSelectedListing(listing);
    setAdminNotes("");
    setShowDetailsModal(true);
  };

  const handleEdit = async (listing: HostListing) => {
    setSelectedListing(listing);
    setAdminNotes("");
    setShowDetailsModal(true);
  };

  const confirmAction = async (status: "pending" | "approved" | "rejected") => {
    if (!selectedListing) return;

    updateStatusMutation.mutate({
      id: selectedListing.id,
      status,
      notes: adminNotes,
    });
  };

  const filteredListings = filter === "all" 
    ? listings 
    : listings.filter((l: HostListing) => l.status === filter);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage host applications and messages</p>
        </div>

        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="listings">Host Applications</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>

          {/* Host Applications Tab */}
          <TabsContent value="listings" className="space-y-6">
            <div className="flex gap-4 mb-6">
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
                Pending {filteredListings.filter((l: HostListing) => l.status === "pending").length}
              </Button>
              <Button
                variant={filter === "approved" ? "default" : "outline"}
                onClick={() => setFilter("approved")}
              >
                Approved {filteredListings.filter((l: HostListing) => l.status === "approved").length}
              </Button>
              <Button
                variant={filter === "rejected" ? "default" : "outline"}
                onClick={() => setFilter("rejected")}
              >
                Rejected {filteredListings.filter((l: HostListing) => l.status === "rejected").length}
              </Button>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <Card>
                  <CardContent className="pt-6">Loading listings...</CardContent>
                </Card>
              ) : filteredListings.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">No applications found</CardContent>
                </Card>
              ) : (
                filteredListings.map((listing: HostListing) => (
                  <Card key={listing.id} className="border-0 shadow-lg">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            {listing.profilePhotoUrl && (
                              <img
                                src={listing.profilePhotoUrl}
                                alt={listing.hostName}
                                className="w-16 h-16 rounded-full object-cover"
                              />
                            )}
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{listing.hostName}</h3>
                              <p className="text-sm text-gray-600">{listing.email}</p>
                              <p className="text-sm text-gray-600">{listing.district}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-semibold">Cuisine:</span> {listing.cuisineStyle}
                            </div>
                            <div>
                              <span className="font-semibold">Price:</span> ¥{listing.pricePerPerson}/person
                            </div>
                            <div>
                              <span className="font-semibold">Max Guests:</span> {listing.maxGuests}
                            </div>
                            <div>
                              <span className="font-semibold">Status:</span>{" "}
                              <Badge
                                className={listing.status === "approved" ? "bg-green-100 text-green-800" : listing.status === "rejected" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}
                              >
                                {listing.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setExpandedId(expandedId === listing.id ? null : listing.id);
                            }}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(listing)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {expandedId === listing.id && (
                        <div className="mt-6 pt-6 border-t space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Menu Description</h4>
                            <p className="text-sm text-gray-700">{listing.menuDescription}</p>
                          </div>
                          {listing.dietaryNote && (
                            <div>
                              <h4 className="font-semibold mb-2">Dietary Notes</h4>
                              <p className="text-sm text-gray-700">{listing.dietaryNote}</p>
                            </div>
                          )}
                          {listing.otherNotes && (
                            <div>
                              <h4 className="font-semibold mb-2">Other Notes</h4>
                              <p className="text-sm text-gray-700">{listing.otherNotes}</p>
                            </div>
                          )}
                          <div className="flex gap-2 pt-4">
                            {listing.status !== "approved" && (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleApprove(listing)}
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Approve
                              </Button>
                            )}
                            {listing.status !== "rejected" && (
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
                {bookingsLoading ? (
                  <div className="text-center py-8 text-gray-600">Loading bookings...</div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-8 text-gray-600">No bookings found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-semibold">Guest Name</th>
                          <th className="text-left py-3 px-4 font-semibold">Email</th>
                          <th className="text-left py-3 px-4 font-semibold">Host</th>
                          <th className="text-left py-3 px-4 font-semibold">Date</th>
                          <th className="text-left py-3 px-4 font-semibold">Meal Type</th>
                          <th className="text-left py-3 px-4 font-semibold">Guests</th>
                          <th className="text-left py-3 px-4 font-semibold">Status</th>
                          <th className="text-left py-3 px-4 font-semibold">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(bookings as Booking[]).map((booking) => (
                          <tr key={booking.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">{booking.guestName}</td>
                            <td className="py-3 px-4 text-gray-600">{booking.guestEmail}</td>
                            <td className="py-3 px-4">{booking.hostName || "Unknown"}</td>
                            <td className="py-3 px-4">{formatDate(booking.requestedDate)}</td>
                            <td className="py-3 px-4 capitalize">{booking.mealType}</td>
                            <td className="py-3 px-4">{booking.numberOfGuests}</td>
                            <td className="py-3 px-4">
                              <Badge className={getStatusBadgeColor(booking.status)}>
                                {booking.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-gray-600">{formatDate(booking.createdAt)}</td>
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
      </div>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedListing?.status === "pending"
                ? "Review Application"
                : selectedListing?.status === "approved"
                ? "Edit Approved Host"
                : "Edit Rejected Host"}
            </DialogTitle>
          </DialogHeader>

          {selectedListing && (
            <div className="space-y-4">
              {selectedListing.status === "pending" ? (
                <>
                  <div>
                    <Label>Admin Notes (Optional)</Label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes about this application..."
                      className="mt-2"
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => confirmAction("rejected")}
                      disabled={updateStatusMutation.isPending}
                    >
                      Reject
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => confirmAction("approved")}
                      disabled={updateStatusMutation.isPending}
                    >
                      Approve
                    </Button>
                  </DialogFooter>
                </>
              ) : (
                <>
                  <AdminHostEditForm
                    listing={selectedListing}
                    onClose={() => {
                      setShowDetailsModal(false);
                      refetch();
                    }}
                  />
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Host Profile</DialogTitle>
          </DialogHeader>
          {selectedListing && (
            <AdminHostEditForm
              listing={selectedListing}
              onClose={() => {
                setShowEditModal(false);
                refetch();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

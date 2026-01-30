"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { ChevronDown, Check, X, Eye, Edit } from "lucide-react";
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

export default function AdminDashboard() {
  const [selectedListing, setSelectedListing] = useState<HostListing | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch all host listings
  const { data: listings = [], isLoading, refetch } = trpc.host.listAll.useQuery();

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
      adminNotes: adminNotes || undefined,
    });

    // Send approval email if approving
    if (status === "approved") {
      sendHostApprovalEmailMutation.mutate({
        hostName: selectedListing.hostName,
        hostEmail: selectedListing.email,
        district: selectedListing.district,
        cuisineStyle: selectedListing.cuisineStyle,
      });
    }
  };

  const filteredListings = (listings as HostListing[]).filter((listing: HostListing) => {
    if (filter === "all") return true;
    return listing.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <p className="text-gray-600">Loading applications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Host Applications</h1>
          <p className="text-gray-600">Review and approve new host registrations</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {["all", "pending", "approved", "rejected"].map((status) => (
            <Button
              key={status}
              onClick={() => setFilter(status as any)}
              variant={filter === status ? "default" : "outline"}
              className="capitalize"
            >
              {status}
              {status !== "all" && (
                <span className="ml-2 px-2 py-1 bg-gray-200 rounded text-sm">
                  {listings.filter((l: HostListing) => l.status === status).length}
                </span>
              )}
            </Button>
          ))}
        </div>

        {/* Listings Table */}
        <div className="space-y-3">
          {filteredListings.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-8 pb-8 text-center">
                <p className="text-gray-600">No applications found</p>
              </CardContent>
            </Card>
          ) : (
            (filteredListings as HostListing[]).map((listing: HostListing) => (
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
                          <h3 className="text-xl font-bold text-gray-900">{listing.hostName}</h3>
                          <p className="text-sm text-gray-600">{listing.email}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">{listing.district}</Badge>
                            <Badge className={getStatusColor(listing.status)}>
                              {listing.status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Cuisine Style</p>
                          <p className="font-semibold text-gray-900">{listing.cuisineStyle}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Max Guests</p>
                          <p className="font-semibold text-gray-900">{listing.maxGuests}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Price Per Person</p>
                          <p className="font-semibold text-gray-900">¥{listing.pricePerPerson}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Applied</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(listing.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Expandable Details */}
                      <button
                        onClick={() =>
                          setExpandedId(expandedId === listing.id ? null : listing.id)
                        }
                        className="flex items-center gap-2 text-primary hover:underline mb-4"
                      >
                        <span className="text-sm font-semibold">View Full Details</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            expandedId === listing.id ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {expandedId === listing.id && (
                        <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-4">
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-1">Bio</p>
                            <p className="text-sm text-gray-600">{listing.bio}</p>
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-1">Menu Description</p>
                            <p className="text-sm text-gray-600">{listing.menuDescription}</p>
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-2">Availability</p>
                            <div className="flex flex-wrap gap-2">
                              {listing.availability &&
                                Object.entries(listing.availability).map(([day, meals]: [string, any]) => (
                                  <Badge key={day} variant="secondary">
                                    {day}: {meals.join(", ")}
                                  </Badge>
                                ))}
                            </div>
                          </div>

                          {listing.foodPhotoUrls && listing.foodPhotoUrls.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-gray-700 mb-2">Food Photos</p>
                              <div className="flex gap-2 flex-wrap">
                                {listing.foodPhotoUrls.map((url, idx) => (
                                  <img
                                    key={idx}
                                    src={url}
                                    alt={`Food ${idx + 1}`}
                                    className="w-20 h-20 rounded object-cover"
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 ml-4">
                      {listing.status === "pending" && (
                        <>
                          <Button
                            onClick={() => handleApprove(listing)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            size="sm"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleReject(listing)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            variant="destructive"
                            size="sm"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedListing(listing);
                              setShowEditModal(true);
                            }}
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit Profile
                          </Button>
                        </>
                      )}
                      {listing.status !== "pending" && (
                        <>
                          <Button variant="outline" size="sm" disabled>
                            {listing.status === "approved" ? "✓ Approved" : "✗ Rejected"}
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedListing(listing);
                              setShowEditModal(true);
                            }}
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit Profile
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Action Dialog */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedListing?.status === "pending"
                ? "Review Application"
                : `Edit Status - ${selectedListing?.hostName}`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Host Name</p>
              <p className="text-gray-900">{selectedListing?.hostName}</p>
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">
                Admin Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Add notes for this application..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDetailsModal(false)}
              disabled={updateStatusMutation.isPending}
            >
              Cancel
            </Button>
            {selectedListing?.status === "pending" && (
              <>
                <Button
                  onClick={() => confirmAction("rejected")}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={updateStatusMutation.isPending}
                >
                  Reject
                </Button>
                <Button
                  onClick={() => confirmAction("approved")}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={updateStatusMutation.isPending}
                >
                  Approve
                </Button>
              </>
            )}
            {selectedListing?.status === "approved" && (
              <>
                <Button
                  onClick={() => confirmAction("rejected")}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={updateStatusMutation.isPending}
                >
                  Change to Rejected
                </Button>
                <Button
                  onClick={() => confirmAction("pending")}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  disabled={updateStatusMutation.isPending}
                >
                  Change to Pending
                </Button>
              </>
            )}
            {selectedListing?.status === "rejected" && (
              <>
                <Button
                  onClick={() => confirmAction("approved")}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={updateStatusMutation.isPending}
                >
                  Change to Approved
                </Button>
                <Button
                  onClick={() => confirmAction("pending")}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  disabled={updateStatusMutation.isPending}
                >
                  Change to Pending
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Host Profile Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Host Profile - {selectedListing?.hostName}</DialogTitle>
          </DialogHeader>
          {selectedListing && (
            <AdminHostEditForm
              listing={selectedListing as any}
              onSave={() => {
                setShowEditModal(false);
                refetch();
              }}
              onCancel={() => setShowEditModal(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

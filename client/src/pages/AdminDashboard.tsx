import { trpc } from "@/lib/trpc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp, Check, X, Clock, Trash2, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getProxiedImageUrl } from "@/lib/imageUtils";

export default function AdminDashboard() {
  const { data: listings = [], isLoading: listingsLoading } = trpc.host.listAll.useQuery();
  const { data: bookings = [], isLoading: bookingsLoading } = trpc.booking.listAll.useQuery();
  const utils = trpc.useUtils();

  const [expandedHostId, setExpandedHostId] = useState<number | null>(null);
  const [editingHostId, setEditingHostId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const updateHostMutation = trpc.host.updateListing.useMutation({
    onSuccess: () => {
      utils.host.listAll.invalidate();
      setEditingHostId(null);
      alert('Host updated successfully!');
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const updateStatusMutation = trpc.host.updateStatus.useMutation({
    onSuccess: () => {
      utils.host.listAll.invalidate();
      alert('Status updated successfully!');
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      hostName: formData.get('hostName') as string,
      email: formData.get('email') as string,
      wechatOrPhone: formData.get('wechatOrPhone') as string || undefined,
      languages: (formData.get('languages') as string)?.split(',').map(l => l.trim()).filter(Boolean) || [],
      bio: formData.get('bio') as string || undefined,
      title: formData.get('title') as string || undefined,
      district: formData.get('district') as string || undefined,
      fullAddress: formData.get('fullAddress') as string || undefined,
      cuisineStyle: formData.get('cuisineStyle') as string || undefined,
      menuDescription: formData.get('menuDescription') as string || undefined,
      dietaryNote: formData.get('dietaryNote') as string || undefined,
      pricePerPerson: parseInt(formData.get('pricePerPerson') as string) || undefined,
      maxGuests: parseInt(formData.get('maxGuests') as string) || undefined,
      mealDurationMinutes: parseInt(formData.get('mealDurationMinutes') as string) || undefined,
      kidsFriendly: formData.get('kidsFriendly') === 'on',
      hasPets: formData.get('hasPets') === 'on',
      petDetails: formData.get('petDetails') as string || undefined,
      householdFeatures: (formData.get('householdFeatures') as string)?.split(',').map(h => h.trim()).filter(Boolean) || [],
      otherHouseholdInfo: formData.get('otherHouseholdInfo') as string || undefined,
      activities: (formData.get('activities') as string)?.split(',').map(a => a.trim()).filter(Boolean) || [],
      otherNotes: formData.get('otherNotes') as string || undefined,
      profilePhotoUrl: formData.get('profilePhotoUrl') as string || undefined,
      foodPhotoUrls: (formData.get('foodPhotoUrls') as string)?.split(',').map(u => u.trim()).filter(Boolean) || [],
    };

    if (editingHostId) {
      updateHostMutation.mutate({ id: editingHostId, ...data });
    }
  };

  const handleStatusChange = (hostId: number, newStatus: 'pending' | 'approved' | 'rejected') => {
    if (confirm(`Are you sure you want to ${newStatus} this host application?`)) {
      updateStatusMutation.mutate({ id: hostId, status: newStatus });
    }
  };

  const filteredListings = statusFilter === 'all' 
    ? listings 
    : listings.filter(h => h.status === statusFilter);

  const editingHost = listings.find(h => h.id === editingHostId);

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: "secondary" as const, icon: Clock, label: "Pending" },
      approved: { variant: "default" as const, icon: Check, label: "Approved" },
      rejected: { variant: "destructive" as const, icon: X, label: "Rejected" },
    };
    const config = variants[status as keyof typeof variants] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage host applications and guest bookings</p>
      </div>

      <Tabs defaultValue="applications">
        <TabsList>
          <TabsTrigger value="applications">Host Applications</TabsTrigger>
          <TabsTrigger value="bookings">Guest Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-4">
          {/* Status Filter */}
          <div className="flex gap-2 mb-4">
            <Button 
              variant={statusFilter === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              All ({listings.length})
            </Button>
            <Button 
              variant={statusFilter === 'pending' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setStatusFilter('pending')}
            >
              <Clock className="h-4 w-4 mr-1" />
              Pending ({listings.filter(h => h.status === 'pending').length})
            </Button>
            <Button 
              variant={statusFilter === 'approved' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setStatusFilter('approved')}
            >
              <Check className="h-4 w-4 mr-1" />
              Approved ({listings.filter(h => h.status === 'approved').length})
            </Button>
            <Button 
              variant={statusFilter === 'rejected' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setStatusFilter('rejected')}
            >
              <X className="h-4 w-4 mr-1" />
              Rejected ({listings.filter(h => h.status === 'rejected').length})
            </Button>
          </div>

          {listingsLoading ? (
            <p>Loading...</p>
          ) : editingHostId && editingHost ? (
            // Edit Form (same as before, but with photo management)
            <Card>
              <CardHeader>
                <CardTitle>Edit Host: {editingHost.hostName}</CardTitle>
                <CardDescription>Update host information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Host Profile */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Host Profile</h3>
                    
                    <div>
                      <Label htmlFor="hostName">Name *</Label>
                      <Input id="hostName" name="hostName" defaultValue={editingHost.hostName} required />
                    </div>

                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" name="email" type="email" defaultValue={editingHost.email} required />
                    </div>

                    <div>
                      <Label htmlFor="wechatOrPhone">WeChat/Phone</Label>
                      <Input id="wechatOrPhone" name="wechatOrPhone" defaultValue={editingHost.wechatOrPhone || ''} />
                    </div>

                    <div>
                      <Label htmlFor="languages">Languages (comma-separated)</Label>
                      <Input id="languages" name="languages" defaultValue={editingHost.languages?.join(', ') || ''} />
                    </div>

                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea id="bio" name="bio" rows={4} defaultValue={editingHost.bio || ''} />
                    </div>

                    <div>
                      <Label htmlFor="profilePhotoUrl">Profile Photo URL</Label>
                      <Input id="profilePhotoUrl" name="profilePhotoUrl" defaultValue={editingHost.profilePhotoUrl || ''} />
                      {editingHost.profilePhotoUrl && (
                        <img src={getProxiedImageUrl(editingHost.profilePhotoUrl)} alt="Profile" className="mt-2 h-32 w-32 object-cover rounded" />
                      )}
                    </div>
                  </div>

                  {/* Dining Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Dining Details</h3>
                    
                    <div>
                      <Label htmlFor="title">Experience Title</Label>
                      <Input id="title" name="title" defaultValue={editingHost.title || ''} />
                    </div>

                    <div>
                      <Label htmlFor="district">District</Label>
                      <Input id="district" name="district" defaultValue={editingHost.district} />
                    </div>

                    <div>
                      <Label htmlFor="fullAddress">Full Address</Label>
                      <Input id="fullAddress" name="fullAddress" defaultValue={editingHost.fullAddress || ''} />
                    </div>

                    <div>
                      <Label htmlFor="cuisineStyle">Cuisine Style</Label>
                      <Input id="cuisineStyle" name="cuisineStyle" defaultValue={editingHost.cuisineStyle} />
                    </div>

                    <div>
                      <Label htmlFor="menuDescription">Menu Description</Label>
                      <Textarea id="menuDescription" name="menuDescription" rows={4} defaultValue={editingHost.menuDescription} />
                    </div>

                    <div>
                      <Label htmlFor="dietaryNote">Dietary Notes</Label>
                      <Textarea id="dietaryNote" name="dietaryNote" rows={2} defaultValue={editingHost.dietaryNote || ''} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="pricePerPerson">Price per Person (¥)</Label>
                        <Input id="pricePerPerson" name="pricePerPerson" type="number" defaultValue={editingHost.pricePerPerson} />
                      </div>

                      <div>
                        <Label htmlFor="maxGuests">Max Guests</Label>
                        <Input id="maxGuests" name="maxGuests" type="number" defaultValue={editingHost.maxGuests} />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="mealDurationMinutes">Meal Duration (minutes)</Label>
                      <Input id="mealDurationMinutes" name="mealDurationMinutes" type="number" defaultValue={editingHost.mealDurationMinutes || 120} />
                    </div>

                    <div>
                      <Label htmlFor="foodPhotoUrls">Food Photo URLs (comma-separated)</Label>
                      <Textarea id="foodPhotoUrls" name="foodPhotoUrls" rows={2} defaultValue={editingHost.foodPhotoUrls?.join(', ') || ''} />
                      {editingHost.foodPhotoUrls && editingHost.foodPhotoUrls.length > 0 && (
                        <div className="mt-2 grid grid-cols-3 gap-2">
                          {editingHost.foodPhotoUrls.map((url, idx) => (
                            <img key={idx} src={getProxiedImageUrl(url)} alt={`Food ${idx + 1}`} className="h-24 w-full object-cover rounded" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Household Info */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Household Info</h3>
                    
                    <div className="flex items-center gap-2">
                      <Checkbox id="kidsFriendly" name="kidsFriendly" defaultChecked={editingHost.kidsFriendly} />
                      <Label htmlFor="kidsFriendly">Kids Friendly</Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox id="hasPets" name="hasPets" defaultChecked={editingHost.hasPets} />
                      <Label htmlFor="hasPets">Has Pets</Label>
                    </div>

                    <div>
                      <Label htmlFor="petDetails">Pet Details</Label>
                      <Input id="petDetails" name="petDetails" defaultValue={editingHost.petDetails || ''} />
                    </div>

                    <div>
                      <Label htmlFor="householdFeatures">Household Features (comma-separated)</Label>
                      <Input id="householdFeatures" name="householdFeatures" defaultValue={editingHost.householdFeatures?.join(', ') || ''} />
                    </div>

                    <div>
                      <Label htmlFor="otherHouseholdInfo">Other Household Info</Label>
                      <Textarea id="otherHouseholdInfo" name="otherHouseholdInfo" rows={2} defaultValue={editingHost.otherHouseholdInfo || ''} />
                    </div>
                  </div>

                  {/* Activities */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Activities</h3>
                    
                    <div>
                      <Label htmlFor="activities">Activities (comma-separated)</Label>
                      <Input id="activities" name="activities" defaultValue={editingHost.activities?.join(', ') || ''} />
                    </div>

                    <div>
                      <Label htmlFor="otherNotes">Other Notes</Label>
                      <Textarea id="otherNotes" name="otherNotes" rows={2} defaultValue={editingHost.otherNotes || ''} />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={updateHostMutation.isPending}>
                      {updateHostMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setEditingHostId(null)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            // Host List with Expandable Cards
            <div className="space-y-4">
              {filteredListings.map((host) => (
                <Card key={host.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {host.hostName}
                            {getStatusBadge(host.status)}
                          </CardTitle>
                          <CardDescription>{host.email}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Status Controls */}
                        {host.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="default"
                              onClick={() => handleStatusChange(host.id, 'approved')}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleStatusChange(host.id, 'rejected')}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {host.status === 'approved' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleStatusChange(host.id, 'rejected')}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        )}
                        {host.status === 'rejected' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleStatusChange(host.id, 'approved')}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setEditingHostId(host.id)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setExpandedHostId(expandedHostId === host.id ? null : host.id)}
                        >
                          {expandedHostId === host.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {expandedHostId === host.id && (
                    <CardContent className="space-y-6">
                      {/* Host Profile */}
                      <div>
                        <h4 className="font-semibold mb-2">Host Profile</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><span className="font-medium">WeChat/Phone:</span> {host.wechatOrPhone || 'N/A'}</div>
                          <div><span className="font-medium">Languages:</span> {host.languages?.join(', ') || 'N/A'}</div>
                          <div className="col-span-2"><span className="font-medium">Bio:</span> {host.bio || 'N/A'}</div>
                          {host.profilePhotoUrl && (
                            <div className="col-span-2">
                              <span className="font-medium">Profile Photo:</span>
                              <img src={getProxiedImageUrl(host.profilePhotoUrl)} alt="Profile" className="mt-2 h-32 w-32 object-cover rounded" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Dining Details */}
                      <div>
                        <h4 className="font-semibold mb-2">Dining Details</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><span className="font-medium">Title:</span> {host.title || 'N/A'}</div>
                          <div><span className="font-medium">District:</span> {host.district}</div>
                          <div><span className="font-medium">Full Address:</span> {host.fullAddress || 'N/A'}</div>
                          <div><span className="font-medium">Cuisine:</span> {host.cuisineStyle}</div>
                          <div><span className="font-medium">Price:</span> ¥{host.pricePerPerson}</div>
                          <div><span className="font-medium">Max Guests:</span> {host.maxGuests}</div>
                          <div><span className="font-medium">Duration:</span> {host.mealDurationMinutes || 120} min</div>
                          <div className="col-span-2"><span className="font-medium">Menu:</span> {host.menuDescription}</div>
                          <div className="col-span-2"><span className="font-medium">Dietary Notes:</span> {host.dietaryNote || 'N/A'}</div>
                          {host.foodPhotoUrls && host.foodPhotoUrls.length > 0 && (
                            <div className="col-span-2">
                              <span className="font-medium">Food Photos:</span>
                              <div className="mt-2 grid grid-cols-3 gap-2">
                                {host.foodPhotoUrls.map((url, idx) => (
                                  <img key={idx} src={getProxiedImageUrl(url)} alt={`Food ${idx + 1}`} className="h-24 w-full object-cover rounded" />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Household Info */}
                      <div>
                        <h4 className="font-semibold mb-2">Household Info</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><span className="font-medium">Kids Friendly:</span> {host.kidsFriendly ? 'Yes' : 'No'}</div>
                          <div><span className="font-medium">Has Pets:</span> {host.hasPets ? 'Yes' : 'No'}</div>
                          {host.petDetails && <div className="col-span-2"><span className="font-medium">Pet Details:</span> {host.petDetails}</div>}
                          <div className="col-span-2"><span className="font-medium">Features:</span> {host.householdFeatures?.join(', ') || 'N/A'}</div>
                          {host.otherHouseholdInfo && <div className="col-span-2"><span className="font-medium">Other Info:</span> {host.otherHouseholdInfo}</div>}
                        </div>
                      </div>

                      {/* Activities */}
                      <div>
                        <h4 className="font-semibold mb-2">Activities & Notes</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="col-span-2"><span className="font-medium">Activities:</span> {host.activities?.join(', ') || 'N/A'}</div>
                          {host.otherNotes && <div className="col-span-2"><span className="font-medium">Other Notes:</span> {host.otherNotes}</div>}
                        </div>
                      </div>

                      {/* Timestamps */}
                      <div className="text-xs text-muted-foreground">
                        <div>Created: {new Date(host.createdAt).toLocaleString()}</div>
                        <div>Updated: {new Date(host.updatedAt).toLocaleString()}</div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          {bookingsLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <CardTitle>Booking #{booking.id}</CardTitle>
                    <CardDescription>
                      {booking.guestName} • {booking.guestEmail}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="font-medium">Host:</span> {booking.hostName || 'Unknown'}</div>
                      <div><span className="font-medium">Date:</span> {booking.requestedDate ? new Date(booking.requestedDate).toLocaleDateString() : 'Not specified'}</div>
                      <div><span className="font-medium">Meal:</span> {booking.mealType}</div>
                      <div><span className="font-medium">Guests:</span> {booking.numberOfGuests}</div>
                      <div><span className="font-medium">Status:</span> {booking.status}</div>
                      <div className="col-span-2"><span className="font-medium">Special Requests:</span> {booking.specialRequests || 'None'}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

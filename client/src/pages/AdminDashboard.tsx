import { trpc } from "@/lib/trpc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function AdminDashboard() {
  const { data: listings = [], isLoading: listingsLoading } = trpc.host.listAll.useQuery();
  const { data: bookings = [], isLoading: bookingsLoading } = trpc.booking.listAll.useQuery();
  const utils = trpc.useUtils();

  const [editingHostId, setEditingHostId] = useState<number | null>(null);

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
    };

    if (editingHostId) {
      updateHostMutation.mutate({ id: editingHostId, ...data });
    }
  };

  const editingHost = listings.find(h => h.id === editingHostId);

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
          {listingsLoading ? (
            <p>Loading...</p>
          ) : editingHostId && editingHost ? (
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
                      <Input id="district" name="district" defaultValue={editingHost.district || ''} />
                    </div>

                    <div>
                      <Label htmlFor="fullAddress">Full Address</Label>
                      <Input id="fullAddress" name="fullAddress" defaultValue={editingHost.fullAddress || ''} />
                    </div>

                    <div>
                      <Label htmlFor="cuisineStyle">Cuisine Style</Label>
                      <Input id="cuisineStyle" name="cuisineStyle" defaultValue={editingHost.cuisineStyle || ''} />
                    </div>

                    <div>
                      <Label htmlFor="menuDescription">Menu Description</Label>
                      <Textarea id="menuDescription" name="menuDescription" rows={6} defaultValue={editingHost.menuDescription || ''} />
                    </div>

                    <div>
                      <Label htmlFor="dietaryNote">Dietary Notes</Label>
                      <Textarea id="dietaryNote" name="dietaryNote" rows={2} defaultValue={editingHost.dietaryNote || ''} />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="pricePerPerson">Price per Person (¥)</Label>
                        <Input id="pricePerPerson" name="pricePerPerson" type="number" defaultValue={editingHost.pricePerPerson || ''} />
                      </div>

                      <div>
                        <Label htmlFor="maxGuests">Max Guests</Label>
                        <Input id="maxGuests" name="maxGuests" type="number" defaultValue={editingHost.maxGuests || ''} />
                      </div>

                      <div>
                        <Label htmlFor="mealDurationMinutes">Meal Duration (minutes)</Label>
                        <Input id="mealDurationMinutes" name="mealDurationMinutes" type="number" defaultValue={editingHost.mealDurationMinutes || ''} />
                      </div>
                    </div>
                  </div>

                  {/* Household Info */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Household Info</h3>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox id="kidsFriendly" name="kidsFriendly" defaultChecked={editingHost.kidsFriendly} />
                      <Label htmlFor="kidsFriendly">Kids Friendly</Label>
                    </div>

                    <div className="flex items-center space-x-2">
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

                  {/* Form Actions */}
                  <div className="flex gap-4 pt-4 border-t">
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
            listings.map((host) => (
              <Card key={host.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{host.hostName}</CardTitle>
                      <CardDescription>{host.email}</CardDescription>
                    </div>
                    <Button onClick={() => setEditingHostId(host.id)} size="sm">
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>District:</strong> {host.district || '-'}
                    </div>
                    <div>
                      <strong>Cuisine:</strong> {host.cuisineStyle || '-'}
                    </div>
                    <div>
                      <strong>Price:</strong> ¥{host.pricePerPerson || '-'}
                    </div>
                    <div>
                      <strong>Max Guests:</strong> {host.maxGuests || '-'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          {bookingsLoading ? (
            <p>Loading...</p>
          ) : bookings.length === 0 ? (
            <p>No bookings yet</p>
          ) : (
            bookings.map((booking: any) => (
              <Card key={booking.id}>
                <CardHeader>
                  <CardTitle>Booking #{booking.id}</CardTitle>
                  <CardDescription>
                    Guest: {booking.guestName} | Date: {new Date(booking.bookingDate).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

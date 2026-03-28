import { trpc } from "@/lib/trpc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp, Check, X, Clock, Trash2, Upload, CalendarX, Copy, ExternalLink, PlusCircle, Pencil, Trash } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { getProxiedImageUrl } from "@/lib/imageUtils";
import { AnnouncementEditor } from "@/components/AnnouncementEditor";
import { LiveChatAdmin } from "@/components/LiveChatAdmin";
import { AdminAnalyticsTab } from "@/components/AdminAnalyticsTab";

// Influencer Pages Tab
function InfluencerPagesTab() {
  const utils = trpc.useUtils();
  const { data: pages = [], isLoading } = trpc.influencer.list.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ slug: "", name: "", personalMessage: "" });

  const createMutation = trpc.influencer.create.useMutation({
    onSuccess: () => { utils.influencer.list.invalidate(); setShowForm(false); setForm({ slug: "", name: "", personalMessage: "" }); toast.success("Page created!"); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.influencer.update.useMutation({
    onSuccess: () => { utils.influencer.list.invalidate(); setEditingId(null); toast.success("Page updated!"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.influencer.delete.useMutation({
    onSuccess: () => { utils.influencer.list.invalidate(); toast.success("Page deleted."); },
    onError: (e) => toast.error(e.message),
  });

  const baseUrl = window.location.origin;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Influencer Pages</CardTitle>
            <CardDescription>Personalized /for/[slug] landing pages for influencer outreach</CardDescription>
          </div>
          <Button size="sm" onClick={() => { setShowForm(!showForm); setEditingId(null); }}>
            <PlusCircle className="w-4 h-4 mr-2" /> New Page
          </Button>
        </CardHeader>
        {showForm && (
          <CardContent className="border-t pt-4 space-y-4">
            <h3 className="font-semibold text-sm">Create New Influencer Page</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Slug (URL key)</Label>
                <Input placeholder="e.g. mark-wiens" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))} />
                <p className="text-xs text-muted-foreground">{baseUrl}/for/{form.slug || "slug"}</p>
              </div>
              <div className="space-y-1">
                <Label>First Name</Label>
                <Input placeholder="e.g. Mark" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Personal Message (2-3 sentences from Steven)</Label>
              <Textarea rows={4} placeholder="I came across your video on [X] and thought you'd love what we're building..." value={form.personalMessage} onChange={e => setForm(f => ({ ...f, personalMessage: e.target.value }))} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending || !form.slug || !form.name || !form.personalMessage}>
                {createMutation.isPending ? "Creating..." : "Create Page"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        )}
      </Card>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : pages.length === 0 ? (
        <p className="text-sm text-muted-foreground">No influencer pages yet. Create one above.</p>
      ) : (
        <div className="space-y-3">
          {pages.map(page => (
            <Card key={page.id}>
              <CardContent className="pt-4">
                {editingId === page.id ? (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label>First Name</Label>
                      <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div className="space-y-1">
                      <Label>Personal Message</Label>
                      <Textarea rows={4} value={form.personalMessage} onChange={e => setForm(f => ({ ...f, personalMessage: e.target.value }))} />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => updateMutation.mutate({ id: page.id, name: form.name, personalMessage: form.personalMessage })} disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{page.name}</span>
                        <Badge variant="outline" className="text-xs font-mono">/for/{page.slug}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{page.personalMessage}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>👁 {page.viewCount} view{page.viewCount !== 1 ? "s" : ""}</span>
                        {page.lastViewedAt && <span>Last viewed: {new Date(page.lastViewedAt).toLocaleDateString()}</span>}
                        <span>Created: {new Date(page.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(`${baseUrl}/for/${page.slug}`); toast.success("Link copied!"); }}>
                        <Copy className="w-3 h-3 mr-1" /> Copy Link
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => window.open(`${baseUrl}/for/${page.slug}`, "_blank")}>
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setEditingId(page.id); setForm({ slug: page.slug, name: page.name, personalMessage: page.personalMessage }); }}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => { if (confirm(`Delete page for ${page.name}?`)) deleteMutation.mutate({ id: page.id }); }}>
                        <Trash className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Inline admin notes editor component
function AdminNotesEditor({ hostId, initialNotes }: { hostId: number; initialNotes: string }) {
  const [notes, setNotes] = useState(initialNotes);
  const [saved, setSaved] = useState(false);
  const saveNotes = trpc.host.updateAdminNotes.useMutation({
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
    onError: (err) => toast.error(`Failed to save notes: ${err.message}`),
  });
  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-sm">Admin Notes (internal only)</h4>
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add internal notes about this application..."
        rows={3}
        className="text-sm"
      />
      <Button
        size="sm"
        variant="outline"
        onClick={() => saveNotes.mutate({ id: hostId, adminNotes: notes })}
        disabled={saveNotes.isPending}
      >
        {saved ? '✓ Saved' : saveNotes.isPending ? 'Saving...' : 'Save Notes'}
      </Button>
    </div>
  );
}

// MySQL tinyint(1) can be returned as string "0" or "1", number 0/1, or boolean.
// This helper normalizes all forms to a proper boolean.
function isHidden(val: unknown): boolean {
  if (val === null || val === undefined) return false;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val !== 0;
  if (typeof val === 'string') return val !== '0' && val !== '';
  return Boolean(val);
}

export default function AdminDashboard() {
  const { data: listings = [], isLoading: listingsLoading } = trpc.host.listAll.useQuery();
  const { data: bookings = [], isLoading: bookingsLoading } = trpc.booking.listAll.useQuery();
  const { data: interestSubmissions = [], isLoading: interestLoading } = trpc.interest.list.useQuery();
  const { data: hostInterestSubmissions = [], isLoading: hostInterestLoading } = trpc.hostInterest.list.useQuery();
  const { data: successfulPayments = [], isLoading: paymentsLoading } = trpc.booking.listAll.useQuery();
  const utils = trpc.useUtils();

  const [expandedHostId, setExpandedHostId] = useState<number | null>(null);
  const [editingHostId, setEditingHostId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [showHiddenBookings, setShowHiddenBookings] = useState(false);
  const [showHiddenInterest, setShowHiddenInterest] = useState(false);
  const [showHiddenHostInterest, setShowHiddenHostInterest] = useState(false);

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

  const toggleBookingHidden = trpc.booking.toggleHidden.useMutation({
    onSuccess: () => {
      utils.booking.listAll.invalidate();
    },
  });

  const toggleInterestHidden = trpc.interest.toggleHidden.useMutation({
    onSuccess: () => {
      utils.interest.list.invalidate();
    },
  });

  const toggleHostInterestHidden = trpc.hostInterest.toggleHidden.useMutation({
    onSuccess: () => {
      utils.hostInterest.list.invalidate();
    },
  });

  // const updateDisplayOrderMutation = trpc.host.updateDisplayOrder.useMutation({
  //   onSuccess: () => {
  //     utils.host.listAll.invalidate();
  //     utils.host.listApproved.invalidate();
  //   },
  //   onError: (error: any) => {
  //     alert(`Error updating display order: ${error.message}`);
  //   },
  // });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Parse and validate availability JSON
    let availability: Record<string, ('lunch' | 'dinner' | 'breakfast')[]> | undefined = undefined;
    const availStr = formData.get('availability') as string;
    
    if (availStr && availStr.trim()) {
      try {
        availability = JSON.parse(availStr);
        // Validate structure
        if (typeof availability !== 'object' || availability === null) {
          alert('Availability must be a JSON object');
          return;
        }
      } catch (error) {
        alert('Invalid JSON format in availability field. Please check your syntax.');
        return;
      }
    }
    
    const data = {
      hostName: formData.get('hostName') as string,
      email: formData.get('email') as string,
      wechatOrPhone: formData.get('wechatOrPhone') as string || undefined,
      languages: (formData.get('languages') as string)?.split(',').map(l => l.trim()).filter(Boolean) || [],
      bio: formData.get('bio') as string || undefined,
      overseasExperience: formData.get('overseasExperience') as string || undefined,
      funFacts: formData.get('funFacts') as string || undefined,
      whyHost: formData.get('whyHost') as string || undefined,
      culturalPassions: formData.get('culturalPassions') as string || undefined,
      otherPassions: formData.get('otherPassions') as string || undefined,
      title: formData.get('title') as string || undefined,
      district: formData.get('district') as string || undefined,
      fullAddress: formData.get('fullAddress') as string || undefined,
      cuisineStyle: formData.get('cuisineStyle') as string || undefined,
      menuDescription: formData.get('menuDescription') as string || undefined,
      dietaryNote: formData.get('dietaryNote') as string || undefined,
      pricePerPerson: parseInt(formData.get('pricePerPerson') as string) || undefined,
      discountPercentage: parseInt(formData.get('discountPercentage') as string) || 0,
      displayOrder: parseInt(formData.get('displayOrder') as string) || 0,
      maxGuests: parseInt(formData.get('maxGuests') as string) || undefined,
      availability,
      availabilityComments: formData.get('availabilityComments') as string || undefined,
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
      console.log('Updating host with data:', data);
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

  // Date blocker state
  const [newBlockDate, setNewBlockDate] = useState('');
  const [newBlockReason, setNewBlockReason] = useState('');
  const { data: availabilityBlocks = [], refetch: refetchBlocks } = trpc.host.getAvailabilityBlocks.useQuery(
    { hostId: editingHostId || 0 },
    { enabled: !!editingHostId }
  );
  const addBlockMutation = trpc.host.addAvailabilityBlock.useMutation({
    onSuccess: () => {
      refetchBlocks();
      setNewBlockDate('');
      setNewBlockReason('');
      toast.success('Date blocked successfully');
    },
    onError: (err) => toast.error(`Failed to block date: ${err.message}`),
  });
  const removeBlockMutation = trpc.host.removeAvailabilityBlock.useMutation({
    onSuccess: () => {
      refetchBlocks();
      toast.success('Date unblocked');
    },
    onError: (err) => toast.error(`Failed to remove block: ${err.message}`),
  });

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
          <TabsTrigger value="hostinterest">Host Interest</TabsTrigger>
          <TabsTrigger value="interest">Traveler Interest</TabsTrigger>
          <TabsTrigger value="payments">Payment Successful</TabsTrigger>
          <TabsTrigger value="announcement">Announcement</TabsTrigger>
          <TabsTrigger value="livechat">Live Chat</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="influencer">Influencer Pages</TabsTrigger>
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
                <form key={editingHostId} onSubmit={handleSubmit} className="space-y-6">
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
                      <Label htmlFor="overseasExperience">Overseas Experience</Label>
                      <Textarea id="overseasExperience" name="overseasExperience" rows={2} defaultValue={editingHost.overseasExperience || ''} placeholder="Where have they lived/traveled abroad?" />
                    </div>

                    <div>
                      <Label htmlFor="funFacts">Fun Facts About Me</Label>
                      <Textarea id="funFacts" name="funFacts" rows={2} defaultValue={editingHost.funFacts || ''} placeholder="Interesting personal details" />
                    </div>

                    <div>
                      <Label htmlFor="whyHost">Why I Want to Host</Label>
                      <Textarea id="whyHost" name="whyHost" rows={3} defaultValue={editingHost.whyHost || ''} placeholder="Their motivation for hosting" />
                    </div>

                    <div>
                      <Label htmlFor="culturalPassions">My Cultural Passions</Label>
                      <Textarea id="culturalPassions" name="culturalPassions" rows={2} defaultValue={editingHost.culturalPassions || ''} placeholder="Cultural interests beyond food" />
                    </div>

                    <div>
                      <Label htmlFor="otherPassions">Besides Food, What I'm Passionate About</Label>
                      <Textarea id="otherPassions" name="otherPassions" rows={2} defaultValue={editingHost.otherPassions || ''} placeholder="Non-food interests and hobbies" />
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
                      <Label htmlFor="availability">Availability (JSON format)</Label>
                      <Textarea 
                        id="availability" 
                        name="availability" 
                        rows={6} 
                        defaultValue={editingHost.availability ? JSON.stringify(editingHost.availability, null, 2) : ''} 
                        placeholder='{"Monday": ["lunch", "dinner"], "Tuesday": ["dinner"]}'
                        className="font-mono text-sm"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Format: Day of week → meal times array. Valid meals: breakfast, lunch, dinner
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="availabilityComments">Availability Comments</Label>
                      <Textarea 
                        id="availabilityComments" 
                        name="availabilityComments" 
                        rows={3} 
                        defaultValue={editingHost.availabilityComments || ''} 
                        placeholder="e.g., Unavailable Feb 10-20 (CNY), March 15-20 (business trip)"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Natural language description of unavailable dates
                      </p>
                    </div>

                    {/* Date Blocker UI */}
                    <div className="border rounded-lg p-4 bg-muted/30">
                      <div className="flex items-center gap-2 mb-3">
                        <CalendarX className="h-4 w-4 text-destructive" />
                        <Label className="text-base font-semibold">Block Specific Dates</Label>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Blocked dates will appear greyed-out on the booking calendar and cannot be booked.
                      </p>

                      {/* Existing blocks */}
                      {availabilityBlocks.filter(b => b.blockType === 'date').length > 0 && (
                        <div className="mb-3 space-y-1">
                          {availabilityBlocks.filter(b => b.blockType === 'date').map(block => (
                            <div key={block.id} className="flex items-center justify-between bg-background rounded px-3 py-2 text-sm">
                              <span className="font-medium">{block.blockDate}</span>
                              {block.reason && <span className="text-muted-foreground mx-2 flex-1">{block.reason}</span>}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                onClick={() => removeBlockMutation.mutate({ blockId: block.id })}
                                disabled={removeBlockMutation.isPending}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add new block */}
                      <div className="flex gap-2">
                        <Input
                          type="date"
                          value={newBlockDate}
                          onChange={e => setNewBlockDate(e.target.value)}
                          className="w-40"
                          placeholder="YYYY-MM-DD"
                        />
                        <Input
                          type="text"
                          value={newBlockReason}
                          onChange={e => setNewBlockReason(e.target.value)}
                          placeholder="Reason (optional)"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          disabled={!newBlockDate || addBlockMutation.isPending}
                          onClick={() => {
                            if (!editingHostId || !newBlockDate) return;
                            addBlockMutation.mutate({
                              hostListingId: editingHostId,
                              blockType: 'date',
                              blockDate: newBlockDate,
                              mealType: 'both',
                              reason: newBlockReason || undefined,
                            });
                          }}
                        >
                          Block Date
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="discountPercentage">Discount Percentage (0-100)</Label>
                      <Input 
                        id="discountPercentage" 
                        name="discountPercentage" 
                        type="number" 
                        min="0" 
                        max="100" 
                        defaultValue={editingHost.discountPercentage || 0} 
                        placeholder="Enter discount % (e.g., 25 for 25% off)"
                      />
                      {editingHost.discountPercentage > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Discounted price: ¥{Math.round(editingHost.pricePerPerson * (1 - editingHost.discountPercentage / 100))}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="displayOrder">Display Order (lower number = higher priority)</Label>
                      <Input 
                        id="displayOrder" 
                        name="displayOrder" 
                        type="number" 
                        min="0" 
                        defaultValue={editingHost.displayOrder || 0} 
                        placeholder="0 = default order"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Set to 1, 2, 3, etc. to control order on Find Hosts page. Lower numbers appear first.
                      </p>
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
                          <CardDescription className="flex items-center gap-3">
                            <span>{host.email}</span>
                            <span className="text-xs text-muted-foreground/70">Applied {new Date(host.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </CardDescription>
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

                      {/* Admin Notes */}
                      <AdminNotesEditor hostId={host.id} initialNotes={host.adminNotes || ''} />

                      {/* Timestamps */}
                      <div className="text-xs text-muted-foreground">
                        <div>Applied: {new Date(host.createdAt).toLocaleString()}</div>
                        <div>Last Updated: {new Date(host.updatedAt).toLocaleString()}</div>
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
              <div className="flex items-center gap-2 mb-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showHiddenBookings}
                    onChange={(e) => setShowHiddenBookings(e.target.checked)}
                    className="rounded"
                  />
                  Show hidden bookings
                </label>
              </div>
              {bookings.filter(b => showHiddenBookings || !isHidden(b.hidden)).map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <CardTitle>Booking #{booking.id}</CardTitle>
                    <CardDescription>
                      {booking.guestName} • {booking.guestEmail}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div><span className="font-medium">Host:</span> {booking.hostName || 'Unknown'}</div>
                      <div><span className="font-medium">Date:</span> {booking.requestedDate ? new Date(booking.requestedDate).toLocaleDateString() : 'Not specified'}</div>
                      <div><span className="font-medium">Meal:</span> {booking.mealType}</div>
                      <div><span className="font-medium">Guests:</span> {booking.numberOfGuests}</div>
                      <div><span className="font-medium">Status:</span> {booking.bookingStatus}</div>
                      <div className="col-span-2"><span className="font-medium">Special Requests:</span> {booking.specialRequests || 'None'}</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleBookingHidden.mutate({ id: booking.id, hidden: !isHidden(booking.hidden) })}
                      disabled={toggleBookingHidden.isPending}
                    >
                      {isHidden(booking.hidden) ? 'Unhide' : 'Hide'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="interest" className="space-y-4">
          {interestLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showHiddenInterest}
                    onChange={(e) => setShowHiddenInterest(e.target.checked)}
                    className="rounded"
                  />
                  Show hidden submissions
                </label>
              </div>
              {interestSubmissions.filter((s: any) => showHiddenInterest || !isHidden(s.hidden)).length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">No traveler interest submissions yet</p>
                  </CardContent>
                </Card>
              ) : (
                interestSubmissions.filter((s: any) => showHiddenInterest || !isHidden(s.hidden)).map((submission: any) => (
                  <Card key={submission.id}>
                    <CardHeader>
                      <CardTitle>{submission.name}</CardTitle>
                      <CardDescription>{submission.email}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {submission.phone && (
                          <div><span className="font-medium">Phone:</span> {submission.phone}</div>
                        )}
                        {submission.wechat && (
                          <div><span className="font-medium">WeChat:</span> {submission.wechat}</div>
                        )}
                        {submission.message && (
                          <div><span className="font-medium">Message:</span> {submission.message}</div>
                        )}
                        <div><span className="font-medium">Submitted:</span> {new Date(submission.createdAt).toLocaleString()}</div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleInterestHidden.mutate({ id: submission.id, hidden: !isHidden(submission.hidden) })}
                        disabled={toggleInterestHidden.isPending}
                        className="mt-4"
                      >
                        {isHidden(submission.hidden) ? 'Unhide' : 'Hide'}
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="hostinterest" className="space-y-4">
          <h2 className="text-xl font-semibold">Host Interest ({hostInterestSubmissions.filter((s: any) => showHiddenHostInterest || !isHidden(s.hidden)).length})</h2>
          <p className="text-sm text-muted-foreground">People who started the host registration form — captured when they click "Next" on the first screen.</p>
          {hostInterestLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showHiddenHostInterest}
                    onChange={(e) => setShowHiddenHostInterest(e.target.checked)}
                    className="rounded"
                  />
                  Show hidden submissions
                </label>
              </div>
              {hostInterestSubmissions.filter((s: any) => showHiddenHostInterest || !isHidden(s.hidden)).length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">No host interest submissions yet</p>
                  </CardContent>
                </Card>
              ) : (
                hostInterestSubmissions.filter((s: any) => showHiddenHostInterest || !isHidden(s.hidden)).map((submission: any) => (
                  <Card key={submission.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{submission.name}</span>
                        <span className="text-xs font-normal text-muted-foreground">{new Date(submission.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </CardTitle>
                      <CardDescription>{submission.email}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">District:</span> {submission.district}</div>
                        {submission.contact && submission.contact !== submission.email && (
                          <div><span className="font-medium">WeChat/Other:</span> {submission.contact}</div>
                        )}
                        <div><span className="font-medium">Submitted:</span> {new Date(submission.createdAt).toLocaleString()}</div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleHostInterestHidden.mutate({ id: submission.id, hidden: !isHidden(submission.hidden) })}
                        disabled={toggleHostInterestHidden.isPending}
                        className="mt-4"
                      >
                        {isHidden(submission.hidden) ? 'Unhide' : 'Hide'}
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>
        <TabsContent value="payments" className="space-y-4">
          {paymentsLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-4">
              {successfulPayments.filter((b: any) => b.paymentStatus === 'paid').length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">No successful payments yet</p>
                  </CardContent>
                </Card>
              ) : (
                successfulPayments
                  .filter((booking: any) => booking.paymentStatus === 'paid')
                  .map((booking: any) => (
                    <Card key={booking.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Booking #{booking.id}</span>
                          <Badge variant="default" className="bg-green-600">Paid</Badge>
                        </CardTitle>
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
                          <div><span className="font-medium">Amount:</span> ¥{booking.totalAmount || 'N/A'}</div>
                          <div><span className="font-medium">Payment Date:</span> {booking.paymentDate ? new Date(booking.paymentDate).toLocaleString() : 'N/A'}</div>
                          {booking.specialRequests && (
                            <div className="col-span-2"><span className="font-medium">Special Requests:</span> {booking.specialRequests}</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="announcement" className="space-y-4">
          <AnnouncementEditor />
        </TabsContent>

        <TabsContent value="livechat" className="space-y-4">
          <LiveChatAdmin />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AdminAnalyticsTab />
        </TabsContent>

        <TabsContent value="influencer" className="space-y-4">
          <InfluencerPagesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

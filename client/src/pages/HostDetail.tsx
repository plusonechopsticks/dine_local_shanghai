import { useParams, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChopsticksLogo } from "@/components/ChopsticksLogo";
import { trpc } from "@/lib/trpc";
import {
  MapPin,
  Clock,
  Users,
  ChefHat,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useParams } from "wouter";
import { useLocation } from "wouter";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const ACTIVITY_LABELS: Record<string, string> = {
  "cooking-class": "Cooking Class",
  "park-visit": "Park Visit",
  "shopping": "Shopping",
  "museum": "Museum Tour",
  "temple": "Temple Visit",
  "market": "Local Market Tour",
  "traditional-craft": "Traditional Craft",
};

export default function HostDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingData, setBookingData] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    requestedDate: "",
    mealType: "dinner",
    numberOfGuests: "1",
    specialRequests: "",
  });

  const hostId = params?.id ? parseInt(params.id) : null;
  const { data: host, isLoading, isError } = trpc.host.get.useQuery(
    { id: hostId || 0 },
    { enabled: !!hostId }
  );

  // Booking mutation
  const createBookingMutation = trpc.booking.create.useMutation({
    onSuccess: () => {
      toast.success("Booking request submitted! The host will respond soon.");
      setIsBookingOpen(false);
      setBookingData({
        guestName: "",
        guestEmail: "",
        guestPhone: "",
        requestedDate: "",
        mealType: "dinner",
        numberOfGuests: "1",
        specialRequests: "",
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit booking request");
    },
  });

  const handleSubmitBooking = () => {
    if (!bookingData.guestName || !bookingData.guestEmail || !bookingData.requestedDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    createBookingMutation.mutate({
      hostListingId: hostId || 0,
      guestName: bookingData.guestName,
      guestEmail: bookingData.guestEmail,
      guestPhone: bookingData.guestPhone,
      requestedDate: bookingData.requestedDate,
      mealType: bookingData.mealType as "lunch" | "dinner",
      numberOfGuests: parseInt(bookingData.numberOfGuests),
      specialRequests: bookingData.specialRequests,
    });
  };

  if (!hostId) return <div className="text-center py-12">Invalid host ID</div>;
  if (isLoading) return <div className="text-center py-12">Loading...</div>;
  if (isError || !host) return <div className="text-center py-12">Host not found</div>;

  const foodPhotos = host.foodPhotoUrls as string[];
  const activities = (host.activities as string[]) || [];
  const availability = host.availability as Record<string, string[]>;

  const images = [
    host.profilePhotoUrl,
    ...(foodPhotos || []),
  ].filter((img): img is string => !!img);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) nextImage();
    if (distance < -50) prevImage();
    setTouchStart(0);
    setTouchEnd(0);
  };

  const daysOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const availableDays = daysOrder.filter(day => availability[day]?.length > 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16">
          <button
            onClick={() => setLocation("/hosts")}
            className="flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <a href="/" className="flex items-center gap-2">
            <ChopsticksLogo className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg" style={{ fontFamily: "var(--font-serif)" }}>
              +1 Chopsticks
            </span>
          </a>
          <div className="w-20" />
        </div>
      </header>

      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Images & Core Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Carousel */}
            <div className="space-y-4">
              <div
                className="relative aspect-square rounded-2xl overflow-hidden bg-secondary"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {images.length > 0 ? (
                  <>
                    <img
                      src={images[currentImageIndex]}
                      alt={host.hostName}
                      className="w-full h-full object-cover"
                    />

                    {/* Overlay Badge */}
                    <Badge className="absolute top-4 left-4 bg-background/90 text-foreground border-0 shadow-md text-sm">
                      {host.cuisineStyle}
                    </Badge>

                    {/* Like Button */}
                    <button className="absolute top-4 right-4 p-2 rounded-full bg-background/90 hover:bg-background transition-colors shadow-md">
                      <Heart className="h-6 w-6 stroke-2 text-foreground/80 hover:fill-primary hover:text-primary transition-colors" />
                    </button>

                    {/* Navigation Buttons */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/90 hover:bg-background transition-colors"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/90 hover:bg-background transition-colors"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </button>

                        {/* Dot Indicators */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                          {images.map((_, index) => (
                            <div
                              key={index}
                              className={`h-2 rounded-full transition-all ${
                                index === currentImageIndex
                                  ? "w-6 bg-background"
                                  : "w-2 bg-background/60"
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full bg-secondary">
                    <span className="text-6xl text-muted-foreground">
                      {host.hostName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? "border-primary"
                          : "border-border/50 hover:border-border"
                      }`}
                    >
                      <img src={img} alt={`${index}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bio Section */}
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-2">{host.hostName}</h2>
                <p className="flex items-center gap-2 text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4" />
                  {host.district}
                </p>
                <p className="text-base leading-relaxed text-foreground/90">
                  {host.bio}
                </p>
              </CardContent>
            </Card>

            {/* Menu Section */}
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <ChefHat className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-semibold">What You'll Eat</h3>
                </div>
                <p className="text-base leading-relaxed text-foreground/90 mb-4">
                  {host.menuDescription}
                </p>
                {host.dietaryNote && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <p className="text-sm font-medium text-foreground mb-1">
                      <CheckCircle className="inline h-4 w-4 mr-2 text-primary" />
                      Dietary Accommodations
                    </p>
                    <p className="text-sm text-foreground/80">{host.dietaryNote}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activities Section */}
            {activities.length > 0 && (
              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-4">Activities & Experiences</h3>
                  <div className="flex flex-wrap gap-2">
                    {activities.map((activity) => (
                      <Badge key={activity} variant="secondary" className="text-sm">
                        {ACTIVITY_LABELS[activity] || activity}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Notes */}
            {host.otherNotes && (
              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-4">Additional Information</h3>
                  <p className="text-base leading-relaxed text-foreground/90">
                    {host.otherNotes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-4">
            {/* Booking Card */}
            <Card className="border-primary/30 bg-primary/5 sticky top-24">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Price */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Price per person</p>
                    <p className="text-3xl font-bold text-primary">¥{host.pricePerPerson}</p>
                  </div>

                  {/* Key Details */}
                  <div className="space-y-3 py-4 border-y border-border/50">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground">Max Guests</p>
                        <p className="font-semibold">{host.maxGuests} people</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground">Meal Duration</p>
                        <p className="font-semibold">{host.mealDurationMinutes} minutes</p>
                      </div>
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-3">Available</p>
                    <div className="grid grid-cols-2 gap-2">
                      {daysOrder.map((day) => {
                        const dayMeals = availability[day];
                        if (!dayMeals) return null;
                        return (
                          <div key={day} className="text-sm">
                            <p className="font-medium capitalize">{day.slice(0, 3)}</p>
                            <p className="text-xs text-muted-foreground">
                              {dayMeals.join(", ")}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => setIsBookingOpen(true)}
                    className="w-full h-12 text-base font-semibold mt-4"
                    style={{ backgroundColor: "var(--warm-burgundy)" }}
                  >
                    Reserve Now
                  </Button>
                  <Button variant="outline" className="w-full h-12 text-base font-semibold">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Contact</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Email</p>
                    <a
                      href={`mailto:${host.email}`}
                      className="text-primary hover:underline break-all"
                    >
                      {host.email}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Info Banner */}
            <Card className="border-blue-200/50 bg-blue-50/50">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">Before You Book</p>
                    <p>Make sure to check the host's availability and dietary accommodations for your dates.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

      {/* Booking Dialog */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request a Dinner with {host?.hostName}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Your Name *</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={bookingData.guestName}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, guestName: e.target.value })
                  }
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={bookingData.guestEmail}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, guestEmail: e.target.value })
                  }
                  className="mt-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+86 138 1234 5678"
                  value={bookingData.guestPhone}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, guestPhone: e.target.value })
                  }
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="date">Preferred Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={bookingData.requestedDate}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, requestedDate: e.target.value })
                  }
                  className="mt-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="meal">Meal Type *</Label>
                <Select
                  value={bookingData.mealType}
                  onValueChange={(value) =>
                    setBookingData({ ...bookingData, mealType: value })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="guests">Number of Guests *</Label>
                <Select
                  value={bookingData.numberOfGuests}
                  onValueChange={(value) =>
                    setBookingData({ ...bookingData, numberOfGuests: value })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: (host?.maxGuests || 10) }).map((_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>
                        {i + 1} {i === 0 ? "Guest" : "Guests"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="requests">Special Requests (Allergies, Preferences, etc.)</Label>
              <Textarea
                id="requests"
                placeholder="Tell the host about any dietary restrictions, allergies, or preferences..."
                value={bookingData.specialRequests}
                onChange={(e) =>
                  setBookingData({ ...bookingData, specialRequests: e.target.value })
                }
                rows={4}
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsBookingOpen(false)}
              disabled={createBookingMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitBooking}
              disabled={createBookingMutation.isPending}
              style={{ backgroundColor: "var(--warm-burgundy)" }}
            >
              {createBookingMutation.isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

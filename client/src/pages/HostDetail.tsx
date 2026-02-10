import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChopsticksLogo } from "@/components/ChopsticksLogo";
import { trpc } from "@/lib/trpc";
import { getProxiedImageUrl } from "@/lib/imageUtils";
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
  Wine,
  Utensils,
  Calendar,
} from "lucide-react";
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
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useParams, useLocation } from "wouter";

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
  const [expandedBio, setExpandedBio] = useState(false);
  const [activeTab, setActiveTab] = useState<"experience" | "host">("experience");
  const [bookingData, setBookingData] = useState<{
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    requestedDate: string;
    mealType: "dinner" | "lunch";
    numberOfGuests: string;
    specialRequests: string;
  }>({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    requestedDate: "",
    mealType: "dinner",
    numberOfGuests: "1",
    specialRequests: "",
  });
  const [showPayment, setShowPayment] = useState(false);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [stripePromise, setStripePromise] = useState<any>(null);

  // Initialize Stripe
  useEffect(() => {
    const pk = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
    if (pk) {
      setStripePromise(loadStripe(pk));
    }
  }, []);

  const hostId = params?.id ? parseInt(params.id) : null;
  const { data: host, isLoading, isError } = trpc.host.get.useQuery(
    { id: hostId || 0 },
    { enabled: !!hostId }
  );

  // Track view count
  const incrementViewMutation = trpc.host.incrementView.useMutation();
  
  // Increment view count when page loads
  useEffect(() => {
    if (hostId && host) {
      incrementViewMutation.mutate({ id: hostId });
    }
  }, [hostId, host]);

  // Update meta tags for social sharing
  useEffect(() => {
    if (!host) return;

    const title = host.title || `${host.cuisineStyle} with ${host.hostName} in ${host.district}`;
    const description = host.menuDescription?.substring(0, 200) || `Experience authentic ${host.cuisineStyle} cuisine with ${host.hostName} in ${host.district}, Shanghai. Book a home dining experience for up to ${host.maxGuests} guests.`;
    const imageUrl = host.profilePhotoUrl || (host.foodPhotoUrls as string[])?.[0] 
      ? getProxiedImageUrl(host.profilePhotoUrl || (host.foodPhotoUrls as string[])?.[0] || '')
      : '';
    const url = window.location.href;
    const discountedPrice = host.discountPercentage && host.discountPercentage > 0 
      ? Math.round(host.pricePerPerson * (1 - host.discountPercentage / 100))
      : host.pricePerPerson;

    // Update document title
    document.title = title;

    // Update meta tags
    const updateMetaTag = (name: string, content: string) => {
      let tag = document.querySelector(`meta[property="${name}"]`) || document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(name.includes('og:') ? 'property' : 'name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    if (imageUrl) updateMetaTag('og:image', imageUrl);
    updateMetaTag('og:url', url);
    updateMetaTag('description', description);
  }, [host]);

  // Booking mutation
  const createBookingMutation = trpc.booking.create.useMutation({
    onSuccess: (data: any) => {
      toast.success("Booking confirmed! Proceed to payment.");
      setBookingId(data.id);
      setShowPayment(true);
      setIsBookingOpen(false);
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
  ].filter(Boolean).map(url => getProxiedImageUrl(url));

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
  
  // Sort availability items to always show lunch before dinner
  const sortedAvailability = Object.entries(availability).reduce((acc: any, [day, meals]) => {
    const sorted = [...(meals || [])].sort((a: any, b: any) => {
      if (a === "lunch" && b === "dinner") return -1;
      if (a === "dinner" && b === "lunch") return 1;
      return 0;
    });
    acc[day] = sorted;
    return acc;
  }, {} as any);

  // Truncate bio for preview
  const bioPreview = host.bio && host.bio.length > 200 
    ? host.bio.substring(0, 200) + "..." 
    : host.bio;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16">
          <button
            onClick={() => setLocation("/hosts")}
            className="flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="w-20" />
        </div>
      </div>

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

            {/* Title and Host Info */}
            <div className="space-y-4">
              {host.title && (
                <h1 className="text-3xl font-bold text-foreground">{host.title}</h1>
              )}
              <p className="text-lg text-muted-foreground">
                Hosted by <span className="text-primary font-semibold">{host.hostName}</span> in <span className="text-primary font-semibold">{host.district}</span>
              </p>
            </div>

            {/* Experience/Host Toggle */}
            <div className="flex gap-2 border-b">
              <button
                onClick={() => setActiveTab("experience")}
                className={`pb-4 px-2 font-medium transition-colors ${
                  activeTab === "experience"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                The Experience
              </button>
              <button
                onClick={() => setActiveTab("host")}
                className={`pb-4 px-2 font-medium transition-colors ${
                  activeTab === "host"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                The Host
              </button>
            </div>

            {/* Content Tabs */}
            {activeTab === "experience" && (
              <div className="space-y-6">
                {/* Menu */}
                {host.menuDescription && (
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Utensils className="h-5 w-5" />
                        Menu
                      </h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">{host.menuDescription}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Dietary Notes */}
                {host.dietaryNote && (
                  <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="pt-6">
                      <div className="flex gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-amber-900 mb-1">Dietary Information</h4>
                          <p className="text-sm text-amber-800">{host.dietaryNote}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Activities */}
                {activities.length > 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold text-lg mb-3">Activities</h3>
                      <div className="flex flex-wrap gap-2">
                        {activities.map((activity) => (
                          <Badge key={activity} variant="secondary">
                            {ACTIVITY_LABELS[activity] || activity}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Household Features */}
                {host.householdFeatures && host.householdFeatures.length > 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold text-lg mb-3">Household Features</h3>
                      <ul className="space-y-2">
                        {host.householdFeatures.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === "host" && (
              <div className="space-y-6">
                {/* Host Bio */}
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg mb-3">About {host.hostName}</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {expandedBio ? host.bio : bioPreview}
                    </p>
                    {host.bio && host.bio.length > 200 && (
                      <button
                        onClick={() => setExpandedBio(!expandedBio)}
                        className="mt-3 text-primary hover:underline text-sm font-medium"
                      >
                        {expandedBio ? "Show less" : "Show more"}
                      </button>
                    )}
                  </CardContent>
                </Card>

                {/* Languages */}
                {host.languages && host.languages.length > 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold text-lg mb-3">Languages</h3>
                      <div className="flex flex-wrap gap-2">
                        {host.languages.map((lang) => (
                          <Badge key={lang} variant="secondary">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Pets */}
                {host.hasPets && (
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold text-lg mb-3">Pets</h3>
                      <p className="text-muted-foreground">{host.petDetails || "Pets present in household"}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Right: Booking Card */}
          <div className="space-y-4">
            <Card className="sticky top-24">
              <CardContent className="pt-6 space-y-4">
                {/* Price Section */}
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    {host.discountPercentage && host.discountPercentage > 0 ? (
                      <>
                        <span className="text-sm text-muted-foreground line-through">
                          ¥{host.pricePerPerson}
                        </span>
                        <Badge variant="destructive" className="text-xs">
                          -{host.discountPercentage}%
                        </Badge>
                      </>
                    ) : null}
                  </div>
                  <div className="text-3xl font-bold text-primary">
                    ¥{host.discountPercentage && host.discountPercentage > 0
                      ? Math.round(host.pricePerPerson * (1 - host.discountPercentage / 100))
                      : host.pricePerPerson}
                    <span className="text-sm font-normal text-muted-foreground">/person</span>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 py-4 border-y">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Duration</p>
                    <p className="font-semibold flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {host.mealDurationMinutes || 120} min
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Max Guests</p>
                    <p className="font-semibold flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {host.maxGuests}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Meal Type</p>
                    <p className="font-semibold flex items-center gap-1">
                      <Wine className="h-4 w-4" />
                      Lunch & Dinner
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Location</p>
                    <p className="font-semibold flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {host.district}
                    </p>
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <p className="text-sm font-semibold mb-2 flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Availability
                  </p>
                  <div className="space-y-1 text-sm">
                    {availableDays.map((day) => (
                      <div key={day} className="flex justify-between text-muted-foreground">
                        <span className="capitalize">{day}</span>
                        <span className="text-foreground">
                          {sortedAvailability[day]?.join(", ")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="space-y-2 pt-4">
                  <Button
                    onClick={() => setIsBookingOpen(true)}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    Book Now
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const url = window.location.href;
                      navigator.clipboard.writeText(url).then(() => {
                        toast.success("Link copied to clipboard!");
                      });
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Booking Dialog */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request a Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="guestName">Your Name *</Label>
              <Input
                id="guestName"
                value={bookingData.guestName}
                onChange={(e) => setBookingData({ ...bookingData, guestName: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="guestEmail">Email *</Label>
              <Input
                id="guestEmail"
                type="email"
                value={bookingData.guestEmail}
                onChange={(e) => setBookingData({ ...bookingData, guestEmail: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="guestPhone">Phone (Optional)</Label>
              <Input
                id="guestPhone"
                type="tel"
                value={bookingData.guestPhone}
                onChange={(e) => setBookingData({ ...bookingData, guestPhone: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="requestedDate">Preferred Date *</Label>
              <Input
                id="requestedDate"
                type="date"
                value={bookingData.requestedDate}
                onChange={(e) => setBookingData({ ...bookingData, requestedDate: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="mealType">Meal Type</Label>
              <Select value={bookingData.mealType} onValueChange={(value: any) => setBookingData({ ...bookingData, mealType: value as "lunch" | "dinner" })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="numberOfGuests">Number of Guests</Label>
              <Input
                id="numberOfGuests"
                type="number"
                min="1"
                max={host.maxGuests}
                value={bookingData.numberOfGuests}
                onChange={(e) => setBookingData({ ...bookingData, numberOfGuests: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
              <Textarea
                id="specialRequests"
                placeholder="Any dietary restrictions or special requests?"
                value={bookingData.specialRequests}
                onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookingOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitBooking}
              disabled={createBookingMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {createBookingMutation.isPending ? "Submitting..." : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      {stripePromise && (
        <Elements stripe={stripePromise}>
          <PaymentModal
            isOpen={showPayment}
            onClose={() => setShowPayment(false)}
            bookingId={bookingId}
            hostListingId={hostId}
            guestEmail={bookingData.guestEmail}
            guestName={bookingData.guestName}
            hostName={host.hostName}
            mealDate={bookingData.requestedDate}
            amount={Math.round(
              (host.discountPercentage && host.discountPercentage > 0
                ? host.pricePerPerson * (1 - host.discountPercentage / 100)
                : host.pricePerPerson) * parseInt(bookingData.numberOfGuests) * 100
            )}
          />
        </Elements>
      )}
    </div>
  );
}

// Payment Modal Component
function PaymentModal({
  isOpen,
  onClose,
  bookingId,
  hostListingId,
  guestEmail,
  guestName,
  hostName,
  mealDate,
  amount,
}: {
  isOpen: boolean;
  onClose: () => void;
  bookingId: number | null;
  hostListingId: number | null;
  guestEmail: string;
  guestName: string;
  hostName: string;
  mealDate: string;
  amount: number;
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const createCheckoutSessionMutation = trpc.payment.createCheckoutSession.useMutation();

  const handlePayment = async () => {
    if (!bookingId || !hostListingId) return;

    setIsProcessing(true);

    try {
      // Create Stripe Checkout session
      const result = await createCheckoutSessionMutation.mutateAsync({
        bookingId,
        hostListingId,
        guestEmail,
        guestName,
        hostName,
        mealDate,
        amountInCents: amount,
      });

      if (result?.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = result.checkoutUrl;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to initiate payment");
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="bg-secondary p-4 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Amount to pay:</span>
              <span className="font-semibold">¥{(amount / 100).toFixed(2)}</span>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handlePayment}
              disabled={isProcessing}
              className="bg-primary hover:bg-primary/90"
            >
              {isProcessing ? "Redirecting..." : "Pay Now"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

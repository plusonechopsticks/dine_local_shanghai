import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChopsticksLogo } from "@/components/ChopsticksLogo";
import { trpc } from "@/lib/trpc";
import { getProxiedImageUrl, getOGImageUrl } from "@/lib/imageUtils";
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
  Globe,
  MessageCircle,
  Sparkles,
  BookOpen,
  Compass,
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
import DateGridCalendar from "@/components/DateGridCalendar";
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
  const [activeTab, setActiveTab] = useState<"experience" | "host">("host");
  const [bookingData, setBookingData] = useState({
    guestName: "",
    guestEmail: "",
    requestedDate: "",
    mealType: "dinner",
    numberOfGuests: "1",
    specialRequests: "",
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<number | null>(null);

  const hostId = params?.id ? parseInt(params.id) : null;
  const { data: host, isLoading, isError } = trpc.host.get.useQuery(
    { id: hostId || 0 },
    { enabled: !!hostId }
  );
  const [disabledDates, setDisabledDates] = useState<Set<string>>(new Set());
  const [disabledMealTypes, setDisabledMealTypes] = useState<Set<string>>(new Set());
  const [showCalendar, setShowCalendar] = useState(false);
  
  const updateDisabledDates = (hostData: any) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const disabled = new Set<string>();
    
    // Disable all dates before today (past dates)
    // Go back 365 days to cover any past dates that might be displayed
    const pastStart = new Date(today);
    pastStart.setFullYear(pastStart.getFullYear() - 1);
    
    for (let d = new Date(pastStart); d < today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      disabled.add(dateStr);
    }
    
    // Disable dates beyond 90 days in the future
    const futureEnd = new Date(today);
    futureEnd.setDate(futureEnd.getDate() + 90);
    
    for (let d = new Date(futureEnd); d.getFullYear() < 2100; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      disabled.add(dateStr);
    }
    
    // Disable unavailable days based on host availability
    if (hostData.availability) {
      const daysOrder = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      const availableDays = new Set(
        Object.entries(hostData.availability)
          .filter(([_, meals]: [string, any]) => meals && meals.length > 0)
          .map(([day]) => day.toLowerCase())
      );
      
      for (let d = new Date(today); d < futureEnd; d.setDate(d.getDate() + 1)) {
        const dayName = daysOrder[d.getDay()];
        if (!availableDays.has(dayName)) {
          const dateStr = d.toISOString().split('T')[0];
          disabled.add(dateStr);
        }
      }
    }
    
    setDisabledDates(disabled);
  };

  useEffect(() => {
    if (host) {
      updateDisabledDates(host);
    }
  }, [host]);

  const availability = host?.availability || {};
  const foodPhotos = (host?.foodPhotoUrls as string[]) || [];
  
  // Restore booking data from localStorage on page load
  useEffect(() => {
    if (!hostId) return;
    
    const cacheKey = `booking_cache_${hostId}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      try {
        const cachedData = JSON.parse(cached);
        setBookingData(cachedData);
        console.log('[Booking Cache] Restored booking data from localStorage');
      } catch (error) {
        console.error('[Booking Cache] Failed to parse cached data:', error);
        localStorage.removeItem(cacheKey);
      }
    }
  }, [hostId]);

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
    const imageUrl = getOGImageUrl(host.profilePhotoUrl || (host.foodPhotoUrls as string[])?.[0] || '');
    const url = window.location.href;
    const discountedPrice = host.discountPercentage && host.discountPercentage > 0 
      ? Math.round(host.pricePerPerson * (1 - host.discountPercentage / 100))
      : host.pricePerPerson;

    // Update document title
    document.title = `${title} - ¥${discountedPrice}/person | +1 Chopsticks`;

    // Helper function to update or create meta tag
    const updateMetaTag = (property: string, content: string, isProperty = true) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${property}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Open Graph tags
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', imageUrl);
    updateMetaTag('og:url', url);
    updateMetaTag('og:type', 'website');
    updateMetaTag('og:site_name', '+1 Chopsticks - Shanghai Home Dining');

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image', false);
    updateMetaTag('twitter:title', title, false);
    updateMetaTag('twitter:description', description, false);
    updateMetaTag('twitter:image', imageUrl, false);

    // Standard meta tags
    updateMetaTag('description', description, false);

    // Cleanup function to reset title on unmount
    return () => {
      document.title = 'Dine at Local Family Homes - Shanghai';
    };
  }, [host]);

  const createBookingMutation = trpc.booking.create.useMutation({
    onSuccess: (data) => {
      if (!host) return;
      
      // Save booking data to localStorage for recovery
      const cacheKey = `booking_cache_${host.id}`;
      localStorage.setItem(cacheKey, JSON.stringify(bookingData));
      console.log('[Booking Cache] Saved booking data to localStorage');
      
      // Calculate total amount
      const discountedPrice = host.discountPercentage && host.discountPercentage > 0 
        ? Math.round(host.pricePerPerson * (1 - host.discountPercentage / 100))
        : host.pricePerPerson;
      const totalAmount = discountedPrice * parseInt(bookingData.numberOfGuests);
      
      // Redirect to confirmation page with booking details
      const params = new URLSearchParams({
        bookingId: data.id.toString(),
        guestName: bookingData.guestName,
        guestEmail: bookingData.guestEmail,
        requestedDate: bookingData.requestedDate,
        mealType: bookingData.mealType,
        numberOfGuests: bookingData.numberOfGuests,
        totalAmount: totalAmount.toString(),
        hostName: host.hostName,
        pricePerPerson: discountedPrice.toString(),
      });
      
      setLocation(`/booking-confirmation?${params.toString()}`);
    },
    onError: (error) => {
      toast.error('Failed to create booking. Please try again.');
      console.error('Booking error:', error);
    },
  });

  // Calculate images early (before any conditional returns or useEffects)
  const images = host ? [
    host.profilePhotoUrl,
    ...(foodPhotos || []),
  ].filter(Boolean).map(url => getProxiedImageUrl(url)) : [];

  // Auto-advance slideshow every 5 seconds if no video
  useEffect(() => {
    if (!host?.introVideoUrl && images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [host?.introVideoUrl, images.length]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading host details...</p>
        </div>
      </div>
    );
  }

  if (isError || !host) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Host not found</h2>
          <p className="text-muted-foreground mb-6">The host you're looking for doesn't exist.</p>
          <Button onClick={() => setLocation("/hosts")} variant="default">
            Back to Hosts
          </Button>
        </div>
      </div>
    );
  }

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
  const sortedAvailability = Object.entries(availability).reduce((acc, [day, meals]) => {
    const sorted = [...(meals || [])].sort((a, b) => {
      if (a === "lunch" && b === "dinner") return -1;
      if (a === "dinner" && b === "lunch") return 1;
      return 0;
    });
    acc[day] = sorted;
    return acc;
  }, {} as Record<string, string[]>);

  // Truncate bio for preview
  const bioPreview = host.bio && host.bio.length > 200 
    ? host.bio.substring(0, 200) + "..." 
    : host.bio;

  return (
    <div className="min-h-screen bg-background">
      {/* HERO SECTION */}
      <section className="relative w-full bg-black" style={{ height: '100vh', height: '100svh' }}>
        {/* Back Button */}
        <div className="absolute top-6 left-6 z-20">
          <button
            onClick={() => setLocation("/hosts")}
            className="inline-flex items-center gap-2 text-white hover:text-gray-300 transition text-sm font-medium"
          >
            <ChevronLeft size={20} />
            ALL HOSTS
          </button>
        </div>

        {/* Video or Slideshow */}
        <div className="w-full h-full flex items-center justify-center">
          {host.introVideoUrl ? (
            <video
              src={host.introVideoUrl}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-contain"
            />
          ) : images.length > 0 ? (
            <>
              <img
                src={images[currentImageIndex]}
                alt={`${host.hostName} photo ${currentImageIndex + 1}`}
                className="w-full h-full object-contain"
              />
              {/* Slideshow Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-3 transition z-10"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft size={24} className="text-white" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-3 transition z-10"
                    aria-label="Next photo"
                  >
                    <ChevronRight size={24} className="text-white" />
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="text-white text-lg">No media available</div>
          )}
        </div>

        {/* Overlay gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white">
          <div className="max-w-7xl mx-auto">
            {/* Location */}
            <p className="text-sm font-semibold tracking-wide mb-2 text-gray-200">
              {host.district} · SHANGHAI
            </p>

            {/* Host Name */}
            <h1 className="text-5xl md:text-6xl font-light mb-3 leading-tight">
              {host.hostName}
            </h1>

            {/* Cuisine */}
            <p className="text-lg mb-4 text-gray-100">
              {host.cuisineStyle}
            </p>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 max-w-md">
              <div className="bg-white/10 backdrop-blur-sm px-3 py-2 rounded">
                <p className="text-xs font-semibold text-gray-300 mb-0.5">PRICE</p>
                <p className="text-lg font-semibold">¥{host.pricePerPerson}/person</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-3 py-2 rounded">
                <p className="text-xs font-semibold text-gray-300 mb-0.5">MAX GUESTS</p>
                <p className="text-lg font-semibold">{host.maxGuests}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REST OF PAGE CONTENT BELOW HERO */}
      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Core Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Menu Description */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">About This Experience</h3>
                <p className="text-muted-foreground leading-relaxed">{host.menuDescription}</p>
              </CardContent>
            </Card>

            {/* Tabs: Experience vs Host Info */}
            <div className="border-b">
              <div className="flex gap-8">
                <button
                  onClick={() => setActiveTab("experience")}
                  className={`pb-4 font-medium transition-colors ${
                    activeTab === "experience"
                      ? "border-b-2 border-primary text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Experience Details
                </button>
                <button
                  onClick={() => setActiveTab("host")}
                  className={`pb-4 font-medium transition-colors ${
                    activeTab === "host"
                      ? "border-b-2 border-primary text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  About the Host
                </button>
              </div>
            </div>

            {/* Experience Details Tab */}
            {activeTab === "experience" && (
              <div className="space-y-6">
                {/* Duration */}
                <div className="flex items-start gap-4">
                  <Clock className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Duration</h4>
                    <p className="text-muted-foreground">{host.mealDurationMinutes} minutes</p>
                  </div>
                </div>

                {/* Dietary Notes */}
                {host.dietaryNote && (
                  <div className="flex items-start gap-4">
                    <Utensils className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">Dietary Accommodations</h4>
                      <p className="text-muted-foreground">{host.dietaryNote}</p>
                    </div>
                  </div>
                )}

                {/* Activities */}
                {host.activities && host.activities.length > 0 && (
                  <div className="flex items-start gap-4">
                    <Compass className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-2">Activities</h4>
                      <div className="flex flex-wrap gap-2">
                        {host.activities.map((activity: string) => (
                          <Badge key={activity} variant="secondary">
                            {ACTIVITY_LABELS[activity] || activity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Other Notes */}
                {host.otherNotes && (
                  <div className="flex items-start gap-4">
                    <BookOpen className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">Additional Information</h4>
                      <p className="text-muted-foreground">{host.otherNotes}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Host Info Tab */}
            {activeTab === "host" && (
              <div className="space-y-6">
                {/* Host Bio */}
                <div>
                  <h4 className="font-semibold mb-3">About {host.hostName}</h4>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {expandedBio ? host.bio : bioPreview}
                  </p>
                  {host.bio && host.bio.length > 200 && (
                    <button
                      onClick={() => setExpandedBio(!expandedBio)}
                      className="text-primary hover:underline text-sm font-medium"
                    >
                      {expandedBio ? "Show less" : "Show more"}
                    </button>
                  )}
                </div>

                {/* Languages */}
                {host.languages && host.languages.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Languages
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {host.languages.map((lang: string) => (
                        <Badge key={lang} variant="outline">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Household Info */}
                <div className="space-y-2">
                  <h4 className="font-semibold">Household</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {host.kidsFriendly && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Kids friendly</span>
                      </div>
                    )}
                    {host.hasPets && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Has pets {host.petDetails ? `(${host.petDetails})` : ""}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Booking Widget */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-6">Reserve a Seat</h3>

                {bookingSuccess ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h4 className="font-semibold mb-2">Booking Confirmed!</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Booking ID: {createdBookingId}
                    </p>
                    <Button
                      onClick={() => {
                        setBookingSuccess(false);
                        setCreatedBookingId(null);
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      New Booking
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium">
                        Name *
                      </Label>
                      <Input
                        id="name"
                        value={bookingData.guestName}
                        onChange={(e) =>
                          setBookingData({ ...bookingData, guestName: e.target.value })
                        }
                        placeholder="Your name"
                        className="mt-1"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={bookingData.guestEmail}
                        onChange={(e) =>
                          setBookingData({ ...bookingData, guestEmail: e.target.value })
                        }
                        placeholder="your@email.com"
                        className="mt-1"
                      />
                    </div>

                    {/* Date */}
                    <div>
                      <Label htmlFor="date" className="text-sm font-medium">
                        Preferred Date *
                      </Label>
                      <div className="mt-2">
                        <button
                          onClick={() => setShowCalendar(!showCalendar)}
                          className="w-full px-3 py-2 border border-input rounded-md text-sm text-left hover:bg-accent transition-colors"
                        >
                          {bookingData.requestedDate || "Select a date"}
                        </button>
                        {showCalendar && (
                          <div className="mt-2 p-3 border border-input rounded-md bg-background">
                            <DateGridCalendar
                              onDateSelect={(date) => {
                                setBookingData({
                                  ...bookingData,
                                  requestedDate: date.toISOString().split("T")[0],
                                });
                                setShowCalendar(false);
                              }}
                              disabledDates={disabledDates}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Meal Type */}
                    <div>
                      <Label htmlFor="mealType" className="text-sm font-medium">
                        Meal Type
                      </Label>
                      <Select
                        value={bookingData.mealType}
                        onValueChange={(value) =>
                          setBookingData({ ...bookingData, mealType: value })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDays.length > 0 && (
                            <>
                              {sortedAvailability[
                                new Date(bookingData.requestedDate)
                                  .toLocaleDateString("en-US", { weekday: "lowercase" })
                                  .slice(0, -1)
                              ]?.includes("lunch") && (
                                <SelectItem value="lunch">Lunch</SelectItem>
                              )}
                              {sortedAvailability[
                                new Date(bookingData.requestedDate)
                                  .toLocaleDateString("en-US", { weekday: "lowercase" })
                                  .slice(0, -1)
                              ]?.includes("dinner") && (
                                <SelectItem value="dinner">Dinner</SelectItem>
                              )}
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Number of Guests */}
                    <div>
                      <Label className="text-sm font-medium">Number of Guests *</Label>
                      <div className="flex gap-2 mt-2">
                        {[1, 2, 3, 4].map((num) => (
                          <button
                            key={num}
                            onClick={() =>
                              setBookingData({ ...bookingData, numberOfGuests: num.toString() })
                            }
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                              bookingData.numberOfGuests === num.toString()
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                      {parseInt(bookingData.numberOfGuests) > host.maxGuests && (
                        <p className="text-xs text-destructive mt-2">
                          Maximum {host.maxGuests} guests allowed
                        </p>
                      )}
                    </div>

                    {/* Special Requests */}
                    <div>
                      <Label htmlFor="requests" className="text-sm font-medium">
                        Special Requests
                      </Label>
                      <Textarea
                        id="requests"
                        value={bookingData.specialRequests}
                        onChange={(e) =>
                          setBookingData({ ...bookingData, specialRequests: e.target.value })
                        }
                        placeholder="Any dietary restrictions, allergies, or special requests?"
                        className="mt-1 resize-none"
                        rows={3}
                      />
                    </div>

                    {/* Price Summary */}
                    <div className="bg-secondary p-4 rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">
                          ¥{host.pricePerPerson} × {bookingData.numberOfGuests} guests
                        </span>
                        <span className="font-bold">
                          ¥{host.pricePerPerson * parseInt(bookingData.numberOfGuests)}
                        </span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      onClick={() => {
                        if (
                          !bookingData.guestName ||
                          !bookingData.guestEmail ||
                          !bookingData.requestedDate
                        ) {
                          toast.error("Please fill in all required fields");
                          return;
                        }
                        if (parseInt(bookingData.numberOfGuests) > host.maxGuests) {
                          toast.error(`Maximum ${host.maxGuests} guests allowed`);
                          return;
                        }
                        createBookingMutation.mutate({
                          hostId: host.id,
                          guestName: bookingData.guestName,
                          guestEmail: bookingData.guestEmail,
                          requestedDate: new Date(bookingData.requestedDate),
                          mealType: bookingData.mealType as "lunch" | "dinner",
                          numberOfGuests: parseInt(bookingData.numberOfGuests),
                          specialRequests: bookingData.specialRequests,
                        });
                      }}
                      disabled={createBookingMutation.isPending}
                      className="w-full"
                    >
                      {createBookingMutation.isPending ? "Booking..." : "Reserve a Seat"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

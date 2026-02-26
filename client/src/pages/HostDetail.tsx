import { useParams, useLocation } from "wouter";
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
    guestPhone: "",
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
  
  // Blocked dates feature removed - availability now controlled by day-of-week only
  
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
        hostName: host.hostName,
        amount: totalAmount.toString(),
        dietaryRestrictions: bookingData.specialRequests || "",
        hostListingId: host.id.toString(),
      });
      
      window.location.href = `/booking-confirmation?${params.toString()}`;
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit booking request");
    },
  });
  
  const createCheckoutSessionMutation = trpc.payment.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.success("Redirecting to payment...");
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create payment session");
    },
  });
  
  const handlePayment = () => {
    console.log('[Payment] handlePayment called', { createdBookingId, host: !!host });
    
    if (!createdBookingId || !host) {
      console.error('[Payment] Missing required data:', { createdBookingId, host: !!host });
      toast.error('Unable to process payment. Please try booking again.');
      return;
    }
    
    const discountedPrice = host.discountPercentage && host.discountPercentage > 0 
      ? Math.round(host.pricePerPerson * (1 - host.discountPercentage / 100))
      : host.pricePerPerson;
    const totalAmount = discountedPrice * parseInt(bookingData.numberOfGuests);
    
    console.log('[Payment] Creating checkout session', {
      bookingId: createdBookingId,
      amount: totalAmount,
      hostName: host.hostName,
      guestEmail: bookingData.guestEmail,
    });
    
    createCheckoutSessionMutation.mutate({
      bookingId: createdBookingId,
      amount: totalAmount,
      hostName: host.hostName,
      guestEmail: bookingData.guestEmail,
    });
  };
  
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
  // Parse availability - handle both object and string cases
  let availability: Record<string, string[]> = {};
  try {
    let rawAvailability: any = {};
    if (typeof host.availability === 'string') {
      rawAvailability = JSON.parse(host.availability);
    } else if (host.availability && typeof host.availability === 'object') {
      rawAvailability = host.availability;
    }
    
    // Normalize keys to lowercase (API returns capitalized day names)
    availability = Object.entries(rawAvailability).reduce((acc, [day, meals]) => {
      acc[day.toLowerCase()] = meals as string[];
      return acc;
    }, {} as Record<string, string[]>);
  } catch (e) {
    console.error('[Availability] Failed to parse availability:', e, host.availability);
    availability = {};
  }
  
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
            {/* Host Video Section - Top Priority */}
            {host.introVideoUrl && (
              <div className="relative w-full bg-black rounded-2xl overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                <video
                  src={host.introVideoUrl}
                  controls
                  autoPlay
                  className="absolute top-0 left-0 w-full h-full"
                  style={{ objectFit: 'contain' }}
                />
              </div>
            )}

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
              {/* Cuisine Badge - Prominent */}
              {host.cuisineStyle && (
                <div className="flex items-center gap-2">
                  <Badge className="bg-amber-600/90 text-white border-0 font-semibold text-base px-4 py-2">
                    {host.cuisineStyle}
                  </Badge>
                </div>
              )}
              {host.title && (
                <h1 className="text-3xl font-bold text-foreground">{host.title}</h1>
              )}
              <p className="text-lg text-muted-foreground">
                Hosted by <span className="text-primary font-semibold">{host.hostName}</span> in <span className="text-primary font-semibold">{host.district}</span>
              </p>
            </div>

            {/* Experience/Host Toggle */}
               <div className="flex gap-2 justify-center mb-6">
              <button
                onClick={() => setActiveTab("host")}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  activeTab === "host"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                The Host
              </button>
              <button
                onClick={() => setActiveTab("experience")}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  activeTab === "experience"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                The Experience
              </button>
            </div>

            {/* Content Based on Tab */}
            {activeTab === "experience" ? (
              <div className="space-y-6">
                {/* Key Details with Icons - Moved to top */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Cuisine Type */}
                  <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                    <Utensils className="h-8 w-8 text-primary mb-2" />
                    <p className="text-sm font-semibold text-foreground">{host.cuisineStyle}</p>
                    <p className="text-xs text-muted-foreground">Cuisine</p>
                  </div>

                  {/* Max Guests */}
                  <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                    <Users className="h-8 w-8 text-primary mb-2" />
                    <p className="text-sm font-semibold text-foreground">{host.maxGuests} guests</p>
                    <p className="text-xs text-muted-foreground">Maximum</p>
                  </div>
                </div>

                {/* Menu Section */}
                <Card className="border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <ChefHat className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-bold">Menu</h3>
                    </div>
                    <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      {host.menuDescription}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex flex-col">
                {/* Host Header Card */}
                  <Card className="border-border/50 rounded-none">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 bg-muted">
                          {host.profilePhotoUrl ? (
                            <img
                              src={getProxiedImageUrl(host.profilePhotoUrl)}
                              alt={host.hostName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                              {host.hostName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-primary">{host.hostName}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-4 w-4" />
                            {host.district}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                {/* Profile Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {/* Languages */}
                  {host.languages && host.languages.length > 0 && (
                    <Card className="border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <MessageCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold mb-2">Languages I Speak</h4>
                            <div className="flex flex-wrap gap-2">
                              {host.languages.map((lang, idx) => (
                                <Badge key={idx} variant="secondary">{lang}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Overseas Experience */}
                  {host.overseasExperience && (
                    <Card className="border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Globe className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold mb-2">Overseas Experience</h4>
                            <p className="text-sm text-foreground/80 leading-relaxed">
                              {host.overseasExperience}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Fun Facts */}
                  {host.funFacts && (
                    <Card className="border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold mb-2">Fun Facts About Me</h4>
                            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                              {host.funFacts}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Cultural Passions */}
                  {host.culturalPassions && (
                    <Card className="border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <BookOpen className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold mb-2">My Cultural Passions</h4>
                            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                              {host.culturalPassions}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Why Host - Full Width */}
                {host.whyHost && (
                  <Card className="border-border/50 mt-6">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Heart className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold mb-3">Why I Want to Host</h4>
                          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                            {host.whyHost}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Other Passions - Full Width */}
                {host.otherPassions && (
                  <Card className="border-border/50 mt-6">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Compass className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold mb-3">Besides Food, What I'm Passionate About</h4>
                          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                            {host.otherPassions}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Bio - Full Width */}
                <Card className="border-border/50 mt-6">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-semibold mb-3">About Me</h4>
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                      {host.bio}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}



            {/* Availability Section */}
            {availableDays.length > 0 && (
              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-bold">Availability</h3>
                  </div>
                  <div className="space-y-2">
                    {availableDays.map((day) => (
                      <div key={day} className="flex items-center justify-between">
                        <span className="capitalize font-medium text-foreground">
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </span>
                        <span className="text-muted-foreground">
                          {sortedAvailability[day]?.join(", ")}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Booking Card */}
          <div className="lg:col-span-1">
            <Card className="border-border/50 sticky top-24">
              <CardContent className="pt-6 space-y-4">
                {/* Price */}
                <div className="space-y-2">
                  {host.discountPercentage && host.discountPercentage > 0 ? (
                    <>
                      <Badge className="bg-red-600 hover:bg-red-700 text-white mb-2">
                        Limited Time Offer
                      </Badge>
                      <div className="flex items-center gap-2">
                        <span className="text-lg text-muted-foreground line-through">¥{host.pricePerPerson}</span>
                        <Badge variant="destructive" className="text-xs">-{host.discountPercentage}%</Badge>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-primary">
                          ¥{Math.round(host.pricePerPerson * (1 - host.discountPercentage / 100))}
                        </span>
                        <span className="text-muted-foreground">/person</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-primary">¥{host.pricePerPerson}</span>
                      <span className="text-muted-foreground">/person</span>
                    </div>
                  )}
                </div>

                {/* Quick Info */}
                <div className="space-y-3 py-4 border-y border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Meal Type</span>
                    <span className="font-semibold">Dinner</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Max Guests</span>
                    <span className="font-semibold">{host.maxGuests}</span>
                  </div>
                </div>

                {/* Book Button */}
                <Button
                  onClick={() => setIsBookingOpen(true)}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-lg rounded-lg"
                >
                  Book Now
                </Button>

                {/* Cancellation Policy */}
                <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/50 rounded-lg">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                      Free cancellation
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      Cancel up to 7 days before for a full refund
                    </p>
                  </div>
                </div>

                {/* Share Button */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(window.location.href);
                      toast.success("Link copied to clipboard!");
                    } catch (err) {
                      toast.error("Failed to copy link");
                    }
                  }}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
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
                placeholder="Enter your name"
                value={bookingData.guestName}
                onChange={(e) => setBookingData({ ...bookingData, guestName: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="guestEmail">Email *</Label>
              <Input
                id="guestEmail"
                type="email"
                placeholder="your@email.com"
                value={bookingData.guestEmail}
                onChange={(e) => setBookingData({ ...bookingData, guestEmail: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="guestPhone">Phone (Optional)</Label>
              <Input
                id="guestPhone"
                placeholder="Your phone number"
                value={bookingData.guestPhone}
                onChange={(e) => setBookingData({ ...bookingData, guestPhone: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="requestedDate">Preferred Date *</Label>
              <Input
                id="requestedDate"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={bookingData.requestedDate}
                onChange={(e) => {
                  const selectedDate = e.target.value;
                  // Parse date in local timezone to avoid UTC conversion issues
                  const [year, month, day] = selectedDate.split('-').map(Number);
                  const checkDate = new Date(year, month - 1, day);
                  console.log('[Booking] Date selected:', selectedDate, 'Day:', checkDate.toLocaleDateString('en-US', { weekday: 'long' }));
                  
                  // Date blocking by availability comments removed
                  const isBlocked = false;
                  
                  if (isBlocked) {
                    toast.error("This date is not available. Please choose another date.");
                    return;
                  }
                  
                  // Check if the day of week matches host's availability
                  if (host?.availability && Object.keys(host.availability).length > 0) {
                    const dayOfWeek = checkDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                    // Normalize availability keys to lowercase for comparison
                    const normalizedAvailability = Object.keys(host.availability).map(k => k.toLowerCase());
                    console.log('[Debug] Selected day:', dayOfWeek);
                    console.log('[Debug] Normalized availability:', normalizedAvailability);
                    const isAvailable = normalizedAvailability.includes(dayOfWeek);
                    console.log('[Debug] Is available?', isAvailable);
                    
                    if (!isAvailable) {
                      const availableDays = Object.keys(host.availability)
                        .map(day => day.charAt(0).toUpperCase() + day.slice(1))
                        .join(', ');
                      toast.error(`Host is only available on: ${availableDays}`);
                      return;
                    }
                  }
                  
                  setBookingData({ ...bookingData, requestedDate: selectedDate });
                }}
              />
              {host?.availability && Object.keys(host.availability).length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Available days: {Object.keys(host.availability)
                    .map(day => day.charAt(0).toUpperCase() + day.slice(1))
                    .join(', ')}
                </p>
              )}

            </div>

            <div>
              <Label htmlFor="mealType">Meal Type</Label>
              <Select value={bookingData.mealType} onValueChange={(value) => setBookingData({ ...bookingData, mealType: value })}>
                <SelectTrigger id="mealType">
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

          {/* Cancellation Policy Badge */}
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-green-800 dark:text-green-200 font-medium">
              Free cancellation up to 7 days before your experience
            </p>
          </div>

          <DialogFooter>
            {!bookingSuccess ? (
              <>
                <Button variant="outline" onClick={() => setIsBookingOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitBooking}
                  disabled={createBookingMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  {createBookingMutation.isPending ? "Submitting..." : "Submit Request"}
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsBookingOpen(false);
                    setBookingSuccess(false);
                    setCreatedBookingId(null);
                    setBookingData({
                      guestName: "",
                      guestEmail: "",
                      guestPhone: "",
                      requestedDate: "",
                      mealType: "dinner",
                      numberOfGuests: "1",
                      specialRequests: "",
                    });
                  }}
                >
                  Close
                </Button>
                <Button
                  onClick={handlePayment}
                  disabled={createCheckoutSessionMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  {createCheckoutSessionMutation.isPending ? "Redirecting..." : "Pay Now"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

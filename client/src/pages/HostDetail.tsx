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
  const [currentFoodImageIndex, setCurrentFoodImageIndex] = useState(0);
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

  const nextFoodImage = () => {
    setCurrentFoodImageIndex((prev) => (prev + 1) % foodPhotos.length);
  };

  const prevFoodImage = () => {
    setCurrentFoodImageIndex((prev) => (prev - 1 + foodPhotos.length) % foodPhotos.length);
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
              ref={(el) => {
                if (el && el.requestFullscreen) {
                  el.requestFullscreen().catch(() => {});
                  el.addEventListener('fullscreenchange', () => {
                    if (!document.fullscreenElement) {
                      el.pause();
                    }
                  });
                }
              }}
              src={host.introVideoUrl}
              autoPlay
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
        {/* Welcome Section with Menu Description and Food Carousel */}
        <section className="mb-12">
          <h2 className="text-4xl font-light mb-6">Welcome to {host.hostName}'s home dining table!</h2>
          <div className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-3xl whitespace-pre-wrap">
            {host.menuDescription
              .split(/[;\n]/)
              .map((line, index) => (
                <div key={index} className="mb-2">
                  {line.trim() === "---" ? (
                    <hr className="my-3 border-gray-300" />
                  ) : (
                    line.trim()
                  )}
                </div>
              ))}
          </div>
          
          {/* Food Photos Carousel */}
          {foodPhotos.length > 0 && (
            <div className="relative">
              <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                <img
                  src={getProxiedImageUrl(foodPhotos[currentFoodImageIndex])}
                  alt={`${host.hostName} food photo ${currentFoodImageIndex + 1}`}
                  className="w-full h-full object-contain"
                />
                
                {/* Navigation Buttons */}
                {foodPhotos.length > 1 && (
                  <>
                    <button
                      onClick={prevFoodImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-3 transition z-10"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft size={24} className="text-white" />
                    </button>
                    <button
                      onClick={nextFoodImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-3 transition z-10"
                      aria-label="Next photo"
                    >
                      <ChevronRight size={24} className="text-white" />
                    </button>
                    
                    {/* Dot Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {foodPhotos.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentFoodImageIndex(index)}
                          className={`h-2 rounded-full transition-all ${
                            index === currentFoodImageIndex
                              ? "w-6 bg-white"
                              : "w-2 bg-white/60 hover:bg-white/80"
                          }`}
                          aria-label={`Go to photo ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Meet Host Section */}
        <section className="mb-12">
          <h2 className="text-4xl font-light mb-8">Meet {host.hostName}</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Picture */}
            <div className="lg:col-span-1">
              {host.profilePhotoUrl && (
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={getProxiedImageUrl(host.profilePhotoUrl)}
                    alt={host.hostName}
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
            </div>
            
            {/* Host Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* About Me */}
              {host.bio && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">About Me</h3>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {host.bio}
                  </div>
                </div>
              )}
              
              {/* Travel Experience */}
              {host.overseasExperience && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Travel Experience</h3>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {host.overseasExperience}
                  </div>
                </div>
              )}
              
              {/* Languages */}
              {host.languages && host.languages.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {host.languages.map((lang, index) => (
                      <span key={index} className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Household */}
              {(host.kidsFriendly || host.hasPets || host.petDetails || (host.householdFeatures && host.householdFeatures.length > 0) || host.otherHouseholdInfo) && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Household</h3>
                  <div className="space-y-3">
                    {host.kidsFriendly && (
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-muted-foreground">Kids friendly</span>
                      </div>
                    )}
                    {host.hasPets && (
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-muted-foreground">{host.petDetails ? `Has pets (${host.petDetails})` : "Has pets"}</span>
                      </div>
                    )}
                    {host.householdFeatures && host.householdFeatures.length > 0 && host.householdFeatures.map((feature: string, index: number) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                    {host.otherHouseholdInfo && (
                      <div className="text-sm text-muted-foreground mt-2 pt-2 border-t border-gray-200">
                        {host.otherHouseholdInfo}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Core Info */}
          <div className="lg:col-span-2 space-y-6">

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
                          <div className="mt-2 p-3 border border-input rounded-md bg-background relative z-50">
                            <DateGridCalendar
                              onDateSelect={(date) => {
                                setBookingData({
                                  ...bookingData,
                                  requestedDate: date,
                                });
                                setShowCalendar(false);
                              }}
                              disabledDates={disabledDates}
                              selectedDate={bookingData.requestedDate}
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
                          {availableDays.length > 0 && bookingData.requestedDate && (
                            <>
                              {(() => {
                                const date = new Date(bookingData.requestedDate + 'T00:00:00');
                                const dayName = date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
                                return (
                                  <>
                                    {sortedAvailability[dayName]?.includes("lunch") && (
                                      <SelectItem value="lunch">Lunch</SelectItem>
                                    )}
                                    {sortedAvailability[dayName]?.includes("dinner") && (
                                      <SelectItem value="dinner">Dinner</SelectItem>
                                    )}
                                  </>
                                );
                              })()}
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

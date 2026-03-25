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
  Play,
  Pause,
  X,
} from "lucide-react";
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
import { useState, useEffect, useRef } from "react";

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
  
  // State management
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentFoodImageIndex, setCurrentFoodImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [expandedBio, setExpandedBio] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showMobileBooking, setShowMobileBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<number | null>(null);
  const [disabledDates, setDisabledDates] = useState<Set<string>>(new Set());
  const [bookingData, setBookingData] = useState({
    guestName: "",
    guestEmail: "",
    requestedDate: "",
    mealType: "dinner",
    numberOfGuests: "1",
    specialRequests: "",
  });

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);

  // Data fetching
  const hostId = params?.id ? parseInt(params.id) : null;
  const { data: host, isLoading, isError } = trpc.host.get.useQuery(
    { id: hostId || 0 },
    { enabled: !!hostId }
  );

  // Booking mutation
  const createBookingMutation = trpc.booking.create.useMutation({
    onSuccess: (data) => {
      if (!host) return;
      const discountedPrice = host.discountPercentage && host.discountPercentage > 0
        ? Math.round(host.pricePerPerson * (1 - host.discountPercentage / 100))
        : host.pricePerPerson;
      const totalAmount = discountedPrice * parseInt(bookingData.numberOfGuests);
      const params = new URLSearchParams({
        bookingId: data.id.toString(),
        guestName: bookingData.guestName,
        guestEmail: bookingData.guestEmail,
        requestedDate: bookingData.requestedDate,
        mealType: bookingData.mealType,
        numberOfGuests: bookingData.numberOfGuests,
        amount: totalAmount.toString(),
        hostName: host.hostName,
        pricePerPerson: discountedPrice.toString(),
      });
      setLocation(`/booking-confirmation?${params.toString()}`);
    },
    onError: (error) => {
      toast.error("Failed to create booking. Please try again.");
      console.error("Booking error:", error);
    },
  });

  // Update disabled dates based on host availability
  useEffect(() => {
    if (!host) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const disabled = new Set<string>();
    
    // Block today and all past dates
    for (let i = -365; i < 0; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      disabled.add(dateStr);
    }
    
    // Block future dates that don't match host availability
    for (let i = 0; i < 90; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i + 1); // Start from tomorrow
      const dateStr = date.toISOString().split("T")[0];
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
      
      if (!host.availability || !host.availability[dayName as keyof typeof host.availability] || 
          (host.availability[dayName as keyof typeof host.availability] as string[]).length === 0) {
        disabled.add(dateStr);
      }
    }
    setDisabledDates(disabled);
  }, [host]);

  // Restore booking data from localStorage
  useEffect(() => {
    if (!host) return;
    const cacheKey = `booking_cache_${host.id}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setBookingData(JSON.parse(cached));
      } catch (e) {
        console.error("Failed to restore booking data:", e);
      }
    }
  }, [host]);

  // Auto-save booking data to localStorage
  useEffect(() => {
    if (!host) return;
    const cacheKey = `booking_cache_${host.id}`;
    localStorage.setItem(cacheKey, JSON.stringify(bookingData));
  }, [bookingData, host]);

  // Image carousel handlers
  const nextImage = () => {
    if (!host?.images) return;
    setCurrentImageIndex((prev) => (prev + 1) % host.images.length);
  };

  const prevImage = () => {
    if (!host?.images) return;
    setCurrentImageIndex((prev) => (prev - 1 + host.images.length) % host.images.length);
  };

  const nextFoodImage = () => {
    if (!host?.foodPhotos) return;
    setCurrentFoodImageIndex((prev) => (prev + 1) % host.foodPhotos.length);
  };

  const prevFoodImage = () => {
    if (!host?.foodPhotos) return;
    setCurrentFoodImageIndex((prev) => (prev - 1 + host.foodPhotos.length) % host.foodPhotos.length);
  };

  // Touch handlers for carousel
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
            <div className="h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Loading host details...</h2>
          <p className="text-muted-foreground">Please wait while we fetch the information.</p>
        </div>
      </div>
    );
  }

  // Error state
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

  const images = host.images || [];
  const foodPhotos = host.foodPhotos || [];
  const availability = host.availability || {};
  const daysOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const availableDays = daysOrder.filter(day => availability[day as keyof typeof availability]?.length > 0);
  
  const sortedAvailability = Object.entries(availability).reduce((acc, [day, meals]) => {
    const sorted = [...(meals || [])].sort((a, b) => {
      if (a === "lunch" && b === "dinner") return -1;
      if (a === "dinner" && b === "lunch") return 1;
      return 0;
    });
    acc[day] = sorted;
    return acc;
  }, {} as Record<string, string[]>);

  const bioPreview = host.bio && host.bio.length > 200 
    ? host.bio.substring(0, 200) + "..." 
    : host.bio;

  const discountedPrice = host.discountPercentage && host.discountPercentage > 0
    ? Math.round(host.pricePerPerson * (1 - host.discountPercentage / 100))
    : host.pricePerPerson;

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
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                src={host.introVideoUrl}
                autoPlay
                loop
                playsInline
                className="w-full h-full object-contain"
              />
              {/* Play/Pause Button */}
              <button
                onClick={() => {
                  if (videoRef.current) {
                    if (videoRef.current.paused) {
                      videoRef.current.play();
                      setIsVideoPlaying(true);
                    } else {
                      videoRef.current.pause();
                      setIsVideoPlaying(false);
                    }
                  }
                }}
                className="absolute inset-0 flex items-center justify-center hover:bg-black/20 transition-colors group"
              >
                <div className="bg-white/30 hover:bg-white/50 rounded-full p-4 transition-all group-hover:scale-110">
                  {isVideoPlaying ? (
                    <Pause size={48} className="text-white" />
                  ) : (
                    <Play size={48} className="text-white fill-white" />
                  )}
                </div>
              </button>
            </div>
          ) : images.length > 0 ? (
            <div
              className="relative w-full h-full"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={getProxiedImageUrl(images[currentImageIndex])}
                alt={`${host.hostName} image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-3 transition z-10"
                  >
                    <ChevronLeft size={24} className="text-white" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-3 transition z-10"
                  >
                    <ChevronRight size={24} className="text-white" />
                  </button>
                </>
              )}
            </div>
          ) : null}
        </div>

        {/* Hero Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-5xl font-light text-white mb-4">{host.hostName}</h1>
            <div className="flex flex-wrap gap-6 text-white">
              <div className="flex items-center gap-2">
                <MapPin size={20} />
                <span>{host.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={20} />
                <span>Up to {host.maxGuests} guests</span>
              </div>
              <div className="flex items-center gap-2">
                <Wine size={20} />
                <span>¥{discountedPrice}/person</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Welcome Section */}
            <section>
              <h2 className="text-4xl font-light mb-6">Welcome to {host.hostName}'s home dining table!</h2>
              <div className="text-lg text-muted-foreground leading-relaxed max-w-3xl whitespace-pre-wrap">
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
            </section>

            {/* Food Photos Carousel */}
            {foodPhotos.length > 0 && (
              <section>
                <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  <img
                    src={getProxiedImageUrl(foodPhotos[currentFoodImageIndex])}
                    alt={`${host.hostName} food photo ${currentFoodImageIndex + 1}`}
                    className="w-full h-full object-contain"
                  />
                  {foodPhotos.length > 1 && (
                    <>
                      <button
                        onClick={prevFoodImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-3 transition z-10"
                      >
                        <ChevronLeft size={24} className="text-white" />
                      </button>
                      <button
                        onClick={nextFoodImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-3 transition z-10"
                      >
                        <ChevronRight size={24} className="text-white" />
                      </button>
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
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </section>
            )}

            {/* Meet Host Section */}
            <section>
              <h2 className="text-4xl font-light mb-8">Meet {host.hostName}</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Picture */}
                {host.profilePhotoUrl && (
                  <div className="lg:col-span-1">
                    <div className="rounded-lg overflow-hidden">
                      <img
                        src={getProxiedImageUrl(host.profilePhotoUrl)}
                        alt={host.hostName}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  </div>
                )}
                {/* Bio and Info */}
                <div className={host.profilePhotoUrl ? "lg:col-span-2" : "lg:col-span-3"}>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6 whitespace-pre-wrap">
                    {expandedBio ? host.bio : bioPreview}
                  </p>
                  {host.bio && host.bio.length > 200 && (
                    <Button
                      variant="outline"
                      onClick={() => setExpandedBio(!expandedBio)}
                      className="mb-6"
                    >
                      {expandedBio ? "Show less" : "Show more"}
                    </Button>
                  )}
                  
                  {/* Household Info */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Household</h3>
                      <p className="text-muted-foreground">{host.householdDescription}</p>
                    </div>
                    {host.activities && host.activities.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Activities</h3>
                        <div className="flex flex-wrap gap-2">
                          {host.activities.map((activity) => (
                            <Badge key={activity} variant="secondary">
                              {ACTIVITY_LABELS[activity] || activity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Availability Section */}
            {availableDays.length > 0 && (
              <section>
                <h2 className="text-4xl font-light mb-6">Availability</h2>
                <div className="space-y-3">
                  {availableDays.map((day) => (
                    <div key={day} className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                      <CheckCircle size={20} className="text-green-600" />
                      <span className="font-medium capitalize">{day}</span>
                      <span className="text-sm text-muted-foreground ml-auto">
                        {(sortedAvailability[day] || []).map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(", ")}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT COLUMN: Booking Widget (Sticky) */}
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
                        setBookingData({
                          guestName: "",
                          guestEmail: "",
                          requestedDate: "",
                          mealType: "dinner",
                          numberOfGuests: "1",
                          specialRequests: "",
                        });
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
                        placeholder="Enter your name"
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
                      <button
                        onClick={() => setShowCalendar(!showCalendar)}
                        className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm text-left hover:bg-accent transition-colors flex items-center gap-2"
                      >
                        <Calendar size={18} className="text-muted-foreground" />
                        <span>
                          {bookingData.requestedDate
                            ? new Date(bookingData.requestedDate + 'T00:00:00').toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })
                            : "Select a date"}
                        </span>
                      </button>
                      {showCalendar && (
                        <div className="mt-2 border border-input rounded-md p-3 bg-white z-50">
                          <DateGridCalendar
                            disabledDates={disabledDates}
                            onDateSelect={(date) => {
                              setBookingData({ ...bookingData, requestedDate: date });
                              setShowCalendar(false);
                            }}
                            selectedDate={bookingData.requestedDate}
                          />
                        </div>
                      )}
                    </div>

                    {/* Meal Type */}
                    <div>
                      <Label htmlFor="meal" className="text-sm font-medium">
                        Meal Type
                      </Label>
                      <Select value={bookingData.mealType} onValueChange={(value) => setBookingData({ ...bookingData, mealType: value })}>
                        <SelectTrigger id="meal" className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {bookingData.requestedDate ? (
                            (() => {
                              const date = new Date(bookingData.requestedDate + 'T00:00:00');
                              const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                              const mealTypes = sortedAvailability[dayName] || [];
                              return mealTypes.length > 0 ? (
                                mealTypes.map((meal) => (
                                  <SelectItem key={meal} value={meal}>
                                    {meal.charAt(0).toUpperCase() + meal.slice(1)}
                                  </SelectItem>
                                ))
                              ) : (
                                <div className="p-2 text-sm text-muted-foreground">No meals available</div>
                              );
                            })()
                          ) : (
                            <div className="p-2 text-sm text-muted-foreground">Select a date first</div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Number of Guests */}
                    <div>
                      <Label htmlFor="guests" className="text-sm font-medium">
                        Number of Guests *
                      </Label>
                      <Input
                        id="guests"
                        type="number"
                        min="1"
                        max={host.maxGuests}
                        value={bookingData.numberOfGuests}
                        onChange={(e) =>
                          setBookingData({ ...bookingData, numberOfGuests: e.target.value })
                        }
                        className="mt-1"
                      />
                    </div>

                    {/* Special Requests */}
                    <div>
                      <Label htmlFor="requests" className="text-sm font-medium">
                        Special Requests (Optional)
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
                      <div className="flex justify-between items-center">
                        <span className="text-sm">
                          ¥{discountedPrice} × {bookingData.numberOfGuests} guests
                        </span>
                        <span className="font-bold">
                          ¥{discountedPrice * parseInt(bookingData.numberOfGuests)}
                        </span>
                      </div>
                    </div>

                    {/* Free Cancellation Clause */}
                    <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-center gap-2">
                      <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                      <p className="text-sm text-green-700 font-medium">
                        Free cancellation up to 7 days before your experience
                      </p>
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
                          hostListingId: host.id,
                          guestName: bookingData.guestName,
                          guestEmail: bookingData.guestEmail,
                          requestedDate: bookingData.requestedDate,
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

      {/* MOBILE FLOATING BOOKING BUTTON */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-gray-200 shadow-lg z-40 p-4">
        <button
          onClick={() => setShowMobileBooking(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          Book Now - ¥{discountedPrice}/person
        </button>
      </div>

      {/* MOBILE BOOKING MODAL */}
      {showMobileBooking && (
        <div className="fixed inset-0 lg:hidden bg-black/50 z-50 flex items-end">
          <div className="w-full bg-white rounded-t-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
              <h3 className="text-xl font-bold">Reserve a Seat</h3>
              <button
                onClick={() => setShowMobileBooking(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4 pb-24">
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
                      setShowMobileBooking(false);
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Close
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <Label htmlFor="mobile-name" className="text-sm font-medium">
                      Name *
                    </Label>
                    <Input
                      id="mobile-name"
                      value={bookingData.guestName}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, guestName: e.target.value })
                      }
                      placeholder="Enter your name"
                      className="mt-1"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="mobile-email" className="text-sm font-medium">
                      Email *
                    </Label>
                    <Input
                      id="mobile-email"
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
                    <Label htmlFor="mobile-date" className="text-sm font-medium">
                      Preferred Date *
                    </Label>
                    <button
                      onClick={() => setShowCalendar(!showCalendar)}
                      className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm text-left hover:bg-accent transition-colors flex items-center gap-2"
                    >
                      <Calendar size={18} className="text-muted-foreground" />
                      <span>
                        {bookingData.requestedDate
                          ? new Date(bookingData.requestedDate + 'T00:00:00').toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })
                          : "Select a date"}
                      </span>
                    </button>
                    {showCalendar && (
                      <div className="mt-2 border border-input rounded-md p-3 bg-white z-50">
                        <DateGridCalendar
                          disabledDates={disabledDates}
                          onDateSelect={(date) => {
                            setBookingData({ ...bookingData, requestedDate: date });
                            setShowCalendar(false);
                          }}
                          selectedDate={bookingData.requestedDate}
                        />
                      </div>
                    )}
                  </div>

                  {/* Meal Type */}
                  <div>
                    <Label htmlFor="mobile-meal" className="text-sm font-medium">
                      Meal Type
                    </Label>
                    <Select value={bookingData.mealType} onValueChange={(value) => setBookingData({ ...bookingData, mealType: value })}>
                      <SelectTrigger id="mobile-meal" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {bookingData.requestedDate ? (
                          (() => {
                            const date = new Date(bookingData.requestedDate + 'T00:00:00');
                            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                            const mealTypes = sortedAvailability[dayName] || [];
                            return mealTypes.length > 0 ? (
                              mealTypes.map((meal) => (
                                <SelectItem key={meal} value={meal}>
                                  {meal.charAt(0).toUpperCase() + meal.slice(1)}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="p-2 text-sm text-muted-foreground">No meals available</div>
                            );
                          })()
                        ) : (
                          <div className="p-2 text-sm text-muted-foreground">Select a date first</div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Number of Guests */}
                  <div>
                    <Label htmlFor="mobile-guests" className="text-sm font-medium">
                      Number of Guests *
                    </Label>
                    <Input
                      id="mobile-guests"
                      type="number"
                      min="1"
                      max={host.maxGuests}
                      value={bookingData.numberOfGuests}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, numberOfGuests: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>

                  {/* Special Requests */}
                  <div>
                    <Label htmlFor="mobile-requests" className="text-sm font-medium">
                      Special Requests (Optional)
                    </Label>
                    <Textarea
                      id="mobile-requests"
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
                    <div className="flex justify-between items-center">
                      <span className="text-sm">
                        ¥{discountedPrice} × {bookingData.numberOfGuests} guests
                      </span>
                      <span className="font-bold">
                        ¥{discountedPrice * parseInt(bookingData.numberOfGuests)}
                      </span>
                    </div>
                  </div>

                  {/* Free Cancellation Clause */}
                  <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-center gap-2">
                    <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                    <p className="text-sm text-green-700 font-medium">
                      Free cancellation up to 7 days before your experience
                    </p>
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
                        hostListingId: host.id,
                        guestName: bookingData.guestName,
                        guestEmail: bookingData.guestEmail,
                        requestedDate: bookingData.requestedDate,
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HostEventSection } from "@/components/HostEventSection";
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
  Volume2,
  VolumeX,
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

const HOUSEHOLD_FEATURE_LABELS: Record<string, string> = {
  "has-pets": "Has Pets",
  "has-stairs": "Has Stairs",
  "kids-present": "Kids at Home",
  "elderly-present": "Elderly at Home",
  "large-space": "Large Space",
  "garden": "Has Garden",
};

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
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [showUnmuteHint, setShowUnmuteHint] = useState(true);
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

  // Hide the unmute hint after 4 seconds
  useEffect(() => {
    const t = setTimeout(() => setShowUnmuteHint(false), 4000);
    return () => clearTimeout(t);
  }, []);

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

  // Fetch specific date blocks from the database
  const { data: availabilityBlocks } = trpc.host.getAvailabilityBlocks.useQuery(
    { hostId: hostId || 0 },
    { enabled: !!hostId }
  );

  // Fetch already-booked slots (confirmed or pending bookings) to prevent double-booking
  const { data: bookedSlots } = trpc.booking.getBlockedSlots.useQuery(
    { hostListingId: hostId || 0 },
    { enabled: !!hostId }
  );

  // Build a lookup set of booked slot keys: "YYYY-MM-DD:mealType"
  const bookedSlotKeys = new Set(
    (bookedSlots || []).map((s: { date: string; mealType: string }) => `${s.date}:${s.mealType}`)
  );

  // Update disabled dates based on host availability + explicit date blocks + existing bookings
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
    
    // Check availability for today and future dates (90 days)
    for (let i = 0; i < 90; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
      
      if (!host.availability || !host.availability[dayName as keyof typeof host.availability] || 
          (host.availability[dayName as keyof typeof host.availability] as string[]).length === 0) {
        disabled.add(dateStr);
      }
    }

    // Also block any explicit date blocks from the database
    if (availabilityBlocks) {
      for (const block of availabilityBlocks) {
        if (block.blockType === 'date' && block.blockDate) {
          disabled.add(block.blockDate);
        }
      }
    }

    // Block dates where ALL available meal slots are already booked
    if (bookedSlots && host.availability) {
      const bookedByDate: Record<string, Set<string>> = {};
      for (const slot of bookedSlots) {
        if (!bookedByDate[slot.date]) bookedByDate[slot.date] = new Set();
        bookedByDate[slot.date].add(slot.mealType);
      }
      for (const [date, bookedMeals] of Object.entries(bookedByDate)) {
        const d = new Date(date + 'T00:00:00');
        const dayName = d.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const availableMeals: string[] = (host.availability as any)[dayName] || [];
        if (availableMeals.length > 0 && availableMeals.every(m => bookedMeals.has(m))) {
          disabled.add(date);
        }
      }
    }

    setDisabledDates(disabled);
  }, [host, availabilityBlocks, bookedSlots]);

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

  // Image carousel handlers - images is derived from profilePhotoUrl + foodPhotoUrls
  const nextImage = () => {
    const imgs = [...(host?.profilePhotoUrl ? [host.profilePhotoUrl] : []), ...((host?.foodPhotoUrls as string[]) || [])];
    setCurrentImageIndex((prev) => (prev + 1) % imgs.length);
  };

  const prevImage = () => {
    const imgs = [...(host?.profilePhotoUrl ? [host.profilePhotoUrl] : []), ...((host?.foodPhotoUrls as string[]) || [])];
    setCurrentImageIndex((prev) => (prev - 1 + imgs.length) % imgs.length);
  };

  const nextFoodImage = () => {
    const fp = (host?.foodPhotoUrls as string[]) || [];
    setCurrentFoodImageIndex((prev) => (prev + 1) % fp.length);
  };

  const prevFoodImage = () => {
    const fp = (host?.foodPhotoUrls as string[]) || [];
    setCurrentFoodImageIndex((prev) => (prev - 1 + fp.length) % fp.length);
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

  // Build slideshow images: profile photo first, then food photos
  const profilePhoto = host.profilePhotoUrl ? [host.profilePhotoUrl] : [];
  const foodPhotos = (host.foodPhotoUrls as string[]) || [];
  const images = [...profilePhoto, ...foodPhotos];
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
      <section className="relative w-full bg-black" style={{ height: '100svh' }}>
        {/* Back Button — must be above click-to-play overlay (z-20) */}
        <div className="absolute top-6 left-6 z-40">
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
            <div className="relative w-full h-full overflow-hidden">
              {/* Blurred background fill — handles portrait videos in landscape frame */}
              <video
                src={host.introVideoUrl}
                className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl brightness-50"
                muted
                loop
                playsInline
                autoPlay
                aria-hidden="true"
                ref={(el) => {
                  // Keep bg video in sync with main video
                  if (el && videoRef.current) {
                    if (isVideoPlaying) el.play(); else el.pause();
                  }
                }}
              />
              {/* Main video — object-contain so full frame is always visible */}
              <video
                ref={videoRef}
                src={host.introVideoUrl}
                loop
                playsInline
                autoPlay
                muted
                className="relative z-10 w-full h-full object-contain"
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
              />
              {/* Click-to-play / click-to-pause overlay */}
              <button
                onClick={() => {
                  if (videoRef.current) {
                    if (videoRef.current.paused) {
                      videoRef.current.play();
                    } else {
                      videoRef.current.pause();
                    }
                  }
                }}
                className="absolute inset-0 z-20 flex items-center justify-center"
                style={{ background: 'transparent' }}
              >
                {/* Big play button — only shown when paused */}
                {!isVideoPlaying && (
                  <div className="bg-black/50 backdrop-blur-sm rounded-full p-6 border border-white/20 transition-transform hover:scale-105">
                    <Play size={52} className="text-white fill-white ml-1" />
                  </div>
                )}
              </button>
              {/* Mute/unmute button — bottom left to avoid WhatsApp button overlap */}
              <div className="absolute bottom-24 left-6 z-30 flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (videoRef.current) {
                      const newMuted = !videoRef.current.muted;
                      videoRef.current.muted = newMuted;
                      setIsVideoMuted(newMuted);
                      setShowUnmuteHint(false);
                    }
                  }}
                  className="bg-black/50 backdrop-blur-sm rounded-full p-3 border border-white/20 hover:bg-black/70 transition"
                  title={isVideoMuted ? 'Unmute' : 'Mute'}
                >
                  {isVideoMuted
                    ? <VolumeX size={20} className="text-white" />
                    : <Volume2 size={20} className="text-white" />}
                </button>
                {/* Fade-out hint shown for first 4 seconds */}
                <span
                  className="text-white/90 text-sm font-medium bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 transition-opacity duration-700"
                  style={{ opacity: showUnmuteHint ? 1 : 0, pointerEvents: 'none' }}
                >
                  🔊 Tap to unmute
                </span>
              </div>
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
                  {/* Dot indicators */}
                  <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`h-1.5 rounded-full transition-all ${
                          index === currentImageIndex
                            ? "w-6 bg-white"
                            : "w-1.5 bg-white/50 hover:bg-white/75"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : null}
        </div>

        {/* Hero Info Overlay — sits above click-to-play button */}
        <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black via-black/60 to-transparent p-8 pointer-events-none">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-5xl font-light text-white mb-1 tracking-tight">{host.hostName}</h1>
            <p className="text-lg font-light mb-4" style={{ color: '#d4af37' }}>{host.cuisineStyle}</p>
            {/* Gold separator */}
            <div className="mb-4" style={{ height: '1px', background: 'linear-gradient(to right, rgba(212,175,55,0.6), rgba(212,175,55,0.1))' }} />
            <div className="flex flex-wrap gap-6" style={{ color: 'rgba(255,255,255,0.65)' }}>
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={15} style={{ color: 'rgba(212,175,55,0.7)' }} />
                <span>{host.district || 'China'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users size={15} style={{ color: 'rgba(212,175,55,0.7)' }} />
                <span>Up to {host.maxGuests} guests</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Wine size={15} style={{ color: 'rgba(212,175,55,0.7)' }} />
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
              <h2 className="text-4xl font-light mb-6">Welcome to {host.hostName}'s Home Dining Experience!</h2>
              <div className="max-w-3xl space-y-1.5">
                {(() => {
                  const rawLines = host.menuDescription.split(/\n/);
                  return rawLines.map((line, index) => {
                    const trimmed = line.trim();

                    // Empty lines → small spacer
                    if (!trimmed) return <div key={index} className="h-1" />;
                    if (trimmed === '---') return <hr key={index} className="my-4 border-gray-200" />;

                    // 1. Numbered dish lines: "1. Dish name" or "1. Dish (Chinese)"
                    const isDishLine = /^\d+\.\s+\S/.test(trimmed);

                    // 2. Dash bullet: "- Dish name"
                    const isDashBullet = /^-\s+\S/.test(trimmed);

                    // 3. Asterisk bullet: "* Dish name"
                    const isAsteriskBullet = /^\*\s+\S/.test(trimmed);

                    // 4. Section header ending with colon: "Her Signature Dishes:" / "Spring:"
                    const isColonHeader = /^[A-Z\u4e00-\u9fff][^\n]{0,50}:$/.test(trimmed);

                    // 5. Pure title-case category header (no colon, no punctuation, no Chinese, short)
                    const isTitleHeader = /^[A-Z][A-Za-z &]+$/.test(trimmed) && trimmed.length < 40;

                    // 6. Dish description line: previous non-empty line was a numbered dish
                    const prevNonEmpty = rawLines.slice(0, index).reverse().find(l => l.trim())?.trim() || '';
                    const isDishDescription = !isDishLine && !isDashBullet && !isAsteriskBullet &&
                      !isColonHeader && !isTitleHeader && /^\d+\.\s+\S/.test(prevNonEmpty);

                    if (isTitleHeader || isColonHeader) {
                      return (
                        <p key={index} className="text-xs tracking-[0.2em] uppercase font-semibold pt-5 pb-1" style={{ color: '#b8962e' }}>
                          {trimmed.replace(/:$/, '')}
                        </p>
                      );
                    }
                    if (isDishLine) {
                      const match = trimmed.match(/^(\d+\.\s*)(.+)$/);
                      return (
                        <div key={index} className="flex gap-2 pt-1">
                          <span className="text-sm font-medium shrink-0" style={{ color: 'rgba(0,0,0,0.35)', minWidth: '1.5rem' }}>{match?.[1]}</span>
                          <span className="text-base font-semibold text-foreground">{match?.[2]}</span>
                        </div>
                      );
                    }
                    if (isDashBullet || isAsteriskBullet) {
                      const content = trimmed.replace(/^[-*]\s+/, '');
                      return (
                        <div key={index} className="flex gap-2.5 items-start pt-0.5">
                          <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#b8962e', minWidth: '6px' }} />
                          <span className="text-base text-foreground">{content}</span>
                        </div>
                      );
                    }
                    if (isDishDescription) {
                      return (
                        <p key={index} className="text-sm text-muted-foreground leading-relaxed pl-8 -mt-0.5">{trimmed}</p>
                      );
                    }
                    // Default: prose paragraph
                    return (
                      <p key={index} className="text-base text-muted-foreground leading-relaxed">{trimmed}</p>
                    );
                  });
                })()}
              </div>
            </section>

            {/* Section Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1" style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.12))' }} />
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(212,175,55,0.5)' }} />
              <div className="flex-1" style={{ height: '1px', background: 'linear-gradient(to left, transparent, rgba(0,0,0,0.12))' }} />
            </div>

            {/* Food Photos Carousel */}
            {foodPhotos.length > 0 && (
              <section>
                <h2 className="text-4xl font-light mb-6">At the Dining Table</h2>
                <div className="relative w-full rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  {/* Blurred background */}
                  <img
                    src={getProxiedImageUrl(foodPhotos[currentFoodImageIndex])}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl brightness-50"
                  />
                  {/* Main image */}
                  <img
                    src={getProxiedImageUrl(foodPhotos[currentFoodImageIndex])}
                    alt={`${host.hostName} food photo ${currentFoodImageIndex + 1}`}
                    className="relative w-full h-full object-contain z-10"
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

            {/* Section Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1" style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.12))' }} />
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(212,175,55,0.5)' }} />
              <div className="flex-1" style={{ height: '1px', background: 'linear-gradient(to left, transparent, rgba(0,0,0,0.12))' }} />
            </div>

            {/* Meet Host Section */}
            <section>
              <h2 className="text-4xl font-light mb-8">Meet {host.hostName}</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Picture */}
                {host.profilePhotoUrl && (
                  <div className="lg:col-span-1">
                    <div className="rounded-2xl overflow-hidden shadow-md" style={{ aspectRatio: '4/5' }}>
                      <img
                        src={getProxiedImageUrl(host.profilePhotoUrl)}
                        alt={host.hostName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
                {/* Bio and Info Sub-sections */}
                <div className={host.profilePhotoUrl ? "lg:col-span-2" : "lg:col-span-3"}>
                  <div className="space-y-6">

                    {/* About Me */}
                    {host.bio && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <BookOpen size={18} style={{ color: '#b8962e' }} /> About Me
                        </h3>
                        <div className="text-muted-foreground leading-relaxed space-y-2">
                          {host.bio.split(/\n+/).map((para, i) => (
                            para.trim() ? <p key={i}>{para.trim()}</p> : null
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Travel Experience */}
                    {host.overseasExperience && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Compass size={18} style={{ color: '#b8962e' }} /> Travel Experience
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">{host.overseasExperience}</p>
                      </div>
                    )}

                    {/* Languages */}
                    {host.languages && host.languages.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Globe size={18} style={{ color: '#b8962e' }} /> Languages
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {(host.languages as string[]).map((lang) => (
                            <Badge key={lang} variant="secondary" className="text-sm">{lang}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Household Info */}
                    {((host.householdFeatures && (host.householdFeatures as string[]).length > 0) || host.petDetails) && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Users size={18} style={{ color: '#b8962e' }} /> Household
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                          {(host.householdFeatures as string[] || []).map((feature) => (
                            <Badge key={feature} variant="outline" className="text-sm">
                              {HOUSEHOLD_FEATURE_LABELS[feature] || feature}
                            </Badge>
                          ))}
                          {host.petDetails && (
                            <span className="text-muted-foreground text-sm">🐾 {host.petDetails}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Activities */}
                    {host.activities && host.activities.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Sparkles size={18} style={{ color: '#b8962e' }} /> Activities
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {host.activities.map((activity) => (
                            <Badge key={activity} variant="secondary">
                              {(ACTIVITY_LABELS[activity] || activity)
                                .replace(/-/g, ' ')
                                .replace(/\b\w/g, (c: string) => c.toUpperCase())}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            </section>


          </div>

          {/* RIGHT COLUMN: Booking Widget (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-2xl overflow-hidden shadow-2xl" style={{ background: 'linear-gradient(160deg, #1a1a1a 0%, #111111 100%)', border: '1px solid rgba(212,175,55,0.25)' }}>
              {/* Widget Header */}
              <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-xs tracking-[0.2em] uppercase mb-1" style={{ color: '#d4af37' }}>Home Dining</p>
                    <h3 className="text-2xl font-bold text-white">Reserve a Seat</h3>
                  </div>
                  <div className="text-right">
                    {host.discountPercentage && host.discountPercentage > 0 ? (
                      <>
                        <p className="text-xs line-through" style={{ color: 'rgba(255,255,255,0.35)' }}>¥{host.pricePerPerson}</p>
                        <p className="text-2xl font-bold" style={{ color: '#d4af37' }}>¥{discountedPrice}</p>
                      </>
                    ) : (
                      <p className="text-2xl font-bold" style={{ color: '#d4af37' }}>¥{discountedPrice}</p>
                    )}
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>per person</p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5">
                {bookingSuccess ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.4)' }}>
                      <CheckCircle className="h-8 w-8" style={{ color: '#d4af37' }} />
                    </div>
                    <h4 className="font-semibold text-white mb-1">Booking Confirmed!</h4>
                    <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.45)' }}>Booking ID: {createdBookingId}</p>
                    <button
                      onClick={() => {
                        setBookingSuccess(false);
                        setCreatedBookingId(null);
                        setBookingData({ guestName: "", guestEmail: "", requestedDate: "", mealType: "dinner", numberOfGuests: "1", specialRequests: "" });
                      }}
                      className="w-full py-2.5 rounded-lg text-sm font-medium transition-all"
                      style={{ border: '1px solid rgba(212,175,55,0.4)', color: '#d4af37', background: 'transparent' }}
                    >
                      Make Another Booking
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-xs tracking-widest uppercase mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Your Name *</label>
                      <input
                        value={bookingData.guestName}
                        onChange={(e) => setBookingData({ ...bookingData, guestName: e.target.value })}
                        placeholder="Full name"
                        className="w-full px-3.5 py-2.5 rounded-lg text-sm text-white placeholder-white/25 outline-none transition-all focus:ring-1"
                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', focusRingColor: '#d4af37' }}
                        onFocus={e => (e.target.style.borderColor = 'rgba(212,175,55,0.6)')}
                        onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs tracking-widest uppercase mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Email Address *</label>
                      <input
                        type="email"
                        value={bookingData.guestEmail}
                        onChange={(e) => setBookingData({ ...bookingData, guestEmail: e.target.value })}
                        placeholder="your@email.com"
                        className="w-full px-3.5 py-2.5 rounded-lg text-sm text-white placeholder-white/25 outline-none transition-all"
                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                        onFocus={e => (e.target.style.borderColor = 'rgba(212,175,55,0.6)')}
                        onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
                      />
                    </div>

                    {/* Date + Meal Type side by side */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs tracking-widest uppercase mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Date *</label>
                        <button
                          onClick={() => setShowCalendar(!showCalendar)}
                          className="w-full px-3 py-2.5 rounded-lg text-sm text-left transition-all flex items-center gap-2"
                          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: bookingData.requestedDate ? 'white' : 'rgba(255,255,255,0.3)' }}
                        >
                          <Calendar size={14} style={{ color: '#d4af37', flexShrink: 0 }} />
                          <span className="truncate text-xs">
                            {bookingData.requestedDate
                              ? new Date(bookingData.requestedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
                              : "Pick date"}
                          </span>
                        </button>
                      </div>
                      <div>
                        <label className="block text-xs tracking-widest uppercase mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Meal</label>
                        <Select value={bookingData.mealType} onValueChange={(value) => setBookingData({ ...bookingData, mealType: value })}>
                          <SelectTrigger
                            className="w-full px-3 py-2.5 rounded-lg text-sm text-white h-auto"
                            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {bookingData.requestedDate ? (
                              (() => {
                                const date = new Date(bookingData.requestedDate + 'T00:00:00');
                                const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                                const mealTypes = sortedAvailability[dayName] || [];
                                return mealTypes.length > 0 ? (
                                  mealTypes.map((meal) => {
                                    const slotKey = `${bookingData.requestedDate}:${meal}`;
                                    const isBooked = bookedSlotKeys.has(slotKey);
                                    return (
                                      <SelectItem key={meal} value={meal} disabled={isBooked}>
                                        {meal.charAt(0).toUpperCase() + meal.slice(1)}{isBooked ? ' — Fully Booked' : ''}
                                      </SelectItem>
                                    );
                                  })
                                ) : (
                                  <div className="p-2 text-sm text-muted-foreground">No meals</div>
                                );
                              })()
                            ) : (
                              <div className="p-2 text-sm text-muted-foreground">Select date first</div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Calendar dropdown */}
                    {showCalendar && (
                      <div className="rounded-xl overflow-hidden z-50" style={{ border: '1px solid rgba(212,175,55,0.25)', background: '#1e1e1e' }}>
                        <DateGridCalendar
                          disabledDates={disabledDates}
                          availability={host.availability}
                          onDateSelect={(date) => {
                            setBookingData({ ...bookingData, requestedDate: date });
                            setShowCalendar(false);
                          }}
                          selectedDate={bookingData.requestedDate}
                        />
                      </div>
                    )}

                    {/* Guests */}
                    <div>
                      <label className="block text-xs tracking-widest uppercase mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Guests * <span style={{ color: 'rgba(255,255,255,0.3)', textTransform: 'none', letterSpacing: 0 }}>(max {host.maxGuests})</span></label>
                      <div className="flex items-center gap-0 rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.07)' }}>
                        <button
                          onClick={() => setBookingData({ ...bookingData, numberOfGuests: String(Math.max(1, parseInt(bookingData.numberOfGuests) - 1)) })}
                          className="px-4 py-2.5 text-white text-lg font-light transition-colors hover:bg-white/10"
                        >−</button>
                        <span className="flex-1 text-center text-sm font-medium text-white">{bookingData.numberOfGuests}</span>
                        <button
                          onClick={() => setBookingData({ ...bookingData, numberOfGuests: String(Math.min(host.maxGuests, parseInt(bookingData.numberOfGuests) + 1)) })}
                          className="px-4 py-2.5 text-white text-lg font-light transition-colors hover:bg-white/10"
                        >+</button>
                      </div>
                    </div>

                    {/* Special Requests */}
                    <div>
                      <label className="block text-xs tracking-widest uppercase mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Special Requests</label>
                      <textarea
                        value={bookingData.specialRequests}
                        onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                        placeholder="Dietary restrictions, allergies…"
                        rows={2}
                        className="w-full px-3.5 py-2.5 rounded-lg text-sm text-white placeholder-white/25 outline-none resize-none transition-all"
                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                        onFocus={e => (e.target.style.borderColor = 'rgba(212,175,55,0.6)')}
                        onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
                      />
                    </div>

                    {/* Price Summary */}
                    <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
                      <div className="flex justify-between items-center">
                        <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                          ¥{discountedPrice} × {bookingData.numberOfGuests} {parseInt(bookingData.numberOfGuests) === 1 ? 'guest' : 'guests'}
                        </span>
                        <span className="text-lg font-bold" style={{ color: '#d4af37' }}>
                          ¥{discountedPrice * parseInt(bookingData.numberOfGuests)}
                        </span>
                      </div>
                    </div>

                    {/* Free Cancellation */}
                    <div className="flex items-center gap-2.5">
                      <CheckCircle size={15} style={{ color: '#4ade80', flexShrink: 0 }} />
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        Free cancellation up to 7 days before your experience
                      </p>
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={() => {
                        if (!bookingData.guestName || !bookingData.guestEmail || !bookingData.requestedDate) {
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
                      className="w-full py-3.5 rounded-xl text-sm font-semibold tracking-widest uppercase transition-all disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)', color: '#111111' }}
                    >
                      {createBookingMutation.isPending ? "Reserving…" : "Reserve a Seat"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Events Section — shown below booking widget for hosts with events */}
            {hostId && <HostEventSection hostListingId={hostId} />}

          </div>
        </div>
      </main>

      {/* MOBILE FLOATING BOOKING BUTTON */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden z-40 p-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 100%)' }}>
        <button
          onClick={() => setShowMobileBooking(true)}
          className="w-full py-3.5 rounded-xl text-sm font-semibold tracking-widest uppercase transition-all"
          style={{ background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)', color: '#111111' }}
        >
          Reserve a Seat — ¥{discountedPrice}/person
        </button>
      </div>

      {/* MOBILE BOOKING MODAL */}
      {showMobileBooking && (
        <div className="fixed inset-0 lg:hidden z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-h-[92vh] overflow-y-auto rounded-t-2xl" style={{ background: 'linear-gradient(160deg, #1a1a1a 0%, #111111 100%)', border: '1px solid rgba(212,175,55,0.2)' }}>
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
            </div>
            {/* Header */}
            <div className="px-6 pt-3 pb-4 flex justify-between items-start" style={{ borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
              <div>
                <p className="text-xs tracking-[0.2em] uppercase mb-0.5" style={{ color: '#d4af37' }}>Home Dining</p>
                <h3 className="text-xl font-bold text-white">Reserve a Seat</h3>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-right">
                  <p className="text-xl font-bold" style={{ color: '#d4af37' }}>¥{discountedPrice}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>per person</p>
                </div>
                <button onClick={() => setShowMobileBooking(false)} className="mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <X size={22} />
                </button>
              </div>
            </div>

            <div className="px-6 py-5 pb-28">
              {bookingSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.4)' }}>
                    <CheckCircle className="h-8 w-8" style={{ color: '#d4af37' }} />
                  </div>
                  <h4 className="font-semibold text-white mb-1">Booking Confirmed!</h4>
                  <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.45)' }}>Booking ID: {createdBookingId}</p>
                  <button
                    onClick={() => { setBookingSuccess(false); setCreatedBookingId(null); setShowMobileBooking(false); }}
                    className="w-full py-2.5 rounded-lg text-sm font-medium"
                    style={{ border: '1px solid rgba(212,175,55,0.4)', color: '#d4af37', background: 'transparent' }}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs tracking-widest uppercase mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Your Name *</label>
                    <input
                      value={bookingData.guestName}
                      onChange={(e) => setBookingData({ ...bookingData, guestName: e.target.value })}
                      placeholder="Full name"
                      className="w-full px-3.5 py-2.5 rounded-lg text-sm text-white placeholder-white/25 outline-none"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                      onFocus={e => (e.target.style.borderColor = 'rgba(212,175,55,0.6)')}
                      onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest uppercase mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Email Address *</label>
                    <input
                      type="email"
                      value={bookingData.guestEmail}
                      onChange={(e) => setBookingData({ ...bookingData, guestEmail: e.target.value })}
                      placeholder="your@email.com"
                      className="w-full px-3.5 py-2.5 rounded-lg text-sm text-white placeholder-white/25 outline-none"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                      onFocus={e => (e.target.style.borderColor = 'rgba(212,175,55,0.6)')}
                      onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs tracking-widest uppercase mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Date *</label>
                      <button
                        onClick={() => setShowCalendar(!showCalendar)}
                        className="w-full px-3 py-2.5 rounded-lg text-xs text-left flex items-center gap-1.5"
                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: bookingData.requestedDate ? 'white' : 'rgba(255,255,255,0.3)' }}
                      >
                        <Calendar size={13} style={{ color: '#d4af37', flexShrink: 0 }} />
                        <span className="truncate">
                          {bookingData.requestedDate
                            ? new Date(bookingData.requestedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
                            : "Pick date"}
                        </span>
                      </button>
                    </div>
                    <div>
                      <label className="block text-xs tracking-widest uppercase mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Meal</label>
                      <Select value={bookingData.mealType} onValueChange={(value) => setBookingData({ ...bookingData, mealType: value })}>
                        <SelectTrigger className="w-full px-3 py-2.5 rounded-lg text-sm text-white h-auto" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {bookingData.requestedDate ? (
                            (() => {
                              const date = new Date(bookingData.requestedDate + 'T00:00:00');
                              const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                              const mealTypes = sortedAvailability[dayName] || [];
                              return mealTypes.length > 0 ? (
                                mealTypes.map((meal) => {
                                  const slotKey = `${bookingData.requestedDate}:${meal}`;
                                  const isBooked = bookedSlotKeys.has(slotKey);
                                  return (
                                    <SelectItem key={meal} value={meal} disabled={isBooked}>
                                      {meal.charAt(0).toUpperCase() + meal.slice(1)}{isBooked ? ' — Fully Booked' : ''}
                                    </SelectItem>
                                  );
                                })
                              ) : (<div className="p-2 text-sm text-muted-foreground">No meals</div>);
                            })()
                          ) : (<div className="p-2 text-sm text-muted-foreground">Select date first</div>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {showCalendar && (
                    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(212,175,55,0.25)', background: '#1e1e1e' }}>
                      <DateGridCalendar
                        disabledDates={disabledDates}
                        availability={host.availability}
                        onDateSelect={(date) => { setBookingData({ ...bookingData, requestedDate: date }); setShowCalendar(false); }}
                        selectedDate={bookingData.requestedDate}
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs tracking-widest uppercase mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Guests * <span style={{ color: 'rgba(255,255,255,0.3)', textTransform: 'none', letterSpacing: 0 }}>(max {host.maxGuests})</span></label>
                    <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.07)' }}>
                      <button onClick={() => setBookingData({ ...bookingData, numberOfGuests: String(Math.max(1, parseInt(bookingData.numberOfGuests) - 1)) })} className="px-4 py-2.5 text-white text-lg font-light hover:bg-white/10">−</button>
                      <span className="flex-1 text-center text-sm font-medium text-white">{bookingData.numberOfGuests}</span>
                      <button onClick={() => setBookingData({ ...bookingData, numberOfGuests: String(Math.min(host.maxGuests, parseInt(bookingData.numberOfGuests) + 1)) })} className="px-4 py-2.5 text-white text-lg font-light hover:bg-white/10">+</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest uppercase mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Special Requests</label>
                    <textarea
                      value={bookingData.specialRequests}
                      onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                      placeholder="Dietary restrictions, allergies…"
                      rows={2}
                      className="w-full px-3.5 py-2.5 rounded-lg text-sm text-white placeholder-white/25 outline-none resize-none"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                      onFocus={e => (e.target.style.borderColor = 'rgba(212,175,55,0.6)')}
                      onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
                    />
                  </div>
                  <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
                    <div className="flex justify-between items-center">
                      <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>¥{discountedPrice} × {bookingData.numberOfGuests} {parseInt(bookingData.numberOfGuests) === 1 ? 'guest' : 'guests'}</span>
                      <span className="text-lg font-bold" style={{ color: '#d4af37' }}>¥{discountedPrice * parseInt(bookingData.numberOfGuests)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle size={15} style={{ color: '#4ade80', flexShrink: 0 }} />
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Free cancellation up to 7 days before your experience</p>
                  </div>
                  <button
                    onClick={() => {
                      if (!bookingData.guestName || !bookingData.guestEmail || !bookingData.requestedDate) {
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
                    className="w-full py-3.5 rounded-xl text-sm font-semibold tracking-widest uppercase transition-all disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)', color: '#111111' }}
                  >
                    {createBookingMutation.isPending ? "Reserving…" : "Reserve a Seat"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

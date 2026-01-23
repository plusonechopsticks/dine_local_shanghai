import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { ChopsticksLogo } from "@/components/ChopsticksLogo";
import {
  MapPin,
  Filter,
  X,
  Loader2,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const DAYS_OF_WEEK = [
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
  { id: "sunday", label: "Sunday" },
];

const SHANGHAI_DISTRICTS = [
  "All Districts",
  "Huangpu",
  "Xuhui",
  "Changning",
  "Jing'an",
  "Putuo",
  "Hongkou",
  "Yangpu",
  "Pudong",
  "Minhang",
  "Baoshan",
  "Jiading",
  "Jinshan",
  "Songjiang",
  "Qingpu",
  "Fengxian",
  "Chongming",
];

export default function HostListings() {
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter state
  const [selectedDistrict, setSelectedDistrict] = useState("All Districts");
  const [selectedDay, setSelectedDay] = useState("any");
  const [selectedMealType, setSelectedMealType] = useState("any");
  const [minGuests, setMinGuests] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const { data: hosts, isLoading } = trpc.host.listApproved.useQuery();

  // Filter logic
  const filteredHosts = useMemo(() => {
    if (!hosts) return [];

    return hosts.filter(host => {
      // District filter
      if (selectedDistrict !== "All Districts" && host.district !== selectedDistrict) {
        return false;
      }

      // Availability filter
      if (selectedDay !== "any" && selectedMealType !== "any") {
        const availability = host.availability as Record<string, string[]>;
        const dayAvailability = availability[selectedDay];
        if (!dayAvailability || !dayAvailability.includes(selectedMealType)) {
          return false;
        }
      }

      // Guest filter
      if (minGuests && host.maxGuests < parseInt(minGuests)) {
        return false;
      }

      // Price filter
      if (maxPrice && host.pricePerPerson > parseInt(maxPrice)) {
        return false;
      }

      return true;
    });
  }, [hosts, selectedDistrict, selectedDay, selectedMealType, minGuests, maxPrice]);

  const clearFilters = () => {
    setSelectedDistrict("All Districts");
    setSelectedDay("any");
    setSelectedMealType("any");
    setMinGuests("");
    setMaxPrice("");
  };

  const hasActiveFilters = 
    selectedDistrict !== "All Districts" ||
    selectedDay !== "any" ||
    selectedMealType !== "any" ||
    minGuests !== "" ||
    maxPrice !== "";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2">
            <ChopsticksLogo className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg" style={{ fontFamily: "var(--font-serif)" }}>
              +1 Chopsticks
            </span>
          </a>
          <nav className="hidden md:flex items-center gap-6">
            <a href="/#experience" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Experience
            </a>
            <a href="/#benefits" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Benefits
            </a>
            <a href="/#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
            <a href="/hosts" className="text-sm font-medium text-foreground">
              Find Hosts
            </a>
          </nav>
          <a href="/host-register">
            <Button size="sm" className="hidden md:inline-flex">
              Become a Host
            </Button>
          </a>
        </div>
      </header>

      <main className="container py-6 md:py-8">
        {/* Compact Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold mb-2">
            Host Families in Shanghai
          </h1>
          <p className="text-muted-foreground">
            {filteredHosts?.length || 0} {filteredHosts?.length === 1 ? "home" : "homes"}
          </p>
        </div>

        {/* Filter Bar */}
        <div className="mb-6 flex flex-wrap gap-3">
          <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
            <SelectTrigger className="w-[140px] h-10">
              <SelectValue placeholder="District" />
            </SelectTrigger>
            <SelectContent>
              {SHANGHAI_DISTRICTS.map(district => (
                <SelectItem key={district} value={district}>
                  {district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDay} onValueChange={setSelectedDay}>
            <SelectTrigger className="w-[140px] h-10">
              <SelectValue placeholder="Any day" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any day</SelectItem>
              {DAYS_OF_WEEK.map(day => (
                <SelectItem key={day.id} value={day.id}>
                  {day.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedMealType} onValueChange={setSelectedMealType}>
            <SelectTrigger className="w-[140px] h-10">
              <SelectValue placeholder="Meal type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any meal</SelectItem>
              <SelectItem value="lunch">Lunch</SelectItem>
              <SelectItem value="dinner">Dinner</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="number"
            placeholder="Min guests"
            value={minGuests}
            onChange={(e) => setMinGuests(e.target.value)}
            className="w-[120px] h-10"
          />

          <Input
            type="number"
            placeholder="Max price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-[120px] h-10"
          />

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-10 gap-1"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredHosts && filteredHosts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground mb-2">No hosts found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredHosts?.map(host => (
              <HostCard key={host.id} host={host} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function HostCard({ host }: { host: any }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const foodPhotos = host.foodPhotoUrls as string[];
  const availability = host.availability as Record<string, string[]>;
  const availableDays = Object.keys(availability);

  const images = [
    host.profilePhotoUrl,
    ...(foodPhotos || []),
  ].filter(Boolean);

  const nextImage = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.preventDefault();
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
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      nextImage();
    }
    if (isRightSwipe) {
      prevImage();
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <div className="group cursor-pointer">
      {/* Image Container */}
      <div 
        className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-secondary"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {images.length > 0 ? (
          <>
            <img
              src={images[currentImageIndex]}
              alt={host.hostName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Badge Overlay */}
            {host.cuisineStyle && (
              <Badge className="absolute top-3 left-3 bg-background/90 text-foreground border-0 shadow-md">
                {host.cuisineStyle}
              </Badge>
            )}

            {/* Heart Icon */}
            <button
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-background/80 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                // TODO: Add to favorites
              }}
            >
              <Heart className="h-5 w-5 stroke-2 text-foreground/80 hover:fill-primary hover:text-primary transition-colors" />
            </button>

            {/* Image Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                {/* Dot Indicators */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 rounded-full transition-all ${
                        index === currentImageIndex
                          ? "w-4 bg-background"
                          : "w-1.5 bg-background/60"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-4xl text-muted-foreground">
              {host.hostName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Info Below Image */}
      <div className="space-y-1">
        {/* Location & Title */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate">
              {host.hostName}
            </h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{host.district}</span>
            </p>
          </div>
        </div>

        {/* Availability */}
        <p className="text-sm text-muted-foreground">
          {availableDays.length} {availableDays.length === 1 ? "day" : "days"} available
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span className="font-semibold text-base underline decoration-2">
            ¥{host.pricePerPerson}
          </span>
          <span className="text-sm text-muted-foreground">per person</span>
        </div>
      </div>
    </div>
  );
}

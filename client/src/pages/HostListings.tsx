"use client";

import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { ChopsticksLogo } from "@/components/ChopsticksLogo";
import { getProxiedImageUrl } from "@/lib/imageUtils";
import {
  MapPin,
  Filter,
  X,
  Loader2,
  Heart,
  ChevronLeft,
  ChevronRight,
  Star,
  Eye,
  Tag,
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

  const { data: listings, isLoading, refetch } = trpc.host.listApproved.useQuery();

  // Auto-refresh view counts every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  // Filter logic
  const filteredHosts = useMemo(() => {
    if (!listings) return [];

    // First filter, then sort by displayOrder (lower = higher priority)
    const filtered = listings.filter(host => {
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

    // Sort by displayOrder (lower number = higher priority), then by creation date
    return filtered.sort((a, b) => {
      if (a.displayOrder !== b.displayOrder) {
        return a.displayOrder - b.displayOrder;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [listings, selectedDistrict, selectedDay, selectedMealType, minGuests, maxPrice]);

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

  const { data: announcement } = trpc.announcement.get.useQuery();

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6 md:py-8">
        {/* Announcement Banner */}
        {announcement && announcement.isActive && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-amber-900 dark:text-amber-100 text-center font-medium whitespace-pre-line">
              {announcement.content}
            </p>
          </div>
        )}
        {/* Compact Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Host Families in Shanghai
          </h1>
          <p className="text-muted-foreground text-lg">
            Experience authentic Shanghai cuisine with local families
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6 items-end">
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block">
              District
            </Label>
            <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
              <SelectTrigger className="w-[140px] h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SHANGHAI_DISTRICTS.map(district => (
                  <SelectItem key={district} value={district}>
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block">
              Day
            </Label>
            <Select value={selectedDay} onValueChange={setSelectedDay}>
              <SelectTrigger className="w-[120px] h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Day</SelectItem>
                {DAYS_OF_WEEK.map(day => (
                  <SelectItem key={day.id} value={day.id}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block">
              Meal Type
            </Label>
            <Select value={selectedMealType} onValueChange={setSelectedMealType}>
              <SelectTrigger className="w-[120px] h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Meal</SelectItem>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
      </div>
    </div>
  );
}

function HostCard({ host }: { host: any }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const foodPhotos = host.foodPhotoUrls as string[];

  // Use food photos first, then profile photo as fallback
  const images = [
    ...(foodPhotos || []),
    host.profilePhotoUrl,
  ].filter(Boolean).map(url => getProxiedImageUrl(url));

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
    <Link href={`/hosts/${host.id}`}>
      <a className="group cursor-pointer block">
        {/* Image Container with Overlay */}
        <div 
          className="relative aspect-square rounded-2xl overflow-hidden bg-secondary shadow-lg hover:shadow-xl transition-shadow"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {images.length > 0 ? (
            <>
              <img
                src={images[currentImageIndex]}
                alt={host.hostName}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              


              {/* Limited Time Offer Badge - Top Left */}
              {host.discountPercentage && host.discountPercentage > 0 && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white border-0 shadow-lg flex items-center gap-1 px-3 py-1">
                  <Tag className="h-3 w-3" />
                  Limited Time Offer
                </Badge>
              )}
              
              {/* Cuisine Badge - Top Left (below discount if present) */}
              {host.cuisineStyle && (
                <Badge className={`absolute left-4 bg-white/20 text-white border-0 backdrop-blur-sm ${
                  host.discountPercentage && host.discountPercentage > 0 ? 'top-14' : 'top-4'
                }`}>
                  {host.cuisineStyle}
                </Badge>
              )}
              
              {/* View Count - Top Left Below Cuisine */}
              {host.viewCount !== undefined && (
                <div className={`absolute left-4 flex items-center gap-1 px-2 py-1 rounded-full bg-white/20 text-white border-0 backdrop-blur-sm text-xs ${
                  host.discountPercentage && host.discountPercentage > 0 
                    ? (host.cuisineStyle ? 'top-24' : 'top-14')
                    : (host.cuisineStyle ? 'top-14' : 'top-4')
                }`}>
                  <Eye className="h-3 w-3" />
                  <span>{host.viewCount}</span>
                </div>
              )}

              {/* Heart Icon - Top Right */}
              <button
                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Add to favorites
                }}
              >
                <Heart className="h-5 w-5 stroke-2 text-white hover:fill-white transition-colors" />
              </button>

              {/* Bottom Content - Host Info & Price */}
              <div className="absolute inset-x-0 bottom-0 p-4 flex items-end justify-between">
                {/* Left: Host Avatar & Name */}
                <div className="flex items-end gap-3 flex-1 min-w-0">
                  {host.profilePhotoUrl && (
                    <img
                      src={getProxiedImageUrl(host.profilePhotoUrl)}
                      alt={host.hostName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white flex-shrink-0"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-semibold text-sm truncate">{host.hostName}</p>
                    <p className="text-white/80 text-xs truncate">{host.district}</p>
                  </div>
                </div>

                {/* Right: Price */}
                <div className="text-right ml-2 flex-shrink-0">
                  {host.discountPercentage && host.discountPercentage > 0 ? (
                    <>
                      <div className="flex items-center gap-2 justify-end">
                        <p className="text-white/70 line-through text-sm">¥{host.pricePerPerson}</p>
                        <Badge className="bg-red-500 text-white border-0 text-xs px-1.5 py-0">
                          -{host.discountPercentage}%
                        </Badge>
                      </div>
                      <p className="text-white font-bold text-xl">¥{Math.round(host.pricePerPerson * (1 - host.discountPercentage / 100))}</p>
                      <p className="text-white/80 text-xs">/person</p>
                    </>
                  ) : (
                    <>
                      <p className="text-white font-bold text-lg">¥{host.pricePerPerson}</p>
                      <p className="text-white/80 text-xs">/person</p>
                    </>
                  )}
                </div>
              </div>

              {/* Image Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/30"
                  >
                    <ChevronLeft className="h-5 w-5 text-white" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/30"
                  >
                    <ChevronRight className="h-5 w-5 text-white" />
                  </button>

                  {/* Dot Indicators */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1">
                    {images.map((_, index) => (
                      <div
                        key={index}
                        className={`h-1.5 rounded-full transition-all ${
                          index === currentImageIndex
                            ? "w-4 bg-white"
                            : "w-1.5 bg-white/60"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/20 to-primary/10">
              <span className="text-6xl font-bold text-primary/40">
                {host.hostName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </a>
    </Link>
  );
}

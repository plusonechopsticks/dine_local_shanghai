import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { ChopsticksLogo } from "@/components/ChopsticksLogo";
import {
  MapPin,
  Users,
  Calendar,
  ChefHat,
  DollarSign,
  Filter,
  X,
  Loader2,
  Heart,
  Languages,
  Clock,
  Baby,
  Dog,
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
        const dayAvailability = availability[selectedDay] || [];
        if (!dayAvailability.includes(selectedMealType)) {
          return false;
        }
      } else if (selectedDay !== "any") {
        const availability = host.availability as Record<string, string[]>;
        if (!availability[selectedDay] || availability[selectedDay].length === 0) {
          return false;
        }
      }

      // Max guests filter
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
          <a href="/#contact">
            <Button size="sm" className="hidden md:inline-flex">
              Join Waitlist
            </Button>
          </a>
        </div>
      </header>

      <main className="container py-8 md:py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3" style={{ fontFamily: "var(--font-serif)" }}>
            Find Your Host Family
          </h1>
          <p className="text-lg text-muted-foreground">
            Browse our curated selection of welcoming families ready to share authentic home-cooked meals
          </p>
        </div>

        {/* Filter Toggle (Mobile) */}
        <div className="md:hidden mb-4">
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-auto">
                Active
              </Badge>
            )}
          </Button>
        </div>

        <div className="grid md:grid-cols-[280px_1fr] gap-8">
          {/* Filter Panel */}
          <aside className={`${showFilters ? "block" : "hidden md:block"}`}>
            <Card className="sticky top-20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                  </CardTitle>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear all
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* District Filter */}
                <div>
                  <Label className="mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    District
                  </Label>
                  <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                    <SelectTrigger>
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

                <Separator />

                {/* Availability Filter */}
                <div>
                  <Label className="mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Availability
                  </Label>
                  <div className="space-y-3">
                    <Select value={selectedDay} onValueChange={setSelectedDay}>
                      <SelectTrigger>
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
                      <SelectTrigger>
                        <SelectValue placeholder="Any meal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any meal</SelectItem>
                        <SelectItem value="lunch">Lunch</SelectItem>
                        <SelectItem value="dinner">Dinner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Guests Filter */}
                <div>
                  <Label htmlFor="minGuests" className="mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Minimum Guests Capacity
                  </Label>
                  <Input
                    id="minGuests"
                    type="number"
                    min="1"
                    max="20"
                    value={minGuests}
                    onChange={(e) => setMinGuests(e.target.value)}
                    placeholder="e.g., 2"
                  />
                </div>

                <Separator />

                {/* Price Filter */}
                <div>
                  <Label htmlFor="maxPrice" className="mb-2 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Max Price (¥/person)
                  </Label>
                  <Input
                    id="maxPrice"
                    type="number"
                    min="0"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="e.g., 150"
                  />
                </div>

                {/* Future filters placeholder */}
                <div className="pt-4 border-t border-dashed border-border">
                  <p className="text-xs text-muted-foreground italic">
                    More filters coming soon: dietary options, languages, ratings, and more
                  </p>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Listings Grid */}
          <div>
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredHosts.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hosts found</h3>
                  <p className="text-muted-foreground mb-4">
                    {hasActiveFilters
                      ? "Try adjusting your filters to see more results"
                      : "No approved hosts available yet. Check back soon!"}
                  </p>
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    {filteredHosts.length} {filteredHosts.length === 1 ? "host" : "hosts"} available
                  </p>
                </div>
                <div className="grid gap-6">
                  {filteredHosts.map(host => (
                    <HostCard key={host.id} host={host} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function HostCard({ host }: { host: any }) {
  const availability = host.availability as Record<string, string[]>;
  const availableDays = Object.keys(availability);
  const foodPhotos = host.foodPhotoUrls as string[];
  const languages = host.languages as string[];
  const dietaryAccommodations = host.dietaryAccommodations as string[] | null;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="grid md:grid-cols-[300px_1fr] gap-0">
        {/* Image Gallery */}
        <div className="relative aspect-[4/3] md:aspect-auto bg-secondary">
          {foodPhotos && foodPhotos.length > 0 ? (
            <div className="grid grid-cols-2 gap-1 h-full">
              <img
                src={foodPhotos[0]}
                alt="Food 1"
                className="w-full h-full object-cover col-span-2"
              />
              {foodPhotos[1] && (
                <img
                  src={foodPhotos[1]}
                  alt="Food 2"
                  className="w-full h-full object-cover"
                />
              )}
              {foodPhotos[2] && (
                <img
                  src={foodPhotos[2]}
                  alt="Food 3"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <ChefHat className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <Button
            size="icon"
            variant="secondary"
            className="absolute top-3 right-3 rounded-full shadow-md"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {host.profilePhotoUrl ? (
                <img
                  src={host.profilePhotoUrl}
                  alt={host.hostName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary">
                    {host.hostName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg" style={{ fontFamily: "var(--font-serif)" }}>
                  {host.hostName}
                </h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {host.district}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">¥{host.pricePerPerson}</div>
              <div className="text-xs text-muted-foreground">per person</div>
            </div>
          </div>

          {/* Cuisine & Bio */}
          <div className="mb-4">
            <Badge variant="secondary" className="mb-2">
              <ChefHat className="h-3 w-3 mr-1" />
              {host.cuisineStyle}
            </Badge>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {host.bio}
            </p>
          </div>

          {/* Menu Description */}
          <div className="mb-4">
            <p className="text-sm line-clamp-2">
              {host.menuDescription}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Up to {host.maxGuests} guests</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{Math.round(host.mealDurationMinutes / 60)}h meal</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Languages className="h-4 w-4" />
              <span>{languages.slice(0, 2).join(", ")}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{availableDays.length} days available</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {host.kidsFriendly && (
              <Badge variant="outline" className="text-xs">
                <Baby className="h-3 w-3 mr-1" />
                Kids Friendly
              </Badge>
            )}
            {host.hasPets && (
              <Badge variant="outline" className="text-xs">
                <Dog className="h-3 w-3 mr-1" />
                Has Pets
              </Badge>
            )}
            {dietaryAccommodations && dietaryAccommodations.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {dietaryAccommodations[0]}
              </Badge>
            )}
          </div>

          {/* CTA */}
          <div className="flex gap-2">
            <Button className="flex-1">
              Request Booking
            </Button>
            <Button variant="outline">
              View Profile
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

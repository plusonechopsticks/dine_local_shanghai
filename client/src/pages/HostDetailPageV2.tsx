import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";

// Placeholder component for loading state
function HostDetailSkeleton() {
  return (
    <div className="bg-[#faf8f3] text-[#1a1410]">
      <div className="h-screen bg-gray-300 animate-pulse" />
    </div>
  );
}

// Mock data fallback
const MOCK_HOST = {
  id: 1,
  hostName: "Norika & Steven",
  profilePhotoUrl: "https://res.cloudinary.com/drxfcfayd/image/upload/v1769881900/host-images/norika_steven.jpg",
  languages: ["Mandarin", "English", "Cantonese"],
  bio: "We are avid travelers who have been to more than 60 countries and just set our feet on all seven continents on earth! (Antarctica is a great honeymoon location.) We love hosting friends and having nice chats over Chinese dinner. Cultural exchange is what we've been doing throughout our lives.",
  overseasExperience: "Steven was born and raised in Hong Kong. He has lived abroad in the US, Europe, Africa, and Latin America, working in multi-cultural environments with colleagues from 50+ nationalities.",
  funFacts: "Norika is a renowned jazz pianist in China. She's a creative cook who loves discussing and sharing culinary techniques with guests. She was born in Tianjin and brings Northern Chinese flavors to the table.",
  whyHost: "We want to share our passion for food and culture with guests from around the world.",
  culturalPassions: "We are passionate about geography and exploring different cultures through food.",
  otherPassions: "Besides food, we love sports, reading, and connecting with people from different backgrounds.",
  cuisineStyle: "Northern-Southern Fusion",
  menuDescription: "A Northern-Southern fusion celebrating Jiā Cháng Cài (home-style cooking)—the heart and soul of Chinese dining. Unlike restaurant food, these dishes are designed for comfort and balance.",
  foodPhotoUrls: [
    "https://res.cloudinary.com/drxfcfayd/image/upload/v1769881900/food-images/dish1.jpg",
    "https://res.cloudinary.com/drxfcfayd/image/upload/v1769881900/food-images/dish2.jpg",
    "https://res.cloudinary.com/drxfcfayd/image/upload/v1769881900/food-images/dish3.jpg",
  ],
  introVideoUrl: "https://example.com/video.mp4",
  dietaryNote: "Can accommodate vegetarian, vegan, gluten-free. Not suitable for shellfish allergy.",
  mealDurationMinutes: 180,
  pricePerPerson: 250,
  maxGuests: 4,
  district: "Songjiang",
  kidsFriendly: true,
  hasPets: true,
  petDetails: "Two friendly cats",
  discountPercentage: 0,
};

export default function HostDetailPageV2() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/hosts/:id/v2");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expandedMenuCategories, setExpandedMenuCategories] = useState<Record<string, boolean>>({
    "to-start": false,
    "main": false,
    "finish": false,
  });
  const [bookingData, setBookingData] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    requestedDate: "",
    mealType: "dinner" as "lunch" | "dinner",
    numberOfGuests: 1,
    specialRequests: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [widgetState, setWidgetState] = useState<"peeking" | "visible-top" | "hidden">("hidden");


  const hostListingId = params?.id ? parseInt(params.id) : 1;

  // Fetch real host data from database
  const { data: hostData, isLoading, error } = trpc.hostListing.getById.useQuery(
    { id: hostListingId },
    { enabled: !!hostListingId }
  );

  // Use real data if available, otherwise fall back to mock
  const host = hostData || MOCK_HOST;

  // Calculate max guests from host data
  const maxGuests = host?.maxGuests || 4;

  // Handle scroll events for widget state - simple scroll position based
  useEffect(() => {
    const handleScroll = () => {
      // Widget appears after scrolling past hero (100vh)
      const heroHeight = window.innerHeight;
      const scrollY = window.scrollY;
      
      // Show widget after scrolling past 80% of hero height
      if (scrollY > heroHeight * 0.8) {
        setWidgetState("visible-top");
      } else {
        setWidgetState("hidden");
      }
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    // Call once on mount
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Use tRPC to create booking
  const createBookingMutation = trpc.booking.create.useMutation({
    onSuccess: (data) => {
      // Redirect to confirmation page with booking details
      const queryParams = new URLSearchParams({
        bookingId: data.id.toString(),
        guestName: bookingData.guestName,
        guestEmail: bookingData.guestEmail,
        requestedDate: bookingData.requestedDate,
        mealType: bookingData.mealType,
        numberOfGuests: bookingData.numberOfGuests.toString(),
        hostName: host?.hostName || "Host",
        amount: (calculatePrice() * bookingData.numberOfGuests).toString(),
        dietaryRestrictions: bookingData.specialRequests,
        hostListingId: hostListingId.toString(),
      });
      setLocation(`/booking-confirmation?${queryParams.toString()}`);
      setIsSubmitting(false);
    },
    onError: (error) => {
      console.error('[HostDetailPageV2] Booking error:', error);
      toast.error(`Booking failed: ${error.message}`);
      setIsSubmitting(false);
    },
  });

  const calculatePrice = () => {
    const basePrice = host?.pricePerPerson || 250;
    const discount = host?.discountPercentage || 0;
    return Math.round(basePrice * (1 - discount / 100));
  };

  const handleSubmitBooking = () => {
    // Validate required fields
    if (!bookingData.guestName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!bookingData.guestEmail.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (!bookingData.requestedDate) {
      toast.error("Please select a date");
      return;
    }
    if (bookingData.numberOfGuests < 1) {
      toast.error("Please select number of guests");
      return;
    }
    // Create booking via tRPC
    console.log('[HostDetailPageV2] Submitting booking:', bookingData);
    createBookingMutation.mutate({
      hostListingId,
      guestName: bookingData.guestName,
      guestEmail: bookingData.guestEmail,
      guestPhone: bookingData.guestPhone || "",
      requestedDate: bookingData.requestedDate,
      mealType: bookingData.mealType,
      numberOfGuests: bookingData.numberOfGuests,
      specialRequests: bookingData.specialRequests || "",
    });
  };

  const toggleMenuCategory = (category: string) => {
    setExpandedMenuCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  if (isLoading) {
    return <HostDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-[#faf8f3] text-[#1a1410] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif mb-4">Host not found</h1>
          <button
            onClick={() => setLocation("/hosts")}
            className="text-[#c44536] hover:opacity-70"
          >
            Back to hosts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#faf8f3] text-[#1a1410] min-h-screen">
      {/* Booking Widget - Fixed Sidebar */}
      {widgetState !== "hidden" && (
      <div
        className={`fixed right-0 w-80 bg-white shadow-lg transition-all duration-300 z-40 hidden lg:block ${
          widgetState === "peeking" ? "bottom-0 translate-y-[calc(100%-78px)]" : 
          widgetState === "visible-top" ? "top-20 translate-y-0" :
          "top-20"
        }`}
      >
        <div className="p-6 border-b border-[#e0d5be]">
          <div className="text-sm text-[#8a7a62] uppercase tracking-wider mb-2">Book a Seat</div>
          <div className="text-2xl font-serif text-[#1a1410]">
            ¥{calculatePrice()} <span className="text-sm text-[#8a7a62]">/ person</span>
          </div>
        </div>

        <div className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="text-xs text-[#c44536] tracking-widest uppercase block mb-2">Name *</label>
            <input
              type="text"
              placeholder="Your name"
              value={bookingData.guestName}
              onChange={(e) => setBookingData({ ...bookingData, guestName: e.target.value })}
              className="w-full px-3 py-2 border border-[#e0d5be] rounded text-sm focus:outline-none focus:border-[#c44536]"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-xs text-[#c44536] tracking-widest uppercase block mb-2">Email *</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={bookingData.guestEmail}
              onChange={(e) => setBookingData({ ...bookingData, guestEmail: e.target.value })}
              className="w-full px-3 py-2 border border-[#e0d5be] rounded text-sm focus:outline-none focus:border-[#c44536]"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs text-[#8a7a62] tracking-widest uppercase block mb-2">Phone</label>
            <input
              type="tel"
              placeholder="Your phone number"
              value={bookingData.guestPhone}
              onChange={(e) => setBookingData({ ...bookingData, guestPhone: e.target.value })}
              className="w-full px-3 py-2 border border-[#e0d5be] rounded text-sm focus:outline-none focus:border-[#c44536]"
            />
          </div>

          {/* Date */}
          <div>
            <label className="text-xs text-[#c44536] tracking-widest uppercase block mb-2">Date *</label>
            <input
              type="date"
              value={bookingData.requestedDate}
              onChange={(e) => setBookingData({ ...bookingData, requestedDate: e.target.value })}
              className="w-full px-3 py-2 border border-[#e0d5be] rounded text-sm focus:outline-none focus:border-[#c44536]"
            />
          </div>

          {/* Meal Type */}
          <div>
            <label className="text-xs text-[#c44536] tracking-widest uppercase block mb-2">Meal</label>
            <select
              value={bookingData.mealType}
              onChange={(e) => setBookingData({ ...bookingData, mealType: e.target.value as "lunch" | "dinner" })}
              className="w-full px-3 py-2 border border-[#e0d5be] rounded text-sm focus:outline-none focus:border-[#c44536]"
            >
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
            </select>
          </div>

          {/* Guests */}
          <div>
            <label className="text-xs text-[#c44536] tracking-widest uppercase block mb-2">Guests *</label>
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: maxGuests }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => setBookingData({ ...bookingData, numberOfGuests: num })}
                  className={`py-2 text-sm font-medium rounded transition-colors ${
                    bookingData.numberOfGuests === num
                      ? "bg-[#c44536] text-white"
                      : "bg-[#ede5cf] text-[#1a1410] hover:bg-[#e0d5be]"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary Requirements */}
          <div>
            <label className="text-xs text-[#8a7a62] tracking-widest uppercase block mb-2">Dietary Requirements</label>
            <textarea
              placeholder="Dietary restrictions, allergies, special requests..."
              value={bookingData.specialRequests}
              onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
              className="w-full px-3 py-2 border border-[#e0d5be] rounded text-sm focus:outline-none focus:border-[#c44536] resize-none h-20"
            />
          </div>

          {/* Total */}
          <div className="border-t border-[#e0d5be] pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-[#8a7a62]">
                ¥{calculatePrice()} × {bookingData.numberOfGuests} guests
              </span>
              <span className="text-lg font-serif text-[#1a1410]">¥{calculatePrice() * bookingData.numberOfGuests}</span>
            </div>

            {/* Reserve Button */}
            <button
              onClick={handleSubmitBooking}
              disabled={isSubmitting}
              className="w-full bg-[#c44536] text-white py-3 rounded font-medium text-sm tracking-wide uppercase hover:bg-[#a03428] disabled:opacity-50 transition-colors mb-2"
            >
              {isSubmitting ? "Submitting..." : "Reserve a Seat"}
            </button>

            {/* Message Button */}
            <button className="w-full border border-[#c44536] text-[#c44536] py-2 rounded font-medium text-sm tracking-wide uppercase hover:bg-[#faf8f3] transition-colors">
              Message First
            </button>
          </div>

          {/* Note */}
          <div className="text-xs text-[#8a7a62] bg-[#ede5cf] p-3 rounded">
            No payment taken yet — {host?.hostName} will confirm your booking.
          </div>
        </div>
      </div>
      )}

      {/* Main Content - No right margin during hero, add margin after */}
      <div className={`transition-all duration-300 ${widgetState === "hidden" ? "" : "lg:mr-80"}`}>
        {/* Hero Section */}
        <div ref={heroRef} className="relative h-screen bg-gradient-to-b from-gray-800 to-gray-900 flex items-end overflow-hidden">
          {/* Video Background */}
          {host?.introVideoUrl ? (
            <video
              src={host.introVideoUrl}
              className="absolute inset-0 w-full h-full object-cover opacity-40"
              autoPlay
              muted
              loop
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900" />
          )}

          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <button className="w-16 h-16 bg-white/30 hover:bg-white/40 rounded-full flex items-center justify-center transition-colors">
              <ChevronRight className="w-8 h-8 text-white ml-1" />
            </button>
          </div>

          {/* Bottom-left info overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-12 z-20">
            <div className="max-w-2xl">
              <p className="text-white/70 text-sm tracking-widest uppercase mb-2">
                {host?.district} · Shanghai
              </p>
              <h1 className="text-white text-5xl font-serif mb-2">{host?.hostName}</h1>
              <p className="text-white/80 text-sm tracking-widest uppercase mb-6">
                {host?.cuisineStyle} · Since 2022
              </p>

              {/* Info badges */}
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-sm">
                  <div className="text-xs text-white/70 uppercase tracking-wider">Price</div>
                  <div className="text-lg text-white font-serif">¥{calculatePrice()} / person</div>
                </div>
                <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-sm">
                  <div className="text-xs text-white/70 uppercase tracking-wider">Max Guests</div>
                  <div className="text-lg text-white font-serif">{host?.maxGuests}</div>
                </div>
                <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-sm">
                  <div className="text-xs text-white/70 uppercase tracking-wider">Duration</div>
                  <div className="text-lg text-white font-serif">{host?.mealDurationMinutes} mins</div>
                </div>
              </div>

              {/* Language and feature tags */}
              <div className="flex flex-wrap gap-2">
                {host?.languages?.map((lang: string) => (
                  <span key={lang} className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                    {lang}
                  </span>
                ))}
                {host?.hasPets && (
                  <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                    {host.petDetails || "Pets"}
                  </span>
                )}
                {host?.kidsFriendly && (
                  <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                    Kids Friendly
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Menu Section */}
        <div ref={menuRef} className="max-w-4xl mx-auto px-8 py-16">
          <p className="text-[#c44536] text-xs tracking-widest uppercase mb-2">The Menu</p>
          <h2 className="text-4xl font-serif mb-2">
            {host?.cuisineStyle}
          </h2>
          <p className="text-gray-600 text-sm mb-8 leading-relaxed">
            {host?.menuDescription}
          </p>

          {/* Menu Items */}
          <div className="space-y-4">
            {["to-start", "main", "finish"].map((category) => (
              <div key={category}>
                <button
                  onClick={() => toggleMenuCategory(category)}
                  className="w-full text-left py-3 border-b border-[#e0d5be] flex items-center justify-between hover:text-[#c44536] transition-colors"
                >
                  <span className="text-lg font-serif">▶ {category.toUpperCase()}</span>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      expandedMenuCategories[category] ? "rotate-90" : ""
                    }`}
                  />
                </button>
                {expandedMenuCategories[category] && (
                  <div className="py-4 text-sm text-gray-600">
                    Menu items for {category} would display here...
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Host Bio Section */}
        <div className="max-w-4xl mx-auto px-8 py-16 border-t border-[#e0d5be]">
          <p className="text-[#c44536] text-xs tracking-widest uppercase mb-2">About Your Host</p>
          <h2 className="text-4xl font-serif mb-12">Meet <em>{host?.hostName}</em></h2>

          <div className="grid grid-cols-3 gap-12">
            {/* Host Photo */}
            <div>
              {host?.profilePhotoUrl ? (
                <img
                  src={host.profilePhotoUrl}
                  alt={host.hostName}
                  className="w-full aspect-square object-cover rounded-sm"
                />
              ) : (
                <div className="w-full aspect-square bg-gray-300 rounded-sm flex items-center justify-center">
                  No profile photo
                </div>
              )}
            </div>

            {/* Bio Content */}
            <div className="col-span-2">
              {/* Bio */}
              <div className="mb-8">
                <p className="text-gray-700 leading-relaxed">{host?.bio}</p>
              </div>

              {/* Overseas Experience */}
              {host?.overseasExperience && (
                <div className="mb-8">
                  <p className="text-xs text-[#c44536] tracking-widest uppercase mb-2">Overseas Experience</p>
                  <p className="text-gray-700 leading-relaxed">{host.overseasExperience}</p>
                </div>
              )}

              {/* Fun Facts */}
              {host?.funFacts && (
                <div className="mb-8">
                  <p className="text-xs text-[#c44536] tracking-widest uppercase mb-2">Fun Facts</p>
                  <p className="text-gray-700 leading-relaxed">{host.funFacts}</p>
                </div>
              )}

              {/* Why Host */}
              {host?.whyHost && (
                <div className="mb-8">
                  <p className="text-xs text-[#c44536] tracking-widest uppercase mb-2">Why I Host</p>
                  <p className="text-gray-700 leading-relaxed">{host.whyHost}</p>
                </div>
              )}

              {/* Cultural Passions */}
              {host?.culturalPassions && (
                <div className="mb-8">
                  <p className="text-xs text-[#c44536] tracking-widest uppercase mb-2">Cultural Passion</p>
                  <p className="text-gray-700 leading-relaxed">{host.culturalPassions}</p>
                </div>
              )}

              {/* Other Passions */}
              {host?.otherPassions && (
                <div>
                  <p className="text-xs text-[#c44536] tracking-widest uppercase mb-2">Beyond Food</p>
                  <p className="text-gray-700 leading-relaxed">{host.otherPassions}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Things to Know Section - MOVED AFTER HOST BIO */}
        <div className="max-w-4xl mx-auto px-8 py-16 border-t border-[#e0d5be]">
          <p className="text-[#c44536] text-xs tracking-widest uppercase mb-2">Before You Book</p>
          <h2 className="text-4xl font-serif mb-12">Things to Know</h2>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs text-[#c44536] tracking-widest uppercase mb-2">Duration</p>
              <p className="text-lg">{host?.mealDurationMinutes} minutes</p>
            </div>
            <div>
              <p className="text-xs text-[#c44536] tracking-widest uppercase mb-2">Group Size</p>
              <p className="text-lg">Up to {host?.maxGuests} guests</p>
            </div>
            <div>
              <p className="text-xs text-[#c44536] tracking-widest uppercase mb-2">Dietary Accommodations</p>
              <p className="text-lg">{host?.dietaryNote || "Contact host for details"}</p>
            </div>
            <div>
              <p className="text-xs text-[#c44536] tracking-widest uppercase mb-2">Languages</p>
              <p className="text-lg">{host?.languages?.join(", ")}</p>
            </div>
          </div>
        </div>

        {/* Food Photo Carousel */}
        <div className="max-w-4xl mx-auto px-8 py-16 border-t border-[#e0d5be]">
          <div className="relative">
            {host?.foodPhotoUrls && host.foodPhotoUrls.length > 0 ? (
              <>
                <div className="relative h-96 bg-gray-200 rounded-sm overflow-hidden">
                  <img
                    src={host.foodPhotoUrls[currentImageIndex]}
                    alt="Food"
                    className="w-full h-full object-cover"
                  />
                </div>

                {host.foodPhotoUrls.length > 1 && (
                  <>
                    <div className="flex justify-center gap-2 mt-4">
                      {host.foodPhotoUrls.map((_: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            idx === currentImageIndex ? "bg-[#c44536]" : "bg-[#e0d5be]"
                          }`}
                        />
                      ))}
                    </div>

                    {host.foodPhotoUrls.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setCurrentImageIndex((prev) =>
                              prev === 0 ? host.foodPhotoUrls.length - 1 : prev - 1
                            )
                          }
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5 text-[#1a1410]" />
                        </button>
                        <button
                          onClick={() =>
                            setCurrentImageIndex((prev) =>
                              prev === host.foodPhotoUrls.length - 1 ? 0 : prev + 1
                            )
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
                        >
                          <ChevronRight className="w-5 h-5 text-[#1a1410]" />
                        </button>
                      </>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="h-96 bg-gray-200 rounded-sm flex items-center justify-center">
                No photos available
              </div>
            )}
          </div>
        </div>

        {/* Footer Spacing */}
        <div className="h-16" />
      </div>
    </div>
  );
}

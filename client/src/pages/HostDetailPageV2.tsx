import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { trpc } from "@/lib/trpc";

// Mock data for Norika & Steven - will be replaced with database query
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
  district: "Songjiang",
  cuisineStyle: "Northern-Southern Fusion",
  title: "Authentic Shanghai Home Cooking Experience",
  menuDescription: "A Northern-Southern fusion celebrating Jiā Cháng Cài (home-style cooking)—the heart and soul of Chinese dining. Unlike restaurant food, these dishes are designed for comfort and balance.",
  foodPhotoUrls: [
    "https://res.cloudinary.com/drxfcfayd/image/upload/v1769881958/host-images/xllmu9jdhd7sjxotnsqp.jpg",
    "https://res.cloudinary.com/drxfcfayd/image/upload/v1769881963/host-images/o9n0ifnj6oxg4pvlaiep.jpg",
    "https://res.cloudinary.com/drxfcfayd/image/upload/v1769881968/host-images/h8ymuocquwyrjiaumfvu.jpg",
  ],
  dietaryNote: "Can accommodate vegetarian, vegan, gluten-free. Not suitable for shellfish allergy.",
  mealDurationMinutes: 180,
  pricePerPerson: 250,
  maxGuests: 4,
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

  const host = MOCK_HOST;
  const hostListingId = params?.id ? parseInt(params.id) : 1;

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
        hostName: host.hostName,
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
    const basePrice = host.pricePerPerson;
    if (host.discountPercentage) {
      return Math.round(basePrice * (1 - host.discountPercentage / 100));
    }
    return basePrice;
  };

  const calculateTotal = () => {
    return calculatePrice() * bookingData.numberOfGuests;
  };

  const handleBooking = async () => {
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

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % host.foodPhotoUrls.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? host.foodPhotoUrls.length - 1 : prev - 1
    );
  };

  return (
    <div className="bg-[#faf8f3] text-[#1a1410]">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white border-b border-[#e8e3d8]">
        <div className="container flex items-center justify-between h-16">
          <button
            onClick={() => setLocation("/hosts")}
            className="flex items-center gap-2 text-sm font-medium text-[#1a1410] hover:opacity-70"
          >
            <ChevronLeft size={18} />
            All Hosts
          </button>
          <div className="text-lg font-serif">🥢 +1 Chopsticks</div>
          <div className="w-20" />
        </div>
      </nav>

      {/* Hero Video Section */}
      <section className="relative w-full h-[75vh] bg-gradient-to-b from-gray-800 to-gray-900 overflow-hidden">
        {/* Video background placeholder */}
        <div className="absolute inset-0 bg-gray-800" />

        {/* Play button overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <div className="w-20 h-20 rounded-full border-2 border-white/60 flex items-center justify-center mb-4">
            <div className="w-0 h-0 border-l-8 border-l-white border-t-5 border-t-transparent border-b-5 border-b-transparent ml-1" />
          </div>
          <p className="text-white text-sm tracking-widest uppercase">
            Watch {host.hostName}
          </p>
        </div>

        {/* Bottom-left info overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-12 z-20">
          <div className="max-w-2xl">
            <p className="text-white/70 text-sm tracking-widest uppercase mb-2">
              {host.district} · Shanghai
            </p>
            <h1 className="text-white text-5xl font-serif mb-2">{host.hostName}</h1>
            <p className="text-white/80 text-sm tracking-widest uppercase mb-6">
              {host.cuisineStyle} · Since 2022
            </p>

            {/* Info badges */}
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-sm">
                <div className="text-xs text-white/70 uppercase tracking-wider">Price</div>
                <div className="text-lg text-white font-serif">¥{calculatePrice()} / person</div>
              </div>
              <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-sm">
                <div className="text-xs text-white/70 uppercase tracking-wider">Max Guests</div>
                <div className="text-lg text-white font-serif">{host.maxGuests}</div>
              </div>
              <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-sm">
                <div className="text-xs text-white/70 uppercase tracking-wider">Duration</div>
                <div className="text-lg text-white font-serif">{host.mealDurationMinutes} mins</div>
              </div>
            </div>

            {/* Language and feature tags */}
            <div className="flex flex-wrap gap-2">
              {host.languages?.map((lang: string) => (
                <span key={lang} className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                  {lang}
                </span>
              ))}
              {host.hasPets && (
                <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                  {host.petDetails || "Pets"}
                </span>
              )}
              {host.kidsFriendly && (
                <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                  Kids Friendly
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section className="bg-[#faf8f3] py-16">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 gap-12">
          {/* Left: Menu list */}
          <div>
            <p className="text-[#c44536] text-xs tracking-widest uppercase mb-2">The Menu</p>
            <h2 className="text-4xl font-serif mb-2">
              {host.cuisineStyle}
            </h2>
            <p className="text-gray-600 text-sm mb-8 leading-relaxed">
              {host.menuDescription}
            </p>

            {/* Menu categories */}
            <div className="space-y-8">
              {["to-start", "main", "finish"].map((category) => (
                <div key={category}>
                  <button
                    onClick={() => toggleMenuCategory(category)}
                    className="flex items-center gap-2 text-[#c44536] text-sm tracking-widest uppercase hover:opacity-70 transition"
                  >
                    <span>▶</span>
                    <span>{category === "to-start" ? "To Start" : category === "main" ? "Main Table" : "To Finish"}</span>
                  </button>
                  {expandedMenuCategories[category] && (
                    <div className="mt-4 space-y-3 ml-6 border-l border-gray-300 pl-4">
                      <div>
                        <p className="font-serif text-sm">Sample Dish 1</p>
                        <p className="text-xs text-gray-600">Description of the dish</p>
                      </div>
                      <div>
                        <p className="font-serif text-sm">Sample Dish 2</p>
                        <p className="text-xs text-gray-600">Description of the dish</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Photo carousel */}
          <div className="relative">
            <div className="aspect-square bg-gray-300 rounded-sm overflow-hidden mb-4">
              {host.foodPhotoUrls && host.foodPhotoUrls.length > 0 ? (
                <img
                  src={host.foodPhotoUrls[currentImageIndex]}
                  alt="Food"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  No photos
                </div>
              )}
            </div>

            {/* Carousel controls */}
            {host.foodPhotoUrls && host.foodPhotoUrls.length > 1 && (
              <>
                <div className="flex justify-center gap-2 mb-4">
                  {host.foodPhotoUrls.map((_: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-2 h-2 rounded-full transition ${
                        idx === currentImageIndex ? "bg-[#1a1410]" : "bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex justify-between">
                  <button onClick={prevImage} className="text-gray-600 hover:text-[#1a1410]">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={nextImage} className="text-gray-600 hover:text-[#1a1410]">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Things to Know */}
      <section className="bg-white py-16 border-t border-[#e8e3d8]">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-[#c44536] text-xs tracking-widest uppercase mb-2">Before You Book</p>
          <h2 className="text-4xl font-serif mb-12">Things to Know</h2>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs text-[#c44536] tracking-widest uppercase mb-2">Duration</p>
              <p className="text-lg">{host.mealDurationMinutes} minutes</p>
            </div>
            <div>
              <p className="text-xs text-[#c44536] tracking-widest uppercase mb-2">Group Size</p>
              <p className="text-lg">Up to {host.maxGuests} guests</p>
            </div>
            <div>
              <p className="text-xs text-[#c44536] tracking-widest uppercase mb-2">Dietary Accommodations</p>
              <p className="text-lg">{host.dietaryNote || "Contact host for details"}</p>
            </div>
            <div>
              <p className="text-xs text-[#c44536] tracking-widest uppercase mb-2">Languages</p>
              <p className="text-lg">{host.languages?.join(", ")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Host */}
      <section className="bg-[#faf8f3] py-16 border-t border-[#e8e3d8]">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 gap-12">
          {/* Left: Profile photo */}
          <div>
            {host.profilePhotoUrl ? (
              <img
                src={host.profilePhotoUrl}
                alt={host.hostName}
                className="w-full aspect-square object-cover rounded-sm"
              />
            ) : (
              <div className="w-full aspect-square bg-gray-300 rounded-sm flex items-center justify-center">
                No photo
              </div>
            )}
          </div>

          {/* Right: Bio and details */}
          <div>
            <p className="text-[#c44536] text-xs tracking-widest uppercase mb-2">About Your Host</p>
            <h2 className="text-4xl font-serif mb-8">
              Meet <em className="text-[#c44536]">{host.hostName}</em>
            </h2>

            {/* Bio */}
            <div className="mb-8">
              <p className="text-gray-700 leading-relaxed">{host.bio}</p>
            </div>

            {/* Overseas Experience */}
            {host.overseasExperience && (
              <div className="mb-8">
                <p className="text-xs text-[#c44536] tracking-widest uppercase mb-2">Overseas Experience</p>
                <p className="text-gray-700 leading-relaxed">{host.overseasExperience}</p>
              </div>
            )}

            {/* Fun Facts */}
            {host.funFacts && (
              <div className="mb-8">
                <p className="text-xs text-[#c44536] tracking-widest uppercase mb-2">Fun Facts</p>
                <p className="text-gray-700 leading-relaxed">{host.funFacts}</p>
              </div>
            )}

            {/* Why Host */}
            {host.whyHost && (
              <div className="mb-8">
                <p className="text-xs text-[#c44536] tracking-widest uppercase mb-2">Why I Host</p>
                <p className="text-gray-700 leading-relaxed">{host.whyHost}</p>
              </div>
            )}

            {/* Cultural Passions */}
            {host.culturalPassions && (
              <div className="mb-8">
                <p className="text-xs text-[#c44536] tracking-widest uppercase mb-2">Cultural Passion</p>
                <p className="text-gray-700 leading-relaxed">{host.culturalPassions}</p>
              </div>
            )}

            {/* Other Passions */}
            {host.otherPassions && (
              <div>
                <p className="text-xs text-[#c44536] tracking-widest uppercase mb-2">Beyond Food</p>
                <p className="text-gray-700 leading-relaxed">{host.otherPassions}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Booking Widget - Fixed Right Sidebar */}
      <div className="fixed right-12 top-32 w-80 bg-white border border-[#e8e3d8] rounded-sm shadow-lg z-30 max-h-[calc(100vh-160px)] overflow-y-auto hidden md:block">
        {/* Widget Header */}
        <div className="bg-[#1a1410] text-white p-5 border-b border-[#e8e3d8]">
          <p className="text-xs tracking-widest uppercase opacity-80 mb-2">Book a Seat</p>
          <div className="text-3xl font-serif">
            ¥{calculatePrice()}
            <span className="text-xs opacity-80 ml-2">/ person</span>
          </div>
        </div>

        {/* Widget Body */}
        <div className="p-5 space-y-4">
          {/* Guest Name */}
          <div>
            <label className="text-xs text-[#c44536] tracking-widest uppercase block mb-2">Name *</label>
            <input
              type="text"
              value={bookingData.guestName}
              onChange={(e) => setBookingData({ ...bookingData, guestName: e.target.value })}
              className="w-full px-3 py-2 border border-[#e8e3d8] rounded-sm text-sm focus:outline-none focus:border-[#c44536]"
              placeholder="Your name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-xs text-[#c44536] tracking-widest uppercase block mb-2">Email *</label>
            <input
              type="email"
              value={bookingData.guestEmail}
              onChange={(e) => setBookingData({ ...bookingData, guestEmail: e.target.value })}
              className="w-full px-3 py-2 border border-[#e8e3d8] rounded-sm text-sm focus:outline-none focus:border-[#c44536]"
              placeholder="your@email.com"
            />
          </div>

          {/* Phone (Optional) */}
          <div>
            <label className="text-xs text-[#c44536] tracking-widest uppercase block mb-2">Phone</label>
            <input
              type="tel"
              value={bookingData.guestPhone}
              onChange={(e) => setBookingData({ ...bookingData, guestPhone: e.target.value })}
              className="w-full px-3 py-2 border border-[#e8e3d8] rounded-sm text-sm focus:outline-none focus:border-[#c44536]"
              placeholder="Your phone number"
            />
          </div>

          {/* Date */}
          <div>
            <label className="text-xs text-[#c44536] tracking-widest uppercase block mb-2">Date *</label>
            <input
              type="date"
              value={bookingData.requestedDate}
              onChange={(e) => setBookingData({ ...bookingData, requestedDate: e.target.value })}
              className="w-full px-3 py-2 border border-[#e8e3d8] rounded-sm text-sm focus:outline-none focus:border-[#c44536]"
            />
          </div>

          {/* Meal Type */}
          <div>
            <label className="text-xs text-[#c44536] tracking-widest uppercase block mb-2">Meal</label>
            <select
              value={bookingData.mealType}
              onChange={(e) => setBookingData({ ...bookingData, mealType: e.target.value as "lunch" | "dinner" })}
              className="w-full px-3 py-2 border border-[#e8e3d8] rounded-sm text-sm focus:outline-none focus:border-[#c44536]"
            >
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
            </select>
          </div>

          {/* Guests */}
          <div>
            <label className="text-xs text-[#c44536] tracking-widest uppercase block mb-2">Guests *</label>
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: host.maxGuests }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => setBookingData({ ...bookingData, numberOfGuests: num })}
                  className={`py-2 text-sm rounded-sm border transition ${
                    bookingData.numberOfGuests === num
                      ? "bg-[#1a1410] text-white border-[#1a1410]"
                      : "border-[#e8e3d8] hover:border-[#1a1410]"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div>
            <label className="text-xs text-[#c44536] tracking-widest uppercase block mb-2">
              Dietary Requirements
            </label>
            <textarea
              value={bookingData.specialRequests}
              onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
              className="w-full px-3 py-2 border border-[#e8e3d8] rounded-sm text-sm resize-none focus:outline-none focus:border-[#c44536]"
              rows={3}
              placeholder="Dietary restrictions, allergies, special requests..."
            />
          </div>

          {/* Total */}
          <div className="border-t border-[#e8e3d8] pt-4">
            <div className="flex justify-between items-baseline mb-4">
              <span className="text-xs text-gray-600">¥{calculatePrice()} × {bookingData.numberOfGuests} guests</span>
              <span className="text-2xl font-serif">¥{calculateTotal()}</span>
            </div>

            {/* Book Button */}
            <button
              onClick={handleBooking}
              disabled={isSubmitting}
              className="w-full bg-[#c44536] text-white py-3 rounded-sm text-xs tracking-widest uppercase font-medium hover:bg-[#a83a2d] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Booking..." : "Reserve a Seat"}
            </button>

            {/* Message Button */}
            <button className="w-full mt-2 border border-[#e8e3d8] py-2 rounded-sm text-xs tracking-widest uppercase hover:border-[#1a1410] transition">
              Message First
            </button>
          </div>
        </div>
      </div>

      {/* Main content padding for fixed widget */}
      <div className="h-20" />
    </div>
  );
}

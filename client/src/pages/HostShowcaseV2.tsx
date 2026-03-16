import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { ChevronLeft, ChevronRight, Play, MapPin, Globe, Users, Clock, Check } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

export default function HostShowcaseV2() {
  const [, setLocation] = useLocation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [menuExpanded, setMenuExpanded] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [autoRotateIndex, setAutoRotateIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [bookingData, setBookingData] = useState({
    guestName: '',
    guestEmail: '',
    requestedDate: '',
    mealType: 'dinner' as 'lunch' | 'dinner',
    numberOfGuests: 2,
    specialRequests: '',
  });

  // Fetch host data from database (using ID 1 for Norika & Steven)
  const { data: host, isLoading } = trpc.host.get.useQuery({ id: 1 });

  // Auto-rotate food photos every 5 seconds
  useEffect(() => {
    const foodPhotos = host?.foodPhotoUrls || [];
    if (foodPhotos.length === 0) return;

    const interval = setInterval(() => {
      setAutoRotateIndex((prev) => (prev + 1) % foodPhotos.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [host?.foodPhotoUrls]);

  // Extract menu description (first part only, before dishes)
  const getMenuDescriptionOnly = (description: string): string => {
    if (!description) return description;
    
    // Split by common dish section markers
    const parts = description.split(/(?:Meat & Poultry|Vegetarian|Dessert|To Start|Main|Finish|---)/i);
    return parts[0].trim();
  };

  // Extract dishes from menu description (one dish per line)
  const extractDishes = (description: string): string[] => {
    if (!description) return [];
    
    const lines = description.split('\n');
    const dishes: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Look for lines that start with a number or contain dish names
      if (trimmed && (trimmed.match(/^\d+\./) || trimmed.match(/^[-•]/))) {
        // Remove numbering and bullets
        const dish = trimmed.replace(/^\d+\.\s*/, '').replace(/^[-•]\s*/, '');
        if (dish.length > 0) {
          dishes.push(dish);
        }
      }
    }
    
    return dishes;
  };

  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setVideoPlaying(true);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!host) {
    return <div className="flex items-center justify-center h-screen">Host not found</div>;
  }

  const foodPhotos = host.foodPhotoUrls || [];
  const maxGuests = host.maxGuests || 2;
  const pricePerPerson = host.pricePerPerson || 250;
  const menuDescription = host.menuDescription || '';
  const menuDescriptionOnly = getMenuDescriptionOnly(menuDescription);
  const dishes = extractDishes(menuDescription);

  const calculatePrice = () => {
    return pricePerPerson;
  };

  const calculateTotal = () => {
    return calculatePrice() * bookingData.numberOfGuests;
  };

  const handleBooking = () => {
    if (!bookingData.guestName || !bookingData.guestEmail || !bookingData.requestedDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    toast.info('Demo mode - booking functionality not yet enabled');
  };

  const nextImage = () => {
    if (foodPhotos.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % foodPhotos.length);
    }
  };

  const prevImage = () => {
    if (foodPhotos.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? foodPhotos.length - 1 : prev - 1
      );
    }
  };

  return (
    <div className="bg-[#faf8f3] min-h-screen pb-24 lg:pb-0">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 border-b border-[#e8e3d8]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => setLocation('/')} className="flex items-center gap-2 hover:opacity-70">
            <span className="text-2xl">🥢</span>
            <span className="font-serif text-lg">+1 Chopsticks</span>
          </button>
          <button onClick={() => setLocation('/all-hosts')} className="text-sm text-gray-600 hover:text-gray-900">
            ← All Hosts
          </button>
          <div className="w-20" />
        </div>
      </nav>

      {/* Hero Video Section - 100vh */}
      <section className="relative w-full h-screen bg-gradient-to-b from-gray-800 to-gray-900 overflow-hidden mt-16">
        {/* Video background */}
        {host.introVideoUrl ? (
          <>
            <video
              ref={videoRef}
              src={host.introVideoUrl}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
            {/* Play button overlay */}
            {!videoPlaying && (
              <button
                onClick={handlePlayVideo}
                className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-all z-10"
              >
                <div className="bg-white/90 rounded-full p-6 hover:bg-white transition-all">
                  <Play className="w-12 h-12 text-[#c44536] fill-[#c44536]" />
                </div>
              </button>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-gray-800 to-gray-900" />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50" />

        {/* Host info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <p className="text-sm opacity-80 mb-2">{host.location}</p>
          <h1 className="text-5xl font-serif mb-2">{host.name}</h1>
          <p className="text-lg opacity-90">{host.cuisineStyle} · Since {host.yearStarted}</p>

          {/* Info badges */}
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur px-4 py-2 rounded">
              <p className="text-xs opacity-80">Price</p>
              <p className="text-lg font-serif">¥{pricePerPerson} / person</p>
            </div>
            <div className="bg-white/20 backdrop-blur px-4 py-2 rounded">
              <p className="text-xs opacity-80">Max Guests</p>
              <p className="text-lg font-serif">{maxGuests}</p>
            </div>
            <div className="bg-white/20 backdrop-blur px-4 py-2 rounded">
              <p className="text-xs opacity-80">Duration</p>
              <p className="text-lg font-serif">{host.durationMinutes} mins</p>
            </div>
          </div>

          {/* Languages and features */}
          <div className="flex flex-wrap gap-2 mt-6">
            {host.languages && typeof host.languages === 'string' && host.languages.split(',').map((lang) => (
              <span key={lang} className="bg-white/20 backdrop-blur px-3 py-1 rounded text-sm">
                {lang.trim()}
              </span>
            ))}
            {host.householdFeatures && (
              <>
                <span className="bg-white/20 backdrop-blur px-3 py-1 rounded text-sm">
                  {host.householdFeatures}
                </span>
              </>
            )}
            {host.kidsWelcome && (
              <span className="bg-white/20 backdrop-blur px-3 py-1 rounded text-sm">
                Kids Friendly
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        {/* Menu Section */}
        <div className="mb-20">
          <p className="text-[#c44536] text-sm tracking-widest uppercase mb-4">The Menu</p>
          <h2 className="text-4xl font-serif mb-8">
            {host.cuisineStyle}
          </h2>

          {/* Menu description - first part only */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-gray-600 text-base mb-8 leading-relaxed whitespace-pre-wrap">
                {menuDescriptionOnly}
              </p>

              {/* Sample Menu expandable section */}
              <div>
                <button
                  onClick={() => setMenuExpanded(!menuExpanded)}
                  className="flex items-center gap-2 text-[#c44536] font-serif text-lg mb-6 hover:opacity-70 transition"
                >
                  <span>{menuExpanded ? '▼' : '▶'}</span>
                  <span className="uppercase tracking-widest">Sample Menu</span>
                </button>

                {menuExpanded && (
                  <div className="space-y-3 pl-6 border-l-2 border-[#c44536]">
                    {dishes.map((dish, idx) => (
                      <p key={idx} className="text-gray-700 text-sm">
                        {dish}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Food photo carousel - 30% smaller */}
            <div className="relative">
              {foodPhotos.length > 0 ? (
                <div className="relative w-full max-w-md mx-auto">
                  <img
                    src={foodPhotos[autoRotateIndex]}
                    alt="Food"
                    className="w-full h-auto rounded-sm object-cover"
                  />
                  
                  {/* Navigation arrows */}
                  <button
                    onClick={prevImage}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition"
                  >
                    <ChevronLeft className="w-5 h-5 text-[#1a1410]" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition"
                  >
                    <ChevronRight className="w-5 h-5 text-[#1a1410]" />
                  </button>

                  {/* Carousel indicators */}
                  <div className="flex justify-center gap-2 mt-4">
                    {foodPhotos.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setAutoRotateIndex(idx)}
                        className={`w-2 h-2 rounded-full transition ${
                          idx === autoRotateIndex ? 'bg-[#c44536]' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-sm flex items-center justify-center">
                  <span className="text-gray-500">No photos available</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Meet Host Section - with left details panel */}
        <div className="mb-20">
          <p className="text-[#c44536] text-sm tracking-widest uppercase mb-4">About Your Host</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Left side - Host details and photo */}
            <div className="lg:col-span-1">
              {/* Host photo - 40% smaller */}
              {host.profilePhotoUrl && (
                <img
                  src={host.profilePhotoUrl}
                  alt={host.name}
                  className="w-full h-auto rounded-sm mb-8 object-cover"
                />
              )}

              {/* Details panel */}
              <div className="space-y-6">
                {/* Location */}
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-[#c44536] flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Location</p>
                    <p className="text-sm font-serif text-gray-800">{host.location}</p>
                  </div>
                </div>

                {/* Languages */}
                <div className="flex gap-3">
                  <Globe className="w-5 h-5 text-[#c44536] flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Languages</p>
                    <p className="text-sm font-serif text-gray-800">
                      {host.languages || 'Not specified'}
                    </p>
                  </div>
                </div>

                {/* Guest count */}
                <div className="flex gap-3">
                  <Users className="w-5 h-5 text-[#c44536] flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Guests</p>
                    <p className="text-sm font-serif text-gray-800">
                      Up to {maxGuests} guests
                    </p>
                  </div>
                </div>

                {/* Duration */}
                <div className="flex gap-3">
                  <Clock className="w-5 h-5 text-[#c44536] flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Duration</p>
                    <p className="text-sm font-serif text-gray-800">
                      {host.durationMinutes} minutes
                    </p>
                  </div>
                </div>

                {/* Verified badge */}
                <div className="flex gap-3 pt-4 border-t border-[#e8e3d8]">
                  <Check className="w-5 h-5 text-[#c44536] flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xs text-[#c44536] uppercase tracking-widest font-semibold">
                      Verified Host
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Bio sections */}
            <div className="lg:col-span-3">
              <h3 className="text-3xl font-serif mb-8">
                Meet <span className="text-[#c44536]">{host.name}</span>
              </h3>

              {/* Bio */}
              <div className="mb-10">
                <p className="text-gray-700 leading-relaxed mb-6">
                  {host.bio}
                </p>
              </div>

              {/* Overseas Experience */}
              {host.otherHouseholdInfo && (
                <div className="mb-10">
                  <h4 className="text-sm text-[#c44536] uppercase tracking-widest font-semibold mb-3">
                    Overseas Experience
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    {host.otherHouseholdInfo}
                  </p>
                </div>
              )}

              {/* Fun Facts */}
              {host.householdFeatures && (
                <div className="mb-10">
                  <h4 className="text-sm text-[#c44536] uppercase tracking-widest font-semibold mb-3">
                    Fun Facts
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    {host.householdFeatures}
                  </p>
                </div>
              )}

              {/* Why I Want to Host */}
              <div className="mb-10">
                <h4 className="text-sm text-[#c44536] uppercase tracking-widest font-semibold mb-3">
                  Why I Want to Host
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  We love hosting friends and having nice chats over dinner. Cultural exchange is what we do.
                </p>
              </div>

              {/* Passions & Interests */}
              <div>
                <h4 className="text-sm text-[#c44536] uppercase tracking-widest font-semibold mb-3">
                  Passions & Interests
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  We are passionate about geography and exploring different cultures through food. Beyond food, we love sports, reading, and connecting with people from different backgrounds.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Things to Know Section */}
        <div className="mb-20">
          <p className="text-[#c44536] text-sm tracking-widest uppercase mb-4">Before You Book</p>
          <h2 className="text-4xl font-serif mb-12">Things to Know</h2>

          <div className="grid grid-cols-2 gap-12">
            <div>
              <p className="text-xs text-[#c44536] uppercase tracking-widest font-semibold mb-3">Duration</p>
              <p className="text-lg font-serif text-gray-800">{host.durationMinutes} minutes</p>
            </div>
            <div>
              <p className="text-xs text-[#c44536] uppercase tracking-widest font-semibold mb-3">Group Size</p>
              <p className="text-lg font-serif text-gray-800">Up to {maxGuests} guests</p>
            </div>
            <div>
              <p className="text-xs text-[#c44536] uppercase tracking-widest font-semibold mb-3">Dietary Accommodations</p>
              <p className="text-lg font-serif text-gray-800">Contact host for details</p>
            </div>
            <div>
              <p className="text-xs text-[#c44536] uppercase tracking-widest font-semibold mb-3">Languages</p>
              <p className="text-lg font-serif text-gray-800">{host.languages || 'Not specified'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Widget - Floating on desktop right side */}
      <div className="hidden lg:block fixed right-8 top-32 w-80 bg-white border border-[#e8e3d8] rounded-sm shadow-lg z-40 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Widget Header */}
        <div className="bg-[#1a1410] text-white p-5 border-b border-[#e8e3d8]">
          <p className="text-xs tracking-widest uppercase opacity-80 mb-2">Book a Seat</p>
          <div className="text-3xl font-serif">
            ¥{pricePerPerson}
            <span className="text-sm opacity-80 ml-2">/ person</span>
          </div>
        </div>

        {/* Widget Body */}
        <div className="p-5 space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs text-[#c44536] uppercase tracking-widest font-semibold block mb-2">
              Name
            </label>
            <input
              type="text"
              placeholder="Your name"
              value={bookingData.guestName}
              onChange={(e) => setBookingData({ ...bookingData, guestName: e.target.value })}
              className="w-full border border-[#e8e3d8] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#c44536]"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-xs text-[#c44536] uppercase tracking-widest font-semibold block mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              value={bookingData.guestEmail}
              onChange={(e) => setBookingData({ ...bookingData, guestEmail: e.target.value })}
              className="w-full border border-[#e8e3d8] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#c44536]"
            />
          </div>

          {/* Date */}
          <div>
            <label className="text-xs text-[#c44536] uppercase tracking-widest font-semibold block mb-2">
              Date
            </label>
            <input
              type="date"
              value={bookingData.requestedDate}
              onChange={(e) => setBookingData({ ...bookingData, requestedDate: e.target.value })}
              className="w-full border border-[#e8e3d8] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#c44536]"
            />
            {/* Simple calendar display */}
            {bookingData.requestedDate && (
              <div className="mt-2 p-3 bg-[#faf8f3] rounded text-xs text-center text-[#1a1410]">
                {new Date(bookingData.requestedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            )}
          </div>

          {/* Time */}
          <div>
            <label className="text-xs text-[#c44536] uppercase tracking-widest font-semibold block mb-2">
              Time
            </label>
            <select
              className="w-full border border-[#e8e3d8] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#c44536]"
            >
              <option value="6:30pm">6:30 PM</option>
              <option value="7:00pm">7:00 PM</option>
              <option value="7:30pm">7:30 PM</option>
              <option value="8:00pm">8:00 PM</option>
            </select>
          </div>

          {/* Guest Count */}
          <div>
            <label className="text-xs text-[#c44536] uppercase tracking-widest font-semibold block mb-3">
              Guests
            </label>
            <div className="flex gap-1 flex-wrap">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  onClick={() => setBookingData({ ...bookingData, numberOfGuests: num })}
                  className={`flex-1 min-w-[45px] py-2 rounded text-sm font-semibold transition ${
                    bookingData.numberOfGuests === num
                      ? 'bg-[#1a1410] text-white'
                      : 'bg-[#e8e3d8] text-[#1a1410] hover:bg-gray-300'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary & Notes */}
          <div>
            <label className="text-xs text-[#c44536] uppercase tracking-widest font-semibold block mb-2">
              Dietary & Notes
            </label>
            <textarea
              placeholder="Dietary restrictions, allergies, special requests..."
              value={bookingData.specialRequests}
              onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
              className="w-full border border-[#e8e3d8] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#c44536] resize-none h-20"
            />
          </div>

          {/* Price calculation */}
          <div className="border-t border-[#e8e3d8] pt-4">
            <div className="flex justify-between mb-4">
              <span className="text-sm text-gray-600">
                ¥{pricePerPerson} × {bookingData.numberOfGuests} guests
              </span>
              <span className="text-lg font-serif text-[#1a1410]">
                ¥{calculateTotal()}
              </span>
            </div>

            {/* Action buttons */}
            <button
              onClick={handleBooking}
              className="w-full bg-[#c44536] text-white py-3 rounded font-semibold hover:bg-opacity-90 transition mb-1"
            >
              RESERVE A SEAT
            </button>
            <p className="text-xs italic text-gray-500 text-center mb-3">and pay later</p>
            <button className="w-full border border-[#c44536] text-[#c44536] py-3 rounded font-semibold hover:bg-[#faf8f3] transition">
              MESSAGE FIRST
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Booking Bar at Bottom - Mobile and Tablet */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1a1410] text-white px-4 py-4 border-t border-[#e8e3d8] z-50 lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs opacity-80">Price per person</p>
            <p className="text-xl font-serif">¥{pricePerPerson}</p>
          </div>
          <button
            onClick={handleBooking}
            className="bg-[#c44536] text-white px-6 py-3 rounded font-semibold hover:bg-opacity-90 transition whitespace-nowrap"
          >
            BOOK A SEAT
          </button>
        </div>
      </div>

      {/* Sticky Booking Bar at Bottom - Desktop */}
      <div className="hidden lg:fixed lg:bottom-0 lg:left-0 lg:right-0 bg-[#1a1410] text-white px-4 py-4 border-t border-[#e8e3d8] z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-xs opacity-80">Price per person</p>
            <p className="text-2xl font-serif">¥{pricePerPerson}</p>
          </div>
          <button
            onClick={handleBooking}
            className="bg-[#c44536] text-white px-8 py-3 rounded font-semibold hover:bg-opacity-90 transition whitespace-nowrap"
          >
            BOOK A SEAT
          </button>
        </div>
      </div>

    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { ChevronLeft, ChevronRight, Play, MapPin, Globe, Users, Clock, Check } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

export default function HostShowcaseV2() {
  const [, setLocation] = useLocation();
  const [autoRotateIndex, setAutoRotateIndex] = useState(0);
  const [menuExpanded, setMenuExpanded] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Booking form state
  const [bookingData, setBookingData] = useState({
    selectedDate: '',
    selectedTime: '',
    numberOfGuests: 2,
    guestName: '',
    guestEmail: '',
    dietaryRestrictions: '',
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
      if (trimmed && (trimmed.match(/^\d+\./) || trimmed.match(/^[-•]/))) {
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

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingData.guestName || !bookingData.guestEmail || !bookingData.selectedDate || !bookingData.selectedTime) {
      toast.error('Please fill in all required fields');
      return;
    }
    toast.info('Demo mode - booking functionality not yet enabled');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!host) {
    return <div className="flex items-center justify-center h-screen">Host not found</div>;
  }

  const foodPhotos = host.foodPhotoUrls || [];
  const maxGuests = host.maxGuests || 6;
  const pricePerPerson = host.pricePerPerson || 250;
  const menuDescription = host.menuDescription || '';
  const menuDescriptionOnly = getMenuDescriptionOnly(menuDescription);
  const dishes = extractDishes(menuDescription);
  const totalPrice = pricePerPerson * bookingData.numberOfGuests;

  // Parse languages
  const languages = typeof host.languages === 'string' 
    ? host.languages.split(',').map(l => l.trim())
    : Array.isArray(host.languages) 
    ? host.languages 
    : [];

  return (
    <div className="min-h-screen bg-[#faf8f3]">
      {/* Hero Section - 100vh */}
      <div className="relative w-full h-screen bg-black overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          src={host.videoUrl}
          autoPlay
          muted
          loop
          playsInline
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

        {/* Play button overlay */}
        {!videoPlaying && (
          <button
            onClick={handlePlayVideo}
            className="absolute inset-0 flex items-center justify-center group"
          >
            <div className="w-20 h-20 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center transition-colors">
              <Play className="w-8 h-8 text-[#c44536] ml-1" fill="currentColor" />
            </div>
          </button>
        )}

        {/* Bottom info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-serif mb-2">{host.name}</h1>
            <p className="text-lg mb-4">{host.location} · {host.cuisineStyle} · Since {host.yearStarted || '2022'}</p>
            
            {/* Info badges */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold">¥{pricePerPerson}</span>
                <span>/person</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Max {maxGuests} guests</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>120 mins</span>
              </div>
            </div>

            {/* Languages */}
            {languages.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <span key={lang} className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {lang}
                  </span>
                ))}
              </div>
            )}

            {/* Features */}
            {host.features && host.features.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {host.features.map((feature) => (
                  <span key={feature} className="px-3 py-1 bg-[#c44536]/80 rounded-full text-sm">
                    {feature}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <section className="py-16 px-8 max-w-6xl mx-auto">
        <p className="text-sm text-[#c44536] font-semibold tracking-wider mb-2">THE MENU</p>
        <h2 className="text-3xl font-serif mb-6">
          <span className="text-[#1a1410]">{host.cuisineStyle}</span>
        </h2>
        
        {/* Menu description - max 5 lines */}
        <p className="text-[#666] leading-relaxed mb-6 line-clamp-5">
          {menuDescriptionOnly}
        </p>

        {/* Sample Menu expandable */}
        <button
          onClick={() => setMenuExpanded(!menuExpanded)}
          className="flex items-center gap-2 text-[#c44536] font-semibold mb-6 hover:opacity-80 transition"
        >
          <span>{menuExpanded ? '▼' : '▶'}</span>
          <span>SAMPLE MENU</span>
        </button>

        {menuExpanded && (
          <div className="space-y-3 mb-8">
            {dishes.map((dish, index) => (
              <div key={index} className="flex items-start gap-3 pl-4 border-l-2 border-[#c44536]">
                <p className="text-[#1a1410]">{dish}</p>
              </div>
            ))}
          </div>
        )}

        {/* Food carousel */}
        {foodPhotos.length > 0 && (
          <div className="flex justify-center mb-8">
            <div className="relative w-full max-w-md">
              <img
                src={foodPhotos[autoRotateIndex]}
                alt="Food"
                className="w-full h-64 object-cover rounded-lg"
              />
              
              {/* Navigation arrows */}
              <button
                onClick={() => setAutoRotateIndex((prev) => (prev - 1 + foodPhotos.length) % foodPhotos.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition"
              >
                <ChevronLeft className="w-5 h-5 text-[#1a1410]" />
              </button>
              <button
                onClick={() => setAutoRotateIndex((prev) => (prev + 1) % foodPhotos.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition"
              >
                <ChevronRight className="w-5 h-5 text-[#1a1410]" />
              </button>

              {/* Carousel indicators */}
              <div className="flex justify-center gap-2 mt-4">
                {foodPhotos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setAutoRotateIndex(index)}
                    className={`w-2 h-2 rounded-full transition ${
                      index === autoRotateIndex ? 'bg-[#c44536]' : 'bg-[#e8e3d8]'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Meet Host Section */}
      <section className="py-16 px-8 max-w-6xl mx-auto">
        <p className="text-sm text-[#c44536] font-semibold tracking-wider mb-2">ABOUT YOUR HOST</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left side - Details panel */}
          <div className="flex flex-col gap-8">
            {/* Host photo - 40% smaller */}
            {host.profilePhotoUrl && (
              <img
                src={host.profilePhotoUrl}
                alt={host.name}
                className="w-40 h-40 object-cover rounded-lg"
              />
            )}

            {/* Details */}
            <div className="space-y-4 text-sm">
              {host.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#c44536] flex-shrink-0 mt-0.5" />
                  <span className="text-[#1a1410]">{host.location}</span>
                </div>
              )}

              {languages.length > 0 && (
                <div className="flex items-start gap-3">
                  <Globe className="w-4 h-4 text-[#c44536] flex-shrink-0 mt-0.5" />
                  <span className="text-[#1a1410]">{languages.join(' · ')}</span>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Users className="w-4 h-4 text-[#c44536] flex-shrink-0 mt-0.5" />
                <span className="text-[#1a1410]">Up to {maxGuests} guests</span>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#c44536] flex-shrink-0 mt-0.5" />
                <span className="text-[#1a1410]">~120 minutes</span>
              </div>

              {/* Verified Host Badge */}
              <div className="flex items-center gap-2 text-[#c44536] font-semibold pt-2">
                <Check className="w-4 h-4" />
                <span>VERIFIED HOST</span>
              </div>
            </div>
          </div>

          {/* Right side - Bio sections */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h3 className="text-2xl font-serif mb-3">
                Meet <span className="text-[#c44536]">{host.name}</span>
              </h3>
              <p className="text-[#666] leading-relaxed">
                {host.bio}
              </p>
            </div>

            {host.funFacts && (
              <div>
                <p className="text-xs text-[#c44536] font-semibold tracking-wider mb-2">FUN FACTS</p>
                <p className="text-[#666] leading-relaxed">
                  {host.funFacts}
                </p>
              </div>
            )}

            {host.whyHost && (
              <div>
                <p className="text-xs text-[#c44536] font-semibold tracking-wider mb-2">WHY I WANT TO HOST</p>
                <p className="text-[#666] leading-relaxed">
                  {host.whyHost}
                </p>
              </div>
            )}

            {(host.culturalPassions || host.beyondFood) && (
              <div>
                <p className="text-xs text-[#c44536] font-semibold tracking-wider mb-2">PASSIONS & INTERESTS</p>
                <p className="text-[#666] leading-relaxed">
                  {host.culturalPassions} {host.beyondFood && `Beyond food, ${host.beyondFood}`}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Things to Know Section */}
      <section className="py-16 px-8 max-w-6xl mx-auto">
        <p className="text-sm text-[#c44536] font-semibold tracking-wider mb-2">BEFORE YOU BOOK</p>
        <h2 className="text-3xl font-serif mb-12">Things to Know</h2>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-xs text-[#c44536] font-semibold tracking-wider mb-2">DURATION</p>
            <p className="text-[#1a1410]">~120 minutes</p>
          </div>
          <div>
            <p className="text-xs text-[#c44536] font-semibold tracking-wider mb-2">GROUP SIZE</p>
            <p className="text-[#1a1410]">Up to {maxGuests} guests</p>
          </div>
          <div>
            <p className="text-xs text-[#c44536] font-semibold tracking-wider mb-2">DIETARY ACCOMMODATIONS</p>
            <p className="text-[#1a1410]">Contact host for details</p>
          </div>
          <div>
            <p className="text-xs text-[#c44536] font-semibold tracking-wider mb-2">LANGUAGES</p>
            <p className="text-[#1a1410]">{languages.join(', ')}</p>
          </div>
        </div>
      </section>

      {/* Booking Widget - Only appears after hero video */}
      <section className="py-16 px-8 max-w-2xl mx-auto mb-16">
        <div className="bg-white border border-[#e8e3d8] rounded-lg p-8">
          <h3 className="text-2xl font-serif mb-8">BOOK A SEAT</h3>

          <form onSubmit={handleBookingSubmit} className="space-y-6">
            {/* Date */}
            <div>
              <label className="block text-xs text-[#c44536] font-semibold tracking-wider mb-2">DATE</label>
              <input
                type="date"
                value={bookingData.selectedDate}
                onChange={(e) => setBookingData({ ...bookingData, selectedDate: e.target.value })}
                className="w-full px-4 py-3 border border-[#e8e3d8] rounded-lg focus:outline-none focus:border-[#c44536]"
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-xs text-[#c44536] font-semibold tracking-wider mb-2">TIME</label>
              <select
                value={bookingData.selectedTime}
                onChange={(e) => setBookingData({ ...bookingData, selectedTime: e.target.value })}
                className="w-full px-4 py-3 border border-[#e8e3d8] rounded-lg focus:outline-none focus:border-[#c44536]"
              >
                <option value="">Select a time</option>
                <option value="6:30 PM">6:30 PM</option>
                <option value="7:00 PM">7:00 PM</option>
                <option value="7:30 PM">7:30 PM</option>
                <option value="8:00 PM">8:00 PM</option>
              </select>
            </div>

            {/* Guests */}
            <div>
              <label className="block text-xs text-[#c44536] font-semibold tracking-wider mb-3">GUESTS</label>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setBookingData({ ...bookingData, numberOfGuests: num })}
                    className={`w-10 h-10 rounded-lg font-semibold transition ${
                      bookingData.numberOfGuests === num
                        ? 'bg-[#1a1410] text-white'
                        : 'bg-[#f5f0e8] text-[#1a1410] hover:bg-[#e8e3d8]'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs text-[#c44536] font-semibold tracking-wider mb-2">NAME</label>
              <input
                type="text"
                placeholder="Your name"
                value={bookingData.guestName}
                onChange={(e) => setBookingData({ ...bookingData, guestName: e.target.value })}
                className="w-full px-4 py-3 border border-[#e8e3d8] rounded-lg focus:outline-none focus:border-[#c44536]"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs text-[#c44536] font-semibold tracking-wider mb-2">EMAIL</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={bookingData.guestEmail}
                onChange={(e) => setBookingData({ ...bookingData, guestEmail: e.target.value })}
                className="w-full px-4 py-3 border border-[#e8e3d8] rounded-lg focus:outline-none focus:border-[#c44536]"
              />
            </div>

            {/* Dietary Restrictions */}
            <div>
              <label className="block text-xs text-[#c44536] font-semibold tracking-wider mb-2">DIETARY RESTRICTIONS</label>
              <textarea
                placeholder="Dietary restrictions, allergies, special requests..."
                value={bookingData.dietaryRestrictions}
                onChange={(e) => setBookingData({ ...bookingData, dietaryRestrictions: e.target.value })}
                className="w-full px-4 py-3 border border-[#e8e3d8] rounded-lg focus:outline-none focus:border-[#c44536] resize-none"
                rows={4}
              />
            </div>

            {/* Price and buttons */}
            <div className="pt-4 border-t border-[#e8e3d8]">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[#666]">¥{pricePerPerson} × {bookingData.numberOfGuests} guests</span>
                <span className="text-2xl font-serif text-[#1a1410]">¥{totalPrice}</span>
              </div>

              <button
                type="submit"
                className="w-full bg-[#c44536] text-white py-3 rounded-lg font-semibold hover:bg-[#a83a2a] transition mb-2"
              >
                RESERVE A SEAT
              </button>
              <p className="text-center text-xs text-[#999] italic">and pay later</p>

              <button
                type="button"
                className="w-full mt-4 border-2 border-[#c44536] text-[#c44536] py-3 rounded-lg font-semibold hover:bg-[#faf8f3] transition"
              >
                MESSAGE FIRST
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

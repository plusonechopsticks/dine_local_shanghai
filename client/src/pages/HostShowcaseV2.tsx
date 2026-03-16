import { useState } from 'react';
import { useLocation } from 'wouter';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

export default function HostShowcaseV2() {
  const [, setLocation] = useLocation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [menuExpanded, setMenuExpanded] = useState(false);
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

  // Limit menu description to max 5 lines
  const limitMenuDescription = (description: string): string => {
    if (!description) return description;
    
    const lines = description.split('\n').filter(line => line.trim());
    if (lines.length <= 5) {
      return description;
    }
    
    return lines.slice(0, 5).join('\n');
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
  const limitedMenuDescription = limitMenuDescription(menuDescription);
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
    <div className="bg-[#faf8f3] text-[#1a1410]">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white border-b border-[#e8e3d8]">
        <div className="container flex items-center justify-between h-16 px-6">
          <button
            onClick={() => setLocation('/hosts')}
            className="flex items-center gap-2 text-sm font-medium text-[#1a1410] hover:opacity-70"
          >
            <ChevronLeft size={18} />
            All Hosts
          </button>
          <div className="text-lg font-serif">+1 Chopsticks</div>
          <div className="w-20" />
        </div>
      </nav>

      {/* Hero Video Section */}
      <section className="relative w-full h-screen bg-gradient-to-b from-gray-800 to-gray-900 overflow-hidden">
        {/* Video background */}
        {host.introVideoUrl ? (
          <video
            src={host.introVideoUrl}
            autoPlay
            muted
            loop
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gray-800" />
        )}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Play button overlay (shown when no video) */}
        {!host.introVideoUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <div className="w-20 h-20 rounded-full border-2 border-white/60 flex items-center justify-center mb-4">
              <div className="w-0 h-0 border-l-8 border-l-white border-t-5 border-t-transparent border-b-5 border-b-transparent ml-1" />
            </div>
            <p className="text-white text-sm tracking-widest uppercase">
              Watch {host.hostName}
            </p>
          </div>
        )}

        {/* Bottom-left info overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-12 z-20">
          <div className="max-w-2xl">
            <p className="text-white/70 text-sm tracking-widest uppercase mb-2">
              {host.fullAddress || host.district} · Shanghai
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
                <div className="text-lg text-white font-serif">{maxGuests}</div>
              </div>
              <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-sm">
                <div className="text-xs text-white/70 uppercase tracking-wider">Duration</div>
                <div className="text-lg text-white font-serif">{host.mealDurationMinutes || 180} mins</div>
              </div>
            </div>

            {/* Language and feature tags */}
            <div className="flex flex-wrap gap-2">
              {host.languages && typeof host.languages === 'string' && host.languages.split(',').map((lang: string) => (
                <span key={lang.trim()} className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                  {lang.trim()}
                </span>
              ))}
              {host.languages && Array.isArray(host.languages) && host.languages.map((lang: string) => (
                <span key={lang} className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                  {lang}
                </span>
              ))}
              {host.hasPets && (
                <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                  {host.petDetails || 'Pets'}
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
          {/* Left: Menu description and sample menu */}
          <div>
            <p className="text-[#c44536] text-xs tracking-widest uppercase mb-2">The Menu</p>
            <h2 className="text-4xl font-serif mb-2">
              {host.cuisineStyle}
            </h2>
            
            {/* Menu description - max 5 lines */}
            <p className="text-gray-600 text-sm mb-8 leading-relaxed whitespace-pre-wrap">
              {limitedMenuDescription}
            </p>

            {/* Sample Menu expandable section */}
            <div>
              <button
                onClick={() => setMenuExpanded(!menuExpanded)}
                className="flex items-center gap-2 text-[#c44536] text-sm tracking-widest uppercase hover:opacity-70 transition"
              >
                <span>{menuExpanded ? '▼' : '▶'}</span>
                <span>Sample Menu</span>
              </button>
              
              {menuExpanded && dishes.length > 0 && (
                <div className="mt-4 space-y-2 ml-6 border-l border-gray-300 pl-4">
                  {dishes.map((dish, idx) => (
                    <div key={idx}>
                      <p className="font-serif text-sm text-gray-700">{dish}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Photo carousel */}
          <div className="relative">
            <div className="aspect-square bg-gray-300 rounded-sm overflow-hidden mb-4">
              {foodPhotos && foodPhotos.length > 0 ? (
                <img
                  src={foodPhotos[currentImageIndex]}
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
            {foodPhotos && foodPhotos.length > 1 && (
              <>
                <div className="flex justify-center gap-2 mb-4">
                  {foodPhotos.map((_: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-2 h-2 rounded-full transition ${
                        idx === currentImageIndex ? 'bg-[#1a1410]' : 'bg-gray-400'
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

      {/* Meet Host */}
      <section className="bg-white py-16 border-t border-[#e8e3d8]">
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
            {host.bio && (
              <div className="mb-8">
                <p className="text-gray-700 leading-relaxed">{host.bio}</p>
              </div>
            )}

            {/* Overseas Experience */}
            {host.otherHouseholdInfo && (
              <div className="mb-8">
                <p className="text-xs text-[#c44536] tracking-widest uppercase mb-2">Overseas Experience</p>
                <p className="text-gray-700 leading-relaxed">{host.otherHouseholdInfo}</p>
              </div>
            )}

            {/* Fun Facts */}
            {host.householdFeatures && (
              <div className="mb-8">
                <p className="text-xs text-[#c44536] tracking-widest uppercase mb-2">Fun Facts</p>
                <p className="text-gray-700 leading-relaxed">{host.householdFeatures}</p>
              </div>
            )}

            {/* Why I Want to Host */}
            {host.introVideoUrl && (
              <div className="mb-8">
                <p className="text-xs text-[#c44536] tracking-widest uppercase mb-2">Why I Want to Host</p>
                <p className="text-gray-700 leading-relaxed">
                  We love hosting friends and having nice chats over dinner. Cultural exchange is what we do.
                </p>
              </div>
            )}

            {/* Cultural Passions & Beyond Food */}
            <div>
              <p className="text-xs text-[#c44536] tracking-widest uppercase mb-2">Passions & Interests</p>
              <p className="text-gray-700 leading-relaxed">
                We are passionate about geography and exploring different cultures through food. Beyond food, we love sports, reading, and connecting with people from different backgrounds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Things to Know */}
      <section className="bg-[#faf8f3] py-16 border-t border-[#e8e3d8]">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-[#c44536] text-xs tracking-widest uppercase mb-2">Before You Book</p>
          <h2 className="text-4xl font-serif mb-12">Things to Know</h2>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs text-[#c44536] tracking-widest uppercase mb-2">Duration</p>
              <p className="text-lg">{host.mealDurationMinutes || 180} minutes</p>
            </div>
            <div>
              <p className="text-xs text-[#c44536] tracking-widest uppercase mb-2">Group Size</p>
              <p className="text-lg">Up to {maxGuests} guests</p>
            </div>
            <div>
              <p className="text-xs text-[#c44536] tracking-widest uppercase mb-2">Dietary Accommodations</p>
              <p className="text-lg">{host.dietaryNote || 'Contact host for details'}</p>
            </div>
            <div>
              <p className="text-xs text-[#c44536] tracking-widest uppercase mb-2">Languages</p>
              <p className="text-lg">{typeof host.languages === 'string' ? host.languages : Array.isArray(host.languages) ? host.languages.join(', ') : 'English, Mandarin'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Widget - Appears after hero section */}
      <div className="w-80 bg-white border border-[#e8e3d8] rounded-sm shadow-lg mx-auto mt-12 mb-12 hidden lg:block">
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
            <label className="text-xs text-[#c44536] tracking-widest uppercase block mb-2">Name</label>
            <input
              type="text"
              value={bookingData.guestName}
              onChange={(e) => setBookingData({ ...bookingData, guestName: e.target.value })}
              className="w-full px-3 py-2 border border-[#e8e3d8] rounded-sm text-sm"
              placeholder="Your name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-xs text-[#c44536] tracking-widest uppercase block mb-2">Email</label>
            <input
              type="email"
              value={bookingData.guestEmail}
              onChange={(e) => setBookingData({ ...bookingData, guestEmail: e.target.value })}
              className="w-full px-3 py-2 border border-[#e8e3d8] rounded-sm text-sm"
              placeholder="your@email.com"
            />
          </div>

          {/* Date */}
          <div>
            <label className="text-xs text-[#c44536] tracking-widest uppercase block mb-2">Date</label>
            <input
              type="date"
              value={bookingData.requestedDate}
              onChange={(e) => setBookingData({ ...bookingData, requestedDate: e.target.value })}
              className="w-full px-3 py-2 border border-[#e8e3d8] rounded-sm text-sm"
            />
          </div>

          {/* Meal Type */}
          <div>
            <label className="text-xs text-[#c44536] tracking-widest uppercase block mb-2">Meal</label>
            <select
              value={bookingData.mealType}
              onChange={(e) => setBookingData({ ...bookingData, mealType: e.target.value as 'lunch' | 'dinner' })}
              className="w-full px-3 py-2 border border-[#e8e3d8] rounded-sm text-sm"
            >
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
            </select>
          </div>

          {/* Guests */}
          <div>
            <label className="text-xs text-[#c44536] tracking-widest uppercase block mb-2">Guests</label>
            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: maxGuests }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => setBookingData({ ...bookingData, numberOfGuests: num })}
                  className={`py-2 text-sm rounded-sm border transition ${
                    bookingData.numberOfGuests === num
                      ? 'bg-[#1a1410] text-white border-[#1a1410]'
                      : 'border-[#e8e3d8] hover:border-[#1a1410]'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Special Requests / Dietary Restrictions */}
          <div>
            <label className="text-xs text-[#c44536] tracking-widest uppercase block mb-2">
              Dietary & Notes
            </label>
            <textarea
              value={bookingData.specialRequests}
              onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
              className="w-full px-3 py-2 border border-[#e8e3d8] rounded-sm text-sm resize-none"
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
              className="w-full bg-[#c44536] text-white py-3 rounded-sm text-xs tracking-widest uppercase font-medium hover:bg-[#a83a2d] transition"
            >
              Reserve a Seat
            </button>

            {/* Message Button */}
            <button className="w-full mt-2 border border-[#e8e3d8] py-2 rounded-sm text-xs tracking-widest uppercase hover:border-[#1a1410] transition">
              Message First
            </button>
          </div>
        </div>
      </div>


    </div>
  );
}

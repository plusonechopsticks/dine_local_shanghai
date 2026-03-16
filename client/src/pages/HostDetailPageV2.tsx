'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { ChevronLeft, ChevronRight, MapPin, Users, Clock, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '../lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function HostDetailPageV2() {
  const params = useParams();
  const hostId = params?.id ? parseInt(params.id) : null;
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [widgetVisible, setWidgetVisible] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    mealType: 'dinner',
    guests: 1,
    dietary: '',
  });

  // Fetch host data
  const { data: host, isLoading, error } = trpc.host.get.useQuery(
    { id: hostId || 0 },
    { enabled: !!hostId }
  );

  // Handle scroll to show/hide widget
  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight * 0.8; // 80vh
      setWidgetVisible(window.scrollY > heroHeight);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (error || !host) return <div className="p-8 text-center">Host not found</div>;

  const photos = host.foodPhotoUrls || [];
  const nextPhoto = () => setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  const prevPhoto = () => setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);

  const handleBookingSubmit = () => {
    if (!bookingData.name || !bookingData.email || !bookingData.date) {
      toast.error('Please fill in all required fields');
      return;
    }
    toast.success('Booking request submitted! (Demo - not functional)');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Video */}
      <section className="relative w-full bg-black" style={{ height: '80vh' }}>
        {host.introVideoUrl ? (
          <video
            src={host.introVideoUrl}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
            <p className="text-white text-lg">No video available</p>
          </div>
        )}
        <div className="absolute inset-0 bg-black/30" />
      </section>

      {/* Main Content */}
      <div className="relative">
        {/* Booking Widget - Fixed Sidebar (Hidden during hero) */}
        {widgetVisible && (
          <div className="fixed right-0 top-0 w-80 h-screen bg-white shadow-lg overflow-y-auto z-40 pt-20">
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-6">Reserve a Seat</h3>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    value={bookingData.name}
                    onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Your name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    value={bookingData.email}
                    onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="your@email.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    value={bookingData.phone}
                    onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="+86 ..."
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium mb-2">Date *</label>
                  <input
                    type="date"
                    value={bookingData.date}
                    onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* Meal Type */}
                <div>
                  <label className="block text-sm font-medium mb-2">Meal Type</label>
                  <select
                    value={bookingData.mealType}
                    onChange={(e) => setBookingData({ ...bookingData, mealType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-sm font-medium mb-2">Number of Guests</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        onClick={() => setBookingData({ ...bookingData, guests: num })}
                        className={`flex-1 py-2 rounded-lg font-medium transition ${
                          bookingData.guests === num
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dietary Requirements */}
                <div>
                  <label className="block text-sm font-medium mb-2">Dietary Requirements</label>
                  <textarea
                    value={bookingData.dietary}
                    onChange={(e) => setBookingData({ ...bookingData, dietary: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="e.g., vegetarian, allergies..."
                    rows={3}
                  />
                </div>

                {/* Price Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span>¥{host.pricePerPerson} × {bookingData.guests} guests</span>
                    <span className="font-bold">¥{host.pricePerPerson * bookingData.guests}</span>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleBookingSubmit}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-bold"
                >
                  Reserve a Seat
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className={widgetVisible ? 'mr-80' : ''}>
          {/* Menu Section */}
          <section className="py-16 px-8 max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-8">Menu</h2>

            {/* Photo Carousel */}
            {photos.length > 0 && (
              <div className="relative mb-12">
                <div className="relative w-full bg-gray-200 rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                  <img
                    src={photos[currentPhotoIndex]}
                    alt={`Food photo ${currentPhotoIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={prevPhoto}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextPhoto}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
                <div className="flex justify-center gap-2 mt-4">
                  {photos.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPhotoIndex(idx)}
                      className={`w-2 h-2 rounded-full transition ${
                        idx === currentPhotoIndex ? 'bg-gray-800' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Menu Description */}
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 whitespace-pre-line">{host.menuDescription}</p>
            </div>

            {/* Cuisine Info */}
            <div className="mt-12 grid grid-cols-2 gap-8">
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-2">Cuisine Style</h3>
                <p className="text-gray-700">{host.cuisineStyle}</p>
              </Card>
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-2">Dietary Notes</h3>
                <p className="text-gray-700">{host.dietaryNote || 'No specific notes'}</p>
              </Card>
            </div>
          </section>

          {/* Experience Details */}
          <section className="py-16 px-8 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-8">Experience Details</h2>
              <div className="grid grid-cols-2 gap-8">
                <div className="flex items-start gap-4">
                  <Clock className="text-red-500 mt-1" size={24} />
                  <div>
                    <h3 className="font-bold text-lg">Duration</h3>
                    <p className="text-gray-700">{host.mealDurationMinutes} minutes</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Users className="text-red-500 mt-1" size={24} />
                  <div>
                    <h3 className="font-bold text-lg">Max Guests</h3>
                    <p className="text-gray-700">Up to {host.maxGuests} people</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <DollarSign className="text-red-500 mt-1" size={24} />
                  <div>
                    <h3 className="font-bold text-lg">Price</h3>
                    <p className="text-gray-700">¥{host.pricePerPerson} per person</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="text-red-500 mt-1" size={24} />
                  <div>
                    <h3 className="font-bold text-lg">Location</h3>
                    <p className="text-gray-700">{host.district}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Meet the Host */}
          <section className="py-16 px-8 max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-8">Meet the Host</h2>

            <div className="flex gap-8 mb-12">
              {host.profilePhotoUrl && (
                <img
                  src={host.profilePhotoUrl}
                  alt={host.hostName}
                  className="w-32 h-32 rounded-lg object-cover"
                />
              )}
              <div>
                <h3 className="text-3xl font-bold mb-2">{host.hostName}</h3>
                <p className="text-gray-600 mb-4">
                  Languages: {host.languages?.join(', ') || 'Not specified'}
                </p>
                <p className="text-gray-700 leading-relaxed">{host.bio}</p>
              </div>
            </div>

            {/* Host Details */}
            <div className="grid grid-cols-1 gap-8">
              {host.overseasExperience && (
                <div>
                  <h4 className="text-xl font-bold mb-3">✈️ Overseas Experience</h4>
                  <p className="text-gray-700">{host.overseasExperience}</p>
                </div>
              )}

              {host.whyHost && (
                <div>
                  <h4 className="text-xl font-bold mb-3">🏠 Why We Host</h4>
                  <p className="text-gray-700">{host.whyHost}</p>
                </div>
              )}

              {host.culturalPassions && (
                <div>
                  <h4 className="text-xl font-bold mb-3">🌏 Cultural Passions</h4>
                  <p className="text-gray-700">{host.culturalPassions}</p>
                </div>
              )}

              {host.otherPassions && (
                <div>
                  <h4 className="text-xl font-bold mb-3">🎯 Other Passions</h4>
                  <p className="text-gray-700">{host.otherPassions}</p>
                </div>
              )}

              {host.funFacts && (
                <div>
                  <h4 className="text-xl font-bold mb-3">✨ Fun Facts</h4>
                  <p className="text-gray-700">{host.funFacts}</p>
                </div>
              )}
            </div>

            {/* Household Info */}
            <div className="mt-12 p-6 bg-blue-50 rounded-lg">
              <h4 className="text-lg font-bold mb-4">Household Info</h4>
              <div className="space-y-2 text-gray-700">
                <p>👶 Kids Friendly: {host.kidsFriendly ? 'Yes' : 'No'}</p>
                <p>🐾 Pets: {host.hasPets ? `Yes - ${host.petDetails || 'Pets present'}` : 'No'}</p>
                {host.otherHouseholdInfo && <p>ℹ️ {host.otherHouseholdInfo}</p>}
              </div>
            </div>
          </section>

          {/* Things to Know */}
          <section className="py-16 px-8 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-8">Things to Know</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-3">📋 Cancellation Policy</h3>
                  <p className="text-gray-700">Free cancellation up to 7 days before the meal.</p>
                </Card>

                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-3">🎒 What to Bring</h3>
                  <p className="text-gray-700">Just yourself! Casual dress is perfect.</p>
                </Card>

                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-3">⏰ Timing</h3>
                  <p className="text-gray-700">Please arrive 10-15 minutes early.</p>
                </Card>

                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-3">🚗 Transportation</h3>
                  <p className="text-gray-700">Transportation can be arranged if needed.</p>
                </Card>
              </div>

              {host.otherNotes && (
                <Card className="p-6 mt-8 border-l-4 border-red-500">
                  <h3 className="font-bold text-lg mb-3">📝 Additional Notes</h3>
                  <p className="text-gray-700">{host.otherNotes}</p>
                </Card>
              )}
            </div>
          </section>

          {/* Footer Spacing */}
          <div className="h-20" />
        </div>
      </div>
    </div>
  );
}

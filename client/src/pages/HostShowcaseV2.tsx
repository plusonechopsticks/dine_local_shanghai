'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Users, Clock, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Mock data for Norika & Steven (Host ID 1)
const NORIKA_STEVEN_DATA = {
  id: 1,
  hostName: 'Norika and Steven',
  profilePhotoUrl: 'https://res.cloudinary.com/drxfcfayd/image/upload/v1769882356/host-images/ifdaljpfkzdovtrq3pbj.jpg',
  introVideoUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/MkrKJzqKzwZGcieH.mov',
  foodPhotoUrls: [
    'https://res.cloudinary.com/drxfcfayd/image/upload/v1769882356/host-images/food1.jpg',
    'https://res.cloudinary.com/drxfcfayd/image/upload/v1769882356/host-images/food2.jpg',
    'https://res.cloudinary.com/drxfcfayd/image/upload/v1769882356/host-images/food3.jpg',
  ],
  bio: 'Hi! We are avid travelers who have been to more than 60 countries and love sharing our passion for food and culture. Steven and I met while traveling and have been exploring the world together ever since.',
  menuDescription: 'Northern-Southern fusion cuisine featuring traditional Shanghai dishes with modern twists. Our menu changes seasonally based on available ingredients.',
  cuisineStyle: 'Northern-Southern fusion',
  pricePerPerson: 250,
  maxGuests: 4,
  activities: 'Vegetarian options available',
  otherPassions: 'Squash, NBA, cycling, reading and international relations!',
  whyHost: 'We love hosting friends as we can share stories and joy over great food. Hosting is a way for us to connect with people from different backgrounds and cultures.',
  culturalPassions: 'Geography (ask me how big Shanghai is...)',
  overseasExperience: 'Steven lived abroad in US, Europe, Africa and LATAM before settling in Shanghai.',
  languages: 'English, Mandarin Chinese',
  location: 'Jing\'an District, Shanghai',
};

export default function HostShowcaseV2() {
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

  // Handle scroll to show/hide widget
  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight * 0.8; // 80vh
      setWidgetVisible(window.scrollY > heroHeight);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const host = NORIKA_STEVEN_DATA;
  const photos = host.foodPhotoUrls || [];
  
  const nextPhoto = () => setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  const prevPhoto = () => setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info('Demo mode - booking functionality not yet enabled');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Video */}
      <div className="relative w-full" style={{ height: '80vh' }}>
        <video
          src={host.introVideoUrl}
          autoPlay
          muted
          loop
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 p-8 max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="flex-1">
          {/* Menu Section */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">What We Serve</h2>
            <Card className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-2">{host.cuisineStyle}</h3>
              <p className="text-gray-600 mb-4">{host.menuDescription}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <DollarSign className="w-4 h-4" />
                <span>¥{host.pricePerPerson} per person</span>
              </div>
            </Card>

            {/* Photo Carousel */}
            {photos.length > 0 && (
              <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-6">
                <img
                  src={photos[currentPhotoIndex]}
                  alt={`Food photo ${currentPhotoIndex + 1}`}
                  className="w-full h-80 object-cover"
                />
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={prevPhoto}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextPhoto}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {photos.map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-2 h-2 rounded-full ${
                            idx === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </section>

          {/* Meet the Host Section */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Meet Your Hosts</h2>
            <div className="flex gap-6 mb-6">
              <img
                src={host.profilePhotoUrl}
                alt={host.hostName}
                className="w-32 h-32 rounded-full object-cover"
              />
              <div>
                <h3 className="text-2xl font-bold mb-2">{host.hostName}</h3>
                <p className="text-gray-600 mb-4">{host.bio}</p>
                <div className="space-y-2 text-sm">
                  <p><strong>Languages:</strong> {host.languages}</p>
                  <p><strong>Location:</strong> {host.location}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Things to Know Section */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Things to Know</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Group Size
                </h4>
                <p className="text-gray-600">Up to {host.maxGuests} guests per meal</p>
              </Card>
              <Card className="p-6">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Duration
                </h4>
                <p className="text-gray-600">Approximately 2-3 hours</p>
              </Card>
              <Card className="p-6">
                <h4 className="font-semibold mb-2">Passions</h4>
                <p className="text-gray-600">{host.otherPassions}</p>
              </Card>
              <Card className="p-6">
                <h4 className="font-semibold mb-2">Why We Host</h4>
                <p className="text-gray-600">{host.whyHost}</p>
              </Card>
            </div>
          </section>

          {/* Additional Info */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">More About Us</h2>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Cultural Interests</h4>
                <p className="text-gray-600">{host.culturalPassions}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">International Experience</h4>
                <p className="text-gray-600">{host.overseasExperience}</p>
              </div>
            </div>
          </section>
        </div>

        {/* Booking Widget Sidebar - Only visible after scrolling past hero */}
        {widgetVisible && (
          <div className="lg:w-80 lg:sticky lg:top-24 lg:h-fit">
            <Card className="p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4">Reserve a Seat</h3>
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={bookingData.name}
                    onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={bookingData.email}
                    onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={bookingData.phone}
                    onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+86 1234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={bookingData.date}
                    onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Meal Type</label>
                  <select
                    value={bookingData.mealType}
                    onChange={(e) => setBookingData({ ...bookingData, mealType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Number of Guests</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setBookingData({ ...bookingData, guests: num })}
                        className={`flex-1 py-2 rounded-lg border ${
                          bookingData.guests === num
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Dietary Requirements</label>
                  <textarea
                    value={bookingData.dietary}
                    onChange={(e) => setBookingData({ ...bookingData, dietary: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Vegetarian, no shellfish..."
                    rows={3}
                  />
                </div>

                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Total: <strong>¥{host.pricePerPerson * bookingData.guests}</strong>
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium"
                >
                  Reserve a Seat
                </Button>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

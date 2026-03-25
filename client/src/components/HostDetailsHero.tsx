import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HostDetailsHeroProps {
  hostName: string;
  district: string;
  cuisine: string;
  pricePerPerson: number;
  maxGuests: number;
  introVideoUrl?: string;
  foodPhotoUrls?: string[];
}

export function HostDetailsHero({
  hostName,
  district,
  cuisine,
  pricePerPerson,
  maxGuests,
  introVideoUrl,
  foodPhotoUrls = [],
}: HostDetailsHeroProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Auto-advance slideshow every 5 seconds if no video
  useEffect(() => {
    if (!introVideoUrl && foodPhotoUrls.length > 1) {
      const interval = setInterval(() => {
        setCurrentPhotoIndex((prev) => (prev + 1) % foodPhotoUrls.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [introVideoUrl, foodPhotoUrls.length]);

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + foodPhotoUrls.length) % foodPhotoUrls.length);
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % foodPhotoUrls.length);
  };

  return (
    <section className="relative w-full bg-black" style={{ height: '80vh' }}>
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <a
          href="/hosts"
          className="inline-flex items-center gap-2 text-white hover:text-gray-300 transition text-sm font-medium"
        >
          <ChevronLeft size={20} />
          ALL HOSTS
        </a>
      </div>

      {/* Video or Slideshow */}
      <div className="w-full h-full flex items-center justify-center">
        {introVideoUrl ? (
          <video
            src={introVideoUrl}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        ) : foodPhotoUrls.length > 0 ? (
          <>
            <img
              src={foodPhotoUrls[currentPhotoIndex]}
              alt={`${hostName} photo ${currentPhotoIndex + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Slideshow Navigation */}
            {foodPhotoUrls.length > 1 && (
              <>
                <button
                  onClick={handlePrevPhoto}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-3 transition z-10"
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={24} className="text-white" />
                </button>
                <button
                  onClick={handleNextPhoto}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-3 transition z-10"
                  aria-label="Next photo"
                >
                  <ChevronRight size={24} className="text-white" />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="text-white text-lg">No media available</div>
        )}
      </div>

      {/* Overlay gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-8 z-20 text-white">
        <div className="max-w-7xl mx-auto">
          {/* Location */}
          <p className="text-sm font-semibold tracking-wide mb-4 text-gray-200">
            {district} · SHANGHAI
          </p>

          {/* Host Name */}
          <h1 className="text-5xl md:text-6xl font-light mb-6 leading-tight">
            {hostName}
          </h1>

          {/* Cuisine */}
          <p className="text-lg mb-8 text-gray-100">
            {cuisine}
          </p>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-6 max-w-md">
            <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded">
              <p className="text-xs font-semibold text-gray-300 mb-1">PRICE</p>
              <p className="text-xl font-semibold">¥{pricePerPerson}/person</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded">
              <p className="text-xs font-semibold text-gray-300 mb-1">MAX GUESTS</p>
              <p className="text-xl font-semibold">{maxGuests}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

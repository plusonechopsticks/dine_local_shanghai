import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react';

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
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-advance slideshow every 5 seconds when not playing video
  useEffect(() => {
    if (!videoPlaying && foodPhotoUrls.length > 1) {
      const interval = setInterval(() => {
        setCurrentPhotoIndex((prev) => (prev + 1) % foodPhotoUrls.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [videoPlaying, foodPhotoUrls.length]);

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + foodPhotoUrls.length) % foodPhotoUrls.length);
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % foodPhotoUrls.length);
  };

  const handlePlayVideo = () => {
    setVideoPlaying(true);
    // Give the video element time to render, then play
    setTimeout(() => {
      videoRef.current?.play();
    }, 50);
  };

  const handleCloseVideo = () => {
    videoRef.current?.pause();
    setVideoPlaying(false);
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

      {/* Background: photo slideshow (always visible) */}
      <div className="w-full h-full flex items-center justify-center">
        {foodPhotoUrls.length > 0 ? (
          <>
            <img
              src={foodPhotoUrls[currentPhotoIndex]}
              alt={`${hostName} photo ${currentPhotoIndex + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Slideshow Navigation — only when video not playing */}
            {!videoPlaying && foodPhotoUrls.length > 1 && (
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

      {/* Video player overlay — rendered on top when playing */}
      {videoPlaying && introVideoUrl && (
        <div className="absolute inset-0 z-30 bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            src={introVideoUrl}
            controls
            playsInline
            className="w-full h-full object-contain"
          />
          {/* Close button */}
          <button
            onClick={handleCloseVideo}
            className="absolute top-6 right-6 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition z-40"
            aria-label="Close video"
          >
            <X size={22} />
          </button>
        </div>
      )}

      {/* Overlay gradient for text readability */}
      {!videoPlaying && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
      )}

      {/* Content Overlay — hidden while video plays */}
      {!videoPlaying && (
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

            {/* Info Grid + Play button row */}
            <div className="flex flex-wrap items-end gap-4">
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

              {/* Play video button */}
              {introVideoUrl && (
                <button
                  onClick={handlePlayVideo}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-5 py-3 rounded transition font-medium text-sm"
                  aria-label="Play host intro video"
                >
                  <Play size={18} fill="white" />
                  Watch Intro
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

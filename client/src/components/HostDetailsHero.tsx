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

  // Derive a static poster image from the Cloudinary video URL (only works for Cloudinary-hosted videos)
  const videoPoster =
    introVideoUrl && introVideoUrl.includes('res.cloudinary.com')
      ? introVideoUrl
          .replace('/video/upload/', '/video/upload/so_0,f_jpg/')
          .replace(/\.mp4$/, '.jpg')
      : undefined;

  // Background image: food photo or video thumbnail fallback
  const backgroundSrc =
    foodPhotoUrls.length > 0
      ? foodPhotoUrls[currentPhotoIndex]
      : videoPoster;

  // Auto-advance slideshow every 5 seconds when not playing video
  useEffect(() => {
    if (!videoPlaying && foodPhotoUrls.length > 1) {
      const interval = setInterval(() => {
        setCurrentPhotoIndex((prev) => (prev + 1) % foodPhotoUrls.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [videoPlaying, foodPhotoUrls.length]);

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev - 1 + foodPhotoUrls.length) % foodPhotoUrls.length);
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev + 1) % foodPhotoUrls.length);
  };

  const handlePlayVideo = () => {
    setVideoPlaying(true);
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
      <div className="absolute top-6 left-6 z-30">
        <a
          href="/hosts"
          className="inline-flex items-center gap-2 text-white hover:text-gray-300 transition text-sm font-medium"
        >
          <ChevronLeft size={20} />
          ALL HOSTS
        </a>
      </div>

      {/* ── THUMBNAIL STATE (default) ── */}
      {!videoPlaying && (
        <>
          {/* Background photo / video thumbnail */}
          <div
            className={`w-full h-full ${introVideoUrl ? 'cursor-pointer' : ''}`}
            onClick={introVideoUrl ? handlePlayVideo : undefined}
          >
            {backgroundSrc ? (
              <img
                src={backgroundSrc}
                alt={`${hostName} photo`}
                className="w-full h-full object-cover"
                loading="eager"
                fetchPriority="high"
              />
            ) : (
              <div className="w-full h-full bg-gray-900" />
            )}
          </div>

          {/* Slideshow prev/next — only when multiple photos and no video overlay */}
          {foodPhotoUrls.length > 1 && (
            <>
              <button
                onClick={handlePrevPhoto}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-3 transition z-20"
                aria-label="Previous photo"
              >
                <ChevronLeft size={24} className="text-white" />
              </button>
              <button
                onClick={handleNextPhoto}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-3 transition z-20"
                aria-label="Next photo"
              >
                <ChevronRight size={24} className="text-white" />
              </button>
            </>
          )}

          {/* Large centred play button — shown when a video is available */}
          {introVideoUrl && (
            <button
              onClick={handlePlayVideo}
              className="absolute inset-0 flex items-center justify-center z-20 group"
              aria-label="Play host intro video"
            >
              <div className="w-20 h-20 rounded-full bg-black/50 group-hover:bg-black/70 backdrop-blur-sm flex items-center justify-center transition-all group-hover:scale-110 shadow-2xl">
                <Play size={36} fill="white" className="text-white ml-1" />
              </div>
            </button>
          )}

          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10 pointer-events-none" />

          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 z-20 text-white pointer-events-none">
            <div className="max-w-7xl mx-auto">
              <p className="text-sm font-semibold tracking-wide mb-4 text-gray-200">
                {district} · SHANGHAI
              </p>
              <h1 className="text-5xl md:text-6xl font-light mb-6 leading-tight">
                {hostName}
              </h1>
              <p className="text-lg mb-8 text-gray-100">{cuisine}</p>
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
        </>
      )}

      {/* ── VIDEO PLAYING STATE ── */}
      {videoPlaying && introVideoUrl && (
        <div className="absolute inset-0 z-30 bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            src={introVideoUrl}
            poster={videoPoster}
            controls
            playsInline
            className="w-full h-full object-contain"
          />
          <button
            onClick={handleCloseVideo}
            className="absolute top-6 right-6 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition z-40"
            aria-label="Close video"
          >
            <X size={22} />
          </button>
        </div>
      )}
    </section>
  );
}

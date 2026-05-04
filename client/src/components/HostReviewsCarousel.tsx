import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface TestimonialImage {
  url: string;
  alt: string;
}

interface Testimonial {
  id: string;
  hostId?: number;
  guestName: string;
  location: string;
  travelerType: string;
  hostName?: string;
  hostDate?: string;
  experienceTitle?: string;
  previewText: string;
  fullText: string;
  images: TestimonialImage[];
  cta: string;
}

interface HostReviewsCarouselProps {
  testimonials: Testimonial[];
}

export function HostReviewsCarousel({ testimonials }: HostReviewsCarouselProps) {
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const CARD_WIDTH = 320; // px, matches card min-w below
  const GAP = 24; // gap-6

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [testimonials]);

  const scrollBy = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -(CARD_WIDTH + GAP) : CARD_WIDTH + GAP, behavior: "smooth" });
  };

  if (!testimonials || testimonials.length === 0) return null;

  const showArrows = canScrollLeft || canScrollRight;

  return (
    <section className="py-16 px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Header row */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-4xl font-bold text-gray-900">What Guests Say</h2>
            <p className="text-gray-500 mt-1 text-sm">Real reviews from guests who dined here</p>
          </div>
          {showArrows && (
            <div className="flex gap-2 mt-1 shrink-0">
              <button
                onClick={() => scrollBy("left")}
                disabled={!canScrollLeft}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition"
                aria-label="Scroll left"
              >
                <ChevronLeft size={20} className="text-gray-700" />
              </button>
              <button
                onClick={() => scrollBy("right")}
                disabled={!canScrollRight}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition"
                aria-label="Scroll right"
              >
                <ChevronRight size={20} className="text-gray-700" />
              </button>
            </div>
          )}
        </div>

        {/* Carousel track */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scroll-smooth pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="min-w-[300px] max-w-[300px] bg-[#faf8f4] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col"
              onClick={() => { setSelectedTestimonial(t); setSelectedImageIndex(0); }}
            >
              {/* Photo */}
              {t.images.length > 0 && (
                <div className="w-full aspect-square overflow-hidden bg-gray-200">
                  <img
                    src={t.images[0].url}
                    alt={t.images[0].alt}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                {/* Stars */}
                <div className="flex gap-0.5 mb-3">
                  {[1,2,3,4,5].map((s) => (
                    <svg key={s} className="w-4 h-4 text-amber-500 fill-amber-500" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>

                {/* Name + location */}
                <p className="font-bold text-gray-900 text-base leading-tight">{t.guestName}</p>
                <p className="text-gray-500 text-xs mt-0.5 mb-2">{t.location}</p>

                {/* Traveler type badge */}
                <span className="inline-block self-start bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full mb-3">
                  {t.travelerType}
                </span>

                {/* Quote */}
                <div className="flex-1">
                  <span className="text-amber-500 text-3xl font-serif leading-none mr-1">"</span>
                  <p className="text-gray-700 text-sm leading-relaxed italic line-clamp-4 inline">
                    {t.previewText}
                  </p>
                </div>

                {/* CTA */}
                <button
                  className="mt-4 text-amber-700 hover:text-amber-800 font-semibold text-sm underline text-left"
                  onClick={(e) => { e.stopPropagation(); setSelectedTestimonial(t); setSelectedImageIndex(0); }}
                >
                  {t.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedTestimonial && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedTestimonial(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-modal-title"
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h2 id="review-modal-title" className="text-lg font-bold text-gray-900">Guest Review</h2>
              <button
                onClick={() => setSelectedTestimonial(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
                aria-label="Close"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              {/* Image carousel in modal */}
              {selectedTestimonial.images.length > 0 && (
                <div className="mb-6 relative bg-gray-100 rounded-xl overflow-hidden" style={{ aspectRatio: "4/3" }}>
                  <img
                    src={selectedTestimonial.images[selectedImageIndex].url}
                    alt={selectedTestimonial.images[selectedImageIndex].alt}
                    className="w-full h-full object-contain"
                  />
                  {selectedTestimonial.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setSelectedImageIndex((p) => p === 0 ? selectedTestimonial.images.length - 1 : p - 1)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2"
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={() => setSelectedImageIndex((p) => p === selectedTestimonial.images.length - 1 ? 0 : p + 1)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2"
                        aria-label="Next image"
                      >
                        <ChevronRight size={20} />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {selectedTestimonial.images.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`h-2 rounded-full transition-all ${idx === selectedImageIndex ? "bg-white w-5" : "bg-white/60 w-2"}`}
                            aria-label={`Image ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
                {[1,2,3,4,5].map((s) => (
                  <svg key={s} className="w-5 h-5 text-amber-500 fill-amber-500" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>

              {/* Attribution */}
              <p className="font-bold text-gray-900 text-base">{selectedTestimonial.guestName}</p>
              <p className="text-gray-500 text-sm mb-1">{selectedTestimonial.location}</p>
              <span className="inline-block bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full mb-5">
                {selectedTestimonial.travelerType}
              </span>

              {/* Full text */}
              <div className="text-gray-800 leading-relaxed space-y-3">
                {selectedTestimonial.fullText.split(/\n\n+/).map((para, i, arr) => (
                  <p key={i}>
                    {i === 0 && <span className="text-gray-400">"</span>}
                    {para.split("\n").map((line, j) => (
                      <span key={j}>{line}{j < para.split("\n").length - 1 && <br />}</span>
                    ))}
                    {i === arr.length - 1 && <span className="text-gray-400">"</span>}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

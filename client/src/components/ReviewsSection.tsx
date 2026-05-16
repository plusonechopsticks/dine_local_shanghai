import { useState, useRef, useCallback } from "react";
import { Link } from "wouter";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { TravelerSegment } from "@/data/testimonials";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TestimonialImage {
  url: string;
  alt: string;
}

export interface Testimonial {
  id: string;
  hostId?: number;
  guestName: string;
  location: string;
  travelerType: string;
  travelerSegment?: TravelerSegment;
  hostName?: string;
  hostDate?: string;
  experienceTitle?: string;
  previewText: string;
  fullText: string;
  images: TestimonialImage[];
  cta: string;
}

// ─── ReviewCard ───────────────────────────────────────────────────────────────

interface ReviewCardProps {
  review: Testimonial;
  className?: string;
  onOpen: (review: Testimonial) => void;
}

function ReviewCard({ review, className = "", onOpen }: ReviewCardProps) {
  return (
    <div
      data-review-card
      className={`bg-[#faf8f4] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col ${className}`}
      onClick={() => onOpen(review)}
    >
      {/* Photo — 4:3 ratio matching host cards */}
      {review.images.length > 0 && (
        <div className="w-full aspect-[4/3] overflow-hidden bg-gray-200 shrink-0">
          <img
            src={review.images[0].url}
            alt={review.images[0].alt}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      {/* Content */}
      <div className="p-4 max-md:p-3 flex flex-col flex-1">
        {/* Stars */}
        <div className="flex gap-0.5 mb-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <svg key={s} className="w-3.5 h-3.5 max-md:w-3 max-md:h-3 text-amber-500 fill-amber-500" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        {/* Name + location */}
        <p className="font-bold text-gray-900 text-sm max-md:text-xs leading-tight">{review.guestName}</p>
        <p className="text-gray-500 text-xs mt-0.5 mb-1.5">{review.location}</p>
        {/* Traveler type badge */}
        <span className="inline-block self-start bg-amber-100 text-amber-800 text-xs font-medium px-2 py-0.5 rounded-full mb-1.5">
          {review.travelerType}
        </span>
        {/* Dined with host tag — clickable link to host detail page */}
        {review.hostName && (
          review.hostId ? (
            <Link
              href={`/hosts/${review.hostId}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 self-start bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full mb-2 transition-colors"
            >
              <svg className="w-3 h-3 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              Dined with {review.hostName}
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 self-start bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full mb-2">
              <svg className="w-3 h-3 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              Dined with {review.hostName}
            </span>
          )
        )}
        {/* Quote */}
        <div className="flex-1">
          <span className="text-amber-500 text-2xl max-md:text-xl font-serif leading-none mr-1">"</span>
          <p className="text-gray-700 text-xs max-md:text-[11px] leading-relaxed italic line-clamp-3 inline">
            {review.previewText}
          </p>
        </div>
        {/* CTA */}
        <button
          className="mt-2 text-amber-700 hover:text-amber-800 font-semibold text-xs underline text-left"
          onClick={(e) => {
            e.stopPropagation();
            onOpen(review);
          }}
        >
          {review.cta}
        </button>
      </div>
    </div>
  );
}

// ─── Segment ──────────────────────────────────────────────────────────────────

interface SegmentProps {
  title: string;
  segment: TravelerSegment;
  reviews: Testimonial[];
  onOpen: (review: Testimonial) => void;
}

function Segment({ title, reviews, onOpen }: SegmentProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeDotIdx, setActiveDotIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const visibleReviews = expanded ? reviews : reviews.slice(0, 3);
  const hiddenCount = reviews.length - 3;

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    if (window.innerWidth > 768) return;
    const firstCard = scrollRef.current.querySelector("[data-review-card]") as HTMLElement;
    if (!firstCard) return;
    const cardWidth = firstCard.offsetWidth + 12; // 12px gap
    const idx = Math.round(scrollRef.current.scrollLeft / cardWidth);
    setActiveDotIdx(idx);
  }, []);

  if (reviews.length === 0) return null;

  return (
    <div className="mb-10 md:mb-12">
      {/* Segment header */}
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="text-[17px] font-medium text-gray-900">
          {title}
          <span className="ml-1.5 text-[13px] text-gray-500 font-normal">
            · {reviews.length} {reviews.length === 1 ? "story" : "stories"}
          </span>
        </h3>

      </div>

      {/* Grid (desktop) / horizontal scroll (mobile) */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={`
          grid gap-3.5
          ${reviews.length === 1 ? "grid-cols-1 max-w-sm" : reviews.length === 2 ? "grid-cols-2 justify-start" : "grid-cols-3"}
          max-md:flex max-md:overflow-x-auto max-md:snap-x max-md:snap-mandatory
          max-md:gap-3 max-md:-mx-4 max-md:px-4 max-md:pr-6
          scrollbar-hide
        `}
      >
        {visibleReviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            onOpen={onOpen}
            className="max-md:w-[calc(100vw-48px)] max-md:min-w-[calc(100vw-48px)] max-md:snap-start max-md:shrink-0"
          />
        ))}

        {/* Mobile only: render hidden cards so scroll can reach them */}
        {!expanded &&
          reviews.slice(3).map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onOpen={onOpen}
              className="hidden max-md:flex max-md:w-[calc(100vw-48px)] max-md:min-w-[calc(100vw-48px)] max-md:snap-start max-md:shrink-0"
            />
          ))}
      </div>

      {/* Mobile scroll dots */}
      <div className="hidden max-md:flex justify-center gap-1.5 mt-3">
        {reviews.map((_, i) => (
          <div
            key={i}
            className={`h-[5px] rounded-full transition-all duration-200 ${
              i === activeDotIdx ? "w-4 bg-gray-900" : "w-[5px] bg-gray-300"
            }`}
          />
        ))}
      </div>

      {/* Desktop show more button */}
      {hiddenCount > 0 && (
        <div className="hidden md:flex justify-center mt-5">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[13px] font-medium px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-colors"
          >
            {expanded
              ? "↑ Show less"
              : `Show ${hiddenCount} more ${hiddenCount === 1 ? "story" : "stories"} ↓`}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  review: Testimonial;
  onClose: () => void;
}

function ReviewModal({ review, onClose }: ModalProps) {
  const [imgIdx, setImgIdx] = useState(0);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
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
          <h2 id="review-modal-title" className="text-lg font-bold text-gray-900">
            Guest Review
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
            aria-label="Close"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>
        <div className="p-6">
          {/* Image carousel */}
          {review.images.length > 0 && (
            <div
              className="mb-6 relative bg-gray-100 rounded-xl overflow-hidden"
              style={{ aspectRatio: "4/3" }}
            >
              <img
                src={review.images[imgIdx].url}
                alt={review.images[imgIdx].alt}
                className="w-full h-full object-contain"
              />
              {review.images.length > 1 && (
                <>
                  <button
                    onClick={() => setImgIdx((p) => (p === 0 ? review.images.length - 1 : p - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setImgIdx((p) => (p === review.images.length - 1 ? 0 : p + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {review.images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setImgIdx(idx)}
                        className={`h-2 rounded-full transition-all ${
                          idx === imgIdx ? "bg-white w-5" : "bg-white/60 w-2"
                        }`}
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
            {[1, 2, 3, 4, 5].map((s) => (
              <svg key={s} className="w-5 h-5 text-amber-500 fill-amber-500" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          {/* Attribution */}
          <p className="font-bold text-gray-900 text-base">{review.guestName}</p>
          <p className="text-gray-500 text-sm mb-1">{review.location}</p>
          <span className="inline-block bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full mb-5">
            {review.travelerType}
          </span>
          {/* Full text */}
          <div className="text-gray-800 leading-relaxed space-y-3">
            {review.fullText.split(/\n\n+/).map((para, i, arr) => (
              <p key={i}>
                {i === 0 && <span className="text-gray-400">"</span>}
                {para.split("\n").map((line, j) => (
                  <span key={j}>
                    {line}
                    {j < para.split("\n").length - 1 && <br />}
                  </span>
                ))}
                {i === arr.length - 1 && <span className="text-gray-400">"</span>}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ReviewsSection (main export) ────────────────────────────────────────────

interface ReviewsSectionProps {
  testimonials: Testimonial[];
  /** Pass false to render a flat carousel instead of segments (e.g. on host detail pages with few reviews) */
  useSegments?: boolean;
}

export function ReviewsSection({ testimonials, useSegments = true }: ReviewsSectionProps) {
  const [openReview, setOpenReview] = useState<Testimonial | null>(null);

  if (!testimonials || testimonials.length === 0) return null;

  const solo = testimonials.filter((r) => r.travelerSegment === "solo");
  const family = testimonials.filter((r) => r.travelerSegment === "family");
  const couples = testimonials.filter((r) => r.travelerSegment === "couples");

  // If useSegments=false OR none have a travelerSegment, fall back to a flat 3-col grid
  const hasSegments = useSegments && (solo.length > 0 || family.length > 0 || couples.length > 0);

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section header — matches other homepage sections */}
        <div className="mb-10 max-md:mb-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            What guests say after their experience
          </h2>
          <p className="text-sm text-gray-500">Real stories from travelers like you</p>
        </div>

        {hasSegments ? (
          <>
            <Segment
              title="Solo & business travelers"
              segment="solo"
              reviews={solo}
              onOpen={setOpenReview}
            />
            <Segment
              title="Families"
              segment="family"
              reviews={family}
              onOpen={setOpenReview}
            />
            <Segment
              title="Friends & couples"
              segment="couples"
              reviews={couples}
              onOpen={setOpenReview}
            />
          </>
        ) : (
          /* Flat fallback grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((r) => (
              <ReviewCard key={r.id} review={r} onOpen={setOpenReview} />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {openReview && (
        <ReviewModal review={openReview} onClose={() => setOpenReview(null)} />
      )}
    </section>
  );
}

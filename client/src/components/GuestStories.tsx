import React, { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface TestimonialImage {
  url: string;
  alt: string;
  type: "guest" | "host" | "food" | "experience";
  caption?: string;
}

interface GuestTestimonial {
  id: number;
  guestName: string;
  guestLocation: string;
  travelerType: string;
  title: string;
  subtitle?: string;
  attributionLine: string;
  previewText: string;
  fullText: string;
  additionalText?: string;
  tertiaryText?: string;
  images: TestimonialImage[];
  badge?: string;
  tags?: string[];
}

interface GuestStoriesProps {
  testimonials: GuestTestimonial[];
}

export function GuestStories({ testimonials }: GuestStoriesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTestimonial, setSelectedTestimonial] = useState<GuestTestimonial | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const itemsPerPage = 3;
  const totalPages = Math.ceil(testimonials.length / itemsPerPage);
  const currentPage = Math.floor(currentIndex / itemsPerPage);

  const visibleTestimonials = testimonials.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - itemsPerPage + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + itemsPerPage) % testimonials.length);
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index * itemsPerPage);
  };

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p className="text-sm font-semibold text-amber-700 mb-2">GUEST STORIES</p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What guests say after their +1 Chopsticks experience
          </h2>
          <p className="text-lg text-gray-600">
            Private meals that feel welcoming, memorable, and genuinely local.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {visibleTestimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              onOpenModal={() => {
                setSelectedTestimonial(testimonial);
                setSelectedImageIndex(0);
              }}
            />
          ))}
        </div>

        {/* Carousel Navigation */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={handlePrevious}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Previous testimonials"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentPage ? "bg-amber-700" : "bg-gray-300"
                }`}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Next testimonials"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <button className="px-8 py-3 bg-amber-800 text-white rounded-full font-semibold hover:bg-amber-900 transition-colors">
            Book your own experience
          </button>
        </div>
      </div>

      {/* Modal */}
      {selectedTestimonial && (
        <TestimonialModal
          testimonial={selectedTestimonial}
          imageIndex={selectedImageIndex}
          onImagePrevious={() =>
            setSelectedImageIndex((prev) =>
              prev === 0 ? selectedTestimonial.images.length - 1 : prev - 1
            )
          }
          onImageNext={() =>
            setSelectedImageIndex((prev) =>
              prev === selectedTestimonial.images.length - 1 ? 0 : prev + 1
            )
          }
          onClose={() => setSelectedTestimonial(null)}
        />
      )}
    </section>
  );
}

interface TestimonialCardProps {
  testimonial: GuestTestimonial;
  onOpenModal: () => void;
}

function TestimonialCard({ testimonial, onOpenModal }: TestimonialCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === 0 ? testimonial.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === testimonial.images.length - 1 ? 0 : prev + 1
    );
  };

  const currentImage = testimonial.images[currentImageIndex];

  return (
    <div
      className="bg-amber-50 rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onOpenModal}
    >
      {/* Image Carousel */}
      <div className="relative h-64 bg-gray-200 overflow-hidden">
        <img
          src={currentImage.url}
          alt={currentImage.alt}
          className="w-full h-full object-cover"
        />

        {/* Image Navigation */}
        {testimonial.images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {testimonial.images.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentImageIndex ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Badge */}
        {testimonial.badge && (
          <div className="inline-block bg-white px-3 py-1 rounded-full text-sm font-semibold text-amber-800 mb-3">
            {testimonial.badge}
          </div>
        )}

        {/* Quote */}
        <p className="text-gray-800 text-sm leading-relaxed mb-4 line-clamp-4">
          "{testimonial.previewText}"
        </p>

        {/* Attribution */}
        <div className="border-t border-amber-200 pt-4">
          <p className="font-semibold text-amber-900 text-sm mb-1">
            {testimonial.guestName}
          </p>
          <p className="text-xs text-gray-600 mb-3">
            {testimonial.title}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenModal();
            }}
            className="text-amber-800 font-semibold text-sm hover:underline"
          >
            Read more
          </button>
        </div>
      </div>
    </div>
  );
}

interface TestimonialModalProps {
  testimonial: GuestTestimonial;
  imageIndex: number;
  onImagePrevious: () => void;
  onImageNext: () => void;
  onClose: () => void;
}

function TestimonialModal({
  testimonial,
  imageIndex,
  onImagePrevious,
  onImageNext,
  onClose,
}: TestimonialModalProps) {
  const currentImage = testimonial.images[imageIndex];

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          {/* Image Section */}
          <div className="flex flex-col gap-4">
            <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={currentImage.url}
                alt={currentImage.alt}
                className="w-full h-full object-cover"
              />

              {/* Image Navigation */}
              {testimonial.images.length > 1 && (
                <>
                  <button
                    onClick={onImagePrevious}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={onImageNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>

                  {/* Dots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {testimonial.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          // This would need state management in parent
                        }}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === imageIndex ? "bg-white" : "bg-white/50"
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Image Caption */}
            {currentImage.caption && (
              <p className="text-sm text-gray-600 italic">{currentImage.caption}</p>
            )}
          </div>

          {/* Text Section */}
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div>
              <p className="text-sm font-semibold text-amber-700 mb-2">
                {testimonial.badge}
              </p>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {testimonial.title}
              </h3>
              <p className="text-gray-600">{testimonial.attributionLine}</p>
            </div>

            {/* Full Review Text */}
            <div className="space-y-4">
              <p className="text-gray-800 leading-relaxed">
                "{testimonial.fullText}"
              </p>

              {testimonial.additionalText && (
                <p className="text-gray-800 leading-relaxed">
                  "{testimonial.additionalText}"
                </p>
              )}

              {testimonial.tertiaryText && (
                <p className="text-gray-800 leading-relaxed">
                  "{testimonial.tertiaryText}"
                </p>
              )}
            </div>

            {/* Tags */}
            {testimonial.tags && testimonial.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {testimonial.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* CTA Button */}
            <button className="mt-4 px-6 py-3 bg-amber-800 text-white rounded-full font-semibold hover:bg-amber-900 transition-colors w-full">
              Book your own experience
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface TestimonialImage {
  url: string;
  alt: string;
}

interface Testimonial {
  id: string;
  guestName: string;
  location: string;
  travelerType: string;
  experienceTitle: string;
  previewText: string;
  fullText: string;
  images: TestimonialImage[];
  cta: string;
}

interface GuestStoriesProps {
  testimonials: Testimonial[];
}

export function GuestStories({ testimonials }: GuestStoriesProps) {
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [cardImageIndices, setCardImageIndices] = useState<Record<string, number>>({});

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const handlePrevImage = () => {
    if (selectedTestimonial) {
      setSelectedImageIndex((prev) =>
        prev === 0 ? selectedTestimonial.images.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (selectedTestimonial) {
      setSelectedImageIndex((prev) =>
        prev === selectedTestimonial.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleCardImagePrev = (e: React.MouseEvent, testimonialId: string, totalImages: number) => {
    e.stopPropagation();
    setCardImageIndices((prev) => ({
      ...prev,
      [testimonialId]: prev[testimonialId] === 0 ? totalImages - 1 : (prev[testimonialId] || 0) - 1,
    }));
  };

  const handleCardImageNext = (e: React.MouseEvent, testimonialId: string, totalImages: number) => {
    e.stopPropagation();
    setCardImageIndices((prev) => ({
      ...prev,
      [testimonialId]: (prev[testimonialId] || 0) === totalImages - 1 ? 0 : (prev[testimonialId] || 0) + 1,
    }));
  };

  const getCardImageIndex = (testimonialId: string) => cardImageIndices[testimonialId] || 0;

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            What guests say after their 🥢 +1 Chopsticks experience
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => {
            const currentImageIndex = getCardImageIndex(testimonial.id);
            return (
              <div
                key={testimonial.id}
                className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedTestimonial(testimonial);
                  setSelectedImageIndex(0);
                }}
              >
                {/* Image Section with Carousel */}
                <div className="relative bg-gray-200 h-64 overflow-hidden group flex items-center justify-center">
                  {testimonial.images.length > 0 && (
                    <>
                      <img
                        src={testimonial.images[currentImageIndex].url}
                        alt={testimonial.images[currentImageIndex].alt}
                        className="w-full h-full object-contain"
                      />

                      {/* Image Navigation Dots */}
                      {testimonial.images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                          {testimonial.images.map((_, idx) => (
                            <button
                              key={idx}
                              className={`w-2 h-2 rounded-full transition-all ${
                                idx === currentImageIndex ? "bg-white w-6" : "bg-white/60"
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setCardImageIndices((prev) => ({
                                  ...prev,
                                  [testimonial.id]: idx,
                                }));
                              }}
                              aria-label={`Image ${idx + 1}`}
                            />
                          ))}
                        </div>
                      )}

                      {/* Navigation Arrows */}
                      {testimonial.images.length > 1 && (
                        <>
                          <button
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => handleCardImagePrev(e, testimonial.id, testimonial.images.length)}
                            aria-label="Previous image"
                          >
                            <ChevronLeft size={20} className="text-gray-900" />
                          </button>
                          <button
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => handleCardImageNext(e, testimonial.id, testimonial.images.length)}
                            aria-label="Next image"
                          >
                            <ChevronRight size={20} className="text-gray-900" />
                          </button>
                        </>
                      )}


                    </>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-6">
                  {/* Attribution */}
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-amber-700 whitespace-nowrap overflow-hidden text-ellipsis">
                      From {testimonial.guestName}, {testimonial.location}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {testimonial.travelerType}
                    </p>
                  </div>

                  {/* Preview Text */}
                  <p className="text-gray-900 mb-4 line-clamp-4 text-base leading-relaxed">
                    "{testimonial.previewText}"
                  </p>

                  {/* CTA Link */}
                  <button
                    className="text-amber-700 hover:text-amber-800 font-semibold text-sm underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTestimonial(testimonial);
                      setSelectedImageIndex(0);
                    }}
                  >
                    {testimonial.cta}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {selectedTestimonial && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedTestimonial(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 id="modal-title" className="text-xl font-bold text-gray-900">
                Guest Story
              </h2>
              <button
                onClick={() => setSelectedTestimonial(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Image Carousel */}
              {selectedTestimonial.images.length > 0 && (
                <div className="mb-6">
                  <div className="relative bg-gray-200 h-96 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
                    <img
                      src={selectedTestimonial.images[selectedImageIndex].url}
                      alt={selectedTestimonial.images[selectedImageIndex].alt}
                      className="w-full h-full object-contain"
                    />

                    {/* Navigation Controls */}
                    {selectedTestimonial.images.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
                          aria-label="Previous image"
                        >
                          <ChevronLeft size={24} className="text-gray-900" />
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
                          aria-label="Next image"
                        >
                          <ChevronRight size={24} className="text-gray-900" />
                        </button>

                        {/* Dots */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                          {selectedTestimonial.images.map((_, idx) => (
                            <button
                              key={idx}
                              className={`w-2 h-2 rounded-full transition-all ${
                                idx === selectedImageIndex ? "bg-white w-6" : "bg-white/60"
                              }`}
                              onClick={() => setSelectedImageIndex(idx)}
                              aria-label={`Go to image ${idx + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Attribution */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-amber-700 mb-1">
                  From {selectedTestimonial.guestName}, {selectedTestimonial.location}
                </p>
                <p className="text-gray-600 text-sm font-medium">
                  {selectedTestimonial.travelerType}
                </p>
              </div>

              {/* Full Text */}
              <div className="space-y-4 text-gray-900 leading-relaxed">
                <p>"{selectedTestimonial.fullText}"</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

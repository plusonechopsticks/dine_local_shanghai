import { useState } from "react";
import { TESTIMONIALS } from "@/data/testimonials";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WhatGuestsRememberProps {
  hostId: number;
}

export function WhatGuestsRemember({ hostId }: WhatGuestsRememberProps) {
  // Filter testimonials for this host
  const hostTestimonials = TESTIMONIALS.filter((t) => t.hostId === hostId);

  if (hostTestimonials.length === 0) {
    return null; // Don't show section if no testimonials
  }

  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? hostTestimonials.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === hostTestimonials.length - 1 ? 0 : prev + 1
    );
  };

  const testimonial = hostTestimonials[currentIndex];

  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      {/* Section Title */}
      <h2 className="text-4xl font-bold text-center mb-12">
        What Guests Remember
      </h2>

      {/* Testimonial Card */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          {/* Left: Image Carousel */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
            {testimonial.images && testimonial.images.length > 0 ? (
              <>
                <img
                  src={testimonial.images[0].url}
                  alt={testimonial.images[0].alt}
                  className="w-full h-full object-contain"
                />

                {/* Navigation Arrows */}
                {testimonial.images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrev}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-2 transition"
                    >
                      <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-2 transition"
                    >
                      <ChevronRight className="w-6 h-6 text-white" />
                    </button>
                  </>
                )}

                {/* Dot Indicators */}
                {testimonial.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {testimonial.images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-2 h-2 rounded-full transition ${
                          idx === currentIndex
                            ? "bg-white"
                            : "bg-white/50 hover:bg-white/75"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No image available
              </div>
            )}
          </div>

          {/* Right: Testimonial Content */}
          <div className="flex flex-col justify-center space-y-6">
            {/* Guest Info */}
            <div>
              <p className="text-sm text-gray-600 font-medium">
                {testimonial.location} · {testimonial.travelerType}
              </p>
              <h3 className="text-2xl font-bold mt-2">{testimonial.guestName}</h3>
            </div>

            {/* Testimonial Text */}
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {testimonial.fullText}
            </p>

            {/* Date */}
            <p className="text-sm text-gray-500">{testimonial.hostDate}</p>

            {/* Carousel Indicators */}
            {hostTestimonials.length > 1 && (
              <div className="flex gap-2 pt-4">
                {hostTestimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1 rounded-full transition ${
                      idx === currentIndex
                        ? "bg-gray-900 w-8"
                        : "bg-gray-300 w-2 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

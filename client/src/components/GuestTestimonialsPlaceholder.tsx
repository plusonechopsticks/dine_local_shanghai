export function GuestTestimonialsPlaceholder() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Guest Testimonials
          </h2>
          <p className="text-lg text-gray-600">
            Real stories from travelers who dined with our hosts
          </p>
        </div>

        {/* Placeholder Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder Card 1 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="bg-gradient-to-br from-red-100 to-red-50 h-48 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-2">🍽️</div>
                <p className="text-gray-500">Guest Story Coming Soon</p>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                Guest Testimonial #1
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Share your dining experience with our community...
              </p>
              <button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors">
                Read More
              </button>
            </div>
          </div>

          {/* Placeholder Card 2 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="bg-gradient-to-br from-red-100 to-red-50 h-48 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-2">🍜</div>
                <p className="text-gray-500">Guest Story Coming Soon</p>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                Guest Testimonial #2
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Share your dining experience with our community...
              </p>
              <button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors">
                Read More
              </button>
            </div>
          </div>

          {/* Placeholder Card 3 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="bg-gradient-to-br from-red-100 to-red-50 h-48 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-2">👥</div>
                <p className="text-gray-500">Guest Story Coming Soon</p>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                Guest Testimonial #3
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Share your dining experience with our community...
              </p>
              <button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors">
                Read More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

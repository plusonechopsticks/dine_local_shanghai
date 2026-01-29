import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, MapPin, Clock, Users, AlertCircle } from "lucide-react";

export default function BookingConfirmation() {
  const [location, setLocation] = useLocation();

  // Parse booking details from URL or state
  const bookingData = {
    id: "BK-2026-001",
    hostName: "Grace Tong",
    hostImage: "https://example.com/grace.jpg",
    dinnerDate: "February 14, 2026",
    dinnerTime: "7:00 PM - 9:30 PM",
    mealType: "Dinner",
    guestCount: 4,
    pricePerPerson: 200,
    totalPrice: 800,
    location: "Xuhui District, Shanghai",
    address: "123 Julu Road, Xuhui, Shanghai",
    cuisine: "Shanghai Fusion",
    menu: "Braised Beef Brisket, Spinach in Supreme Broth, Signature Seafood Noodle Soup, Foil-Baked Whole Fish",
    dietaryRestrictions: "Vegetarian options available",
    specialRequests: "Please let us know about any allergies",
    hostBio: "I love sharing authentic Shanghai cuisine with travelers. I've been cooking for 20 years and enjoy hosting intimate dinners.",
    confirmationNumber: "CONF-2026-001",
    bookingStatus: "confirmed",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">Your dinner reservation has been confirmed. Here are your booking details.</p>
        </div>

        {/* Confirmation Number */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Confirmation Number</p>
              <p className="text-2xl font-bold text-blue-900">{bookingData.confirmationNumber}</p>
              <p className="text-xs text-gray-500 mt-2">Save this number for your records</p>
            </div>
          </CardContent>
        </Card>

        {/* Host Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Your Host</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                <img src={bookingData.hostImage} alt={bookingData.hostName} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">{bookingData.hostName}</h3>
                <p className="text-sm text-gray-600 mt-1">{bookingData.hostBio}</p>
                <p className="text-sm font-medium text-burgundy-600 mt-2">Cuisine: {bookingData.cuisine}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dinner Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Dinner Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-burgundy-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600">Date & Time</p>
                <p className="font-semibold text-gray-900">{bookingData.dinnerDate}</p>
                <p className="text-sm text-gray-700">{bookingData.dinnerTime}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-burgundy-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-semibold text-gray-900">{bookingData.location}</p>
                <p className="text-sm text-gray-700">{bookingData.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-burgundy-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600">Guest Count</p>
                <p className="font-semibold text-gray-900">{bookingData.guestCount} guests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu & Dietary Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Menu & Dietary Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Tonight's Menu</p>
              <p className="text-gray-900">{bookingData.menu}</p>
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm text-gray-600 mb-2">Dietary Accommodations</p>
              <p className="text-gray-900">{bookingData.dietaryRestrictions}</p>
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm text-gray-600 mb-2">Special Requests</p>
              <p className="text-gray-900">{bookingData.specialRequests}</p>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Summary */}
        <Card className="mb-6 bg-gray-50">
          <CardHeader>
            <CardTitle className="text-lg">Price Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Price per person</span>
                <span className="font-semibold">¥{bookingData.pricePerPerson}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Number of guests</span>
                <span className="font-semibold">×{bookingData.guestCount}</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-semibold text-gray-900">Total Price</span>
                <span className="text-xl font-bold text-burgundy-600">¥{bookingData.totalPrice}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900 mb-1">Important Information</p>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• Please arrive 10 minutes early</li>
                  <li>• Cancellations must be made 48 hours in advance</li>
                  <li>• Contact your host through the messaging system for any questions</li>
                  <li>• Payment will be collected on the day of the dinner</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => setLocation("/guest-dashboard")}
            className="px-6"
          >
            Back to Dashboard
          </Button>
          <Button
            onClick={() => setLocation(`/host/${bookingData.hostName.toLowerCase().replace(" ", "-")}`)}
            className="px-6 bg-burgundy-600 hover:bg-burgundy-700"
          >
            Message Host
          </Button>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>A confirmation email has been sent to your registered email address.</p>
          <p>You can also view this booking in your Guest Dashboard.</p>
        </div>
      </div>
    </div>
  );
}

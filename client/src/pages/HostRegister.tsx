import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ChopsticksLogo } from "@/components/ChopsticksLogo";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Sparkles, Heart, Users, Upload, ArrowRight } from "lucide-react";

const SHANGHAI_DISTRICTS = [
  "Huangpu", "Xuhui", "Changning", "Jing'an", "Putuo", "Hongkou", 
  "Yangpu", "Minhang", "Baoshan", "Jiading", "Pudong", "Jinshan", 
  "Songjiang", "Qingpu", "Fengxian", "Chongming"
];

const REGISTRATION_STEPS = [
  { id: 1, title: "Profile", description: "Name, photo, bio" },
  { id: 2, title: "Contact", description: "Email, WeChat" },
  { id: 3, title: "Availability", description: "Days, times, guests" },
  { id: 4, title: "Menu", description: "Cuisine, dishes, photos" },
  { id: 5, title: "Household", description: "Kids, pets, details" },
];

interface RegistrationData {
  // Step 1: Quick interest
  name: string;
  district: string;
  contact: string;
  // Step 2: Full registration
  profilePhoto?: string;
  bio?: string;
  languagesSpoken?: string;
  email?: string;
  wechatId?: string;
  availability?: string[];
  mealType?: ("lunch" | "dinner")[];
  maxGuests?: number;
  mealDurationMinutes?: number;
  pricePerPerson?: number;
  cuisineStyle?: string;
  menuDescription?: string;
  foodPhotos?: string[];
  dietaryAccommodations?: string;
  kidsFreindly?: boolean;
  petsInHome?: boolean;
}

export default function HostRegister() {
  const [step, setStep] = useState<"interest" | "full">("interest");
  const [currentFullStep, setCurrentFullStep] = useState(1);
  const [data, setData] = useState<RegistrationData>({
    name: "",
    district: "",
    contact: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitInterestMutation = trpc.hostInterest.submit.useMutation({
    onSuccess: () => {
      toast.success("Thank you! Ready to complete your full profile?");
      setStep("full");
      setCurrentFullStep(1);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit. Please try again.");
      setIsSubmitting(false);
    },
  });

  const handleInterestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!data.name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!data.district) {
      toast.error("Please select your district");
      return;
    }
    if (!data.contact.trim()) {
      toast.error("Please enter your email or WeChat ID");
      return;
    }

    setIsSubmitting(true);
    await submitInterestMutation.mutateAsync({
      name: data.name.trim(),
      district: data.district,
      contact: data.contact.trim(),
    });
  };

  const handleFullStepNext = () => {
    if (currentFullStep < REGISTRATION_STEPS.length) {
      setCurrentFullStep(currentFullStep + 1);
    }
  };

  const handleFullStepPrev = () => {
    if (currentFullStep > 1) {
      setCurrentFullStep(currentFullStep - 1);
    }
  };

  const progressPercentage = (currentFullStep / REGISTRATION_STEPS.length) * 100;

  // Step 1: Quick Interest Form
  if (step === "interest") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white">
        {/* Header */}
        <header className="border-b border-burgundy-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/">
              <a className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <ChopsticksLogo className="w-8 h-8 text-burgundy-600" />
                <span className="font-serif text-xl font-bold text-burgundy-900">
                  +1 Chopsticks
                </span>
              </a>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12 max-w-2xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-burgundy-50 text-burgundy-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              We are looking for an inaugural batch of hosts!
            </div>
            
            <h1 className="font-serif text-5xl font-bold text-burgundy-900 mb-4">
              Become a Host
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Share your culture, meet amazing travelers, and earn income by hosting authentic home dinners
            </p>

            {/* Quick Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="border-burgundy-100">
                <CardContent className="pt-6 text-center">
                  <Heart className="w-8 h-8 text-burgundy-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Share Culture</h3>
                  <p className="text-sm text-gray-600">Introduce travelers to authentic Shanghai home cooking</p>
                </CardContent>
              </Card>
              <Card className="border-burgundy-100">
                <CardContent className="pt-6 text-center">
                  <Users className="w-8 h-8 text-burgundy-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Meet Friends</h3>
                  <p className="text-sm text-gray-600">Connect with interesting people from around the world</p>
                </CardContent>
              </Card>
              <Card className="border-burgundy-100">
                <CardContent className="pt-6 text-center">
                  <Sparkles className="w-8 h-8 text-burgundy-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Earn Income</h3>
                  <p className="text-sm text-gray-600">Get paid for sharing your hospitality and cooking</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Simple Form */}
          <Card className="border-burgundy-200 shadow-lg">
            <CardContent className="pt-8 pb-8">
              <form onSubmit={handleInterestSubmit} className="space-y-8">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-lg font-medium text-gray-900">
                    What's your name?
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    placeholder="Enter your name"
                    className="h-12 text-base"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="district" className="text-lg font-medium text-gray-900">
                    Which district do you live in Shanghai?
                  </Label>
                  <Select value={data.district} onValueChange={(value) => setData({ ...data, district: value })} required>
                    <SelectTrigger id="district" className="h-12 text-base">
                      <SelectValue placeholder="Select your district" />
                    </SelectTrigger>
                    <SelectContent>
                      {SHANGHAI_DISTRICTS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="contact" className="text-lg font-medium text-gray-900">
                    Leave your email or WeChat ID
                  </Label>
                  <Input
                    id="contact"
                    type="text"
                    value={data.contact}
                    onChange={(e) => setData({ ...data, contact: e.target.value })}
                    placeholder="email@example.com or WeChat ID"
                    className="h-12 text-base"
                    required
                  />
                  <p className="text-sm text-gray-500">
                    We'll contact you shortly to discuss next steps
                  </p>
                </div>

                <div className="space-y-4 mt-8 pt-8 border-t border-gray-200">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-16 text-xl font-bold bg-burgundy-600 hover:bg-burgundy-700 text-white rounded-lg shadow-md transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Interest"}
                  </Button>
                  <p className="text-center text-sm text-gray-600 mt-4">
                    After submitting, you'll have the option to complete your full profile
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>
              By submitting, you agree to be contacted about the +1 Chopsticks pilot program.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Step 2: Full Registration Form with Progress
  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white">
      {/* Header */}
      <header className="border-b border-burgundy-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <ChopsticksLogo className="w-8 h-8 text-burgundy-600" />
              <span className="font-serif text-xl font-bold text-burgundy-900">
                +1 Chopsticks
              </span>
            </a>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Progress Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="font-serif text-4xl font-bold text-burgundy-900 mb-2">
                Complete Your Profile
              </h1>
              <p className="text-gray-600">
                Step {currentFullStep} of {REGISTRATION_STEPS.length}: {REGISTRATION_STEPS[currentFullStep - 1]?.title}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-burgundy-600">
                {Math.round(progressPercentage)}%
              </div>
              <p className="text-sm text-gray-600">Complete</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-burgundy-600 h-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Step Indicators */}
          <div className="grid grid-cols-5 gap-2 mt-8">
            {REGISTRATION_STEPS.map((s) => (
              <div
                key={s.id}
                className={`text-center p-2 rounded-lg transition-all min-w-0 ${
                  s.id === currentFullStep
                    ? "bg-burgundy-100 border-2 border-burgundy-600"
                    : s.id < currentFullStep
                    ? "bg-burgundy-50 border-2 border-burgundy-300"
                    : "bg-gray-100 border-2 border-gray-300"
                }`}
              >
                <div className="font-bold text-xs mb-0.5">{s.id}</div>
                <div className="text-xs text-gray-700 truncate">{s.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <Card className="border-burgundy-200 shadow-lg">
          <CardContent className="pt-8 pb-8">
            {/* Step 1: Profile */}
            {currentFullStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-burgundy-900 mb-6">Profile Details</h2>
                
                <div className="space-y-3">
                  <Label className="text-lg font-medium">Profile Photo</Label>
                  <div className="border-2 border-dashed border-burgundy-200 rounded-lg p-8 text-center cursor-pointer hover:bg-burgundy-50 transition-colors">
                    <Upload className="w-8 h-8 text-burgundy-400 mx-auto mb-3" />
                    <p className="text-gray-600">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="bio" className="text-lg font-medium">
                    Tell us about yourself
                  </Label>
                  <textarea
                    id="bio"
                    value={data.bio || ""}
                    onChange={(e) => setData({ ...data, bio: e.target.value })}
                    placeholder="Share your story, why you want to host, your cooking background..."
                    className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-600 focus:border-transparent"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="languages" className="text-lg font-medium">
                    Languages you speak
                  </Label>
                  <Input
                    id="languages"
                    value={data.languagesSpoken || ""}
                    onChange={(e) => setData({ ...data, languagesSpoken: e.target.value })}
                    placeholder="e.g., Mandarin, English, Shanghainese"
                    className="h-12 text-base"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Contact */}
            {currentFullStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-burgundy-900 mb-6">Contact Information</h2>
                
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-lg font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={data.email || ""}
                    onChange={(e) => setData({ ...data, email: e.target.value })}
                    placeholder="your@email.com"
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="wechat" className="text-lg font-medium">
                    WeChat ID
                  </Label>
                  <Input
                    id="wechat"
                    value={data.wechatId || ""}
                    onChange={(e) => setData({ ...data, wechatId: e.target.value })}
                    placeholder="Your WeChat ID"
                    className="h-12 text-base"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Availability */}
            {currentFullStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-burgundy-900 mb-6">Availability</h2>
                
                <div className="space-y-3">
                  <Label className="text-lg font-medium">Meal Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={data.mealDurationMinutes || 120}
                    onChange={(e) => setData({ ...data, mealDurationMinutes: parseInt(e.target.value) })}
                    placeholder="120"
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-lg font-medium">Max Guests</Label>
                  <Input
                    type="number"
                    value={data.maxGuests || 2}
                    onChange={(e) => setData({ ...data, maxGuests: parseInt(e.target.value) })}
                    placeholder="2"
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-lg font-medium">Price per Person (RMB)</Label>
                  <Input
                    type="number"
                    value={data.pricePerPerson || 100}
                    onChange={(e) => setData({ ...data, pricePerPerson: parseInt(e.target.value) })}
                    placeholder="100"
                    className="h-12 text-base"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Menu */}
            {currentFullStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-burgundy-900 mb-6">Your Menu</h2>
                
                <div className="space-y-3">
                  <Label htmlFor="cuisine" className="text-lg font-medium">
                    Cuisine Style
                  </Label>
                  <Input
                    id="cuisine"
                    value={data.cuisineStyle || ""}
                    onChange={(e) => setData({ ...data, cuisineStyle: e.target.value })}
                    placeholder="e.g., Shanghainese, Sichuan, Home-style"
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="menu" className="text-lg font-medium">
                    What will you cook?
                  </Label>
                  <textarea
                    id="menu"
                    value={data.menuDescription || ""}
                    onChange={(e) => setData({ ...data, menuDescription: e.target.value })}
                    placeholder="Describe your typical menu, special dishes, seasonal specialties..."
                    className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-600 focus:border-transparent"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-lg font-medium">Food Photos (minimum 3)</Label>
                  <div className="border-2 border-dashed border-burgundy-200 rounded-lg p-8 text-center cursor-pointer hover:bg-burgundy-50 transition-colors">
                    <Upload className="w-8 h-8 text-burgundy-400 mx-auto mb-3" />
                    <p className="text-gray-600">Upload photos of your dishes</p>
                    <p className="text-sm text-gray-500">PNG, JPG up to 10MB each</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="dietary" className="text-lg font-medium">
                    Dietary Accommodations
                  </Label>
                  <Input
                    id="dietary"
                    value={data.dietaryAccommodations || ""}
                    onChange={(e) => setData({ ...data, dietaryAccommodations: e.target.value })}
                    placeholder="e.g., Vegetarian options, Halal, Allergies you can handle"
                    className="h-12 text-base"
                  />
                </div>
              </div>
            )}

            {/* Step 5: Household */}
            {currentFullStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-burgundy-900 mb-6">Household Details</h2>
                
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.kidsFreindly || false}
                      onChange={(e) => setData({ ...data, kidsFreindly: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300"
                    />
                    <span className="text-lg font-medium text-gray-900">
                      Kids and families are welcome
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.petsInHome || false}
                      onChange={(e) => setData({ ...data, petsInHome: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300"
                    />
                    <span className="text-lg font-medium text-gray-900">
                      I have pets in my home
                    </span>
                  </label>
                </div>

                <div className="bg-burgundy-50 border border-burgundy-200 rounded-lg p-4 mt-6">
                  <p className="text-sm text-burgundy-900">
                    ✓ Once your profile is approved, you'll need to provide your full address for verification
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8 pt-8 border-t border-gray-200">
              <Button
                onClick={handleFullStepPrev}
                disabled={currentFullStep === 1}
                className="flex-1 h-14 text-lg bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </Button>
              {currentFullStep < REGISTRATION_STEPS.length ? (
                <Button
                  onClick={handleFullStepNext}
                  className="flex-1 h-14 text-lg bg-burgundy-600 hover:bg-burgundy-700 text-white font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  Next <ArrowRight className="w-5 h-5" />
                </Button>
              ) : (
                <Button
                  className="flex-1 h-12 bg-burgundy-600 hover:bg-burgundy-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Profile"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

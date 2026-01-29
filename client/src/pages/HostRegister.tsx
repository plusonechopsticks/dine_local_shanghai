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
import { Sparkles, Heart, Users, Upload, ArrowRight, Check, Loader2, User } from "lucide-react";

const SHANGHAI_DISTRICTS = [
  "Huangpu", "Xuhui", "Changning", "Jing'an", "Putuo", "Hongkou",
  "Yangpu", "Minhang", "Baoshan", "Jiading", "Pudong", "Jinshan",
  "Songjiang", "Qingpu", "Fengxian", "Chongming"
];

const ACTIVITY_OPTIONS = [
  { id: "cooking-class", label: "Cooking Class" },
  { id: "park-visit", label: "Park Visit" },
  { id: "shopping", label: "Shopping" },
  { id: "museum", label: "Museum Tour" },
  { id: "temple", label: "Temple Visit" },
  { id: "market", label: "Local Market Tour" },
  { id: "traditional-craft", label: "Traditional Craft" },
];

const REGISTRATION_STEPS = [
  { id: 1, title: "Contact", description: "Name, district, email" },
  { id: 2, title: "Cuisine", description: "Dishes & dietary info" },
  { id: 3, title: "About You", description: "Bio & activities" },
  { id: 4, title: "Availability", description: "Days & meals" },
  { id: 5, title: "Pricing", description: "Price & notes" },
];

interface RegistrationData {
  // Step 1
  name: string;
  district: string;
  email: string;
  // Step 2
  cuisineStyle: string;
  menuDescription: string;
  foodPhotoUrls: string[];
  dietaryNote: string;
  // Step 3
  bio: string;
  profilePhotoUrl: string;
  activities: string[];
  // Step 4
  availability: Record<string, string[]>;
  maxGuests: number;
  // Step 5
  pricePerPerson: number;
  otherNotes: string;
}

export default function HostRegister() {
  const [step, setStep] = useState<"interest" | "full">("interest");
  const [currentFullStep, setCurrentFullStep] = useState(1);
  const [data, setData] = useState<Partial<RegistrationData>>({
    foodPhotoUrls: [],
    activities: [],
    availability: {} as Record<string, ("lunch" | "dinner")[]>,
    maxGuests: 2,
    pricePerPerson: 100,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isProfilePhoto: boolean = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Starting upload for file: ${file.name}, size: ${file.size} bytes`);
        
        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large (max 10MB)`);
          continue;
        }

        try {
          // Upload directly using FormData to storage endpoint
          console.log(`Uploading ${file.name} directly to storage...`);
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
            signal: AbortSignal.timeout(120000), // 120 second timeout
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upload failed: ${response.status} ${errorText}`);
          }
          
          const result = await response.json();
          console.log(`Upload successful for ${file.name}: ${result.url}`);
          uploadedUrls.push(result.url);
        } catch (uploadError: any) {
          const errorMsg = uploadError?.message || "Unknown upload error";
          console.error(`Upload failed for ${file.name}:`, errorMsg);
          toast.error(`Failed to upload ${file.name}: ${errorMsg}`);
        }
      }

      if (uploadedUrls.length > 0) {
        if (isProfilePhoto) {
          setData({ ...data, profilePhotoUrl: uploadedUrls[0] });
          toast.success("Photo uploaded!");
        } else {
          setData({ 
            ...data, 
            foodPhotoUrls: [...(data.foodPhotoUrls || []), ...uploadedUrls]
          });
          toast.success(`${uploadedUrls.length} photo(s) uploaded!`);
        }
      }
    } catch (error: any) {
      console.error("Unexpected error in handleFileUpload:", error);
      toast.error(error?.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleInterestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.name?.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!data.district) {
      toast.error("Please select your district");
      return;
    }
    if (!data.email?.trim()) {
      toast.error("Please enter your email");
      return;
    }

    setIsSubmitting(true);
    await submitInterestMutation.mutateAsync({
      name: data.name.trim(),
      district: data.district,
      contact: data.email.trim(),
    });
  };

  const handleFullRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.name?.trim() || !data.district || !data.email?.trim()) {
      toast.error("Please complete all required fields");
      return;
    }
    if (!data.cuisineStyle?.trim() || !data.menuDescription?.trim()) {
      toast.error("Please describe your cuisine and menu");
      return;
    }
    if (!data.foodPhotoUrls || data.foodPhotoUrls.length < 3) {
      toast.error("Please upload at least 3 food photos");
      return;
    }
    if (!data.bio?.trim() || data.bio.length < 20) {
      toast.error("Please write at least 20 characters about yourself");
      return;
    }
    if (!data.availability || Object.keys(data.availability).length === 0) {
      toast.error("Please select at least one day/meal availability");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await trpc.host.submit.useMutation().mutateAsync({
        name: data.name.trim(),
        district: data.district,
        email: data.email.trim(),
        cuisineStyle: data.cuisineStyle.trim(),
        menuDescription: data.menuDescription.trim(),
        foodPhotoUrls: data.foodPhotoUrls,
        dietaryNote: data.dietaryNote || undefined,
        bio: data.bio.trim(),
        profilePhotoUrl: data.profilePhotoUrl || undefined,
        activities: data.activities || [],
        availability: data.availability as Record<string, ("lunch" | "dinner")[]>,
        maxGuests: data.maxGuests || 2,
        pricePerPerson: data.pricePerPerson || 100,
        otherNotes: data.otherNotes || undefined,
      });

      if (result.success) {
        toast.success("Registration submitted! We'll review your profile soon.");
        // Reset form
        setStep("interest");
        setCurrentFullStep(1);
        setData({
          foodPhotoUrls: [],
          activities: [],
          availability: {},
          maxGuests: 2,
          pricePerPerson: 100,
        });
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to submit registration");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Interest form
  if (step === "interest") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white">
        <div className="max-w-2xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <Link href="/">
              <ChopsticksLogo className="w-12 h-12 mx-auto mb-4" />
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Join Our Inaugural Batch
            </h1>
            <p className="text-lg text-gray-600">
              We are looking for an inaugural batch of hosts for our 2026 pilot program!
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="pt-6">
                <Heart className="w-8 h-8 text-burgundy-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Share Culture</h3>
                <p className="text-sm text-gray-600">Share your authentic Shanghai culture and family traditions</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="pt-6">
                <Users className="w-8 h-8 text-burgundy-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Meet Friends</h3>
                <p className="text-sm text-gray-600">Connect with travelers from around the world</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="pt-6">
                <Sparkles className="w-8 h-8 text-burgundy-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Earn Income</h3>
                <p className="text-sm text-gray-600">Earn money by sharing meals with guests</p>
              </CardContent>
            </Card>
          </div>

          {/* Interest Form */}
          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Tell Us About Yourself</h2>
              <form onSubmit={handleInterestSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-base font-semibold text-gray-700">
                    Your Name *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={data.name || ""}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    className="mt-2 h-12 text-base"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="district" className="text-base font-semibold text-gray-700">
                    District *
                  </Label>
                  <Select value={data.district || ""} onValueChange={(value) => setData({ ...data, district: value })}>
                    <SelectTrigger id="district" className="mt-2 h-12 text-base">
                      <SelectValue placeholder="Select your district" />
                    </SelectTrigger>
                    <SelectContent>
                      {SHANGHAI_DISTRICTS.map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="email" className="text-base font-semibold text-gray-700">
                    Email or WeChat ID *
                  </Label>
                  <Input
                    id="email"
                    type="text"
                    placeholder="your@email.com or WeChat ID"
                    value={data.email || ""}
                    onChange={(e) => setData({ ...data, email: e.target.value })}
                    className="mt-2 h-12 text-base"
                    disabled={isSubmitting}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 text-lg font-bold bg-burgundy-600 hover:bg-burgundy-700 text-white rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Continue <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Full registration form
  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <ChopsticksLogo className="w-12 h-12 mx-auto mb-4" />
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Complete Your Profile</h1>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {REGISTRATION_STEPS.map((s) => (
              <div
                key={s.id}
                className={`flex-1 mx-1 text-center ${
                  s.id === currentFullStep ? "font-bold text-burgundy-600" : "text-gray-500"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                    s.id < currentFullStep
                      ? "bg-burgundy-600 text-white"
                      : s.id === currentFullStep
                      ? "bg-burgundy-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {s.id < currentFullStep ? <Check className="w-5 h-5" /> : s.id}
                </div>
                <p className="text-xs md:text-sm">{s.title}</p>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-burgundy-600 h-full transition-all"
              style={{ width: `${(currentFullStep / REGISTRATION_STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Form */}
        <Card className="border-0 shadow-lg bg-white mb-8">
          <CardContent className="p-8">
            <form onSubmit={handleFullRegistrationSubmit} className="space-y-6">
              {/* Step 1: Contact */}
              {currentFullStep === 1 && (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
                  <div>
                    <Label htmlFor="name" className="text-base font-semibold text-gray-700">
                      Your Name *
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={data.name || ""}
                      onChange={(e) => setData({ ...data, name: e.target.value })}
                      className="mt-2 h-12 text-base"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Label htmlFor="district" className="text-base font-semibold text-gray-700">
                      District *
                    </Label>
                    <Select value={data.district || ""} onValueChange={(value) => setData({ ...data, district: value })}>
                      <SelectTrigger id="district" className="mt-2 h-12 text-base">
                        <SelectValue placeholder="Select your district" />
                      </SelectTrigger>
                      <SelectContent>
                        {SHANGHAI_DISTRICTS.map((district) => (
                          <SelectItem key={district} value={district}>
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-base font-semibold text-gray-700">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={data.email || ""}
                      onChange={(e) => setData({ ...data, email: e.target.value })}
                      className="mt-2 h-12 text-base"
                      disabled={isSubmitting}
                    />
                  </div>
                </>
              )}

              {/* Step 2: Cuisine */}
              {currentFullStep === 2 && (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Cuisine</h2>
                  <div>
                    <Label htmlFor="cuisineStyle" className="text-base font-semibold text-gray-700">
                      Cuisine Style *
                    </Label>
                    <Input
                      id="cuisineStyle"
                      type="text"
                      placeholder="e.g., Shanghai, Sichuan, Fusion"
                      value={data.cuisineStyle || ""}
                      onChange={(e) => setData({ ...data, cuisineStyle: e.target.value })}
                      className="mt-2 h-12 text-base"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Label htmlFor="menuDescription" className="text-base font-semibold text-gray-700">
                      Menu Description *
                    </Label>
                    <textarea
                      id="menuDescription"
                      placeholder="Describe the dishes you typically prepare"
                      value={data.menuDescription || ""}
                      onChange={(e) => setData({ ...data, menuDescription: e.target.value })}
                      className="mt-2 w-full p-3 border border-gray-300 rounded-lg text-base"
                      rows={4}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dietaryNote" className="text-base font-semibold text-gray-700">
                      Dietary Restrictions You Can Accommodate
                    </Label>
                    <Input
                      id="dietaryNote"
                      type="text"
                      placeholder="e.g., Vegetarian, Halal, Gluten-free"
                      value={data.dietaryNote || ""}
                      onChange={(e) => setData({ ...data, dietaryNote: e.target.value })}
                      className="mt-2 h-12 text-base"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Label className="text-base font-semibold text-gray-700 block mb-3">
                      Food Photos ({data.foodPhotoUrls?.length || 0}/3+) *
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Click to upload food photos</p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, false)}
                        disabled={isUploading}
                        className="hidden"
                        id="foodPhotos"
                      />
                      <label htmlFor="foodPhotos" className="cursor-pointer">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isUploading}
                          onClick={() => document.getElementById("foodPhotos")?.click()}
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Select Photos
                            </>
                          )}
                        </Button>
                      </label>
                    </div>
                    {data.foodPhotoUrls && data.foodPhotoUrls.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {data.foodPhotoUrls.map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`Food ${idx + 1}`}
                            className="w-full h-20 object-cover rounded"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Step 3: About You */}
              {currentFullStep === 3 && (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">About You</h2>
                  <div>
                    <Label htmlFor="bio" className="text-base font-semibold text-gray-700">
                      Tell Us About Yourself *
                    </Label>
                    <textarea
                      id="bio"
                      placeholder="Share your story, interests, and why you want to host"
                      value={data.bio || ""}
                      onChange={(e) => setData({ ...data, bio: e.target.value })}
                      className="mt-2 w-full p-3 border border-gray-300 rounded-lg text-base"
                      rows={4}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Label className="text-base font-semibold text-gray-700 block mb-3">
                      Profile Photo
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Click to upload your photo</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, true)}
                        disabled={isUploading}
                        className="hidden"
                        id="profilePhoto"
                      />
                      <label htmlFor="profilePhoto" className="cursor-pointer">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isUploading}
                          onClick={() => document.getElementById("profilePhoto")?.click()}
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Select Photo
                            </>
                          )}
                        </Button>
                      </label>
                    </div>
                    {data.profilePhotoUrl && (
                      <img
                        src={data.profilePhotoUrl}
                        alt="Profile"
                        className="mt-4 w-32 h-32 object-cover rounded-lg mx-auto"
                      />
                    )}
                  </div>
                  <div>
                    <Label className="text-base font-semibold text-gray-700 block mb-3">
                      Activities You Can Offer
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {ACTIVITY_OPTIONS.map((activity) => (
                        <label key={activity.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={data.activities?.includes(activity.id) || false}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setData({
                                  ...data,
                                  activities: [...(data.activities || []), activity.id],
                                });
                              } else {
                                setData({
                                  ...data,
                                  activities: (data.activities || []).filter((a) => a !== activity.id),
                                });
                              }
                            }}
                            disabled={isSubmitting}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700">{activity.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Step 4: Availability */}
              {currentFullStep === 4 && (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Availability</h2>
                  <div>
                    <Label className="text-base font-semibold text-gray-700 block mb-3">
                      When Can You Host? *
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                        <div key={day} className="border border-gray-300 rounded-lg p-3">
                          <p className="font-semibold text-sm text-gray-900 mb-2">{day}</p>
                          <label className="flex items-center gap-2 mb-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={data.availability?.[day]?.includes("lunch") || false}
                              onChange={(e) => {
                                const current = data.availability?.[day] || [];
                                if (e.target.checked) {
                                  setData({
                                    ...data,
                                    availability: {
                                      ...data.availability,
                                      [day]: [...current, "lunch"],
                                    },
                                  });
                                } else {
                                  setData({
                                    ...data,
                                    availability: {
                                      ...data.availability,
                                      [day]: current.filter((m) => m !== "lunch"),
                                    },
                                  });
                                }
                              }}
                              disabled={isSubmitting}
                              className="w-4 h-4"
                            />
                            <span className="text-xs text-gray-700">Lunch</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={data.availability?.[day]?.includes("dinner") || false}
                              onChange={(e) => {
                                const current = data.availability?.[day] || [];
                                if (e.target.checked) {
                                  setData({
                                    ...data,
                                    availability: {
                                      ...data.availability,
                                      [day]: [...current, "dinner"],
                                    },
                                  });
                                } else {
                                  setData({
                                    ...data,
                                    availability: {
                                      ...data.availability,
                                      [day]: current.filter((m) => m !== "dinner"),
                                    },
                                  });
                                }
                              }}
                              disabled={isSubmitting}
                              className="w-4 h-4"
                            />
                            <span className="text-xs text-gray-700">Dinner</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="maxGuests" className="text-base font-semibold text-gray-700">
                      Maximum Guests Per Meal
                    </Label>
                    <Input
                      id="maxGuests"
                      type="number"
                      min="1"
                      max="20"
                      value={data.maxGuests || 2}
                      onChange={(e) => setData({ ...data, maxGuests: parseInt(e.target.value) })}
                      className="mt-2 h-12 text-base"
                      disabled={isSubmitting}
                    />
                  </div>
                </>
              )}

              {/* Step 5: Pricing */}
              {currentFullStep === 5 && (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Pricing & Notes</h2>
                  <div>
                    <Label htmlFor="pricePerPerson" className="text-base font-semibold text-gray-700">
                      Price Per Person (¥) *
                    </Label>
                    <Input
                      id="pricePerPerson"
                      type="number"
                      min="1"
                      value={data.pricePerPerson || 100}
                      onChange={(e) => setData({ ...data, pricePerPerson: parseInt(e.target.value) })}
                      className="mt-2 h-12 text-base"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Label htmlFor="otherNotes" className="text-base font-semibold text-gray-700">
                      Additional Notes
                    </Label>
                    <textarea
                      id="otherNotes"
                      placeholder="Any other information you'd like to share"
                      value={data.otherNotes || ""}
                      onChange={(e) => setData({ ...data, otherNotes: e.target.value })}
                      className="mt-2 w-full p-3 border border-gray-300 rounded-lg text-base"
                      rows={4}
                      disabled={isSubmitting}
                    />
                  </div>
                </>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-6">
                {currentFullStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentFullStep(currentFullStep - 1)}
                    disabled={isSubmitting}
                    className="flex-1 h-12 text-base"
                  >
                    Previous
                  </Button>
                )}
                {currentFullStep < REGISTRATION_STEPS.length && (
                  <Button
                    type="button"
                    onClick={() => setCurrentFullStep(currentFullStep + 1)}
                    disabled={isSubmitting}
                    className="flex-1 h-12 text-base bg-burgundy-600 hover:bg-burgundy-700 text-white"
                  >
                    Next
                  </Button>
                )}
                {currentFullStep === REGISTRATION_STEPS.length && (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 h-12 text-base bg-burgundy-600 hover:bg-burgundy-700 text-white flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Registration <Check className="w-5 h-5" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

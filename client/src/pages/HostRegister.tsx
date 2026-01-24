import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ChopsticksLogo } from "@/components/ChopsticksLogo";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
  Camera,
  User,
  Languages,
  MapPin,
  Calendar,
  Users,
  ChefHat,
  Clock,
  DollarSign,
  Baby,
  Dog,
  Phone,
  Loader2,
  Check,
  Heart,
  Globe,
  Home as HomeIcon,
  Sparkles,
} from "lucide-react";

const DAYS_OF_WEEK = [
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
  { id: "sunday", label: "Sunday" },
];

const SHANGHAI_DISTRICTS = [
  "Huangpu",
  "Xuhui",
  "Changning",
  "Jing'an",
  "Putuo",
  "Hongkou",
  "Yangpu",
  "Pudong",
  "Minhang",
  "Baoshan",
  "Jiading",
  "Jinshan",
  "Songjiang",
  "Qingpu",
  "Fengxian",
  "Chongming",
];

const LANGUAGES = [
  "Mandarin",
  "English",
  "Shanghainese",
  "Cantonese",
  "Japanese",
  "Korean",
  "French",
  "German",
  "Spanish",
  "Other",
];

const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Halal",
  "Kosher",
  "Gluten-free",
  "Nut-free",
  "Dairy-free",
];

const CUISINE_STYLES = [
  "Shanghainese (本帮菜)",
  "Cantonese (粤菜)",
  "Sichuan (川菜)",
  "Hunan (湘菜)",
  "Jiangsu (苏菜)",
  "Shandong (鲁菜)",
  "Zhejiang (浙菜)",
  "Fujian (闽菜)",
  "Home-style Chinese",
  "Fusion",
  "Other",
];

export default function HostRegister() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Form state
  const [hostName, setHostName] = useState("");
  const [district, setDistrict] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["Mandarin"]);
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [wechatOrPhone, setWechatOrPhone] = useState("");
  const [availability, setAvailability] = useState<Record<string, ("lunch" | "dinner")[]>>({});
  const [maxGuests, setMaxGuests] = useState(2);
  const [cuisineStyle, setCuisineStyle] = useState("");
  const [menuDescription, setMenuDescription] = useState("");
  const [foodPhotos, setFoodPhotos] = useState<string[]>([]);
  const [dietaryAccommodations, setDietaryAccommodations] = useState<string[]>([]);
  const [mealDuration, setMealDuration] = useState(120);
  const [pricePerPerson, setPricePerPerson] = useState(100);
  const [kidsFriendly, setKidsFriendly] = useState(true);
  const [hasPets, setHasPets] = useState(false);
  const [petDetails, setPetDetails] = useState("");

  const profilePhotoRef = useRef<HTMLInputElement>(null);
  const foodPhotoRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.upload.image.useMutation();
  const submitMutation = trpc.host.submit.useMutation({
    onSuccess: () => {
      setIsSuccess(true);
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong. Please try again.");
      setIsSubmitting(false);
    },
  });

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      const result = await uploadMutation.mutateAsync({
        base64Data: base64,
        fileName: file.name,
        contentType: file.type,
      });
      setProfilePhoto(result.url);
      toast.success("Profile photo uploaded!");
    } catch {
      toast.error("Failed to upload photo");
    }
  };

  const handleFoodPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 5MB per image.`);
        continue;
      }

      try {
        const base64 = await fileToBase64(file);
        const result = await uploadMutation.mutateAsync({
          base64Data: base64,
          fileName: file.name,
          contentType: file.type,
        });
        setFoodPhotos(prev => [...prev, result.url]);
        toast.success("Photo uploaded!");
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
  };

  const removeFoodPhoto = (index: number) => {
    setFoodPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages(prev =>
      prev.includes(lang)
        ? prev.filter(l => l !== lang)
        : [...prev, lang]
    );
  };

  const toggleDietary = (option: string) => {
    setDietaryAccommodations(prev =>
      prev.includes(option)
        ? prev.filter(o => o !== option)
        : [...prev, option]
    );
  };

  const toggleAvailability = (day: string, mealType: "lunch" | "dinner") => {
    setAvailability(prev => {
      const dayAvailability = prev[day] || [];
      if (dayAvailability.includes(mealType)) {
        const newDayAvailability = dayAvailability.filter(m => m !== mealType) as ("lunch" | "dinner")[];
        if (newDayAvailability.length === 0) {
          const { [day]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [day]: newDayAvailability };
      } else {
        return { ...prev, [day]: [...dayAvailability, mealType] as ("lunch" | "dinner")[] };
      }
    });
  };

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        if (!hostName.trim()) {
          toast.error("Please enter your name");
          return false;
        }
        if (!district) {
          toast.error("Please select your district");
          return false;
        }
        return true;
      case 2:
        if (selectedLanguages.length === 0) {
          toast.error("Please select at least one language");
          return false;
        }
        if (bio.length < 20) {
          toast.error("Please write at least 20 characters about yourself");
          return false;
        }
        if (!email.trim() || !email.includes("@")) {
          toast.error("Please enter a valid email");
          return false;
        }
        if (!wechatOrPhone.trim()) {
          toast.error("Please enter your WeChat ID or phone number");
          return false;
        }
        return true;
      case 3:
        if (Object.keys(availability).length === 0) {
          toast.error("Please select at least one available time");
          return false;
        }
        return true;
      case 4:
        if (!cuisineStyle) {
          toast.error("Please select a cuisine style");
          return false;
        }
        if (menuDescription.length < 30) {
          toast.error("Please describe your menu in at least 30 characters");
          return false;
        }
        if (foodPhotos.length < 3) {
          toast.error("Please upload at least 3 photos of your food");
          return false;
        }
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;

    setIsSubmitting(true);
    try {
      await submitMutation.mutateAsync({
        hostName,
        profilePhotoUrl: profilePhoto || undefined,
        languages: selectedLanguages,
        bio,
        email,
        wechatOrPhone,
        district,
        availability,
        maxGuests,
        cuisineStyle,
        menuDescription,
        foodPhotoUrls: foodPhotos,
        dietaryAccommodations,
        mealDurationMinutes: mealDuration,
        pricePerPerson,
        kidsFriendly,
        hasPets,
        petDetails: hasPets ? petDetails : undefined,
      });
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-12 pb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-serif)" }}>
              Application Submitted!
            </h2>
            <p className="text-muted-foreground mb-8 text-base leading-relaxed">
              Thank you for your interest in becoming a host! We'll review your application and get back to you within 3-5 business days.
            </p>
            <a href="/">
              <Button className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2">
            <ChopsticksLogo className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg" style={{ fontFamily: "var(--font-serif)" }}>
              +1 Chopsticks
            </span>
          </a>
          <a href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </a>
        </div>
      </header>

      {/* Benefits Section */}
      <section className="bg-primary/5 border-b border-border/30 py-8">
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-bold mb-4 text-center" style={{ fontFamily: "var(--font-serif)" }}>
            Why Become a Host?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1 text-base">Share Your Culture</h3>
              <p className="text-sm text-muted-foreground">Connect with travelers and share authentic Shanghai hospitality</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1 text-base">Meet New Friends</h3>
              <p className="text-sm text-muted-foreground">Build meaningful connections with guests from around the world</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1 text-base">Earn Extra Income</h3>
              <p className="text-sm text-muted-foreground">Set your own price and hosting schedule that works for you</p>
            </div>
          </div>
        </div>
      </section>

      <main className="container py-10 md:py-14">
        <div className="max-w-2xl mx-auto">
          {/* Progress indicator */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-base text-muted-foreground font-medium">Step {step} of 5</span>
              <span className="text-base text-muted-foreground">{Math.round((step / 5) * 100)}% complete</span>
            </div>
            <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl" style={{ fontFamily: "var(--font-serif)" }}>
                  <User className="h-6 w-6 text-primary" />
                  Let's start with the basics
                </CardTitle>
                <CardDescription className="text-base">
                  Tell us your name and where you're located in Shanghai
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-7">
                {/* Name */}
                <div>
                  <Label htmlFor="hostName" className="text-base font-medium mb-2 block">What's your name? *</Label>
                  <Input
                    id="hostName"
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    placeholder="How should guests address you?"
                    className="mt-1.5 h-12 text-base"
                  />
                </div>

                {/* District */}
                <div>
                  <Label htmlFor="district" className="text-base font-medium mb-2 block flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Which district do you live in? *
                  </Label>
                  <Select value={district} onValueChange={setDistrict}>
                    <SelectTrigger className="mt-1.5 h-12 text-base">
                      <SelectValue placeholder="Select your Shanghai district" />
                    </SelectTrigger>
                    <SelectContent>
                      {SHANGHAI_DISTRICTS.map(d => (
                        <SelectItem key={d} value={d} className="text-base">{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-2">
                    Once approved, you'll provide your full address
                  </p>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleNext} size="lg" className="gap-2 text-base px-8">
                    Continue
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Profile & Contact */}
          {step === 2 && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl" style={{ fontFamily: "var(--font-serif)" }}>
                  <User className="h-6 w-6 text-primary" />
                  Tell us about yourself
                </CardTitle>
                <CardDescription className="text-base">
                  Help guests get to know you better
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-7">
                {/* Profile Photo */}
                <div>
                  <Label className="text-base font-medium mb-3 block">Profile Photo (optional)</Label>
                  <div className="flex items-center gap-5">
                    <div 
                      className="w-28 h-28 rounded-full bg-secondary flex items-center justify-center overflow-hidden cursor-pointer border-2 border-dashed border-border hover:border-primary transition-colors"
                      onClick={() => profilePhotoRef.current?.click()}
                    >
                      {profilePhoto ? (
                        <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>
                    <input
                      ref={profilePhotoRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePhotoUpload}
                    />
                    <div className="text-sm text-muted-foreground">
                      <p className="text-base mb-1">Click to upload a photo</p>
                      <p>Max 5MB, JPG or PNG</p>
                    </div>
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <Label className="text-base font-medium mb-3 block flex items-center gap-2">
                    <Languages className="h-5 w-5" />
                    Languages you speak *
                  </Label>
                  <div className="flex flex-wrap gap-2.5">
                    {LANGUAGES.map(lang => (
                      <Button
                        key={lang}
                        type="button"
                        variant={selectedLanguages.includes(lang) ? "default" : "outline"}
                        size="default"
                        onClick={() => toggleLanguage(lang)}
                        className="transition-all text-base h-10"
                      >
                        {lang}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <Label htmlFor="bio" className="text-base font-medium mb-2 block">
                    Tell us about yourself *
                  </Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Share your story... Why do you love hosting? What makes your home special?"
                    className="mt-1.5 min-h-32 text-base resize-none"
                    rows={5}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    {bio.length} / 20 characters minimum
                  </p>
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-base font-medium mb-2 block">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="mt-1.5 h-12 text-base"
                  />
                </div>

                {/* WeChat/Phone */}
                <div>
                  <Label htmlFor="wechatOrPhone" className="text-base font-medium mb-2 block flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    WeChat ID or Phone Number *
                  </Label>
                  <Input
                    id="wechatOrPhone"
                    value={wechatOrPhone}
                    onChange={(e) => setWechatOrPhone(e.target.value)}
                    placeholder="For guest coordination"
                    className="mt-1.5 h-12 text-base"
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <Button onClick={handleBack} variant="outline" size="lg" className="gap-2 text-base">
                    <ArrowLeft className="h-5 w-5" />
                    Back
                  </Button>
                  <Button onClick={handleNext} size="lg" className="gap-2 text-base px-8">
                    Continue
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Availability */}
          {step === 3 && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl" style={{ fontFamily: "var(--font-serif)" }}>
                  <Calendar className="h-6 w-6 text-primary" />
                  When can you host?
                </CardTitle>
                <CardDescription className="text-base">
                  Select your available days and meal times
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-7">
                {/* Availability Grid */}
                <div>
                  <Label className="text-base font-medium mb-3 block">Available days and times *</Label>
                  <div className="space-y-3">
                    {DAYS_OF_WEEK.map(day => (
                      <div key={day.id} className="flex items-center gap-4 p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
                        <span className="text-base font-medium w-28">{day.label}</span>
                        <div className="flex gap-3">
                          <Button
                            type="button"
                            variant={availability[day.id]?.includes("lunch") ? "default" : "outline"}
                            size="default"
                            onClick={() => toggleAvailability(day.id, "lunch")}
                            className="text-base"
                          >
                            Lunch
                          </Button>
                          <Button
                            type="button"
                            variant={availability[day.id]?.includes("dinner") ? "default" : "outline"}
                            size="default"
                            onClick={() => toggleAvailability(day.id, "dinner")}
                            className="text-base"
                          >
                            Dinner
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Max Guests */}
                <div>
                  <Label htmlFor="maxGuests" className="text-base font-medium mb-2 block flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Maximum number of guests
                  </Label>
                  <Input
                    id="maxGuests"
                    type="number"
                    min="1"
                    max="20"
                    value={maxGuests}
                    onChange={(e) => setMaxGuests(parseInt(e.target.value) || 2)}
                    className="mt-1.5 h-12 text-base"
                  />
                </div>

                {/* Meal Duration */}
                <div>
                  <Label htmlFor="mealDuration" className="text-base font-medium mb-2 block flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Typical meal duration (minutes)
                  </Label>
                  <Input
                    id="mealDuration"
                    type="number"
                    min="60"
                    max="300"
                    step="15"
                    value={mealDuration}
                    onChange={(e) => setMealDuration(parseInt(e.target.value) || 120)}
                    className="mt-1.5 h-12 text-base"
                  />
                </div>

                {/* Price */}
                <div>
                  <Label htmlFor="pricePerPerson" className="text-base font-medium mb-2 block flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Price per person (RMB)
                  </Label>
                  <Input
                    id="pricePerPerson"
                    type="number"
                    min="50"
                    max="1000"
                    step="10"
                    value={pricePerPerson}
                    onChange={(e) => setPricePerPerson(parseInt(e.target.value) || 100)}
                    className="mt-1.5 h-12 text-base"
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <Button onClick={handleBack} variant="outline" size="lg" className="gap-2 text-base">
                    <ArrowLeft className="h-5 w-5" />
                    Back
                  </Button>
                  <Button onClick={handleNext} size="lg" className="gap-2 text-base px-8">
                    Continue
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Menu */}
          {step === 4 && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl" style={{ fontFamily: "var(--font-serif)" }}>
                  <ChefHat className="h-6 w-6 text-primary" />
                  What will you cook?
                </CardTitle>
                <CardDescription className="text-base">
                  Share your culinary style and menu details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-7">
                {/* Cuisine Style */}
                <div>
                  <Label htmlFor="cuisineStyle" className="text-base font-medium mb-2 block">Cuisine style *</Label>
                  <Select value={cuisineStyle} onValueChange={setCuisineStyle}>
                    <SelectTrigger className="mt-1.5 h-12 text-base">
                      <SelectValue placeholder="Select your cooking style" />
                    </SelectTrigger>
                    <SelectContent>
                      {CUISINE_STYLES.map(style => (
                        <SelectItem key={style} value={style} className="text-base">{style}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Menu Description */}
                <div>
                  <Label htmlFor="menuDescription" className="text-base font-medium mb-2 block">
                    Describe your typical menu *
                  </Label>
                  <Textarea
                    id="menuDescription"
                    value={menuDescription}
                    onChange={(e) => setMenuDescription(e.target.value)}
                    placeholder="What dishes do you typically prepare? Any signature specialties?"
                    className="mt-1.5 min-h-32 text-base resize-none"
                    rows={5}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    {menuDescription.length} / 30 characters minimum
                  </p>
                </div>

                {/* Food Photos */}
                <div>
                  <Label className="text-base font-medium mb-3 block">Food photos (minimum 3) *</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {foodPhotos.map((photo, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                        <img src={photo} alt={`Food ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeFoodPhoto(index)}
                          className="absolute top-2 right-2 p-1.5 bg-background/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {foodPhotos.length < 10 && (
                      <div
                        onClick={() => foodPhotoRef.current?.click()}
                        className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors bg-secondary/30"
                      >
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">Upload</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={foodPhotoRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFoodPhotoUpload}
                  />
                  <p className="text-sm text-muted-foreground mt-3">
                    {foodPhotos.length} / 3 photos minimum (max 10)
                  </p>
                </div>

                {/* Dietary Accommodations */}
                <div>
                  <Label className="text-base font-medium mb-3 block">
                    Dietary options you can accommodate (optional)
                  </Label>
                  <div className="flex flex-wrap gap-2.5">
                    {DIETARY_OPTIONS.map(option => (
                      <Button
                        key={option}
                        type="button"
                        variant={dietaryAccommodations.includes(option) ? "default" : "outline"}
                        size="default"
                        onClick={() => toggleDietary(option)}
                        className="text-base"
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button onClick={handleBack} variant="outline" size="lg" className="gap-2 text-base">
                    <ArrowLeft className="h-5 w-5" />
                    Back
                  </Button>
                  <Button onClick={handleNext} size="lg" className="gap-2 text-base px-8">
                    Continue
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Household */}
          {step === 5 && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl" style={{ fontFamily: "var(--font-serif)" }}>
                  <HomeIcon className="h-6 w-6 text-primary" />
                  About your home
                </CardTitle>
                <CardDescription className="text-base">
                  Final details about your household
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-7">
                {/* Kids Friendly */}
                <div className="flex items-start gap-4 p-5 border border-border rounded-lg">
                  <Checkbox
                    id="kidsFriendly"
                    checked={kidsFriendly}
                    onCheckedChange={(checked) => setKidsFriendly(checked as boolean)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="kidsFriendly" className="text-base font-medium cursor-pointer flex items-center gap-2">
                      <Baby className="h-5 w-5" />
                      Family-friendly (suitable for children)
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Check if your home is welcoming to families with kids
                    </p>
                  </div>
                </div>

                {/* Pets */}
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-5 border border-border rounded-lg">
                    <Checkbox
                      id="hasPets"
                      checked={hasPets}
                      onCheckedChange={(checked) => setHasPets(checked as boolean)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor="hasPets" className="text-base font-medium cursor-pointer flex items-center gap-2">
                        <Dog className="h-5 w-5" />
                        I have pets at home
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Let guests know if you have pets (for allergies)
                      </p>
                    </div>
                  </div>

                  {hasPets && (
                    <div>
                      <Label htmlFor="petDetails" className="text-base font-medium mb-2 block">
                        Tell us about your pets
                      </Label>
                      <Textarea
                        id="petDetails"
                        value={petDetails}
                        onChange={(e) => setPetDetails(e.target.value)}
                        placeholder="What kind of pets do you have?"
                        className="mt-1.5 text-base resize-none"
                        rows={3}
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-4">
                  <Button onClick={handleBack} variant="outline" size="lg" className="gap-2 text-base">
                    <ArrowLeft className="h-5 w-5" />
                    Back
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    size="lg" 
                    className="gap-2 text-base px-8"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Application
                        <Check className="h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = error => reject(error);
  });
}

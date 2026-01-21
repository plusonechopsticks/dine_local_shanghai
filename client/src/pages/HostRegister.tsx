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
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["Mandarin"]);
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [wechatOrPhone, setWechatOrPhone] = useState("");
  const [district, setDistrict] = useState("");
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
        if (selectedLanguages.length === 0) {
          toast.error("Please select at least one language");
          return false;
        }
        if (bio.length < 20) {
          toast.error("Please write at least 20 characters about yourself");
          return false;
        }
        return true;
      case 2:
        if (!email.trim() || !email.includes("@")) {
          toast.error("Please enter a valid email");
          return false;
        }
        if (!wechatOrPhone.trim()) {
          toast.error("Please enter your WeChat ID or phone number");
          return false;
        }
        if (!district) {
          toast.error("Please select your district");
          return false;
        }
        return true;
      case 3:
        if (Object.keys(availability).length === 0) {
          toast.error("Please select at least one available time slot");
          return false;
        }
        return true;
      case 4:
        if (!cuisineStyle) {
          toast.error("Please select a cuisine style");
          return false;
        }
        if (menuDescription.length < 20) {
          toast.error("Please describe your menu in at least 20 characters");
          return false;
        }
        if (foodPhotos.length < 3) {
          toast.error("Please upload at least 3 food photos");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    
    setIsSubmitting(true);
    
    submitMutation.mutate({
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
      dietaryAccommodations: dietaryAccommodations.length > 0 ? dietaryAccommodations : undefined,
      mealDurationMinutes: mealDuration,
      pricePerPerson,
      kidsFriendly,
      hasPets,
      petDetails: hasPets ? petDetails : undefined,
    });
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-serif)" }}>
              Application Submitted!
            </h2>
            <p className="text-muted-foreground mb-6">
              Thank you for applying to become a host with +1 Chopsticks! We'll review your application and get back to you within 3-5 business days.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Once approved, we'll contact you to collect your full address and schedule an onboarding call.
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

      <main className="container py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Step {step} of 5</span>
              <span className="text-sm text-muted-foreground">{Math.round((step / 5) * 100)}% complete</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 1: Profile */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ fontFamily: "var(--font-serif)" }}>
                  <User className="h-5 w-5 text-primary" />
                  Your Profile
                </CardTitle>
                <CardDescription>
                  Tell us about yourself so guests can get to know you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Photo */}
                <div>
                  <Label className="mb-2 block">Profile Photo (optional)</Label>
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center overflow-hidden cursor-pointer border-2 border-dashed border-border hover:border-primary transition-colors"
                      onClick={() => profilePhotoRef.current?.click()}
                    >
                      {profilePhoto ? (
                        <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="h-8 w-8 text-muted-foreground" />
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
                      <p>Click to upload a photo</p>
                      <p>Max 5MB, JPG or PNG</p>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <Label htmlFor="hostName">Your Name *</Label>
                  <Input
                    id="hostName"
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    placeholder="How should guests address you?"
                    className="mt-1"
                  />
                </div>

                {/* Languages */}
                <div>
                  <Label className="mb-2 block flex items-center gap-2">
                    <Languages className="h-4 w-4" />
                    Languages Spoken *
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map(lang => (
                      <Button
                        key={lang}
                        type="button"
                        variant={selectedLanguages.includes(lang) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleLanguage(lang)}
                        className="transition-all"
                      >
                        {lang}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <Label htmlFor="bio">About You *</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell guests about yourself, your family, and why you love hosting..."
                    className="mt-1 min-h-[120px]"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {bio.length}/20 characters minimum
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Contact & Location */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ fontFamily: "var(--font-serif)" }}>
                  <MapPin className="h-5 w-5 text-primary" />
                  Contact & Location
                </CardTitle>
                <CardDescription>
                  How can we reach you and where are you located?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email */}
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="mt-1"
                  />
                </div>

                {/* WeChat/Phone */}
                <div>
                  <Label htmlFor="wechatOrPhone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    WeChat ID or Phone Number *
                  </Label>
                  <Input
                    id="wechatOrPhone"
                    value={wechatOrPhone}
                    onChange={(e) => setWechatOrPhone(e.target.value)}
                    placeholder="For coordination with guests"
                    className="mt-1"
                  />
                </div>

                {/* District */}
                <div>
                  <Label>District in Shanghai *</Label>
                  <Select value={district} onValueChange={setDistrict}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select your district" />
                    </SelectTrigger>
                    <SelectContent>
                      {SHANGHAI_DISTRICTS.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-2">
                    📍 Once approved, we'll ask for your full address (kept private until booking confirmed)
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Availability */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ fontFamily: "var(--font-serif)" }}>
                  <Calendar className="h-5 w-5 text-primary" />
                  Availability
                </CardTitle>
                <CardDescription>
                  When are you available to host guests?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {DAYS_OF_WEEK.map(day => (
                    <div key={day.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                      <span className="font-medium">{day.label}</span>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={availability[day.id]?.includes("lunch") ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleAvailability(day.id, "lunch")}
                        >
                          Lunch
                        </Button>
                        <Button
                          type="button"
                          variant={availability[day.id]?.includes("dinner") ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleAvailability(day.id, "dinner")}
                        >
                          Dinner
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Max Guests */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4" />
                    Maximum Guests
                  </Label>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setMaxGuests(prev => Math.max(1, prev - 1))}
                    >
                      -
                    </Button>
                    <span className="text-xl font-semibold w-12 text-center">{maxGuests}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setMaxGuests(prev => Math.min(20, prev + 1))}
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Meal Duration */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4" />
                    Estimated Meal Duration
                  </Label>
                  <Select value={mealDuration.toString()} onValueChange={(v) => setMealDuration(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="150">2.5 hours</SelectItem>
                      <SelectItem value="180">3 hours</SelectItem>
                      <SelectItem value="240">4 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4" />
                    Price per Person (RMB)
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">¥</span>
                    <Input
                      type="number"
                      value={pricePerPerson}
                      onChange={(e) => setPricePerPerson(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-32"
                    />
                    <span className="text-muted-foreground">/ person</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Suggested: ¥80-150 for casual meals, ¥150-300 for special occasions
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Menu & Food */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ fontFamily: "var(--font-serif)" }}>
                  <ChefHat className="h-5 w-5 text-primary" />
                  Your Menu
                </CardTitle>
                <CardDescription>
                  What will you cook for your guests?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Cuisine Style */}
                <div>
                  <Label>Cuisine Style *</Label>
                  <Select value={cuisineStyle} onValueChange={setCuisineStyle}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select your cuisine style" />
                    </SelectTrigger>
                    <SelectContent>
                      {CUISINE_STYLES.map(style => (
                        <SelectItem key={style} value={style}>{style}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Menu Description */}
                <div>
                  <Label htmlFor="menuDescription">Describe Your Menu *</Label>
                  <Textarea
                    id="menuDescription"
                    value={menuDescription}
                    onChange={(e) => setMenuDescription(e.target.value)}
                    placeholder="What dishes will you typically prepare? Any signature dishes or family recipes?"
                    className="mt-1 min-h-[120px]"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {menuDescription.length}/20 characters minimum
                  </p>
                </div>

                {/* Food Photos */}
                <div>
                  <Label className="mb-2 block">Food Photos * (minimum 3)</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {foodPhotos.map((photo, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                        <img src={photo} alt={`Food ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeFoodPhoto(index)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {foodPhotos.length < 10 && (
                      <div
                        className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center justify-center cursor-pointer bg-secondary/30"
                        onClick={() => foodPhotoRef.current?.click()}
                      >
                        <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                        <span className="text-xs text-muted-foreground">Add Photo</span>
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
                  <p className="text-xs text-muted-foreground mt-2">
                    {foodPhotos.length}/3 minimum photos uploaded. Show off your best dishes!
                  </p>
                </div>

                {/* Dietary Accommodations */}
                <div>
                  <Label className="mb-2 block">Dietary Accommodations (optional)</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    What dietary requirements can you accommodate?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {DIETARY_OPTIONS.map(option => (
                      <Button
                        key={option}
                        type="button"
                        variant={dietaryAccommodations.includes(option) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleDietary(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Household Info */}
          {step === 5 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ fontFamily: "var(--font-serif)" }}>
                  <Baby className="h-5 w-5 text-primary" />
                  Household Info
                </CardTitle>
                <CardDescription>
                  Help guests know what to expect
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Kids Friendly */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <Baby className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Kids & Family Friendly</p>
                      <p className="text-sm text-muted-foreground">Suitable for guests with children</p>
                    </div>
                  </div>
                  <Checkbox
                    checked={kidsFriendly}
                    onCheckedChange={(checked) => setKidsFriendly(checked as boolean)}
                  />
                </div>

                {/* Pets */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-3">
                      <Dog className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Pets in Home</p>
                        <p className="text-sm text-muted-foreground">Do you have any pets?</p>
                      </div>
                    </div>
                    <Checkbox
                      checked={hasPets}
                      onCheckedChange={(checked) => setHasPets(checked as boolean)}
                    />
                  </div>
                  {hasPets && (
                    <Input
                      value={petDetails}
                      onChange={(e) => setPetDetails(e.target.value)}
                      placeholder="e.g., One friendly golden retriever"
                      className="ml-8"
                    />
                  )}
                </div>

                {/* Summary */}
                <div className="mt-8 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h4 className="font-semibold mb-3">Review Your Listing</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {hostName}</p>
                    <p><strong>District:</strong> {district}</p>
                    <p><strong>Cuisine:</strong> {cuisineStyle}</p>
                    <p><strong>Price:</strong> ¥{pricePerPerson}/person</p>
                    <p><strong>Max Guests:</strong> {maxGuests}</p>
                    <p><strong>Photos:</strong> {foodPhotos.length} uploaded</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={step === 1}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            
            {step < 5 ? (
              <Button onClick={nextStep} className="gap-2">
                Next
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <Check className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Helper function
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
}

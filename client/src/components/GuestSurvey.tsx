import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, Check } from "lucide-react";

interface GuestSurveyProps {
  bookingId: number;
  guestEmail?: string;
  numberOfGuests?: number;
  source: "post_payment" | "email";
  onComplete: () => void;
}

const AGE_GROUPS = [
  { value: "under-18", label: "Under 18" },
  { value: "18-24", label: "18–24" },
  { value: "25-34", label: "25–34" },
  { value: "35-44", label: "35–44" },
  { value: "45-54", label: "45–54" },
  { value: "55-64", label: "55–64" },
  { value: "65+", label: "65+" },
] as const;

const FIRST_TIME_OPTIONS = [
  { value: "all_first_time", label: "Yes — first time for everyone" },
  { value: "some_first_time", label: "Some of us are first-timers" },
  { value: "all_been_before", label: "No — we've all been before" },
  { value: "live_in_china", label: "We live in China" },
] as const;

const CHANNEL_OPTIONS = [
  { value: "instagram", label: "📸 Instagram" },
  { value: "reddit", label: "🤖 Reddit" },
  { value: "google", label: "🔍 Google" },
  { value: "ota", label: "🎟️ Get Your Guide / Airbnb" },
  { value: "friend", label: "👥 Friend / Word of mouth" },
  { value: "press", label: "📰 Press / Article" },
  { value: "other", label: "✨ Other" },
] as const;

type AgeGroup = "under-18" | "18-24" | "25-34" | "35-44" | "45-54" | "55-64" | "65+";
type FirstTimeChina = "all_first_time" | "some_first_time" | "all_been_before" | "live_in_china";
type Channel = "instagram" | "reddit" | "google" | "ota" | "friend" | "press" | "other";

const TOTAL_QUESTIONS = 4;

export function GuestSurvey({ bookingId, guestEmail, numberOfGuests, source, onComplete }: GuestSurveyProps) {
  const [step, setStep] = useState(0); // 0-3 = questions, 4 = thank you
  const [submitted, setSubmitted] = useState(false);

  // Answers
  const [countries, setCountries] = useState<string[]>([]);
  const [countryInput, setCountryInput] = useState("");
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);
  const [firstTimeChina, setFirstTimeChina] = useState<FirstTimeChina | null>(null);
  const [channel, setChannel] = useState<Channel | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const submitMutation = trpc.survey.submit.useMutation();

  const canProceed = () => {
    if (step === 0) return countries.length > 0;
    if (step === 1) return ageGroups.length > 0;
    if (step === 2) return firstTimeChina !== null;
    if (step === 3) return channel !== null;
    return true;
  };

  const handleSubmit = async (skipRemaining = false) => {
    if (submitted) return;
    setSubmitted(true);
    try {
      await submitMutation.mutateAsync({
        bookingId,
        guestEmail,
        countries: countries.length > 0 ? countries : undefined,
        ageGroups: ageGroups.length > 0 ? ageGroups : undefined,
        firstTimeChina: firstTimeChina ?? undefined,
        channel: !skipRemaining ? (channel ?? undefined) : undefined,
        source,
      });
    } catch (e) {
      // silently ignore errors — survey is optional
    }
    setStep(4);
  };

  const handleSkip = async () => {
    await handleSubmit(true);
  };

  const handleNext = async () => {
    if (step === 3) {
      await handleSubmit(false);
    } else {
      setStep(s => s + 1);
    }
  };

  const addCountry = (val: string) => {
    const trimmed = val.trim();
    if (trimmed && !countries.includes(trimmed)) {
      setCountries(c => [...c, trimmed]);
    }
    setCountryInput("");
  };

  const removeCountry = (c: string) => setCountries(prev => prev.filter(x => x !== c));
  const toggleAgeGroup = (g: AgeGroup) =>
    setAgeGroups(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  // Popular country quick-picks
  const QUICK_COUNTRIES = ["USA", "UK", "Australia", "Canada", "Germany", "France", "Singapore", "Japan"];

  // Progress dots
  const ProgressDots = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i === step ? "w-6 h-2.5 bg-[#8B3A3A]" :
            i < step ? "w-2.5 h-2.5 bg-[#8B3A3A] opacity-60" :
            "w-2.5 h-2.5 bg-gray-200"
          }`}
        />
      ))}
    </div>
  );

  // Thank-you screen
  if (step === 4) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank you! 🙏</h2>
        <p className="text-gray-500 mb-8 max-w-xs">
          Your answers help us keep improving the experience for every guest.
        </p>
        <Button
          onClick={onComplete}
          className="bg-[#8B3A3A] hover:bg-[#7a3232] text-white px-8"
        >
          View my booking
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-2">
        <p className="text-sm text-gray-400 font-medium tracking-wide uppercase">Quick survey</p>
        <h2 className="text-xl font-bold text-gray-900 mt-1">
          Help us improve
          {numberOfGuests && numberOfGuests > 1 ? ` · ${numberOfGuests} guests` : ""}
        </h2>
      </div>

      <ProgressDots />

      {/* Q1: Countries */}
      {step === 0 && (
        <div>
          <p className="text-base font-semibold text-gray-800 mb-1 text-center">
            Where is your group from?
          </p>
          <p className="text-sm text-gray-400 text-center mb-4">Add all countries represented</p>

          {/* Quick-pick chips */}
          <div className="flex flex-wrap gap-2 mb-3 justify-center">
            {QUICK_COUNTRIES.filter(c => !countries.includes(c)).map(c => (
              <button
                key={c}
                onClick={() => setCountries(prev => [...prev, c])}
                className="px-3 py-1.5 rounded-full border border-gray-200 text-sm text-gray-600 hover:border-[#8B3A3A] hover:text-[#8B3A3A] transition-colors"
              >
                {c}
              </button>
            ))}
          </div>

          {/* Free-text input */}
          <div className="flex gap-2 mb-3">
            <input
              ref={inputRef}
              type="text"
              value={countryInput}
              onChange={e => setCountryInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCountry(countryInput); } }}
              placeholder="Type a country and press Enter…"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B3A3A]"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => addCountry(countryInput)}
              disabled={!countryInput.trim()}
              className="shrink-0"
            >
              Add
            </Button>
          </div>

          {/* Selected tags */}
          {countries.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {countries.map(c => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#8B3A3A] text-white text-sm"
                >
                  {c}
                  <button onClick={() => removeCountry(c)} className="hover:opacity-70">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Q2: Age groups */}
      {step === 1 && (
        <div>
          <p className="text-base font-semibold text-gray-800 mb-1 text-center">
            What age groups are in your party?
          </p>
          <p className="text-sm text-gray-400 text-center mb-4">Select all that apply</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {AGE_GROUPS.map(({ value, label }) => {
              const selected = ageGroups.includes(value);
              return (
                <button
                  key={value}
                  onClick={() => toggleAgeGroup(value)}
                  className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                    selected
                      ? "border-[#8B3A3A] bg-[#8B3A3A] text-white"
                      : "border-gray-200 text-gray-700 hover:border-[#8B3A3A]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Q3: First time in China */}
      {step === 2 && (
        <div>
          <p className="text-base font-semibold text-gray-800 mb-1 text-center">
            Is this your first time in China?
          </p>
          <p className="text-sm text-gray-400 text-center mb-4">For your whole group</p>
          <div className="flex flex-col gap-2">
            {FIRST_TIME_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFirstTimeChina(value)}
                className={`py-3 px-5 rounded-xl border-2 text-sm font-medium text-left transition-all ${
                  firstTimeChina === value
                    ? "border-[#8B3A3A] bg-[#8B3A3A] text-white"
                    : "border-gray-200 text-gray-700 hover:border-[#8B3A3A]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Q4: How did you find us */}
      {step === 3 && (
        <div>
          <p className="text-base font-semibold text-gray-800 mb-1 text-center">
            How did you find +1 Chopsticks?
          </p>
          <p className="text-sm text-gray-400 text-center mb-4">Pick the best one</p>
          <div className="flex flex-col gap-2">
            {CHANNEL_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setChannel(value)}
                className={`py-3 px-5 rounded-xl border-2 text-sm font-medium text-left transition-all ${
                  channel === value
                    ? "border-[#8B3A3A] bg-[#8B3A3A] text-white"
                    : "border-gray-200 text-gray-700 hover:border-[#8B3A3A]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={handleSkip}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Skip for now
        </button>
        <Button
          onClick={handleNext}
          disabled={!canProceed() || submitMutation.isPending}
          className="bg-[#8B3A3A] hover:bg-[#7a3232] text-white px-6 gap-2"
        >
          {step === 3 ? "Finish" : "Next"}
          {step < 3 && <ChevronRight className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}

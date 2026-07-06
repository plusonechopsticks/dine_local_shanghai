import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { X } from "lucide-react";

interface GuestSurveyProps {
  bookingId: number;
  guestEmail?: string;
  numberOfGuests?: number;
  hostName?: string;
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

const QUICK_COUNTRIES: { flag: string; name: string }[] = [
  { flag: "🇺🇸", name: "USA" },
  { flag: "🇬🇧", name: "UK" },
  { flag: "🇦🇺", name: "Australia" },
  { flag: "🇸🇬", name: "Singapore" },
  { flag: "🇨🇦", name: "Canada" },
  { flag: "🇩🇪", name: "Germany" },
  { flag: "🇫🇷", name: "France" },
  { flag: "🇮🇳", name: "India" },
];

type AgeGroup = "under-18" | "18-24" | "25-34" | "35-44" | "45-54" | "55-64" | "65+";
type FirstTimeChina = "all_first_time" | "some_first_time" | "all_been_before" | "live_in_china";
type Channel = "instagram" | "reddit" | "google" | "ota" | "friend" | "press" | "other";

const TOTAL_QUESTIONS = 4;

export function GuestSurvey({ bookingId, guestEmail, numberOfGuests, hostName, source, onComplete }: GuestSurveyProps) {
  const [step, setStep] = useState(0); // 0–3 = questions, 4 = thank you
  const [submitted, setSubmitted] = useState(false);

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
    } catch {
      // survey is optional — silently ignore errors
    }
    setStep(4);
  };

  const handleNext = async () => {
    if (step === 3) await handleSubmit(false);
    else setStep(s => s + 1);
  };

  const addCountry = (name: string) => {
    const trimmed = name.trim();
    if (trimmed && !countries.includes(trimmed)) setCountries(c => [...c, trimmed]);
    setCountryInput("");
  };

  const removeCountry = (c: string) => setCountries(prev => prev.filter(x => x !== c));
  const toggleAgeGroup = (g: AgeGroup) =>
    setAgeGroups(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  // ── Progress dots ──────────────────────────────────────────────────────────
  const ProgressDots = () => (
    <div className="flex items-center justify-center gap-2 my-5">
      {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i === step
              ? "w-7 h-2.5 bg-gray-800"
              : i < step
              ? "w-2.5 h-2.5 bg-gray-400"
              : "w-2.5 h-2.5 bg-gray-200"
          }`}
        />
      ))}
    </div>
  );

  // ── Thank-you screen ───────────────────────────────────────────────────────
  if (step === 4) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
        <div className="text-5xl mb-4">🙏</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h2>
        <p className="text-gray-500 mb-8 max-w-xs text-sm">
          Your answers help your host and future guests have an even better experience.
        </p>
        <button
          onClick={onComplete}
          className="bg-gray-900 hover:bg-gray-700 text-white px-8 py-3 rounded-full font-medium transition-colors"
        >
          View my booking
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* ── Green confirmation banner ── */}
      <div className="bg-[#3a7d44] rounded-t-xl px-6 py-7 text-center text-white">
        <div className="text-4xl mb-3">🎉</div>
        <h2 className="text-2xl font-bold mb-1">Booking Confirmed!</h2>
        <p className="text-sm text-white/80">
          Your home dining experience{hostName ? ` with ${hostName}` : ""} is set
          {numberOfGuests ? ` · ${numberOfGuests} guest${numberOfGuests > 1 ? "s" : ""}` : ""}
        </p>
      </div>

      {/* ── Survey body ── */}
      <div className="bg-white rounded-b-xl px-6 pb-8 pt-6">
        {/* Intro line */}
        <p className="text-gray-700 text-center text-[15px] leading-snug mb-1">
          While you're here —{" "}
          <strong>4 quick questions about your group</strong>{" "}
          to help your host prepare 🥢
        </p>

        <ProgressDots />

        {/* Question label */}
        <p className="text-center text-xs font-semibold tracking-widest uppercase text-[#C9A84C] mb-2">
          Question {step + 1} of {TOTAL_QUESTIONS}
        </p>

        {/* ── Q1: Countries ── */}
        {step === 0 && (
          <div>
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-1">
              Where is your group from?
            </h3>
            <p className="text-sm text-gray-400 text-center mb-4">Add every country in your group</p>

            {/* Text input */}
            <input
              ref={inputRef}
              type="text"
              value={countryInput}
              onChange={e => setCountryInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCountry(countryInput); } }}
              placeholder="Type a country and press Enter..."
              className="w-full border border-gray-200 bg-[#faf9f7] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 mb-4"
            />

            {/* Selected tags */}
            {countries.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {countries.map(c => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-900 text-white text-sm"
                  >
                    {c}
                    <button onClick={() => removeCountry(c)} className="hover:opacity-70">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Quick-pick chips with flags */}
            <div className="flex flex-wrap gap-2">
              {QUICK_COUNTRIES.filter(c => !countries.includes(c.name)).map(({ flag, name }) => (
                <button
                  key={name}
                  onClick={() => setCountries(prev => [...prev, name])}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-700 hover:border-gray-400 transition-colors bg-white"
                >
                  <span>{flag}</span>
                  <span>{name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Q2: Age groups ── */}
        {step === 1 && (
          <div>
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-1">
              What age groups are in your party?
            </h3>
            <p className="text-sm text-gray-400 text-center mb-5">Select all that apply</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {AGE_GROUPS.map(({ value, label }) => {
                const selected = ageGroups.includes(value);
                return (
                  <button
                    key={value}
                    onClick={() => toggleAgeGroup(value)}
                    className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                      selected
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-200 text-gray-700 hover:border-gray-400 bg-white"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Q3: First time in China ── */}
        {step === 2 && (
          <div>
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-1">
              Is this your first time in China?
            </h3>
            <p className="text-sm text-gray-400 text-center mb-5">For your whole group</p>
            <div className="flex flex-col gap-2">
              {FIRST_TIME_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setFirstTimeChina(value)}
                  className={`py-3 px-5 rounded-xl border-2 text-sm font-medium text-left transition-all ${
                    firstTimeChina === value
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 text-gray-700 hover:border-gray-400 bg-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Q4: How did you find us ── */}
        {step === 3 && (
          <div>
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-1">
              How did you find +1 Chopsticks?
            </h3>
            <p className="text-sm text-gray-400 text-center mb-5">Pick the best one</p>
            <div className="flex flex-col gap-2">
              {CHANNEL_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setChannel(value)}
                  className={`py-3 px-5 rounded-xl border-2 text-sm font-medium text-left transition-all ${
                    channel === value
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 text-gray-700 hover:border-gray-400 bg-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Navigation ── */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => handleSubmit(true)}
            className="text-sm text-gray-400 underline underline-offset-2 hover:text-gray-600 transition-colors"
          >
            Skip for now
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed() || submitMutation.isPending}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
              canProceed()
                ? "bg-gray-900 text-white hover:bg-gray-700"
                : "bg-[#e8e0d0] text-[#b8a898] cursor-not-allowed"
            }`}
          >
            {step === 3 ? "Finish" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}

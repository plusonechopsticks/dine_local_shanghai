import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

interface SurpriseMeOverlayProps {
  host: {
    id: number;
    hostName: string;
    cuisineStyle: string;
    district: string;
    profilePhotoUrl: string | null;
  };
  onClose: () => void;
}

export function SurpriseMeOverlay({ host, onClose }: SurpriseMeOverlayProps) {
  const [, setLocation] = useLocation();
  const [phase, setPhase] = useState<"enter" | "reveal" | "go">("enter");

  // Sequence: fade in → reveal host → auto-navigate after a beat
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("reveal"), 600);
    return () => clearTimeout(t1);
  }, []);

  const handleMeetHost = () => {
    setPhase("go");
    setTimeout(() => {
      onClose();
      setLocation(`/hosts/${host.id}`);
    }, 400);
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${
        phase === "go" ? "opacity-0" : "opacity-100"
      }`}
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`relative flex flex-col items-center text-center px-8 py-10 max-w-sm w-full transition-all duration-700 ${
          phase === "enter"
            ? "opacity-0 translate-y-8 scale-95"
            : "opacity-100 translate-y-0 scale-100"
        }`}
      >
        {/* Subtle label */}
        <p className="text-white/60 text-sm uppercase tracking-widest mb-6 font-medium">
          You're going to meet
        </p>

        {/* Host photo */}
        <div className="relative mb-6">
          <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-white/20 shadow-2xl">
            {host.profilePhotoUrl ? (
              <img
                src={host.profilePhotoUrl}
                alt={host.hostName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-red-800 to-red-600 flex items-center justify-center">
                <span className="text-white text-4xl font-bold">
                  {host.hostName.charAt(0)}
                </span>
              </div>
            )}
          </div>
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-full ring-2 ring-white/30 animate-ping" />
        </div>

        {/* Host name */}
        <h2 className="text-white text-3xl font-bold mb-2 tracking-tight">
          {host.hostName}
        </h2>

        {/* Cuisine & district */}
        <p className="text-white/70 text-base mb-1">{host.cuisineStyle}</p>
        <p className="text-white/50 text-sm mb-8">📍 {host.district}, Shanghai</p>

        {/* CTA */}
        <Button
          onClick={handleMeetHost}
          className="w-full bg-red-600 hover:bg-red-700 text-white text-lg font-semibold py-4 rounded-xl shadow-lg"
        >
          Meet {host.hostName.split(" ")[0]} →
        </Button>

        {/* Dismiss */}
        <button
          onClick={onClose}
          className="mt-4 text-white/40 hover:text-white/70 text-sm transition-colors"
        >
          Maybe another time
        </button>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Users,
  Heart,
  Globe,
  Home as HomeIcon,
  ChefHat,
  MessageCircle,
  ArrowRight,
  Check,
  Sparkles,
} from "lucide-react";
import { ChopsticksLogo } from "@/components/ChopsticksLogo";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <ExperienceSection />
      <BenefitsSection />
      <CTASection />
      <AboutSection />
      <ContactSection />
      <Footer />
    </div>
  );
}

function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container flex items-center justify-between h-16">
        <a href="#" className="flex items-center gap-2">
          <ChopsticksLogo className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg" style={{ fontFamily: "var(--font-serif)" }}>
            +1 Chopsticks
          </span>
        </a>
        <div className="hidden md:flex items-center gap-8">
          <a href="#experience" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Experience
          </a>
          <a href="#benefits" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Benefits
          </a>
          <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            About
          </a>
          <a href="/hosts" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Find Hosts
          </a>
          <a href="/host-register">
            <Button size="sm">Become a Host</Button>
          </a>
        </div>
        <a href="/host-register" className="md:hidden">
          <Button size="sm">Host</Button>
        </a>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Sparkles className="h-4 w-4" />
            <span>Launching Pilot Program in Shanghai</span>
          </div>

          {/* Main heading */}
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            +1 Chopsticks
            <span className="block text-primary mt-2 text-2xl md:text-3xl lg:text-4xl">加一雙筷子</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Experience genuine hospitality by sharing dinner with local families in Shanghai.
            Not a restaurant—a real family dinner where they simply add an extra pair of chopsticks for you.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/hosts">
              <Button size="lg" className="gap-2 px-8">
                Browse Hosts
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
            <a href="#experience">
              <Button size="lg" variant="outline" className="gap-2 px-8 bg-background">
                Learn More
              </Button>
            </a>
          </div>


        </div>
      </div>
    </section>
  );
}

function ExperienceSection() {
  return (
    <section id="experience" className="py-20 md:py-28 bg-secondary/30">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            The Experience
          </h2>
          <p className="text-lg text-muted-foreground">
            What if you could experience something even more authentic than walking tours or cooking classes?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card className="bg-card border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-8">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <HomeIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: "var(--font-serif)" }}>
                Real Home Setting
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Step into an actual family home—not a restaurant or staged venue. Experience the warmth
                and authenticity of a real Chinese household.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-8">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-6">
                <MessageCircle className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: "var(--font-serif)" }}>
                Cultural Exchange
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Share stories, learn about daily life, and create genuine connections that go beyond
                typical tourist interactions.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-8">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <ChefHat className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: "var(--font-serif)" }}>
                Home-Cooked Meals
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Taste authentic dishes the way locals actually eat them—recipes passed down through
                generations, prepared with love.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-8">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: "var(--font-serif)" }}>
                Family Interactions
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                If there are kids, it becomes a learning adventure for everyone. Experience the joy
                of multi-generational family dynamics.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  const benefits = [
    "Genuine local connections beyond typical tourist experiences",
    "Authentic home-cooked meals you won't find in restaurants",
    "Cultural insights from real family conversations",
    "Stories and memories that last a lifetime",
    "Support local families and community tourism",
    "Safe, vetted host families with language support",
  ];

  return (
    <section id="benefits" className="py-20 md:py-28">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
          <div>
            <h2
              className="text-3xl md:text-4xl font-bold tracking-tight mb-6"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Why Dine with Local Families?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              As someone who's explored 60+ countries, I know we all crave those genuine local
              connections—the kind you get from walking tours, cooking classes, or chance encounters
              in neighborhood bars. This takes it further.
            </p>
            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-secondary flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-10 w-10 text-primary" />
                </div>
                <p
                  className="text-2xl font-semibold mb-2"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  加一雙筷子
                </p>
                <p className="text-muted-foreground">
                  "Add an extra pair of chopsticks"
                </p>
                <p className="text-sm text-muted-foreground mt-4 max-w-xs mx-auto">
                  A Chinese expression of hospitality—there's always room for one more at the table.
                </p>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 md:py-28 bg-primary text-primary-foreground">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* For Travelers */}
          <div className="text-center md:text-left">
            <div className="w-14 h-14 rounded-xl bg-primary-foreground/10 flex items-center justify-center mb-6 mx-auto md:mx-0">
              <Globe className="h-7 w-7" />
            </div>
            <h3
              className="text-2xl font-bold mb-4"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              For Travelers
            </h3>
            <p className="text-primary-foreground/80 mb-6 leading-relaxed">
              Heading to China? Experience Shanghai like a local. Skip the tourist traps and
              discover the real culture through genuine family connections.
            </p>
            <ul className="space-y-3 text-left mb-8">
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-primary-foreground/80" />
                <span>Authentic home-cooked dinner experience</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-primary-foreground/80" />
                <span>Cultural exchange with local families</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-primary-foreground/80" />
                <span>Language support provided</span>
              </li>
            </ul>
            <a href="/hosts">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2"
              >
                Browse Hosts
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          </div>

          {/* For Host Families */}
          <div className="text-center md:text-left md:border-l md:border-primary-foreground/20 md:pl-12">
            <div className="w-14 h-14 rounded-xl bg-primary-foreground/10 flex items-center justify-center mb-6 mx-auto md:mx-0">
              <HomeIcon className="h-7 w-7" />
            </div>
            <h3
              className="text-2xl font-bold mb-4"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              For Host Families
            </h3>
            <p className="text-primary-foreground/80 mb-6 leading-relaxed">
              Love cooking and meeting new people? Share your culture and earn extra income by
              hosting international guests for dinner.
            </p>
            <ul className="space-y-3 text-left mb-8">
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-primary-foreground/80" />
                <span>Earn income doing what you love</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-primary-foreground/80" />
                <span>Meet travelers from around the world</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-primary-foreground/80" />
                <span>Flexible hosting schedule</span>
              </li>
            </ul>
            <a href="/host-register">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2"
              >
                Become a Host
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section id="about" className="py-20 md:py-28 bg-secondary/30">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className="text-3xl md:text-4xl font-bold tracking-tight mb-6"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            About the Pilot Program
          </h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            We're launching a pilot program in Shanghai in the coming months. We're looking for
            5-10 welcoming families who love cooking and meeting international guests, and
            travelers who want to experience authentic Chinese hospitality.
          </p>

          <div className="grid sm:grid-cols-3 gap-6 mt-12">
            <div className="p-6 rounded-xl bg-card border border-border/50">
              <div className="text-3xl font-bold text-primary mb-2">5-10</div>
              <div className="text-sm text-muted-foreground">Pilot Host Families</div>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border/50">
              <div className="text-3xl font-bold text-primary mb-2">2026</div>
              <div className="text-sm text-muted-foreground">Launch Year</div>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border/50">
              <div className="text-3xl font-bold text-primary mb-2">Shanghai</div>
              <div className="text-sm text-muted-foreground">Pilot Location</div>
            </div>
          </div>

          <p className="text-muted-foreground mt-12 leading-relaxed">
            Yes, there are challenges around safety and language barriers, but imagine the stories
            and connections this could create! We're carefully vetting all host families and
            providing translation support to ensure a safe and memorable experience for everyone.
          </p>
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [interestType, setInterestType] = useState<"traveler" | "host">("traveler");
  const [message, setMessage] = useState("");

  const submitMutation = trpc.interest.submit.useMutation({
    onSuccess: () => {
      toast.success("Thank you for your interest! We'll be in touch soon.");
      setName("");
      setEmail("");
      setMessage("");
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    submitMutation.mutate({
      name: name.trim(),
      email: email.trim(),
      interestType,
      message: message.trim() || undefined,
    });
  };

  return (
    <section id="contact" className="py-20 md:py-28">
      <div className="container">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Join the Waitlist
            </h2>
            <p className="text-lg text-muted-foreground">
              Be the first to know when we launch. Drop your details and tell us if you're
              interested as a traveler or host family.
            </p>
          </div>

          <Card className="border-border/50 shadow-lg">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-background"
                  />
                </div>

                <div className="space-y-3">
                  <Label>I'm interested as a...</Label>
                  <RadioGroup
                    value={interestType}
                    onValueChange={(value) => setInterestType(value as "traveler" | "host")}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="traveler" id="traveler" />
                      <Label htmlFor="traveler" className="font-normal cursor-pointer">
                        Traveler
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="host" id="host" />
                      <Label htmlFor="host" className="font-normal cursor-pointer">
                        Host Family
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message (optional)</Label>
                  <Textarea
                    id="message"
                    placeholder={
                      interestType === "traveler"
                        ? "Tell us about your travel plans or what interests you about this experience..."
                        : "Tell us about your family and why you'd love to host international guests..."
                    }
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="bg-background resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-2"
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending ? (
                    "Submitting..."
                  ) : (
                    <>
                      Submit Interest
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            We respect your privacy and will never share your information.
          </p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 border-t border-border/50 bg-secondary/20">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <ChopsticksLogo className="h-5 w-5 text-primary" />
            <span className="font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
              +1 Chopsticks
            </span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Let's make travel more meaningful, one dinner table at a time. 🥢
          </p>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} +1 Chopsticks. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

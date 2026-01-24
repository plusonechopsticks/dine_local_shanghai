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
import { Sparkles, Heart, Users } from "lucide-react";

const SHANGHAI_DISTRICTS = [
  "Huangpu", "Xuhui", "Changning", "Jing'an", "Putuo", "Hongkou", 
  "Yangpu", "Minhang", "Baoshan", "Jiading", "Pudong", "Jinshan", 
  "Songjiang", "Qingpu", "Fengxian", "Chongming"
];

export default function HostRegister() {
  const [name, setName] = useState("");
  const [district, setDistrict] = useState("");
  const [contact, setContact] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitMutation = trpc.hostInterest.submit.useMutation({
    onSuccess: () => {
      toast.success("Thank you! We'll be in touch soon.");
      // Reset form
      setName("");
      setDistrict("");
      setContact("");
      setIsSubmitting(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit. Please try again.");
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!district) {
      toast.error("Please select your district");
      return;
    }
    if (!contact.trim()) {
      toast.error("Please enter your email or WeChat ID");
      return;
    }

    setIsSubmitting(true);
    await submitMutation.mutateAsync({
      name: name.trim(),
      district,
      contact: contact.trim(),
    });
  };

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
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-lg font-medium text-gray-900">
                  What's your name?
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="h-12 text-base"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="district" className="text-lg font-medium text-gray-900">
                  Which district do you live in Shanghai?
                </Label>
                <Select value={district} onValueChange={setDistrict} required>
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
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="email@example.com or WeChat ID"
                  className="h-12 text-base"
                  required
                />
                <p className="text-sm text-gray-500">
                  We'll contact you shortly to discuss next steps
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 text-lg bg-burgundy-600 hover:bg-burgundy-700"
              >
                {isSubmitting ? "Submitting..." : "Submit Interest"}
              </Button>
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

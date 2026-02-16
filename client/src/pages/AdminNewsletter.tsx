import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";


export default function AdminNewsletter() {

  const [testEmail, setTestEmail] = useState("shugenbaba@gmail.com");
  const [sending, setSending] = useState(false);
  
  const sendNewsletterMutation = trpc.newsletter.send.useMutation({
    onSuccess: () => {
      alert("Newsletter sent successfully!");
      setSending(false);
    },
    onError: (error) => {
      alert(`Failed to send newsletter: ${error.message}`);
      setSending(false);
    },
  });

  const handleSendTest = () => {
    setSending(true);
    sendNewsletterMutation.mutate({
      founderNote: `Gong Hei Fat Choy! 🧧

As we celebrate the Year of the Snake, I'm thrilled to share three exciting milestones with you:

**1. Our First Host is Live!** Meet Sookie, a culinary artist who's opening her home in Putuo District. Her "Soul Food So Good" experience brings together Cantonese, Chaoshan, and Western fusion flavors in a cozy setting with her adorable dog as your dining companion.

**2. Growing Community:** We now have 47 travelers and 12 aspiring hosts who've joined our waitlist. Your enthusiasm fuels our mission to create authentic cultural exchanges through home dining.

**3. Platform Launch:** Our booking system is now live! You can browse host profiles, check availability, and reserve your spot at the table—all in a few clicks.

**Our Vision:** +1 Chopsticks isn't just about food—it's about breaking down walls between "tourist" and "local." Every meal is a conversation, every recipe tells a story, and every host becomes a bridge to understanding Shanghai beyond the guidebooks.

This CNY, as families gather around tables across China, we're building a community where travelers can experience that same warmth. Not as observers, but as welcomed guests.

Ready to pull up a chair?`,
      cnyIntro: "Chinese New Year in Shanghai is magical—but the best experiences aren't in tourist guides. Here are three hidden gems where locals actually celebrate:",
      cnyPlaces: [
        {
          name: "Pan Long Xin Tian Di",
          chineseName: "蟠龙新天地",
          description: "A revitalized industrial complex transformed into a vibrant cultural hub with traditional performances and modern art installations.",
          tip: "Visit after sunset when the red lanterns light up the courtyards. The fusion of old factory architecture with CNY decorations creates stunning photo opportunities.",
          dates: "Festivities run through February 28th"
        },
        {
          name: "Wu Kong Road",
          chineseName: "武康路",
          description: "This tree-lined French Concession street becomes a living museum during CNY, with local families hanging traditional decorations from historic villas.",
          tip: "Go on a weekday morning to avoid crowds. Stop by the small tea shops where elderly residents gather—they're often happy to share CNY stories with curious visitors.",
        },
        {
          name: "Yu Yuan Garden",
          chineseName: "豫园",
          description: "Yes, it's touristy, but the CNY temple fair here is the real deal. Local families come for specific vendors that have been operating for generations.",
          tip: "Skip the main entrance crowds. Enter through the east gate near Fuyou Road, where you'll find family-run stalls selling traditional snacks that most tourists miss.",
        }
      ],
      cnyPhotoUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/gAkOAquOIzeDHTmX.PNG",
      featuredHostId: 180001, // Chuan's ID
      testEmail: testEmail,
    });
  };

  const handleSendToAll = () => {
    if (!confirm("Are you sure you want to send this newsletter to ALL subscribers?")) {
      return;
    }
    setSending(true);
    sendNewsletterMutation.mutate({
      founderNote: `Gong Hei Fat Choy! 🧧

As we celebrate the Year of the Snake, I'm thrilled to share three exciting milestones with you:

**1. Our First Host is Live!** Meet Sookie, a culinary artist who's opening her home in Putuo District. Her "Soul Food So Good" experience brings together Cantonese, Chaoshan, and Western fusion flavors in a cozy setting with her adorable dog as your dining companion.

**2. Growing Community:** We now have 47 travelers and 12 aspiring hosts who've joined our waitlist. Your enthusiasm fuels our mission to create authentic cultural exchanges through home dining.

**3. Platform Launch:** Our booking system is now live! You can browse host profiles, check availability, and reserve your spot at the table—all in a few clicks.

**Our Vision:** +1 Chopsticks isn't just about food—it's about breaking down walls between "tourist" and "local." Every meal is a conversation, every recipe tells a story, and every host becomes a bridge to understanding Shanghai beyond the guidebooks.

This CNY, as families gather around tables across China, we're building a community where travelers can experience that same warmth. Not as observers, but as welcomed guests.

Ready to pull up a chair?`,
      cnyIntro: "Chinese New Year in Shanghai is magical—but the best experiences aren't in tourist guides. Here are three hidden gems where locals actually celebrate:",
      cnyPlaces: [
        {
          name: "Pan Long Xin Tian Di",
          chineseName: "蟠龙新天地",
          description: "A revitalized industrial complex transformed into a vibrant cultural hub with traditional performances and modern art installations.",
          tip: "Visit after sunset when the red lanterns light up the courtyards. The fusion of old factory architecture with CNY decorations creates stunning photo opportunities.",
          dates: "Festivities run through February 28th"
        },
        {
          name: "Wu Kong Road",
          chineseName: "武康路",
          description: "This tree-lined French Concession street becomes a living museum during CNY, with local families hanging traditional decorations from historic villas.",
          tip: "Go on a weekday morning to avoid crowds. Stop by the small tea shops where elderly residents gather—they're often happy to share CNY stories with curious visitors.",
        },
        {
          name: "Yu Yuan Garden",
          chineseName: "豫园",
          description: "Yes, it's touristy, but the CNY temple fair here is the real deal. Local families come for specific vendors that have been operating for generations.",
          tip: "Skip the main entrance crowds. Enter through the east gate near Fuyou Road, where you'll find family-run stalls selling traditional snacks that most tourists miss.",
        }
      ],
      cnyPhotoUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/gAkOAquOIzeDHTmX.PNG",
      featuredHostId: 180001, // Chuan's ID
      // No testEmail - sends to all
    });
  };

  return (
    <div className="container py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Send Newsletter</h1>
      
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Inaugural Newsletter - CNY Edition</h2>
        
        <div className="space-y-4 mb-6">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Featured Host</Label>
            <p className="text-base">Chuan (ID: 2)</p>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-muted-foreground">CNY Photo</Label>
            <img 
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663228681359/gAkOAquOIzeDHTmX.PNG" 
              alt="CNY Lanterns"
              className="w-full max-w-md rounded-lg mt-2"
            />
          </div>
          
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Founder's Note Preview</Label>
            <div className="bg-muted p-4 rounded-lg mt-2 text-sm">
              <p className="font-medium mb-2">Gong Hei Fat Choy! 🧧</p>
              <p className="text-muted-foreground">
                As we celebrate the Year of the Snake, I'm thrilled to share three exciting milestones...
              </p>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-muted-foreground">CNY Recommendations</Label>
            <ul className="list-disc list-inside mt-2 text-sm space-y-1">
              <li>Pan Long Xin Tian Di (蟠龙新天地)</li>
              <li>Wu Kong Road (武康路)</li>
              <li>Yu Yuan Garden (豫园)</li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-6 space-y-4">
          <div>
            <Label htmlFor="testEmail">Test Email Address</Label>
            <Input
              id="testEmail"
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="your@email.com"
              className="mt-2"
            />
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleSendTest}
              disabled={sending || !testEmail}
              variant="outline"
            >
              {sending ? "Sending..." : "Send Test Email"}
            </Button>

            <Button
              onClick={handleSendToAll}
              disabled={sending}
              variant="default"
            >
              {sending ? "Sending..." : "Send to All Subscribers"}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-muted">
        <h3 className="font-semibold mb-2">Newsletter Stats</h3>
        <p className="text-sm text-muted-foreground">
          This newsletter will be sent to all traveler interest submissions in the database.
        </p>
      </Card>
    </div>
  );
}

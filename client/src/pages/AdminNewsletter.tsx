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
      founderNote: `From Steven, Founder and CEO

Gong Hei Fat Choy! Welcome to the inaugural newsletter of +1 Chopsticks!

I'm excited to share the following milestones achieved in three weeks' time:

1. We created a MVP that allows hosts to list and guest to book

2. We have 6 pilot hosts that are up and running, and one of them is from outside my network!

3. We have received 2 paid orders!!!

The early signals are encouraging: I receive messages every day that travelers love this idea and would like to give it a try.

So +1 chopsticks fans, I will appreciate very much if you forward the newsletter to whoever might be coming to China, or recommend us more hosts.

I'll keep you engaged every month on where we are :)`,
      cnyIntro: "Lots of local mom and pop are going to be closed, yet major tourist sights (Yu Garden, the Bund areas, big museums, observation towers) generally stay open through CNY.\n\nIn fact, some of them have extended hours or festive programs (like the metro will run longer!), so Shanghai will feel more lively than dead because of the local tourists.\n\nHere are a few suggested spots (hidden gems other than Yu-Yuan) if you happen to be in Shanghai during CNY",
      cnyPlaces: [
        {
          name: "Jade Buddha Temple",
          chineseName: "玉佛寺",
          description: "Try Jade Buddha Temple for some Zen-ness with the temple bells",
          tip: "Visit early morning for peaceful meditation and avoid the afternoon crowds",
        },
        {
          name: "Pan-Long-Xin-Tian-Di",
          chineseName: "蟠龙新天地",
          description: "Go to Pan-Long-Xin-Tian-Di instead of Yu-Yuan for the lantern and water bridge landscape",
          tip: "Visit after sunset when the lanterns are lit for the best photo opportunities",
        },
        {
          name: "Wu-Kang Road",
          chineseName: "武康路",
          description: "Consider a city walk in Wu-Kang Road for how young hipsters in Shanghai blend CNY with latest fashion trends",
          tip: "Weekday mornings are best to see locals and avoid tourist crowds",
        }
      ],
      cnyPs: "P.S. I've added dash in between pinyin so it's easier to read for non Chinese speakers! (So we write Wu-Kang Road instead Wu Kang Road)",
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
      founderNote: `From Steven, Founder and CEO

Gong Hei Fat Choy! Welcome to the inaugural newsletter of +1 Chopsticks!

I'm excited to share the following milestones achieved in three weeks' time:

1. We created a MVP that allows hosts to list and guest to book

2. We have 6 pilot hosts that are up and running, and one of them is from outside my network!

3. We have received 2 paid orders!!!

The early signals are encouraging: I receive messages every day that travelers love this idea and would like to give it a try.

So +1 chopsticks fans, I will appreciate very much if you forward the newsletter to whoever might be coming to China, or recommend us more hosts.

I'll keep you engaged every month on where we are :)`,
      cnyIntro: "Lots of local mom and pop are going to be closed, yet major tourist sights (Yu Garden, the Bund areas, big museums, observation towers) generally stay open through CNY.\n\nIn fact, some of them have extended hours or festive programs (like the metro will run longer!), so Shanghai will feel more lively than dead because of the local tourists.\n\nHere are a few suggested spots (hidden gems other than Yu-Yuan) if you happen to be in Shanghai during CNY",
      cnyPlaces: [
        {
          name: "Jade Buddha Temple",
          chineseName: "玉佛寺",
          description: "Try Jade Buddha Temple for some Zen-ness with the temple bells",
          tip: "Visit early morning for peaceful meditation and avoid the afternoon crowds",
        },
        {
          name: "Pan-Long-Xin-Tian-Di",
          chineseName: "蟠龙新天地",
          description: "Go to Pan-Long-Xin-Tian-Di instead of Yu-Yuan for the lantern and water bridge landscape",
          tip: "Visit after sunset when the lanterns are lit for the best photo opportunities",
        },
        {
          name: "Wu-Kang Road",
          chineseName: "武康路",
          description: "Consider a city walk in Wu-Kang Road for how young hipsters in Shanghai blend CNY with latest fashion trends",
          tip: "Weekday mornings are best to see locals and avoid tourist crowds",
        }
      ],
      cnyPs: "P.S. I've added dash in between pinyin so it's easier to read for non Chinese speakers! (So we write Wu-Kang Road instead Wu Kang Road)",
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

import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function AnnouncementEditor() {
  const { data: announcement, isLoading } = trpc.announcement.get.useQuery();
  const utils = trpc.useUtils();
  
  const [content, setContent] = useState("");
  const [isActive, setIsActive] = useState(true);
  
  // Update form when announcement data loads
  useEffect(() => {
    if (announcement) {
      setContent(announcement.content);
      setIsActive(announcement.isActive);
    }
  }, [announcement]);
  
  const updateMutation = trpc.announcement.update.useMutation({
    onSuccess: () => {
      utils.announcement.get.invalidate();
      toast.success("Announcement updated successfully!");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      content,
      isActive,
    });
  };
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Announcement Banner</CardTitle>
        <CardDescription>
          Manage the announcement displayed on the Find Hosts page. Use this to communicate important updates like holiday schedules, booking requirements, or special notices.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Announcement Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Example: It's Chinese New Year next week! All hosts are only available on or after Feb 18. Please book at least 3 days in advance."
              rows={4}
              required
            />
            <p className="text-sm text-muted-foreground">
              This message will appear as a banner at the top of the Find Hosts page.
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="isActive">Show announcement on Find Hosts page</Label>
          </div>
          
          <div className="flex gap-2">
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Announcement"}
            </Button>
            {announcement && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setContent(announcement.content);
                  setIsActive(announcement.isActive);
                }}
              >
                Reset
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";
import { toast } from "sonner";

const TAGS = ["entrepreneurship", "travel-policy", "travel-tips", "food-culture"];

// View count component removed - simplified implementation
function BlogPostViewCount() {
  return null;
}

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitInterestMutation = trpc.interest.submit.useMutation();

  return (
    <div className="flex gap-3 max-w-md mx-auto">
      <input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-red-600"
      />
      <Button
        className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 font-semibold disabled:opacity-50"
        disabled={isSubmitting || !email}
        onClick={async () => {
          if (!email) {
            toast.error("Please enter your email");
            return;
          }
          setIsSubmitting(true);
          try {
            await submitInterestMutation.mutateAsync({
              name: "Newsletter Subscriber",
              email,
              interestType: "traveler",
              message: "Subscribed to newsletter",
            });
            toast.success("Thanks for subscribing!");
            setEmail("");
          } catch (error) {
            toast.error("Failed to subscribe. Please try again.");
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        Subscribe
      </Button>
    </div>
  );
}

export default function Blog() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [, navigate] = useLocation();

  // Scroll to top when the blog listing page mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  // Fetch all published blog posts
  const { data: posts, isLoading } = trpc.blog.listPosts.useQuery({
    published: true,
  });

  // Filter posts by selected tag
  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    if (!selectedTag) return posts;
    return posts.filter((post: any) => {
      const tags = typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags;
      return Array.isArray(tags) && tags.includes(selectedTag);
    });
  }, [posts, selectedTag]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-50 to-orange-50 py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Stories from +1 Chopsticks
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Insights on travel, entrepreneurship, food culture, and authentic experiences in Shanghai.
          </p>
        </div>
      </section>

      {/* Tag Filter */}
      <section className="border-b bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-3">
            <Button
              variant={selectedTag === null ? "default" : "outline"}
              onClick={() => setSelectedTag(null)}
              className="rounded-full"
            >
              All Posts
            </Button>
            {TAGS.map((tag) => (
              <Button
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                onClick={() => setSelectedTag(tag)}
                className="rounded-full capitalize"
              >
                {tag.replace("-", " ")}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup Section */}
      <section className="bg-gradient-to-r from-red-50 to-orange-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex justify-center mb-4">
              <Mail className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Get Stories Delivered to Your Inbox
            </h2>
            <p className="text-muted-foreground mb-6">
              Subscribe to our newsletter for new blog posts, travel tips, and insider stories from Shanghai's local dining scene.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading posts...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts found in this category.</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post: any) => (
                <Card
                  key={post.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/blog/${post.slug}`)}
                >
                  {post.featuredImageUrl && (
                    <div className="h-64 overflow-hidden bg-muted">
                      <img
                        src={post.featuredImageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-1 pt-3">
                    <CardTitle className="mb-2 text-lg leading-tight">{post.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(() => {
                        const tags = typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags;
                        return Array.isArray(tags) ? tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs capitalize">
                            {tag.replace("-", " ")}
                          </Badge>
                        )) : null;
                      })()}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : ""}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {post.excerpt}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

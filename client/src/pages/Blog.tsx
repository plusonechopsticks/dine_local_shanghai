import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

const TAGS = ["entrepreneurship", "travel-policy", "travel-tips", "food-culture"];

function BlogPostViewCount({ postId }: { postId: number }) {
  const { data: viewCount } = trpc.blog.getViewCount.useQuery(
    { blogPostId: postId },
    { enabled: !!postId }
  ) as any;

  return (
    <span className="flex items-center gap-1">
      <Eye className="w-3 h-3" />
      {viewCount || 0}
    </span>
  );
}

export default function Blog() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [, navigate] = useLocation();

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
                    <div className="h-48 overflow-hidden bg-muted">
                      <img
                        src={post.featuredImageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <CardTitle className="line-clamp-2 mb-3">{post.title}</CardTitle>
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
                      <BlogPostViewCount postId={post.id} />
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

import { useLocation } from "wouter";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Eye } from "lucide-react";
import { Streamdown } from "streamdown";

export default function BlogPost() {
  const [location, navigate] = useLocation();
  const slug = location.split("/blog/")[1];

  // Fetch blog post by slug
  const { data: post, isLoading, error } = trpc.blog.getPostBySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  ) as any;

  // Increment view count on page load (once per slug)
  const incrementView = trpc.blog.incrementView.useMutation();
  useEffect(() => {
    if (slug) {
      incrementView.mutate({ slug });
    }
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  // Inject per-post SEO meta tags into <head>
  useEffect(() => {
    if (!post) return;
    const seoTitle = (post as any).metaTitle || post.title;
    const seoDesc = (post as any).metaDescription || post.excerpt || "";
    const canonicalUrl = `https://plus1chopsticks.com/blog/${post.slug}`;

    // Title
    document.title = `${seoTitle} | +1 Chopsticks`;

    // Meta description
    let descTag = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!descTag) {
      descTag = document.createElement("meta");
      descTag.setAttribute("name", "description");
      document.head.appendChild(descTag);
    }
    descTag.setAttribute("content", seoDesc);

    // OG title
    let ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement | null;
    if (!ogTitle) {
      ogTitle = document.createElement("meta");
      ogTitle.setAttribute("property", "og:title");
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute("content", `${seoTitle} | +1 Chopsticks`);

    // OG description
    let ogDesc = document.querySelector('meta[property="og:description"]') as HTMLMetaElement | null;
    if (!ogDesc) {
      ogDesc = document.createElement("meta");
      ogDesc.setAttribute("property", "og:description");
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute("content", seoDesc);

    // OG URL
    let ogUrl = document.querySelector('meta[property="og:url"]') as HTMLMetaElement | null;
    if (!ogUrl) {
      ogUrl = document.createElement("meta");
      ogUrl.setAttribute("property", "og:url");
      document.head.appendChild(ogUrl);
    }
    ogUrl.setAttribute("content", canonicalUrl);

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalUrl);

    // OG image (featured image if available)
    if (post.featuredImageUrl) {
      let ogImage = document.querySelector('meta[property="og:image"]') as HTMLMetaElement | null;
      if (!ogImage) {
        ogImage = document.createElement("meta");
        ogImage.setAttribute("property", "og:image");
        document.head.appendChild(ogImage);
      }
      ogImage.setAttribute("content", post.featuredImageUrl);
    }

    // Restore defaults on unmount
    return () => {
      document.title = "+1 Chopsticks | Authentic Home Dining Experiences in Shanghai";
      document.querySelector('meta[name="description"]')?.setAttribute("content",
        "Dine with local families in Shanghai. Authentic home-cooked meals, real cultural exchange, and unforgettable experiences with +1 Chopsticks."
      );
    };
  }, [post]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading post...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-muted-foreground mb-4">Post not found</p>
        <Button onClick={() => navigate("/blog")}>Back to Blog</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="border-b bg-background sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/blog")}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Blog
          </Button>
        </div>
      </div>

      {/* Hero Image */}
      {post.featuredImageUrl && (
        <div className="w-full aspect-video overflow-hidden bg-muted">
          <img
            src={post.featuredImageUrl}
            alt={post.title}
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
        </div>
      )}

      {/* Article Content */}
      <article className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <header className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {(typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags).map((tag: string) => (
                <Badge key={tag} variant="secondary" className="capitalize">
                  {tag.replace("-", " ")}
                </Badge>
              ))}
            </div>

            <h1 className="text-4xl font-bold text-foreground mb-4">{post.title}</h1>

            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <span>By {post.authorName}</span>
              <span>•</span>
              <span>
                {post.publishedAt
                  ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : ""}
              </span>
              {post.viewCount !== undefined && post.viewCount > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {post.viewCount.toLocaleString()} {post.viewCount === 1 ? "view" : "views"}
                  </span>
                </>
              )}
            </div>
          </header>

          {/* Content */}
          <div className="prose prose-sm max-w-none dark:prose-invert
              prose-headings:text-foreground prose-headings:font-bold
              prose-p:text-foreground prose-p:leading-relaxed prose-p:my-4
              prose-a:text-primary prose-a:underline
              prose-strong:text-foreground prose-strong:font-semibold
              prose-em:text-foreground prose-em:italic
              prose-code:text-foreground prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded
              prose-pre:bg-muted prose-pre:text-foreground
              prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic
              prose-ul:text-foreground prose-ol:text-foreground prose-ul:my-4 prose-ol:my-4
              prose-li:text-foreground prose-li:my-2
              prose-img:rounded-lg prose-img:shadow-md">
            <Streamdown>{post.content}</Streamdown>
          </div>

          {/* Footer */}
          <footer className="mt-12 pt-8 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Share this article or explore more stories
                </p>
              </div>
              <Button onClick={() => navigate("/blog")} variant="outline">
                Back to Blog
              </Button>
            </div>
          </footer>
        </div>
      </article>
    </div>
  );
}

import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen } from "lucide-react";

const FEATURED_SLUGS = [
  "eating-in-china-with-food-sensitivities",
  "china-app-stack-essential-apps-traveling",
  "planning-first-china-trip-itinerary-questions",
];

function BlogCard({
  post,
  onClick,
}: {
  post: {
    title: string;
    excerpt: string | null;
    featuredImageUrl: string | null;
    tags: string[] | string | null;
    slug: string;
    publishedAt: Date | null;
  };
  onClick: () => void;
}) {
  const tags: string[] = (() => {
    if (!post.tags) return [];
    if (Array.isArray(post.tags)) return post.tags;
    try {
      return JSON.parse(post.tags as string);
    } catch {
      return [];
    }
  })();

  const dateStr = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <article
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col"
    >
      {/* Cover image */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {post.featuredImageUrl ? (
          <img
            src={post.featuredImageUrl}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
            <BookOpen className="w-12 h-12 text-red-300" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 text-red-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug group-hover:text-red-600 transition-colors line-clamp-2">
          {post.title}
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 flex-1">
            {post.excerpt}
          </p>
        )}

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          {dateStr && (
            <span className="text-xs text-gray-400">{dateStr}</span>
          )}
          <span className="text-sm font-semibold text-red-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 ml-auto">
            Read more <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </article>
  );
}

export function HomeBlogSection() {
  const [, setLocation] = useLocation();

  // Fetch all published posts and pick the 3 featured ones in order
  const { data: allPosts = [] } = trpc.blog.listPosts.useQuery({ published: true });

  const featuredPosts = FEATURED_SLUGS.map((slug) =>
    allPosts.find((p) => p.slug === slug)
  ).filter(Boolean) as typeof allPosts;

  if (featuredPosts.length === 0) return null;

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-red-600 uppercase tracking-widest mb-2">
            Resources
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Useful Food &amp; Travel Advice
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Practical guides to help you eat well and travel confidently in China.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {featuredPosts.map((post) => (
            <BlogCard
              key={post.slug}
              post={post}
              onClick={() => setLocation(`/blog/${post.slug}`)}
            />
          ))}
        </div>

        {/* Browse All */}
        <div className="text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => { setLocation("/blog"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors px-8"
          >
            Browse All Articles <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}

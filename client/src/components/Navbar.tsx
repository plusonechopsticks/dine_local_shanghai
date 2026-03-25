import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export function Navbar() {
  const { user, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const [pendingScroll, setPendingScroll] = useState<string | null>(null);

  const handleMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  const handleNavClick = (path: string) => {
    setLocation(path);
    handleMenuClose();
  };

  const scrollToElement = (id: string, delay: number = 100) => {
    const timer = setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        // Calculate navbar height for offset
        const navbar = document.querySelector("nav");
        const navbarHeight = navbar ? navbar.offsetHeight : 80;
        
        // Get element position
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        
        // Scroll to element with navbar offset
        window.scrollTo({
          top: elementPosition - navbarHeight - 20, // 20px extra padding
          behavior: "smooth"
        });
      }
    }, delay);
    return timer;
  };

  const handleAnchorClick = (id: string) => {
    handleMenuClose();
    scrollToElement(id, 50); // Shorter delay when already on page
  };

  const handleSectionClick = (id: string) => {
    handleMenuClose();
    // Check if we're already on the home page using wouter's location
    if (location === "/") {
      // Already on home, just scroll
      handleAnchorClick(id);
    } else {
      // Not on home, navigate first then scroll
      setPendingScroll(id);
      setLocation("/");
    }
  };

  // Handle scroll after navigation - triggered when location changes
  useEffect(() => {
    if (pendingScroll && location === "/") {
      // We've navigated to home, now scroll
      // Use longer delay on mobile to ensure content is rendered
      const isMobile = window.innerWidth < 768;
      const delay = isMobile ? 300 : 150;
      scrollToElement(pendingScroll, delay);
      setPendingScroll(null);
    }
  }, [location, pendingScroll]);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => handleNavClick("/")}
          className="flex items-center gap-2 hover:opacity-80 transition flex-shrink-0"
        >
          <span className="text-2xl">🥢</span>
          <span className="text-xl font-bold">+1 Chopsticks</span>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => handleNavClick("/hosts")}
            className="text-gray-700 hover:text-gray-900 font-medium transition"
          >
            Browse Hosts
          </button>
          <button
            onClick={() => handleSectionClick("how-it-works")}
            className="text-gray-700 hover:text-gray-900 font-medium transition cursor-pointer"
          >
            How it Works
          </button>
          <button
            onClick={() => handleSectionClick("about-us")}
            className="text-gray-700 hover:text-gray-900 font-medium transition cursor-pointer"
          >
            About Us
          </button>
          <button
            onClick={() => handleSectionClick("faq")}
            className="text-gray-700 hover:text-gray-900 font-medium transition cursor-pointer"
          >
            FAQ
          </button>
          <button
            onClick={() => handleNavClick("/blog")}
            className="text-gray-700 hover:text-gray-900 font-medium transition"
          >
            Blog
          </button>

          {!isLoading && (
            <>
              {user ? (
                <>
                  <Link href="/host-dashboard">
                    <a className="text-gray-700 hover:text-gray-900 font-medium transition">Host Dashboard</a>
                  </Link>
                  <Button
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-50"
                    onClick={() => handleNavClick("/host-register")}
                  >
                    Become a Host
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-50"
                    onClick={() => handleNavClick("/host-register")}
                  >
                    Become a Host
                  </Button>
                </>
              )}
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-gray-700" />
          ) : (
            <Menu className="w-6 h-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
            <button
              onClick={() => handleNavClick("/hosts")}
              className="text-left text-gray-700 hover:text-gray-900 font-medium py-2 transition"
            >
              Browse Hosts
            </button>
            <button
              onClick={() => handleSectionClick("how-it-works")}
              className="text-left text-gray-700 hover:text-gray-900 font-medium py-2 transition cursor-pointer"
            >
              How it Works
            </button>
            <button
              onClick={() => handleSectionClick("about-us")}
              className="text-left text-gray-700 hover:text-gray-900 font-medium py-2 transition cursor-pointer"
            >
              About Us
            </button>
            <button
              onClick={() => handleSectionClick("faq")}
              className="text-left text-gray-700 hover:text-gray-900 font-medium py-2 transition cursor-pointer"
            >
              FAQ
            </button>
            <button
              onClick={() => handleNavClick("/blog")}
              className="text-left text-gray-700 hover:text-gray-900 font-medium py-2 transition"
            >
              Blog
            </button>

            {!isLoading && (
              <>
                {user ? (
                  <>
                    <Link href="/host-dashboard">
                      <a
                        onClick={handleMenuClose}
                        className="text-left text-gray-700 hover:text-gray-900 font-medium py-2 transition"
                      >
                        Host Dashboard
                      </a>
                    </Link>
                    <Button
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-50 w-full"
                      onClick={() => handleNavClick("/host-register")}
                    >
                      Become a Host
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-50 w-full"
                      onClick={() => handleNavClick("/host-register")}
                    >
                      Become a Host
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

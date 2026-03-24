import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

interface HomeHeaderProps {
  onNavigate?: (path: string) => void;
}

export function HomeHeader({ onNavigate }: HomeHeaderProps) {
  const [, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (path: string) => {
    setLocation(path);
    setIsMobileMenuOpen(false);
  };

  const handleAnchorClick = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
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
        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => handleNavClick("/hosts")}
            className="text-gray-700 hover:text-gray-900 font-medium transition"
          >
            Browse Hosts
          </button>
          <a
            href="#how-it-works"
            onClick={(e) => {
              e.preventDefault();
              handleAnchorClick("how-it-works");
            }}
            className="text-gray-700 hover:text-gray-900 font-medium transition cursor-pointer"
          >
            How it Works
          </a>
          <a
            href="#about-us"
            onClick={(e) => {
              e.preventDefault();
              handleAnchorClick("about-us");
            }}
            className="text-gray-700 hover:text-gray-900 font-medium transition cursor-pointer"
          >
            About Us
          </a>
          <a
            href="#faq"
            onClick={(e) => {
              e.preventDefault();
              handleAnchorClick("faq");
            }}
            className="text-gray-700 hover:text-gray-900 font-medium transition cursor-pointer"
          >
            FAQ
          </a>
          <button
            onClick={() => handleNavClick("/blog")}
            className="text-gray-700 hover:text-gray-900 font-medium transition"
          >
            Blog
          </button>
          <Button
            variant="outline"
            className="border-red-600 text-red-600 hover:bg-red-50"
            onClick={() => handleNavClick("/host-register")}
          >
            Become a Host
          </Button>
        </nav>

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
            <a
              href="#how-it-works"
              onClick={(e) => {
                e.preventDefault();
                handleAnchorClick("how-it-works");
              }}
              className="text-left text-gray-700 hover:text-gray-900 font-medium py-2 transition cursor-pointer"
            >
              How it Works
            </a>
            <a
              href="#about-us"
              onClick={(e) => {
                e.preventDefault();
                handleAnchorClick("about-us");
              }}
              className="text-left text-gray-700 hover:text-gray-900 font-medium py-2 transition cursor-pointer"
            >
              About Us
            </a>
            <a
              href="#faq"
              onClick={(e) => {
                e.preventDefault();
                handleAnchorClick("faq");
              }}
              className="text-left text-gray-700 hover:text-gray-900 font-medium py-2 transition cursor-pointer"
            >
              FAQ
            </a>
            <button
              onClick={() => handleNavClick("/blog")}
              className="text-left text-gray-700 hover:text-gray-900 font-medium py-2 transition"
            >
              Blog
            </button>
            <Button
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-50 w-full"
              onClick={() => handleNavClick("/host-register")}
            >
              Become a Host
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

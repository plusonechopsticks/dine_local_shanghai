import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { user, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [, setLocation] = useLocation();

  const handleMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  const handleNavClick = (path: string) => {
    setLocation(path);
    handleMenuClose();
  };

  const handleAnchorClick = (id: string) => {
    handleMenuClose();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

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

          {!isLoading && (
            <>
              {user ? (
                <>
                  <Link href="/host-dashboard">
                    <a className="text-gray-700 hover:text-gray-900 font-medium transition">Host Dashboard</a>
                  </Link>
                  <Link href="/guest-dashboard">
                    <a className="text-gray-700 hover:text-gray-900 font-medium transition">My Bookings</a>
                  </Link>
                  <Link href="/admin">
                    <a className="text-gray-700 hover:text-gray-900 font-medium transition">Admin</a>
                  </Link>
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
                    <Link href="/guest-dashboard">
                      <a
                        onClick={handleMenuClose}
                        className="text-left text-gray-700 hover:text-gray-900 font-medium py-2 transition"
                      >
                        My Bookings
                      </a>
                    </Link>
                    <Link href="/admin">
                      <a
                        onClick={handleMenuClose}
                        className="text-left text-gray-700 hover:text-gray-900 font-medium py-2 transition"
                      >
                        Admin
                      </a>
                    </Link>
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

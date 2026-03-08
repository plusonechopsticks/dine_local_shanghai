import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { user, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <a className="flex items-center gap-2 hover:opacity-80 transition flex-shrink-0">
            <span className="text-2xl">🥢</span>
            <span className="text-xl font-bold">+1 Chopsticks</span>
          </a>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/">
            <a className="text-gray-700 hover:text-gray-900 font-medium transition">Home</a>
          </Link>
          <Link href="/hosts">
            <a className="text-gray-700 hover:text-gray-900 font-medium transition">Find Hosts</a>
          </Link>

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
                    asChild
                  >
                    <Link href="/host-register">
                      <a>Become a Host</a>
                    </Link>
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
            <Link href="/">
              <a
                onClick={handleMenuClose}
                className="text-left text-gray-700 hover:text-gray-900 font-medium py-2 transition"
              >
                Home
              </a>
            </Link>
            <Link href="/hosts">
              <a
                onClick={handleMenuClose}
                className="text-left text-gray-700 hover:text-gray-900 font-medium py-2 transition"
              >
                Find Hosts
              </a>
            </Link>

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
                      className="border-red-600 text-red-600 hover:bg-red-50 w-full justify-start"
                      asChild
                    >
                      <Link href="/host-register">
                        <a onClick={handleMenuClose}>Become a Host</a>
                      </Link>
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

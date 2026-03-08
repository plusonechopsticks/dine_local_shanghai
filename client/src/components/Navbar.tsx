import { Link } from "wouter";
import { ChopsticksLogo } from "./ChopsticksLogo";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { user, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
              <span className="text-2xl">🥢</span>
              <span className="text-xl font-bold">+1 Chopsticks</span>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/">
              <a className="text-gray-700 hover:text-gray-900 font-medium">Home</a>
            </Link>
            <Link href="/hosts">
              <a className="text-gray-700 hover:text-gray-900 font-medium">Find Hosts</a>
            </Link>

            {!isLoading && (
              <>
                {user ? (
                  <>
                    <Link href="/host-dashboard">
                      <a className="text-gray-700 hover:text-gray-900 font-medium">Host Dashboard</a>
                    </Link>
                    <Link href="/guest-dashboard">
                      <a className="text-gray-700 hover:text-gray-900 font-medium">My Bookings</a>
                    </Link>
                    <Link href="/admin">
                      <a className="text-gray-700 hover:text-gray-900 font-medium">Admin</a>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/host-register">
                      <a className="text-gray-700 hover:text-gray-900 font-medium">Become a Host</a>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/">
              <a className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">Home</a>
            </Link>
            <Link href="/hosts">
              <a className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">Find Hosts</a>
            </Link>

            {!isLoading && (
              <>
                {user ? (
                  <>
                    <Link href="/host-dashboard">
                      <a className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">Host Dashboard</a>
                    </Link>
                    <Link href="/guest-dashboard">
                      <a className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">My Bookings</a>
                    </Link>
                    <Link href="/admin">
                      <a className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">Admin</a>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/host-register">
                      <a className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">Become a Host</a>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

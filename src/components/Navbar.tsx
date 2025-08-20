/* eslint-disable @next/next/no-img-element */
'use client';
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Call once to set initial state
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Function to get active link styles
  const getLinkStyles = (href: string) => {
    const isActive = pathname === href;
    const baseStyles = "transition duration-150";
    
    if (isActive) {
      // Active link styles
      return `${baseStyles} ${scrolled ? "text-teal-600 font-semibold" : "text-teal-400 font-semibold"}`;
    } else {
      // Inactive link styles
      return `${baseStyles} ${scrolled ? "text-black hover:text-black/80" : "text-white hover:text-white/80"}`;
    }
  };

  return (
    <header className={`fixed top-0 z-50 w-full flex justify-center backdrop-blur-sm transition-all duration-300 ${
      scrolled ? "bg-white shadow-sm" : "bg-transparent"
    }`}>
      <div className={`w-[98%] ${scrolled ? "" : "border-1 border-indigo-500"} rounded-2xl mx-2`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Mobile Menu */}
            <div className="flex items-center">
              {/* Mobile Menu Button */}
              <div className="flex lg:hidden mr-2">
                <button 
                  onClick={toggleMobileMenu}
                  className={`p-2 ${scrolled ? "text-black" : "text-white"}`} 
                  aria-label="Toggle menu"
                >
                <Image
                    src={scrolled ? "/hamburger-dark.svg" : "/hamburger.svg"}
                    alt="Menu"
                    width={20}
                    height={20}
                    className="h-4 w-auto"
                  />
                </button>
              </div>
            
              {/* Logo */}
              <div className="flex-shrink-0 bg-amber-200">
                <Link href="/" className="flex items-center">
                  <img
                    src="/logo.svg"
                    alt="Penthrey Logo"
                  
                    className="h-14 w-auto "
                  />
                </Link>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex flex-1 justify-center">
              <ul className="flex space-x-8">
                <li>
                  <Link
                    href="/"
                    className={getLinkStyles("/")}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#why-penthry"
                    className={`${getLinkStyles("/#why-penthry")} flex justify-center items-center gap-2`}
                  >
                    Features
                   
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className={`${getLinkStyles("/pricing")} flex justify-center items-center gap-2`}
                  >
                    Pricing
                 
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#who-is-penthry-for"
                    className={getLinkStyles("/#who-is-penthry-for")}
                  >
                    Use Cases
                  </Link>
                </li>
                <li>
                  <Link
                    href="/resources"
                    className={getLinkStyles("/resources")}
                  >
                    Resources
                  </Link>
                </li>
              </ul>
            </div>

            {/* Auth Links - Visible on all screen sizes */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                href="/login"
                className={`${scrolled ? "text-black hover:text-black/80 outline-teal-400" : "text-white hover:text-white/80 outline-teal-400"} outline-1 outline-offset-[-1px] px-3 sm:px-6 py-2 rounded-lg transition duration-150 text-sm sm:text-base`}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-3 sm:px-4 py-2 rounded-lg bg-teal-400 text-zinc-800 font-semibold hover:bg-teal-300 transition duration-150 text-sm sm:text-base"
              >
                Get Started
              </Link>
            </div>
          </div>
          
          {/* Mobile Menu Dropdown */}
          <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? "max-h-96 opacity-100 pb-4" : "max-h-0 opacity-0"
          }`}>
            <ul className="flex flex-col space-y-4 mt-2">
              <li>
                <Link
                  href="/"
                  className={`block py-2 ${getLinkStyles("/")}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/#why-penthry"
                  className={`block py-2 ${getLinkStyles("/#why-penthry")} flex items-center gap-2`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                  <Image
                    src={scrolled ? "/dropdown-dark.svg" : "/dropdown.svg"}
                    alt="drop"
                    width={20}
                    height={20}
                    className="h-2 w-auto"
                  />
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className={`block py-2 ${getLinkStyles("/pricing")} flex items-center gap-2`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                  <Image
                    src={scrolled ? "/dropdown-dark.svg" : "/dropdown.svg"}
                    alt="drop"
                    width={20}
                    height={20}
                    className="h-2 w-auto"
                  />
                </Link>
              </li>
              <li>
                <Link
                  href="/#who-is-penthry-for"
                  className={`block py-2 ${getLinkStyles("/#who-is-penthry-for")}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Use Cases
                </Link>
              </li>
              <li>
                <Link
                  href="/resources"
                  className={`block py-2 ${getLinkStyles("/resources")}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Resources
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}

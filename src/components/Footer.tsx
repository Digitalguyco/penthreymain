import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
export default function Footer() {
  return (
    <footer className="w-full bg-[#eeeeff] rounded-3xl px-6 py-12 md:px-12 md:py-16 flex flex-col items-center gap-12">
      {/* Logo Header */}
      <div className="w-full flex justify-center">
        <div className="w-full lg:w-[90%] text-center">
          <h1 className="font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl tracking-[0.6em] md:tracking-[0.8em] text-transparent bg-clip-text bg-gradient-to-r from-[#1B1C4B] via-[#262879] to-[#3032A3]">
            PENTHRY
          </h1>
        </div>
      </div>
      
      {/* Links Section */}
      <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 px-4 md:px-12">
        {/* Product Links */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-gray-500">Product</h3>
          <Link href="/features" className="text-[#4e4e56] font-medium hover:text-indigo-700">
            Features
          </Link>
          <Link href="/pricing" className="text-[#4e4e56] font-medium hover:text-indigo-700">
            Pricing
          </Link>
          <Link href="/use-cases" className="text-[#4e4e56] font-medium hover:text-indigo-700">
            Use Cases
          </Link>
        </div>
        
        {/* Company Links */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-gray-500">Company</h3>
          <Link href="/about" className="text-[#4e4e56] font-medium hover:text-indigo-700">
            About Us
          </Link>
          <Link href="/careers" className="text-[#4e4e56] font-medium hover:text-indigo-700">
            Careers
          </Link>
          <Link href="/blog" className="text-[#4e4e56] font-medium hover:text-indigo-700">
            Blog
          </Link>
        </div>
        
        {/* Support Links */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-gray-500">Support</h3>
          <Link href="/help" className="text-[#4e4e56] font-medium hover:text-indigo-700">
            Help Center
          </Link>
          <Link href="/contact" className="text-[#4e4e56] font-medium hover:text-indigo-700">
            Contact
          </Link>
          <Link href="/terms" className="text-[#4e4e56] font-medium hover:text-indigo-700">
            Terms
          </Link>
        </div>
        
        {/* Socials Links */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-gray-500">Socials</h3>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-[#4e4e56] font-medium hover:text-indigo-700">
            LinkedIn
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-[#4e4e56] font-medium hover:text-indigo-700">
            X (formerly Twitter)
          </a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-[#4e4e56] font-medium hover:text-indigo-700">
            YouTube
          </a>
        </div>
      </div>
      
      {/* Footer Bottom */}
      <div className="w-full px-8 flex flex-col gap-8">
        <div className="w-full h-px bg-[#b9bac0]"></div>
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center justify-center">
            <div className="w-6 h-10 relative">
              {/* Replace with your actual logo */}
              <Image src="/logoBlack.svg" alt="Penthry Logo" width={24} height={24} />
            </div>
          </div>
          <p className="text-[#767681] text-sm md:text-base">
            © {new Date().getFullYear()} Penthry. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 
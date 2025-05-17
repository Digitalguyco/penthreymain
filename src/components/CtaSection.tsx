import React from 'react';
import Link from 'next/link';

export default function CtaSection() {
  return (
    <section className="py-16 max-w-7xl mx-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative py-14 px-6 bg-gradient-to-r from-[#1B1C4B] via-[#262879] to-[#3032A3] rounded-3xl shadow-lg overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="w-[700px] h-96 absolute right-0 top-0 outline outline-offset-[-0.5px] outline-indigo-700/50 rounded-full translate-x-1/4 -translate-y-1/4"></div>
            <div className="w-[600px] h-[530px] absolute right-10 top-10 outline  outline-offset-[-0.5px] outline-indigo-700/50 rounded-full translate-x-1/4 -translate-y-1/4"></div>
            <div className="w-[510px] h-[700px] absolute right-20 top-0 outline  outline-offset-[-0.5px] outline-indigo-700/50 rounded-full translate-x-1/4 -translate-y-1/4"></div>
          </div>
          
          {/* Content box */}
          <div className="relative z-10 max-w-3xl mx-auto px-6 sm:px-12 py-8 bg-indigo-50/20 rounded-3xl backdrop-blur-xl flex flex-col items-center gap-6">
            <h2 className="text-white text-3xl sm:text-4xl font-bold font-manrope text-center leading-tight">
              Start Streamlining Your Business Today
            </h2>
            <p className="text-indigo-100 text-lg sm:text-xl font-normal font-manrope text-center leading-7">
              Create your account in minutes. No credit card required—just powerful tools to get going fast.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <Link href="/demo" className="px-6 py-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-teal-400 hover:bg-indigo-800/30 transition-colors">
                <span className="text-zinc-100 text-base font-semibold font-manrope">Book a Demo</span>
              </Link>
              <Link href="/signup" className="px-6 py-3 bg-teal-400 rounded-lg hover:bg-teal-300 transition-colors">
                <span className="text-zinc-800 text-base font-semibold font-manrope">Get Started Now</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 
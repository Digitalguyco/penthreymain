import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function WhoForSection() {
  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-8 md:gap-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-8">
            <h2 className="text-3xl md:text-4xl font-semibold font-manrope text-zinc-800 leading-tight md:leading-[52px] md:max-w-md">
              Who is Penthry For?
            </h2>
            
            <div className="flex flex-col gap-4 md:max-w-sm">
              <p className="text-zinc-600 text-lg md:text-xl font-normal font-manrope leading-7">
                From startups to large organizations, Penthry scales with you.
              </p>
              <Link href="/signup" className="inline-flex self-start items-center gap-2 px-4 py-3 bg-teal-400 rounded-lg hover:bg-teal-300 transition-colors">
                <span className="text-zinc-800 text-base font-semibold font-manrope">Join Us Now</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 3L13 8L8 13M3 8H13" stroke="#27272A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </div>
          
          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Card - For Startups */}
            <div className="lg:col-span-2 aspect-[3/4] sm:aspect-[4/3] lg:aspect-auto lg:min-h-[500px] xl:min-h-[600px] rounded-3xl overflow-hidden bg-slate-800 relative shadow-lg">
              <div className="absolute inset-0">
                <Image 
                  src="/images/who1.jpg" 
                  alt="For Startups" 
                  fill 
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                <div className="p-4 sm:p-6 bg-indigo-50/20 rounded-3xl backdrop-blur-xl">
                  <h3 className="text-xl sm:text-2xl font-semibold font-manrope text-zinc-100 mb-2">
                    For Startups
                  </h3>
                  <p className="text-zinc-300 text-base sm:text-lg font-normal font-manrope leading-relaxed">
                    Simplify operations, automate your back office, and focus on growth.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              {/* Top Row - Two Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* For HR Teams */}
                <div className="aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden bg-indigo-800 relative shadow-lg">
                  <div className="absolute inset-0">
                    <Image 
                      src="/images/who2.jpg" 
                      alt="For HR Teams" 
                      fill 
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="p-4 bg-indigo-50/20 rounded-3xl backdrop-blur-xl">
                      <h3 className="text-xl sm:text-2xl font-semibold font-manrope text-zinc-100 mb-2">
                        For HR Teams
                      </h3>
                      <p className="text-zinc-300 text-sm sm:text-base font-normal font-manrope leading-normal">
                        Track performance, monitor growth, and improve retention with powerful HR tools.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* For Finance Leads */}
                <div className="aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden bg-indigo-900 relative shadow-lg">
                  <div className="absolute inset-0">
                    <Image 
                      src="/images/who3.jpg" 
                      alt="For Finance Leads" 
                      fill 
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="p-4 bg-indigo-50/20 rounded-3xl backdrop-blur-xl">
                      <h3 className="text-xl sm:text-2xl font-semibold font-manrope text-zinc-100 mb-2">
                        For Finance Leads
                      </h3>
                      <p className="text-zinc-300 text-sm sm:text-base font-normal font-manrope leading-normal">
                        Gain full control over salary payments, spending, and revenue tracking.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bottom Row - Wide Card */}
              <div className="aspect-[4/1] min-h-[180px] rounded-3xl overflow-hidden bg-gradient-to-r from-[#1B1C4B] via-[#262879] to-[#3032A3] relative shadow-lg flex items-center justify-center">
                <div className="p-4 sm:p-6 bg-indigo-50/20 rounded-3xl backdrop-blur-xl max-w-2xl mx-auto">
                  <h3 className="text-xl sm:text-2xl font-semibold font-manrope text-zinc-100 mb-2 text-center">
                    For Customer Teams
                  </h3>
                  <p className="text-zinc-300 text-sm sm:text-base font-normal font-manrope leading-normal text-center">
                    Manage interactions, gather feedback, and build stronger customer relationships.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 
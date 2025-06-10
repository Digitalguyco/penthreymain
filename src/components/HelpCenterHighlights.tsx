'use client';
import React, { useState } from 'react';
import Image from 'next/image';

interface HelpCategory {
  id: number;
  title: string;
  description: string;
  icon: string;
}

export default function HelpCenterHighlights() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search functionality here
    console.log('Searching for:', searchQuery);
  };

  const helpCategories: HelpCategory[] = [
    {
      id: 1,
      title: "Billing & Subscriptions",
      description: "Learn how to manage your plan, payments, and invoices.",
      icon: "/icons/card.svg"
    },
    {
      id: 2,
      title: "Team & Role Management", 
      description: "Control who can access what within your organization.",
      icon: "/icons/usersgc.svg"
    },
    {
      id: 3,
      title: "Account Settings",
      description: "Manage your profile, password, and notifications.",
      icon: "/icons/spanner.svg"
    },
    {
      id: 4,
      title: "Getting Started",
      description: "Quick steps to set up your account and start using Penthry.",
      icon: "/icons/airplane.svg"
    }
  ];

  const CategoryCard = ({ category }: { category: HelpCategory }) => (
    <div className="w-full md:flex-1 p-6 bg-white rounded-3xl outline outline-offset-[-1px] outline-zinc-300 flex flex-col justify-start items-start gap-6 hover:shadow-lg transition-shadow duration-200">
      <div className="self-stretch flex flex-col justify-start items-start gap-20">
        <div className="w-10 h-10 p-2 bg-indigo-100 rounded-[999px] outline outline-offset-[-4px] outline-indigo-50 inline-flex justify-center items-center gap-2.5">
          <div className="w-5 h-5 relative overflow-hidden">
            <Image
              src={category.icon}
              alt={category.title}
              width={20}
              height={20}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
      <div className="self-stretch flex flex-col justify-start items-start gap-3">
        <div className="self-stretch justify-start text-neutral-700 text-base font-semibold font-['Manrope'] leading-normal">
          {category.title}
        </div>
        <div className="self-stretch justify-start text-zinc-500 text-base font-medium font-['Manrope'] leading-normal">
          {category.description}
        </div>
      </div>
    </div>
  );

  return (
    <section className="w-full px-6 py-12 bg-zinc-100 rounded-3xl inline-flex flex-col justify-start items-center gap-12 overflow-hidden">
      <div className="self-stretch flex flex-col justify-start items-center gap-6 overflow-hidden">
        <div className="w-full max-w-[700px] flex flex-col justify-start items-center gap-2.5">
          <div className="self-stretch text-center justify-start text-zinc-800 text-4xl font-semibold font-['Manrope'] leading-[58px]">
            Help Center Highlights
          </div>
          <div className="self-stretch text-center justify-start text-zinc-600 text-xl font-normal font-['Manrope'] leading-7">
            Everything you need to get the answers, fast.
          </div>
        </div>
        <div className="w-full max-w-sm mx-auto flex flex-col justify-start items-start gap-1.5">
          <form onSubmit={handleSearchSubmit} className="self-stretch flex flex-col justify-start items-start gap-1.5">
            <div className="self-stretch px-3.5 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] outline-1 outline-offset-[-1px] outline-gray-400 inline-flex justify-start items-center gap-2 overflow-hidden focus-within:outline-indigo-500 focus-within:outline-2 transition-all duration-200">
              <div className="flex-1 flex justify-start items-center gap-2.5">
                <div className="w-5 h-5 relative overflow-hidden flex-shrink-0">
                  <svg className="w-full h-full text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search support articles..."
                  className="flex-1 text-zinc-500 text-base font-normal font-['Manrope'] leading-normal bg-transparent border-none outline-none placeholder:text-zinc-500"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
      <div className="w-full max-w-[800px] grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
        <CategoryCard category={helpCategories[0]} />
        <CategoryCard category={helpCategories[1]} />
        <CategoryCard category={helpCategories[2]} />
        <CategoryCard category={helpCategories[3]} />
      </div>
    </section>
  );
} 
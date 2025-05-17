'use client';
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

export default function Hero() {
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const phrases = [
    "Streamline Finance, HR, and Customer Management—Smarter.",
    "Automate Workflows, Enhance Productivity—Effortlessly.",
    "Unify Business Operations—All in One Platform."
  ];
  
  const currentPhrase = useRef(0);
  
  useEffect(() => {
    const phrase = phrases[currentPhrase.current];
    
    const timer = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(phrase.substring(0, displayText.length + 1));
        
        // If completed typing the phrase
        if (displayText.length === phrase.length) {
          // Pause before starting to delete
          setTypingSpeed(1500);
          setIsDeleting(true);
        } else {
          // Normal typing speed with small variation
          setTypingSpeed(100 - Math.random() * 50);
        }
      } else {
        setDisplayText(phrase.substring(0, displayText.length - 1));
        
        // If completed deleting the phrase
        if (displayText.length === 0) {
          setIsDeleting(false);
          currentPhrase.current = (currentPhrase.current + 1) % phrases.length;
          setLoopNum(loopNum + 1);
          setTypingSpeed(500); // Pause before typing next phrase
        } else {
          // Faster deletion speed
          setTypingSpeed(50);
        }
      }
    }, typingSpeed);
    
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, loopNum, typingSpeed, phrases]);
  
  return (
    <section className="w-full py-20 md:py-32 bg-[#1D1E55] rounded-b-4xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex flex-col items-center justify-center min-h-[200px] sm:min-h-[220px] md:min-h-[260px] mb-4">
            <div className="inline-block text-4xl sm:text-5xl md:text-6xl font-semibold text-indigo-50 tracking-tight">
              {displayText}
              <span className="animate-pulse">|</span>
            </div>
            <div className="text-blue-200 text-2xl sm:text-3xl md:text-4xl mt-6 sm:mt-8">Powered by Penthry</div>
          </div>
          <p className="mt-6 text-lg max-w-3xl mx-auto leading-8 text-indigo-100/90">
            Manage your finances, HR, customer data, and market analytics—all in
            one intelligent, optimized platform built for modern organizations.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/services"
              className="px-6 py-3 rounded-lg outline outline-offset-[-1px] outline-teal-400 justify-center items-center gap-2">
              <div className="text-zinc-100 text-base font-semibold font-['Manrope']">
                Book a Demo
              </div>
            </Link>
            <Link
              href="/services"
              className="rounded-md bg-teal-400 px-6 py-3 text-sm font-semibold text-zinc-800 shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Get Started
            </Link>
          </div>
          <div className="mt-10 flex justify-center w-full">
            <div className="w-full max-w-[670px] h-auto aspect-[670/480] rounded-lg overflow-hidden">
              <Image 
                src="/images/hero.png" 
                alt="Hero" 
                width={670} 
                height={480} 
                className="object-cover w-full h-full"
                priority 
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

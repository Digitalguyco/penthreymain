import React from 'react';

export default function Testimonials() {
  // Testimonial data
  const testimonials = [
    {
      name: "Aisha Bello",
      role: "HR Manager",
      quote: "Penthry helped us cut admin time by 40%—and gave us insights we didn't even know we needed.",
      image: "/images/testimonials/Image1.png"

    },
    {
      name: "Joseph Okafor",
      role: "CFO, NovaServe",
      quote: "We moved our entire finance workflow to Penthry. Seamless.",
      image: "/images/testimonials/Image2.png"
    },
    {
      name: "Chidera Umeh",
      role: "Ops Lead, FarmConnect",
      quote: "The automation tools alone saved our operations team hours every week. Game-changer.",
      image: "/images/testimonials/Image3.png"
    },
    {
      name: "Tomi Adedayo",
      role: "People & Culture, NexaWorks",
      quote: "From onboarding to ongoing support, Penthry has been fantastic. It's built with teams in mind.",
       image: "/images/testimonials/Image4.png"
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative px-6 py-12 flex flex-col lg:flex-row gap-10">
          {/* Quotation Mark Elements */}
          <div className="absolute top-2 left-3 hidden lg:block">
            <div className="text-indigo-200 opacity-30" style={{ fontSize: '160px' }}>
              &ldquo;
            </div>
          </div>
          <div className="absolute bottom-10 right-10 hidden lg:block">
            <div className="text-indigo-200 opacity-30" style={{ fontSize: '160px' }}>
              &rdquo;
            </div>
          </div>
          
          {/* Heading Section */}
          <div className="lg:w-1/3 flex flex-col gap-4 z-10">
            <p className="text-zinc-600 text-xl font-normal font-manrope leading-7">
              Customer Testimonials
            </p>
            <h2 className="text-zinc-800 text-4xl font-semibold font-manrope leading-[58px]">
              Trusted by Teams Across Industries
            </h2>
          </div>
          
          {/* Testimonials Grid */}
          <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6 z-10">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="p-6 bg-white rounded-3xl outline outline-1 outline-offset-[-1px] outline-zinc-300 flex flex-col justify-start items-start gap-6"
              >
                <div className="flex justify-start items-start gap-2 w-full">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 overflow-hidden flex-shrink-0">
                    {/* Placeholder for profile image */}
                    <div className={`w-full h-full bg-[url(${testimonial.image})] bg-cover bg-center`}></div>
                  </div>
                  <div className="flex flex-col justify-start items-start gap-1">
                    <h3 className="text-neutral-700 text-base font-semibold font-manrope leading-normal">
                      {testimonial.name}
                    </h3>
                    <p className="text-zinc-500 text-sm font-normal font-manrope leading-tight">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <p className="text-neutral-600 text-base font-medium font-manrope leading-normal">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 
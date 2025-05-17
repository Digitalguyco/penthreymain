import React from 'react';
import Image from 'next/image';
export default function WhyPenthry() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-indigo-50 rounded-3xl px-6 py-12">
          <div className="flex flex-col justify-start items-center gap-12 max-w-7xl mx-auto">
            <h2 className="text-4xl font-semibold font-manrope text-zinc-800 text-center leading-[52px]">
              Why Penthry?
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                {/* Right Column - Image */}
                <div className="h-full min-h-[400px]  bg-slate-500/25 rounded-3xl">
                {/* Replace with actual image when ready */}
                <Image src="/images/whyIMG.jpg" alt="Why Penthry" width={400} height={400} className='rounded-3xl object-cover w-full max-h-[600px] ' />
              </div>
              {/* Left Column - Features */}
              <div className="flex flex-col gap-6">
                {/* Feature 1 */}
                <div className="p-6 bg-white rounded-3xl shadow-[0px_1px_4px_0px_rgba(12,12,13,0.10)] flex items-center gap-6">
                  <div className="p-4 bg-zinc-100 rounded-full flex-shrink-0">
                    <Image src="/icons/Workflow.svg" alt="Automated Workflows" width={48} height={48} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-semibold font-manrope text-neutral-700">
                      Automated Workflows
                    </h3>
                    <p className="text-zinc-600 font-normal font-manrope">
                      Reduce repetitive tasks with smart, time-saving flows.
                    </p>
                  </div>
                </div>
                
                {/* Feature 2 */}
                <div className="p-6 bg-white rounded-3xl shadow-[0px_1px_4px_0px_rgba(12,12,13,0.10)] flex items-center gap-6">
                  <div className="p-4 bg-zinc-100 rounded-full flex-shrink-0">
                  <Image src="/icons/security.svg" alt="Automated Workflows" width={48} height={48} />

                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-semibold font-manrope text-neutral-700">
                      Secure by Design
                    </h3>
                    <p className="text-zinc-600 font-normal font-manrope">
                      All data encrypted with regular cloud backups.
                    </p>
                  </div>
                </div>
                
                {/* Feature 3 */}
                <div className="p-6 bg-white rounded-3xl shadow-[0px_1px_4px_0px_rgba(12,12,13,0.10)] flex items-center gap-6">
                  <div className="p-4 bg-zinc-100 rounded-full flex-shrink-0">
                  <Image src="/icons/intergrations.svg" alt="Automated Workflows" width={48} height={48} />

                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-semibold font-manrope text-neutral-700">
                      Seamless Integrations
                    </h3>
                    <p className="text-zinc-600 font-normal font-manrope">
                      Sync with Stripe, Zoom, Typeform, and your favorite tools.
                    </p>
                  </div>
                </div>
                
                {/* Feature 4 */}
                <div className="p-6 bg-white rounded-3xl shadow-[0px_1px_4px_0px_rgba(12,12,13,0.10)] flex items-center gap-6">
                  <div className="p-4 bg-zinc-100 rounded-full flex-shrink-0">
                  <Image src="/icons/Graph.svg" alt="Automated Workflows" width={48} height={48} />

                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-semibold font-manrope text-neutral-700">
                      Real-Time Dashboards
                    </h3>
                    <p className="text-zinc-600 font-normal font-manrope">
                      Make informed decisions backed by live business metrics.
                    </p>
                  </div>
                </div>
              </div>
              
            
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 
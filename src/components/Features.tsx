import React from 'react';
import Image from 'next/image';

export default function Features() {
  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="self-stretch px-6 py-12 flex flex-col justify-start items-start gap-8 ">
          {/* Header Section */}
          <div className="self-stretch flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="flex flex-col justify-start items-start gap-2.5">
              <h2 className="max-w-[596px] text-zinc-800 text-4xl font-semibold font-manrope leading-[52px]">
                Everything You Need. In One Place.
              </h2>
            </div>
            <div className=" flex flex-col justify-start items-start gap-4">
              <h3 className="max-w-[320px] text-neutral-700 text-2xl font-semibold font-manrope leading-9">
                Run smarter with an all-in-one business platform.
              </h3>
              <p className="max-w-[320px] text-zinc-600 text-base font-normal font-manrope leading-normal">
                Penthry combines finance, HR, CRM, and market tools—so you can streamline operations and focus on scaling.
              </p>
            </div>
          </div>
          
          {/* Features Grid */}
          <div className="self-stretch flex flex-col justify-start items-start gap-6 overflow-hidden">
            {/* First Row */}
            <div className="self-stretch grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="p-6 bg-zinc-100 rounded-3xl shadow-[0px_1px_4px_0px_rgba(12,12,13,0.10)] flex flex-col justify-start items-start gap-6">
                <div className="p-2.5 flex justify-center items-center">
                  <Image 
                    src="/icons/account-control.svg" 
                    alt="Account Control" 
                    width={32} 
                    height={32}
                    className="w-8 h-8"
                  />
                </div>
                <div className="flex flex-col justify-start items-start gap-3">
                  <h3 className="text-neutral-700 text-2xl font-semibold font-manrope leading-9">
                    Account Control
                  </h3>
                  <p className="text-zinc-600 text-base font-normal font-manrope leading-normal">
                    Manage teams with role-based access, multi-business support, and custom visibility settings.
                  </p>
                </div>
              </div>
              
              {/* Feature 2 */}
              <div className="p-6 bg-zinc-100 rounded-3xl shadow-[0px_1px_4px_0px_rgba(12,12,13,0.10)] flex flex-col justify-start items-start gap-6">
                <div className="p-2.5 flex justify-center items-center">
                  <Image 
                    src="/icons/finance.svg" 
                    alt="Finance Management" 
                    width={32} 
                    height={32}
                    className="w-8 h-8"
                  />
                </div>
                <div className="flex flex-col justify-start items-start gap-3">
                  <h3 className="text-neutral-700 text-2xl font-semibold font-manrope leading-9">
                    Finance Management
                  </h3>
                  <p className="text-zinc-600 text-base font-normal font-manrope leading-normal">
                    Automate salary payments, manage transactions and debts, and integrate with trusted gateways.
                  </p>
                </div>
              </div>
              
              {/* Feature 3 */}
              <div className="p-6 bg-zinc-100 rounded-3xl shadow-[0px_1px_4px_0px_rgba(12,12,13,0.10)] flex flex-col justify-start items-start gap-6">
                <div className="p-2.5 flex justify-center items-center">
                  <Image 
                    src="/icons/hr-tools.svg" 
                    alt="HR Tools" 
                    width={32} 
                    height={32}
                    className="w-8 h-8"
                  />
                </div>
                <div className="flex flex-col justify-start items-start gap-3">
                  <h3 className="text-neutral-700 text-2xl font-semibold font-manrope leading-9">
                    HR Tools
                  </h3>
                  <p className="text-zinc-600 text-base font-normal font-manrope leading-normal">
                    Track performance, KPIs, attendance, and foster employee growth with a built-in scorecard system.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Second Row */}
            <div className="self-stretch grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 4 */}
              <div className="p-6 bg-zinc-100 rounded-3xl shadow-[0px_1px_4px_0px_rgba(12,12,13,0.10)] flex flex-col justify-start items-start gap-6">
                <div className="p-2.5 flex justify-center items-center">
                  <Image 
                    src="/icons/crm.svg" 
                    alt="Customer CRM" 
                    width={32} 
                    height={32}
                    className="w-8 h-8"
                  />
                </div>
                <div className="flex flex-col justify-start items-start gap-3">
                  <h3 className="text-neutral-700 text-2xl font-semibold font-manrope leading-9">
                    Customer CRM
                  </h3>
                  <p className="text-zinc-600 text-base font-normal font-manrope leading-normal">
                    Unify customer data, feedback, and interactions in one place for better relationship management.
                  </p>
                </div>
              </div>
              
              {/* Feature 5 */}
              <div className="p-6 bg-zinc-100 rounded-3xl shadow-[0px_1px_4px_0px_rgba(12,12,13,0.10)] flex flex-col justify-start items-start gap-6">
                <div className="p-2.5 flex justify-center items-center">
                  <Image 
                    src="/icons/finance.svg" 
                    alt="Finance Management" 
                    width={32} 
                    height={32}
                    className="w-8 h-8"
                  />
                </div>
                <div className="flex flex-col justify-start items-start gap-3">
                  <h3 className="text-neutral-700 text-2xl font-semibold font-manrope leading-9">
                    Finance Management
                  </h3>
                  <p className="text-zinc-600 text-base font-normal font-manrope leading-normal">
                    Automate salary payments, manage transactions and debts, and integrate with trusted gateways.
                  </p>
                </div>
              </div>
              
              {/* Feature 6 */}
              <div className="p-6 bg-zinc-100 rounded-3xl shadow-[0px_1px_4px_0px_rgba(12,12,13,0.10)] flex flex-col justify-start items-start gap-6">
                <div className="p-2.5 flex justify-center items-center">
                  <Image 
                    src="/icons/data-tools.svg" 
                    alt="Smart Data Tools" 
                    width={32} 
                    height={32}
                    className="w-8 h-8"
                  />
                </div>
                <div className="flex flex-col justify-start items-start gap-3">
                  <h3 className="text-neutral-700 text-2xl font-semibold font-manrope leading-9">
                    Smart Data Tools
                  </h3>
                  <p className="text-zinc-600 text-base font-normal font-manrope leading-normal">
                    Leverage BI dashboards, secure cloud storage, and a built-in content system to drive decisions.
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
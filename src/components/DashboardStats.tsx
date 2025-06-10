import Image from 'next/image';
interface StatCard {
  title: string;
  value: string;
  icon: string;
}

const statsData: StatCard[] = [
  {
    title: 'Team Members',
    value: '24',
    icon: 'teamPurple'
  },
  {
    title: 'Payments Pending',
    value: '₦1.2M',
    icon: 'card'
  },
  {
    title: 'Performance Growth',
    value: '+12.5%',
    icon: 'lineChart'
  },
  {
    title: 'Files Stored',
    value: '2.4TB',
    icon: 'teamPurple'
  }
];

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat, index) => (
        <div
          key={index}
          className="p-6 bg-white rounded-2xl shadow-[0px_1px_2px_0px_rgba(16,24,40,0.10)] border border-zinc-300 flex justify-between items-start"
        >
          <div className="flex-1 flex flex-col gap-2">
            <div className="text-zinc-500 text-base font-medium font-['Manrope'] leading-normal">
              {stat.title}
            </div>
            <div className="text-zinc-800 text-xl font-semibold font-['Manrope'] leading-7">
              {stat.value}
            </div>
          </div>
          <div className="w-10 h-10 p-2 bg-indigo-100 rounded-full border-4 border-indigo-50 flex items-center justify-center">
            {/* Placeholder icon */}
          <Image src={`icons/${stat.icon}.svg`}  width={100} height={100} alt='alt'/>
          </div>
        </div>
      ))}
    </div>
  );
} 
'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { apiClient } from '@/lib/api';

interface StatCard {
  title: string;
  value: string | number;
  icon: string;
  loading?: boolean;
}

interface OrganizationStats {
  total_members: number;
  active_members: number;
  pending_invites: number;
  total_storage: string;
}

export default function DashboardStats() {
  const [stats, setStats] = useState<OrganizationStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchOrganizationStats = async () => {
      try {
        const response = await apiClient.getOrganizationStats();
        if (response.data) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch organization stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrganizationStats();
  }, []);
  
  const statsData: StatCard[] = [
    {
      title: 'Total Members',
      value: loading ? '...' : stats?.total_members?.toString() || '0',
      icon: 'teamPurple',
      loading
    },
    {
      title: 'Active Members',
      value: loading ? '...' : stats?.active_members?.toString() || '0',
      icon: 'teamPurple',
      loading
    },
    {
      title: 'Pending Invites',
      value: loading ? '...' : stats?.pending_invites?.toString() || '0',
      icon: 'bell',
      loading
    },
    {
      title: 'Storage Used',
      value: loading ? '...' : stats?.total_storage || '0 GB',
      icon: 'storage',
      loading
    }
  ];

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
            <div className={`text-zinc-800 text-xl font-semibold font-['Manrope'] leading-7 ${
              stat.loading ? 'animate-pulse' : ''
            }`}>
              {stat.value}
            </div>
          </div>
          <div className="w-10 h-10 p-2 bg-indigo-100 rounded-full border-4 border-indigo-50 flex items-center justify-center">
            <Image src={`icons/${stat.icon}.svg`} width={100} height={100} alt={stat.title} />
          </div>
        </div>
      ))}
    </div>
  );
} 
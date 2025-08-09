'use client';

import { useEffect, useState } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardContent from '@/components/DashboardContent';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    //  check if user is authenticated
    if (!isAuthenticated) {
      window.location.href = '/login';
      
    }

    
  }, [isAuthenticated])
  

  return (
    <div className="min-h-screen py-1 px-2 lg:px-6 bg-zinc-100 flex overflow-hidden">
      <DashboardSidebar 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <DashboardContent 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
    </div>
  );
} 
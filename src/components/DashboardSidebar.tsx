'use client';
import { useState } from 'react';
import Image from 'next/image';

interface NavigationItem {
  name: string;
  icon: string;
  active?: boolean;
}

const mainNavItems: NavigationItem[] = [
  { name: 'Dashboard', icon: 'home', active: true },
  { name: 'Team Management', icon: 'team' },
  { name: 'Finance & Payments', icon: 'cardwhite' },
  { name: 'HR Tools', icon: 'settingwheels' },
  { name: 'Customer CRM', icon: 'customer' },
  { name: 'Market Insights', icon: 'lineChartwhite' },
  { name: 'Documents & Storage', icon: 'storage' },
];

const settingsNavItems: NavigationItem[] = [
  { name: 'Account Settings', icon: 'setting' },
  { name: 'Security Settings', icon: 'padlock' },
  { name: 'Notifications', icon: 'bell' },
];

const supportNavItems: NavigationItem[] = [
  { name: 'Help Center', icon: 'support' },
  { name: 'Documentation', icon: 'file' },
  { name: 'Log Out', icon: 'logout' },
];

interface DashboardSidebarProps {
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
}

export default function DashboardSidebar({ isMobileMenuOpen = false, setIsMobileMenuOpen }: DashboardSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const NavItem = ({ item, onClick }: { item: NavigationItem, onClick?: () => void }) => (
    <div 
      className={`px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer transition-colors ${
        item.active 
          ? 'bg-indigo-950 text-zinc-100' 
          : 'text-zinc-100 hover:bg-indigo-800'
      }`}
      onClick={onClick}
    >
      <Image src={`icons/${item.icon}.svg`} width={15} height={15} alt='alt'/>
      {!isCollapsed && (
        <span className="text-sm font-medium font-['Manrope'] leading-tight">
          {item.name}
        </span>
      )}
    </div>
  );

  const handleMobileNavClick = () => {
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const SidebarContent = () => (
    <>
      {/* Header with Logo and Collapse Button */}
      <div className="flex justify-between items-center">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1">
              <Image src='logo.svg' width={25} height={25} alt='Penthrey Logo'/>
            </div>
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex w-6 h-6 items-center justify-center text-zinc-100 hover:bg-indigo-800 rounded transition-colors"
        >
          <Image src='icons/collapse.svg' width={15} height={15} alt='Collapse'/>
        </button>
        
        {/* Mobile close button */}
        <button 
          onClick={handleMobileNavClick}
          className="lg:hidden w-6 h-6 flex items-center justify-center text-zinc-100 hover:bg-indigo-800 rounded transition-colors"
        >
          <Image src='hamburger.svg' width={15} height={15} alt='Close menu'/>
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-between">
        {/* Main Navigation */}
        <div className="flex flex-col gap-2">
          {mainNavItems.map((item, index) => (
            <NavItem 
              key={index} 
              item={item} 
              onClick={handleMobileNavClick}
            />
          ))}
        </div>

        {/* Settings Section */}
        <div className="pt-6 border-t border-zinc-600 flex flex-col gap-2">
          {settingsNavItems.map((item, index) => (
            <NavItem 
              key={index} 
              item={item} 
              onClick={handleMobileNavClick}
            />
          ))}
        </div>

        {/* Support Section */}
        <div className="pt-6 border-t border-zinc-600 flex flex-col gap-2">
          {supportNavItems.map((item, index) => (
            <NavItem 
              key={index} 
              item={item} 
              onClick={handleMobileNavClick}
            />
          ))}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`${isCollapsed ? 'w-30' : 'w-60'} transition-all duration-300 self-stretch p-6 bg-indigo-900 rounded-3xl backdrop-blur-[100px] hidden lg:flex flex-col gap-8 overflow-hidden`}>
        <SidebarContent />
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={handleMobileNavClick}
          />
          
          {/* Sidebar */}
          <div className="relative flex flex-col w-80 max-w-xs bg-indigo-900 rounded-r-3xl backdrop-blur-[100px] p-6 gap-8 overflow-hidden transform transition-transform duration-300 ease-in-out">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
} 
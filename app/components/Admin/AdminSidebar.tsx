"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, Calendar, Stethoscope, Bed, 
  FlaskConical, Pill, Receipt, Settings, ChevronRight, 
  ChevronLeft, ChevronDown, Activity, Package, ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const menuItems = [
  { title: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/admin" },
  { 
    title: "Patients", 
    icon: <Users size={20} />, 
    subItems: [
      { name: "Patient List", href: "/admin/patients" },
      { name: "Admissions", href: "/admin/patients/admissions" },
    ] 
  },
  { title: "Appointments", icon: <Calendar size={20} />, path: "/admin/appointments" },
  { title: "Staff", icon: <Stethoscope size={20} />, path: "/admin/staff" },
  { 
    title: "Wards & Beds", 
    icon: <Bed size={20} />, 
    subItems: [
      { name: "Bed Census", href: "/admin/wards/beds" },
      { name: "Ward Management", href: "/admin/wards/list" },
    ] 
  },
  { title: "Laboratory", icon: <FlaskConical size={20} />, path: "/admin/lab" },
  { 
    title: "Pharmacy", 
    icon: <Pill size={20} />, 
    subItems: [
      { name: "Inventory", href: "/admin/pharmacy/stock" },
      { name: "Prescriptions", href: "/admin/pharmacy/prescriptions" },
    ] 
  },
  { title: "Billing", icon: <Receipt size={20} />, path: "/admin/billing" },
  { title: "Security", icon: <ShieldCheck size={20} />, path: "/admin/security" },
  { title: "Settings", icon: <Settings size={20} />, path: "/admin/settings" },
];

export default function AdminSidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    menuItems.forEach(item => {
      if (item.subItems?.some(sub => pathname === sub.href)) {
        setOpenMenus(prev => ({ ...prev, [item.title]: true }));
      }
    });
  }, [pathname]);

  return (
    <aside 
      className={`h-screen sticky top-0 bg-[#f8fafc] border-r border-slate-200 flex flex-col transition-all duration-300 z-50 ${isCollapsed ? 'w-[72px]' : 'w-64'}`}
    >
      {/* Brand Header */}
      <div className="h-20 flex items-center px-4 border-b border-slate-200/60 overflow-hidden">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-100 font-bold">
          H
        </div>
        {!isCollapsed && (
          <div className="ml-3 animate-in fade-in slide-in-from-left-2">
            <h1 className="font-extrabold text-slate-900 text-sm tracking-tight leading-none uppercase">HealthCore</h1>
            <p className="text-[9px] text-blue-600 font-bold uppercase mt-1 tracking-widest">Admin Portal</p>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = pathname === item.path || item.subItems?.some(s => s.href === pathname);
          const hasSubItems = !!item.subItems;

          return (
            <div key={item.title}>
              {!hasSubItems ? (
                <Link
                  href={item.path!}
                  className={`flex items-center p-3 rounded-xl transition-all group ${
                    isActive ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-500 hover:bg-white hover:text-slate-900'
                  } ${isCollapsed ? 'justify-center' : 'gap-3'}`}
                >
                  <span className={`${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && <span className="text-[13px]">{item.title}</span>}
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => setOpenMenus(p => ({...p, [item.title]: !p[item.title]}))}
                    className={`w-full flex items-center p-3 rounded-xl transition-all ${
                      isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:bg-white hover:text-slate-900'
                    } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>{item.icon}</span>
                      {!isCollapsed && <span className="text-[13px]">{item.title}</span>}
                    </div>
                    {!isCollapsed && (
                      <ChevronDown size={14} className={`transition-transform duration-200 ${openMenus[item.title] ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  {!isCollapsed && openMenus[item.title] && (
                    <div className="mt-1 ml-4 border-l-2 border-slate-100 pl-2 space-y-1">
                      {item.subItems?.map(sub => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={`block py-2 pl-4 text-[12px] rounded-lg transition-colors ${
                            pathname === sub.href ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-400 hover:text-blue-500'
                          }`}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-slate-200">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
}
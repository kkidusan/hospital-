// components/reception/Sidebar.tsx
import { 
  LayoutDashboard, UserPlus, Search, Calendar, ClipboardList, 
  Ticket, Bed, Users, HelpCircle, FileBarChart, 
  CreditCard, Ambulance, Printer 
} from 'lucide-react';
import Link from 'next/link';

const menuItems = [
  { group: "Main", items: [
    { name: 'Dashboard Home', icon: LayoutDashboard, href: '/reception-triage' },
    { name: 'Patient Recored', icon: UserPlus, href: '/reception-triage/recored' },
    { name: 'Billing & Payment', icon: Search, href: '/reception-triage/billing' },
  ]},
  { group: "Appointments & OP", items: [
    { name: 'Booking', icon: Calendar, href: '/reception-triage/booking' },
    { name: 'Appointment List', icon: ClipboardList, href: '/reception-triage/appointments' },
    { name: 'OP Ticket', icon: Ticket, href: '/reception-triage/op-ticket' },
  ]},
  { group: "IP & Bed Management", items: [
    { name: 'IP Admission', icon: Bed, href: '/reception-triage/ip-admission' },
    { name: 'Bed Availability', icon: Bed, href: '/reception-triage/beds' },
    { name: 'Visitor Management', icon: Users, href: '/reception-triage/visitors' },
  ]},
  { group: "Operations", items: [
    { name: 'Enquiry', icon: HelpCircle, href: '/reception-triage/enquiry' },
    { name: 'Advance Payments', icon: CreditCard, href: '/reception-triage/payments' },
    { name: 'ID Card Printing', icon: Printer, href: '/reception-triage/id-cards' },
    { name: 'Ambulance Requests', icon: Ambulance, href: '/reception-triage/ambulance' },
    { name: 'Reports', icon: FileBarChart, href: '/reception-triage/reports' },
  ]}
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-2">
        <div className="bg-blue-600 p-1.5 rounded-lg">
          <div className="w-5 h-5 bg-white rounded-sm" />
        </div>
        <span className="text-white font-bold text-xl tracking-tight">HMS Core</span>
      </div>
      
      {/* Navigation Area with Scroll Indicator Hidden */}
      <nav 
        className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide"
        style={{ 
          msOverflowStyle: 'none', 
          scrollbarWidth: 'none' 
        }}
      >
        {/* Webkit Specific CSS to hide scrollbar */}
        <style dangerouslySetInnerHTML={{ __html: `
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}} />

        {menuItems.map((group) => (
          <div key={group.group}>
            <p className="px-3 text-[10px] uppercase font-semibold text-slate-500 mb-2 tracking-widest">
              {group.group}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-all text-sm group"
                >
                  <item.icon size={18} className="text-slate-400 group-hover:text-blue-400" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
"use client"
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, History, User, Sparkles, LogOut, Settings } from 'lucide-react';
import "../globals.css";
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const menu = [
    { label: 'לוח בקרה', icon: <LayoutDashboard size={22}/>, path: '/dashboard' },
    { label: 'המוצרים שלי', icon: <History size={22}/>, path: '/my-products' },
    { label: 'פרופיל אישי', icon: <User size={22}/>, path: '/profile' },
  ];

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-100" dir="rtl">
      {/* Sidebar הקבוע */}
      <aside className="w-72 bg-[#0f172a] border-l border-slate-800/50 p-8 fixed h-full right-0 z-50">
        <div className="flex items-center gap-3 mb-16 px-2 text-white italic font-black text-2xl">
          <Sparkles className="text-indigo-500" /> Smart-W
        </div>
        
        <nav className="space-y-3 flex-1">
          {menu.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${
                pathname === item.path 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              {item.icon} <span className="font-bold">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-10">
           <button className="w-full flex items-center gap-4 p-4 text-slate-500 hover:text-red-400 font-bold transition-colors">
            <LogOut size={20} /> התנתקות
          </button>
        </div>
      </aside>

      {/* התוכן המשתנה */}
      <main className="flex-1 pr-72 min-h-screen">
        <div className="p-8 lg:p-12 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
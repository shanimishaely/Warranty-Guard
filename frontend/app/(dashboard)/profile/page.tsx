"use client"
import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import api from '@/api/axios';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', phone: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/me'); 
        setFormData({
          username: res.data.username || '',
          email: res.data.email || '',
          phone: res.data.phone || ''
        });
      } catch (err) { 
        console.error("Profile fetch error", err);
      } finally { setLoading(false); }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await api.put('/users/update', {
        username: formData.username,
        phone: formData.phone
      });
      alert("נשמר בהצלחה! 🔥");
    } catch (err) {
      alert("שגיאה בעדכון");
    } finally { setSaving(false); }
  };

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500" size={48} /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto text-right dir-rtl p-4">
      <h1 className="text-5xl font-black mb-10 text-white">הפרופיל שלי 👤</h1>
      <div className="bg-[#0f172a]/60 border border-slate-800 p-10 rounded-[3rem] backdrop-blur-xl shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="space-y-3">
            <label className="text-slate-400 font-bold flex items-center gap-2 pr-2"><User size={18}/> שם משתמש</label>
            <input 
              className="w-full h-16 bg-[#020617] border border-slate-700 rounded-2xl px-6 font-bold text-white focus:border-indigo-500 outline-none transition-all"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>
          <div className="space-y-3">
            <label className="text-slate-400 font-bold flex items-center gap-2 pr-2"><Phone size={18}/> טלפון</label>
            <input 
              className="w-full h-16 bg-[#020617] border border-slate-700 rounded-2xl px-6 font-bold text-white focus:border-indigo-500 outline-none transition-all"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          <div className="space-y-3 md:col-span-2">
            <label className="text-slate-400 font-bold flex items-center gap-2 pr-2"><Mail size={18}/> אימייל (נעול)</label>
            <input 
              className="w-full h-16 bg-[#020617]/50 border border-slate-800 rounded-2xl px-6 font-bold text-slate-500 cursor-not-allowed"
              value={formData.email}
              disabled
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleUpdate} disabled={saving} className="bg-indigo-600 hover:bg-indigo-500 text-white h-16 px-16 rounded-2xl font-black text-xl shadow-lg">
            {saving ? <Loader2 className="animate-spin" /> : "שמור שינויים ✨"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
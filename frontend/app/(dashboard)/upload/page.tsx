"use client"
import React, { useState } from 'react';
import { Upload, Loader2, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import api from '@/api/axios';
import Link from 'next/link';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [warrantyMonths, setWarrantyMonths] = useState("12");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('warranty_months', warrantyMonths);

    try {
      await api.post('/receipts/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(true);
    } catch (err) {
      alert("שגיאה בהעלאה. ודאי שהשרת דלוק!");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={60} />
        </motion.div>
        <h1 className="text-4xl font-black text-white mb-4">המוצר נוסף בהצלחה! 🎉</h1>
        <p className="text-slate-400 mb-8 text-xl">ה-AI סיים לנתח את הקבלה והאחריות מעודכנת.</p>
        <Link href="/dashboard/history">
          <Button className="bg-indigo-600 hover:bg-indigo-500 h-14 px-10 rounded-2xl text-lg font-bold">
            חזרה למוצרים שלי
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto py-10">
      <h1 className="text-5xl font-black text-white mb-4 text-right">העלאת קבלה 📄</h1>
      <p className="text-slate-400 text-xl mb-12 text-right font-medium">העלי קבלה ובחרי את תקופת האחריות המובטחת</p>

      <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-10 space-y-8 shadow-2xl">
        {/* אזור בחירת קובץ */}
        <div className="space-y-4">
            <label className="text-slate-400 font-bold block text-right pr-2 text-sm uppercase tracking-widest">שלב 1: בחירת קובץ הקבלה</label>
            <label className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-[2rem] p-12 flex flex-col items-center justify-center cursor-pointer transition-all group bg-[#020617]/50">
                <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                <Upload size={40} className="text-indigo-400 mb-4 group-hover:scale-110 transition-transform" />
                <span className="text-slate-300 font-bold text-lg">{file ? file.name : "בחרי קובץ או גררי לכאן"}</span>
            </label>
        </div>

        {/* בחירת תקופת אחריות */}
        <div className="space-y-4">
            <label className="text-slate-400 font-bold block text-right pr-2 text-sm uppercase tracking-widest">שלב 2: תקופת האחריות (בחודשים)</label>
            <select 
                value={warrantyMonths}
                onChange={(e) => setWarrantyMonths(e.target.value)}
                className="w-full h-16 bg-[#020617] border border-slate-800 rounded-2xl px-6 text-white font-black text-lg focus:border-indigo-500 outline-none transition-all"
            >
                <option value="12">שנה אחת (12 חודשים)</option>
                <option value="24">שנתיים (24 חודשים)</option>
                <option value="36">שלוש שנים (36 חודשים)</option>
                <option value="60">חמש שנים (60 חודשים)</option>
                <option value="120">עשר שנים (120 חודשים)</option>
            </select>
        </div>

        <Button 
          onClick={handleUpload}
          disabled={!file || loading}
          className="w-full h-20 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black text-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-95"
        >
          {loading ? <Loader2 className="animate-spin" size={32} /> : "נתחי ושמרי מוצר 🚀"}
        </Button>
      </div>
    </motion.div>
  );
}
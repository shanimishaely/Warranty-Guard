"use client"
import React, { useEffect, useState, useRef } from 'react';
import { Plus, Loader2, Tag, ShieldCheck, Wallet, TrendingUp, Upload, X, Calendar, Clock, ShieldPlus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import api from '@/api/axios';
import { format, addMonths, differenceInDays } from 'date-fns';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [receipts, setReceipts] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/receipts/my-receipts');
      setReceipts(res.data.receipts || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // פונקציה לחישוב סטטוס האחריות
  const getWarrantyInfo = (purchaseDateStr: string, months: number = 12) => {
    const purchaseDate = new Date(purchaseDateStr);
    const expiryDate = addMonths(purchaseDate, months);
    const today = new Date();
    const daysLeft = differenceInDays(expiryDate, today);
    const totalDays = months * 30;
    const progress = Math.max(0, Math.min(100, (daysLeft / totalDays) * 100));

    let color = "bg-emerald-500";
    let text = `עוד ${daysLeft} יום`;
    if (daysLeft <= 0) { color = "bg-red-500"; text = "פג תוקף"; }
    else if (daysLeft < 90) { color = "bg-orange-500"; text = "בקרוב!"; }

    return { progress, color, text, expiryDate: format(expiryDate, 'dd/MM/yyyy') };
  };

  const totalSpent = receipts.reduce((sum, r) => sum + (Number(r.total_amount) || 0), 0);
  const chartData = [
    { name: 'חשמל', value: 400 }, { name: 'ביגוד', value: 300 }, { name: 'פנאי', value: 200 }
  ];
  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899'];

  if (loading) return <div className="h-[80vh] flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500" size={48} /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="dir-rtl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div className="text-right">
          <h1 className="text-6xl font-black mb-3 bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">שלום ! 👋</h1>
          <p className="text-slate-400 text-xl">כל האחריות שלך במקום אחד, בשליטה מלאה.</p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 h-16 px-10 rounded-2xl gap-3 font-black text-xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">
          <Plus size={28} /> הוספת מוצר חדש
        </Button>
      </header>

      {/* כרטיסי סטטיסטיקה */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard label="סה״כ הוצאות" value={`₪${totalSpent.toLocaleString()}`} icon={<Wallet className="text-emerald-400"/>} />
        <StatCard label="מוצרים באחריות" value={receipts.length.toString()} icon={<ShieldCheck className="text-indigo-400"/>} />
        <StatCard label="חיסכון מוערך" value="₪1,250" icon={<TrendingUp className="text-amber-400"/>} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 text-right">
        {/* רשימת מוצרים עם פסי התקדמות */}
        <div className="xl:col-span-2 space-y-6">
          <h3 className="text-3xl font-black px-2 mb-4">המוצרים שלי 🛡️</h3>
          {receipts.length > 0 ? receipts.map((r) => {
            const info = getWarrantyInfo(r.purchase_date, r.warranty_period);
            return (
              <motion.div whileHover={{ x: -10 }} key={r._id} className="bg-[#0f172a] border border-slate-800/50 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between hover:border-indigo-500/50 transition-all gap-6">
                <div className="flex items-center gap-6 w-full md:w-auto justify-start flex-row-reverse">
                  <div className="p-5 bg-indigo-500/10 text-indigo-500 rounded-3xl"><Tag size={28}/></div>
                  <div className="text-right">
                    <p className="font-black text-2xl text-white">{r.store_name}</p>
                    <p className="text-slate-500 font-bold">₪{r.total_amount} | {r.purchase_date}</p>
                  </div>
                </div>

                <div className="w-full md:w-64 space-y-2">
                   <div className="flex justify-between text-xs font-black uppercase">
                      <span className="text-slate-500">{info.expiryDate}</span>
                      <span className={info.color.replace('bg-', 'text-')}>{info.text}</span>
                   </div>
                   <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${info.progress}%` }} 
                        className={`h-full ${info.color}`} 
                      />
                   </div>
                </div>
              </motion.div>
            );
          }) : <div className="p-20 text-center bg-[#0f172a]/30 rounded-[3rem] border border-dashed border-slate-800 text-slate-500 font-bold italic text-xl">עוד לא העלית מוצרים...</div>}
        </div>

        {/* גרף פילוח */}
        <div className="bg-[#0f172a]/50 border border-slate-800/50 p-8 rounded-[3rem] flex flex-col items-center">
          <h4 className="font-black text-2xl mb-8">סטטוס תיק מוצרים</h4>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value">
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-4xl font-black">{receipts.length}</span>
                <span className="text-slate-500 text-sm font-bold">מוצרים</span>
            </div>
          </div>
          <div className="w-full mt-8 space-y-3">
             {chartData.map((d, i) => (
               <div key={i} className="flex justify-between items-center bg-slate-900/50 p-3 rounded-xl">
                  <span className="font-bold">{d.name}</span>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* מודאל העלאה חכם */}
      <AnimatePresence>
        {isUploadOpen && (
          <UploadModal 
            onClose={() => setIsUploadOpen(false)} 
            onSuccess={() => { setIsUploadOpen(false); fetchData(); }} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StatCard({ label, value, icon }: any) {
  return (
    <div className="bg-[#0f172a] border border-slate-800/50 p-8 rounded-[2.5rem] hover:border-indigo-500/30 transition-all group">
      <div className="flex items-center gap-4 mb-4 flex-row-reverse justify-end">
        <div className="p-4 bg-slate-800/50 rounded-2xl group-hover:bg-indigo-500/10 transition-colors">{icon}</div>
        <span className="text-slate-400 font-bold text-lg">{label}</span>
      </div>
      <div className="text-5xl font-black text-white text-right tracking-tighter">{value}</div>
    </div>
  );
}

function UploadModal({ onClose, onSuccess }: any) {
  const [file, setFile] = useState<File | null>(null);
  const [warrantyMonths, setWarrantyMonths] = useState("12");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('warranty_months', warrantyMonths); // שולח את הבחירה לשרת

    try {
      await api.post('/receipts/upload', formData);
      onSuccess();
    } catch (err) { alert("שגיאה בניתוח הקבלה"); }
    finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl z-[100] flex items-center justify-center p-6">
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#0f172a] w-full max-w-xl rounded-[4rem] p-12 border border-slate-800 relative shadow-[0_0_100px_rgba(99,102,241,0.1)]">
        <button onClick={onClose} className="absolute top-12 left-12 text-slate-500 hover:text-white transition-colors"><X size={32}/></button>
        
        <div className="text-right mb-10">
            <h2 className="text-4xl font-black mb-2 text-white">הוספת מוצר חדש ✨</h2>
            <p className="text-slate-500 font-bold">העלי קבלה ובחרי תקופת אחריות</p>
        </div>

        <div className="space-y-8">
            <div onClick={() => fileInputRef.current?.click()} className="border-3 border-dashed border-slate-800 rounded-[3rem] p-12 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-500/5 transition-all group">
              <input type="file" ref={fileInputRef} hidden onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <div className="bg-indigo-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                 <Upload className="text-indigo-500" size={32} />
              </div>
              <p className="text-slate-300 font-black text-xl">{file ? file.name : "בחרי קבלה או תמונה"}</p>
              <p className="text-slate-600 font-medium mt-2 text-sm italic">PNG, JPG, PDF נתמכים</p>
            </div>

            <div className="space-y-3 text-right">
                <label className="text-slate-400 font-black pr-2 flex items-center justify-end gap-2 uppercase text-xs tracking-widest">
                   תקופת אחריות (חודשים) <ShieldPlus size={16} className="text-indigo-500"/>
                </label>
                <select 
                    value={warrantyMonths}
                    onChange={(e) => setWarrantyMonths(e.target.value)}
                    className="w-full h-18 bg-[#020617] border-2 border-slate-800 rounded-3xl px-8 text-white font-black text-xl focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer shadow-inner"
                >
                    <option value="12">שנה אחת (12 חודשים)</option>
                    <option value="24">שנתיים (24 חודשים)</option>
                    <option value="36">שלוש שנים (36 חודשים)</option>
                    <option value="60">חמש שנים (60 חודשים)</option>
                    <option value="120">אחריות לכל החיים (120 חודשים)</option>
                </select>
            </div>

            <Button disabled={!file || loading} onClick={handleUpload} className="w-full h-20 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] font-black text-2xl shadow-2xl shadow-indigo-600/30 transition-all active:scale-95">
              {loading ? <div className="flex items-center gap-3 font-bold italic tracking-wider"><Loader2 className="animate-spin" /> המוח הקריאייטיבי שלי מנתח...</div> : "נתחי קבלה ושמרי מוצר 🚀"}
            </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
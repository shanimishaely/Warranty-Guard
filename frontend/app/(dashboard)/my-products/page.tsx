"use client"
import React, { useEffect, useState } from 'react';
import { Search, Package, Calendar, Clock, FileDown, Trash2, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import api from '@/api/axios';
import { format, addMonths, differenceInDays } from 'date-fns';

export default function MyProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/receipts/my-receipts');
      setProducts(res.data.receipts || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // --- פונקציית מחיקה ---
  const handleDelete = async (id: string) => {
    if (!window.confirm("בטוחה שאת רוצה למחוק את הקבלה הזו? אין דרך חזרה!")) return;
    
    try {
      await api.delete(`/receipts/${id}`);
      setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      alert("שגיאה במחיקה. ודאי שה-Backend תומך בזה!");
    }
  };

  // --- פונקציית צפייה בקובץ המקורי ---
  const viewOriginalReceipt = (imageUrl: string) => {
    if (!imageUrl) return alert("לא נמצאה תמונה לקבלה זו");
    
    // ודאי שהכתובת של ה-Backend נכונה
    const backendUrl = "http://localhost:8000/"; 
    const fullUrl = imageUrl.startsWith('http') ? imageUrl : `${backendUrl}${imageUrl}`;
    
    window.open(fullUrl, '_blank');
  };

  const getWarrantyStatus = (purchaseDateStr: string, months: number) => {
    const purchaseDate = new Date(purchaseDateStr);
    const expiryDate = addMonths(purchaseDate, months || 12);
    const today = new Date();
    
    const totalDays = differenceInDays(expiryDate, purchaseDate);
    const daysLeft = differenceInDays(expiryDate, today);
    const percentLeft = Math.max(0, Math.min(100, (daysLeft / totalDays) * 100));

    let color = "bg-emerald-500";
    let textColor = "text-emerald-500";
    let message = `נותרו עוד ${daysLeft} ימים`;

    if (daysLeft <= 0) {
      color = "bg-red-500";
      textColor = "text-red-500";
      message = "האחריות פגה ⛔";
    } else if (daysLeft < 90) {
      color = "bg-orange-500";
      textColor = "text-orange-500";
      message = "פגה בקרוב! ⚠️";
    }

    return { percent: 100 - percentLeft, color, textColor, message, expiryDate: format(expiryDate, 'dd/MM/yyyy') };
  };

  const filtered = products.filter(p => 
    p.store_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="h-[80vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-indigo-500" size={48} />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 dir-rtl">
      <header className="flex flex-col md:flex-row justify-between items-end md:items-center mb-12 gap-6">
        <div className="text-right">
          <h1 className="text-6xl font-black text-white mb-2 tracking-tight">המוצרים שלי 🛡️</h1>
          <p className="text-slate-400 text-xl font-medium">מעקב חכם אחרי תקופות אחריות בזמן אמת</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input 
            type="text" 
            placeholder="חיפוש מוצר או חנות..."
            className="w-full h-14 bg-[#0f172a] border border-slate-800 rounded-2xl pr-12 pl-4 text-white text-right focus:border-indigo-500 outline-none transition-all shadow-2xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence>
          {filtered.map((p) => {
            const status = getWarrantyStatus(p.purchase_date, p.warranty_period);
            return (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={p._id}
                className="bg-[#0f172a]/80 border border-slate-800 rounded-[2.5rem] p-8 hover:border-indigo-500/50 transition-all group relative overflow-hidden shadow-xl"
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                  
                  {/* כפתורי פעולה - עכשיו בצד שמאל */}
                  <div className="flex gap-3 order-3 md:order-1">
                    <Button 
                        onClick={() => viewOriginalReceipt(p.image_url)}
                        variant="ghost" 
                        title="צפייה בקבלה"
                        className="h-14 w-14 rounded-2xl bg-slate-800/50 hover:bg-indigo-600 hover:text-white text-slate-400 transition-all shadow-lg"
                    >
                      <ExternalLink size={24} />
                    </Button>
                    <Button 
                        onClick={() => handleDelete(p._id)}
                        variant="ghost" 
                        title="מחיקת מוצר"
                        className="h-14 w-14 rounded-2xl bg-slate-800/50 hover:bg-red-600 hover:text-white text-slate-400 transition-all shadow-lg"
                    >
                      <Trash2 size={24} />
                    </Button>
                  </div>

                  {/* מדד האחריות - מרכז */}
                  <div className="w-full md:w-1/3 space-y-4 order-2 text-right">
                    <div className="flex justify-between items-end text-sm font-bold flex-row-reverse">
                      <span className={`${status.textColor} text-base`}>{status.message}</span>
                      <span className="text-slate-500 flex items-center gap-1.5 text-base">
                         <Calendar size={18} /> {status.expiryDate}
                      </span>
                    </div>
                    
                    <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700 p-0.5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${100 - status.percent}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`h-full ${status.color} rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)]`}
                      />
                    </div>
                  </div>

                  {/* פרטי מוצר - צד ימין */}
                  <div className="flex items-center gap-6 flex-1 text-right w-full md:w-auto order-1 md:order-3 justify-end">
                    <div className="space-y-1">
                      <h3 className="text-3xl font-black text-white group-hover:text-indigo-400 transition-colors">
                        {p.store_name}
                      </h3>
                      <p className="text-slate-500 font-bold text-lg uppercase tracking-wider">
                        ₪{p.total_amount} | {p.purchase_date}
                      </p>
                    </div>
                    <div className="p-5 bg-slate-800/80 rounded-[1.8rem] text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-2xl border border-slate-700">
                      <Package size={32} />
                    </div>
                  </div>
                </div>

                {/* אפקט דקורטיבי עדין */}
                <div className={`absolute -right-20 -top-20 w-48 h-48 ${status.color} opacity-[0.05] rounded-full blur-3xl`} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center p-32 text-slate-500">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 0.2 }}>
            <AlertCircle size={80} className="mb-6" />
          </motion.div>
          <p className="text-2xl font-black italic tracking-wide">לא מצאתי מוצרים כאלו במערכת...</p>
        </div>
      )}
    </motion.div>
  );
}
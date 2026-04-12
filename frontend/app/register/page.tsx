"use client"
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, User, ArrowRight, Loader2, Phone } from "lucide-react";
import api from '@/api/axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  // הוספתי את phone ל-state
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // בתוך ה-handleSubmit של RegisterPage:

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // וולידציה: רק ספרות בטלפון
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(formData.phone)) {
    return alert("מספר טלפון חייב להכיל 10 ספרות בדיוק (מספרים בלבד)");
  }

  if (formData.password !== formData.confirmPassword) return alert("הסיסמאות לא תואמות");
  
  setLoading(true);
  try {
    await api.post('/users/signup', {
      username: formData.name, // זה ה-username ב-Pydantic
      email: formData.email,
      phone: formData.phone,
      password: formData.password
    });
    
    alert("חשבון נוצר בהצלחה!");
    router.push('/login'); 
  } catch (err: any) {
    // טיפול בשגיאה ספציפית מהשרת
    const msg = err.response?.data?.detail || "שגיאה בהרשמה";
    alert(msg);
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-blue-600 rounded-[2rem]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">יצירת חשבון</CardTitle>
          <CardDescription>הצטרפו ל-Smart-W והתחילו לנהל אחריות חכמה</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* שם מלא */}
            <div className="space-y-2">
              <Label>שם מלא</Label>
              <div className="relative">
                <User className="absolute right-3 top-3 text-slate-400" size={18} />
                <Input 
                  className="pr-10"
                  placeholder="ישראל ישראלי" 
                  onChange={(e)=>setFormData({...formData, name: e.target.value})} 
                  required 
                />
              </div>
            </div>

            {/* אימייל */}
            <div className="space-y-2">
              <Label>אימייל</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 text-slate-400" size={18} />
                <Input 
                  type="email" 
                  className="pr-10"
                  placeholder="name@example.com" 
                  onChange={(e)=>setFormData({...formData, email: e.target.value})} 
                  required 
                />
              </div>
            </div>

            {/* טלפון - השדה החדש */}
            <div className="space-y-2">
              <Label>מספר טלפון (לוואטסאפ)</Label>
              <div className="relative">
                <Phone className="absolute right-3 top-3 text-slate-400" size={18} />
                <Input 
                  type="tel" 
                  className="pr-10"
                  placeholder="0501234567" 
                  maxLength={10}
                  onChange={(e)=>setFormData({...formData, phone: e.target.value})} 
                  required 
                />
              </div>
            </div>

            {/* סיסמה */}
            <div className="space-y-2">
              <Label>סיסמה</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 text-slate-400" size={18} />
                <Input 
                  type="password" 
                  className="pr-10"
                  onChange={(e)=>setFormData({...formData, password: e.target.value})} 
                  required 
                />
              </div>
            </div>

            {/* אימות סיסמה */}
            <div className="space-y-2">
              <Label>אימות סיסמה</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 text-slate-400" size={18} />
                <Input 
                  type="password" 
                  className="pr-10"
                  onChange={(e)=>setFormData({...formData, confirmPassword: e.target.value})} 
                  required 
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-xl text-lg font-bold shadow-lg shadow-blue-100 mt-2 transition-all active:scale-95">
              {loading ? <Loader2 className="animate-spin" /> : "צור חשבון והמשך ללוגין"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-blue-600 text-sm font-semibold hover:underline">כבר יש חשבון? התחברו כאן</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
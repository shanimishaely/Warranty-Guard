"use client"
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, Loader2, LogIn } from "lucide-react";
import { loginUser } from '@/api/axios'; 
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // שליחת אובייקט שתואם ל-User Model בשרת
      const res = await loginUser({ 
        email: email, 
        password: password,
        // שולחים את המייל גם כ-username כדי לעבור את ה-Validation של Pydantic בשרת
        username: email 
      });
      
      // שמירת המשתמש והטוקן ב-Zustand (הטוקן מגיע כ-res.access_token)
      login(res.user, res.access_token); 
      
      // מעבר חלק לדשבורד
      router.push('/dashboard');
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMsg = err.response?.data?.detail || "אימייל או סיסמה לא נכונים";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="w-full max-w-md shadow-2xl border-none bg-white rounded-[2rem] overflow-hidden">
          <CardHeader className="text-center pt-8 bg-slate-50/50 border-b border-slate-100 mb-4">
            <div className="mx-auto bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg shadow-blue-200 rotate-3">
              <LogIn size={28} />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">התחברות למערכת</CardTitle>
            <CardDescription className="text-slate-500 pt-1">נהלו את האחריות שלכם בצורה חכמה</CardDescription>
          </CardHeader>
          
          <CardContent className="p-8 pt-4">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium mr-1">כתובת אימייל</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3 text-slate-400" size={18} />
                  <Input 
                    type="email" 
                    placeholder="name@example.com"
                    className="pr-10 h-12 border-slate-200 focus:ring-blue-500 focus:border-blue-500 rounded-xl"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-medium mr-1">סיסמה</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 text-slate-400" size={18} />
                  <Input 
                    type="password" 
                    placeholder="••••••••"
                    className="pr-10 h-12 border-slate-200 focus:ring-blue-500 focus:border-blue-500 rounded-xl"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-blue-600 hover:bg-blue-700 h-12 font-bold text-lg rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-[0.98] mt-4"
              >
                {loading ? <Loader2 className="animate-spin" /> : "כניסה למערכת"}
              </Button>
            </form>

            <div className="mt-8 text-center flex flex-col gap-2">
              <Link href="/register" className="text-blue-600 text-sm font-bold hover:text-blue-700 transition-colors">
                עוד לא נרשמת? צרי חשבון חדש כאן
              </Link>
              <p className="text-slate-400 text-xs mt-2 italic">Smart-W 2026 • Security First</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
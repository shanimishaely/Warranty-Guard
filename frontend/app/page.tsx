import { redirect } from 'next/navigation';

export default function Home() {
  // ברגע שמישהו נכנס ל-localhost:3000, הוא עובר אוטומטית לרישום
  redirect('/register'); 
}
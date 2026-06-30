"use client";

import { useEffect, useState } from "react";

const facts = [
  "Warm water after waking can support digestion.",
  "Regular sleep timing helps the body recover.",
  "Eating calmly supports better digestion.",
  "Short walks after meals can support metabolism.",
  "Consistent daily routines support balance.",
];

export default function DashboardLoading() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % facts.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#FAF9F6] flex flex-col items-center justify-center text-slate-900 z-50">
      {/* Center Spinner Icon */}
      <div className="relative mb-6">
        <div className="h-10 w-10 rounded-full border-2 border-emerald-800 border-t-transparent animate-spin flex items-center justify-center">
          <span className="text-xs">🌱</span>
        </div>
      </div>

      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Please wait...</p>
      
      {/* Rotating Ayurvedic Facts */}
      <p className="mt-3 max-w-xs px-6 text-center text-xs font-semibold text-emerald-800 leading-relaxed min-h-[40px] flex items-center justify-center transition-all duration-500">
        {facts[index]}
      </p>
    </div>
  );
}

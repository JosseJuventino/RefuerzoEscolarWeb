// app/(error)/500/page.tsx 
"use client";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function ServerErrorPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="inline-block p-6 bg-red-100 rounded-full">
          <AlertCircle className="w-16 h-16 text-red-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-[#003C71]">
          Error del servidor
        </h1>
        
        <p className="text-gray-600 text-lg">
          Estamos trabajando para solucionarlo
        </p>

        <Link
          href="/dashboard"
          className="mt-6 inline-block bg-[#003C71] text-white px-8 py-3 rounded-lg
                  font-semibold hover:bg-[#00509E] transition-colors duration-300"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
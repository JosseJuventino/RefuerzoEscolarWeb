"use client";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="inline-block p-6 bg-[#003C71]/10 rounded-full">
          <AlertTriangle className="w-16 h-16 text-[#003C71]" />
        </div>
        
        <h1 className="text-3xl font-bold text-[#003C71]">
          ¡Contenido no encontrado!
        </h1>
        
        <p className="text-gray-600 text-lg">
          La página que buscas no existe o ha sido movida
        </p>

        <Link
          href="/dashboard"
          className="mt-6 inline-block bg-[#003C71] text-white px-8 py-3 rounded-lg
                  font-semibold hover:bg-[#00509E] transition-colors duration-300"
        >
          Volver al dashboard
        </Link>
      </div>
    </div>
  );
}
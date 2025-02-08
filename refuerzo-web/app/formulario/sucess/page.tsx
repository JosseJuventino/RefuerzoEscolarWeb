"use client";
import Link from "next/link";
import { CheckCircle2, Plus } from "lucide-react";

export default function SuccessPage() {
  return (
    <main className="w-full h-screen flex items-center justify-center bg-gray-50">
      {/* Contenedor principal */}
      <div className="max-w-[600px] w-full p-8 md:p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-10 text-center">
          {/* Ícono */}
          <CheckCircle2 className="w-20 h-20 text-[#003C71] mx-auto mb-6" />

          {/* Título */}
          <h1 className="text-3xl font-bold text-[#003C71] mb-4">
            Postulante agregado exitosamente!
          </h1>

          <p className="text-gray-600 mb-8">
            El postulante ha sido registrado en el sistema
          </p>

          {/* Botones */}
          <div className="flex flex-col gap-4 max-w-xs mx-auto">
            <Link
              href="/formulario/"
              className="bg-[#003C71] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#00509E] transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Añadir otro
            </Link>
            <Link
              href="/dashboard/applicants"
              className="border-2 border-[#003C71] text-[#003C71] px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-300 flex items-center justify-center gap-2"
            >
              Ver mis postulantes
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
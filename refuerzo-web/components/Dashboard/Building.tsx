import Link from "next/link";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="bg-[#003C71]/10 p-8 rounded-full inline-block">
          <span className="text-6xl text-[#003C71]">🚧</span>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-[#003C71]">
          ¡Página en desarrollo!
        </h1>
        
        <p className="text-gray-600 text-lg leading-relaxed">
          Estamos trabajando duro para ofrecerte la mejor experiencia
        </p>

        <Link
          href="/dashboard"
          className="mt-6 inline-block bg-[#003C71] text-white px-8 py-3 rounded-lg
                   font-semibold hover:bg-[#00509E] transition-colors duration-300
                   text-lg shadow-sm"
        >
          Regresar al inicio
        </Link>
      </div>
    </div>
  );
}
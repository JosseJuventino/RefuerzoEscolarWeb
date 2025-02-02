import { BookKeyIcon } from "lucide-react";

export const Loading = () => {

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full transition-all duration-300 hover:shadow-xl">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-20 h-20 animate-bounce">
            <div className="absolute inset-0 bg-blue-100 rounded-full" />
            <BookKeyIcon className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-blue-600"/>
          </div>

          <h2 className="text-2xl font-bold text-blue-900 mb-4 animate-pulse">
            Verificando acceso...
          </h2>

          <div className="mt-6 relative w-12 h-12">
            <div className="w-full h-full border-4 border-blue-100 rounded-full" />
            <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-600 border-r-blue-600 rounded-full animate-spin" />
          </div>

          <p className="text-center text-blue-700 italic mt-4">
            La educación es el pasaporte hacia el futuro...
          </p>
        </div>
      </div>
    </div>
  );
};
"use client";

import { useState, useEffect } from "react";
import { ShowPasswordIcon, HidePasswordIcon } from "@/utils/Icons";
import { AuthService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from 'next/navigation';
import Image from "next/image";

const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await AuthService.checkAuth();
      if (isAuthenticated) {
        router.push('/dashboard');
      }
    };
    
    checkAuth();
  }, [router]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);


    try {
      await AuthService.login({ email, password });
      router.push('/dashboard');
    } catch (err: unknown) {
      let errorMessage = "Error de autenticación. Por favor intenta de nuevo.";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      useAuthStore.getState().clearAuth();
    } finally {
      setLoading(false);
    }
  };


  

  return (
    <div className="w-full md:w-1/2 p-6 md:p-8">
      <Image src="/LogoColorido.svg" alt="Logo" className="w-24" width={96} height={96} />
      <h2 className="text-2xl font-bold mb-6 text-blue_principal">Iniciar Sesión</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nombre@ejemplo.com"
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
              focus:outline-none focus:border-blue_principal focus:ring-1 focus:ring-blue_principal"
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Contraseña
          </label>
          <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                focus:outline-none focus:border-blue_principal focus:ring-1 focus:blue_principal pr-10"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 text-blue_principal flex items-center"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <HidePasswordIcon /> : <ShowPasswordIcon />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue_principal text-white rounded-md hover:bg-blue_principal focus:outline-none focus:ring-2 focus:blue_principal focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Cargando..." : "Iniciar Sesión"}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
"use client";

import { useState, useEffect } from "react";
import { ShowPasswordIcon, HidePasswordIcon } from "@/utils/Icons";
import { AuthService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { requestPasswordReset } from "@/services/user.service";
import { RequestPassResponse } from "@/types/types";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import {
  useGoogleReCaptcha
} from 'react-google-recaptcha-v3';


const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPasswordPopup, setShowForgotPasswordPopup] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();

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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResetLoading(true);


    try {
      if (!executeRecaptcha) {
        throw new Error("reCAPTCHA no está disponible.");
      }


      const token = await executeRecaptcha("forgot_password");
      console.log("Token de reCAPTCHA generado:", token);

      const response: RequestPassResponse = await requestPasswordReset(resetEmail, token);

      console.log(response);

      if (response && response.statusCode === 404) {
        toast.error(response.message);
      } else {
        toast.success("Enlace de recuperación enviado correctamente, revisa tu correo.");
        setShowForgotPasswordPopup(false);
      }
    } catch {
      setError("Error al enviar el enlace de recuperación. Intenta nuevamente.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="w-full md:w-1/2 p-6 md:p-8">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 5000,
          style: {
            background: "#fff",
            color: "#363636",
            boxShadow: "0 3px 10px rgba(0, 0, 0, 0.1)",
          },
        }}
      />
      <Image src="/LogoColorido.svg" alt="Logo" className="w-24" width={96} height={96} />
      <h2 className="text-2xl font-bold mb-6 text-blue_principal">Iniciar Sesión</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="absolute -top-[1000px] left-0 opacity-0" aria-hidden="true">
          <label htmlFor="website"></label>
          <input
            type="text"
            id="website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            onChange={(e) => {
              if (e.target.value) {
                setError('Solicitud bloqueada por seguridad');
                setResetLoading(false);
              }
            }}
          />
        </div>
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

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => setShowForgotPasswordPopup(true)}
            className="text-blue_principal hover:text-blue-700 text-sm"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-2 text-center">
          <span>Este sitio está protegido por reCAPTCHA y se aplican la </span>
          <a href="https://policies.google.com/privacy" className="text-blue_principal" target="_blank">Política de privacidad</a> y los
          <a href="https://policies.google.com/terms" className="text-blue_principal" target="_blank">Términos de servicio</a> de Google.
        </p>
      </form>

      {/* Popup de recuperación de contraseña */}
      {showForgotPasswordPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-blue_principal">Recuperar Contraseña</h3>

            <>
              <p className="mb-4 text-gray-600">
                Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
              </p>

              <form onSubmit={handleForgotPassword}>
                <div className="mb-4">
                  <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="reset-email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="nombre@ejemplo.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue_principal"
                    required
                  />
                </div>



                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordPopup(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="px-4 py-2 bg-blue_principal text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                  >
                    {resetLoading ? "Enviando..." : "Enviar enlace"}
                  </button>


                </div>

              </form>
            </>

          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
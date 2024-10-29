"use client";

import { useState } from "react";
import { ShowPasswordIcon, HidePasswordIcon } from "@/app/utils/Icons";
import GoogleLogin from "./GoogleLogin";

const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full md:w-1/2 p-6 md:p-8">
      <h2 className="text-2xl font-bold mb-6">Login</h2>

      <form className="space-y-4">
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
            placeholder="nombre@ejemplo.com"
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
              focus:outline-none focus:border-blue_principal focus:ring-1 focus:ring-blue_principal"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="••••••••"
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                focus:outline-none focus:border-blue_principal focus:ring-1 focus:blue_principal pr-10"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <HidePasswordIcon /> : <ShowPasswordIcon />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue_principal text-white rounded-md hover:bg-blue_principal focus:outline-none focus:ring-2 focus:blue_principal focus:ring-offset-2"
        >
          Log In
        </button>

        <div className="text-center text-sm text-gray-500">O continuar con</div>

        <GoogleLogin />
        <div className="text-center text-sm">
          ¿No tienes una cuenta?{" "}
          <a href="#" className="text-blue_principal hover:underline">
            Regístrate aquí
          </a>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;

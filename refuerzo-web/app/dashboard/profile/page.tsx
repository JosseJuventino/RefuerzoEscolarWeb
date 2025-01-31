"use client";

import { useAuth } from "@/hooks/useAuth";
import { UserCircle, Edit, LogOut } from "lucide-react";
import PageHeader from "@/components/Dashboard/PageHeader";
import { useAuthStore } from "@/stores/authStore";

export default function ProfilePage() {
  const { user } = useAuth();
  const { clearAuth } = useAuthStore();

   const handleLogout = () => clearAuth('/');
    
  return (
    <div className="p-10">
      <PageHeader
        title="Mi Perfil"
        buttons={[
          {
            label: "Editar Perfil",
            icon: <Edit size={18} />,
            onClick: () => console.log("Editar perfil"),
            className: "bg-blue_principal text-white px-4 py-2 rounded-lg shadow-md transition-transform hover:scale-105",
          },
          {
            label: "Cerrar Sesión",
            icon: <LogOut size={18} />,
            onClick: handleLogout,
            className: "bg-red-600 text-white px-4 py-2 rounded-lg shadow-md transition-transform hover:scale-105",
          },
        ]}
      />

      <div className="mt-8">
        <div className="flex items-center space-x-6">
          {user?.image ? (
            <img
              src={user.image}
              alt="User avatar"
              className="w-32 h-32 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
              <UserCircle className="w-16 h-16 text-gray-400" />
            </div>
          )}

          <div className="flex-1">
            <h2 className="text-3xl font-bold text-blue_principal">
              {user?.nombreCompleto || "Invitado"}
            </h2>
            <p className="text-gray-600 -mt-3">{user?.email || "No disponible"}</p>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <div>
            <h3 className="font-bold text-blue_principal text-2xl mb-4">Información Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
              <div className="text-lg">
                <p><strong>Nombre:</strong> {user?.nombreCompleto || "No disponible"}</p>
                <p><strong>Correo electrónico:</strong> {user?.email || "No disponible"}</p>
              </div>
              <div className="text-lg">
                <p><strong>Teléfono:</strong> No disponible</p>
                <p><strong>Dirección:</strong> No disponible</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";
import { 
  UserCircle, 
  Edit, 
  LogOut, 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  Lock, 
  CheckCircle, 
  Loader,
  Activity,
  Key
} from "lucide-react";

import toast from "react-hot-toast";
import PageHeader from "@/components/Dashboard/PageHeader";



// Componente de Ítem de Información
const InfoItem = ({ 
  icon: Icon, 
  label, 
  value, 
  editable = false, 
  onEdit 
}: { 
  icon: React.ElementType;
  label: string;
  value: string | React.ReactNode;
  editable?: boolean;
  onEdit?: () => void;
}) => (
  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
    <div className="p-2 bg-white rounded-lg shadow-sm">
      <Icon className="w-5 h-5 text-blue_principal" />
    </div>
    <div className="flex-1">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="font-medium text-gray-900">
        {value || <span className="text-gray-400 italic">No disponible</span>}
      </p>
    </div>
    {editable && (
      <button 
        onClick={onEdit}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue_principal"
      >
        <Edit className="w-4 h-4" />
      </button>
    )}
  </div>
);

// Componente de Sección de Seguridad
const SecuritySection = () => (
  <div className="p-2">
    <h2 className="text-2xl font-bold text-blue_principal mb-6 flex items-center gap-2">
      <Lock className="w-6 h-6 " />
      Seguridad y Privacidad
    </h2>
    
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-3">
          <Key className="w-5 h-5 text-blue_principal" />
          <div>
            <p className="font-medium">Cambiar Contraseña</p>
            <p className="text-sm text-gray-500">Actualiza tu contraseña regularmente para mayor seguridad</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-white border border-blue_principal text-blue_principal rounded-lg hover:bg-blue-50">
          Cambiar
        </button>
      </div>
    </div>
  </div>
);

// Componente principal
export default function ProfilePage() {
  const { user } = useAuth();
  const { clearAuth } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    toast.loading("Cerrando sesión...");
    setTimeout(() => {
      clearAuth('/');
      toast.success("Sesión cerrada con éxito");
    }, 1500);
  };
  const handleSaveProfile = async () => {
    const savePromise = new Promise((resolve, reject) => {
      setIsLoading(true);
      setTimeout(async () => {
        try {
    
          setIsEditing(false);
          resolve("Perfil actualizado correctamente");
        } catch {
          reject("Error al actualizar el perfil");
        } finally {
          setIsLoading(false);
        }
      }, 1500);
    });
    toast.promise(savePromise, {
      loading: <b>Guardando cambios...</b>,
      success: <b>Perfil actualizado correctamente</b>,
      error: <b>Error al actualizar el perfil</b>,
    });
  };


  return (
    <div className="p-10">
      <PageHeader
        title="Mi Perfil"
        buttons={[
          {
            label: isEditing ? "Guardar Cambios" : "Editar Perfil",
            icon: isEditing ? 
              (isLoading ? <Loader className="animate-spin" /> : <CheckCircle size={18} />) : 
              <Edit size={18} />,
            onClick: isEditing ? handleSaveProfile : () => setIsEditing(true),
            className: `px-4 py-2 rounded-lg shadow-md transition-all ${
              isEditing 
                ? "bg-green-100 text-green-600 hover:bg-green-200" 
                : "bg-white text-blue_principal border border-blue_principal hover:bg-blue-50"
            }`,
          },
          {
            label: "Cerrar Sesión",
            icon: <LogOut size={18} />,
            onClick: handleLogout,
            className: "bg-red-100 text-red-600 px-4 py-2 rounded-lg shadow-md hover:bg-red-200 transition-all",
          },
        ]}
      />

      <div className="mt-8 space-y-8">
        <div className="rounded-2xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              {user?.image ? (
                <img
                  src={user.image}
                  alt="User avatar"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-4 border-white shadow-lg">
                  <UserCircle className="w-20 h-20 text-gray-400" />
                </div>
              )}
              <button
                onClick={() => toast("Función de edición de foto en desarrollo", { icon: '🛠️' })}
                className="absolute bottom-0 right-0 bg-blue_principal p-2 rounded-full shadow-md hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-blue_principal mb-2 flex items-center gap-2">
                {user?.nombreCompleto || "Invitado"}
              </h1>
              <p className="text-lg text-gray-600 flex items-center justify-center md:justify-start gap-2">
                <Mail className="w-5 h-5 text-blue_principal" />
                {user?.email || "No disponible"}
              </p>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem 
              icon={User} 
              label="Nombre completo" 
              value={user?.nombreCompleto}
              editable
              onEdit={() => setIsEditing(true)}
            />
            <InfoItem 
              icon={Mail} 
              label="Correo electrónico" 
              value={user?.email}
            />
            <InfoItem 
              icon={Phone} 
              label="Teléfono" 
              value="75135462"
              editable
              onEdit={() => setIsEditing(true)}
            />
            <InfoItem 
              icon={MapPin} 
              label="Dirección" 
              value="Col Brisas del Mar"
              editable
              onEdit={() => setIsEditing(true)}
            />
          </div>
        </div>

        {/* Componentes de Secciones */}
        <SecuritySection />

        <div className="p-2">
          <h2 className="text-2xl font-bold text-blue_principal mb-6 flex items-center gap-2">
            <Activity className="w-6 h-6" />
            Actividad Reciente
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="font-medium">Último inicio de sesión</p>
              <p className="text-sm text-gray-500">25 de Julio, 2023 - 14:30 desde Chrome, Windows</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="font-medium">Dispositivos activos</p>
              <p className="text-sm text-gray-500">2 dispositivos conectados</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
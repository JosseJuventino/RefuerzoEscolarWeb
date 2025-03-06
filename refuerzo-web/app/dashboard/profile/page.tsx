"use client";

import { useState } from "react";
import { getLoginAttempt } from "@/services/auditory.service";
import {
  UserCircle,
  Edit,
  LogOut,
  Mail,
  Phone,
  MapPin,
  User,
  Lock,
  Activity,
  Key,
  Monitor,
  Smartphone,
  Chrome,
  Globe,
  Calendar,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";


import { toast } from "@pheralb/toast";
import PageHeader from "@/components/Dashboard/PageHeader";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { requestPasswordReset } from "@/services/user.service";
import { LoginAttempt, RequestPassResponse } from "@/types/types";
import ForgotPasswordModal from "@/components/Popups/ForgotPasswordModal";
import { useQuery } from "@tanstack/react-query";
import { formatRelativeTime } from "@/utils/formatRelativeTime";

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


export default function ProfilePage() {
  const [showForgotPasswordPopup, setShowForgotPasswordPopup] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;

  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleLogout = () => {
    toast.loading({
      text: "Cerrando sesión...",
      options: {
        promise: new Promise(() => {
          setTimeout(() => {
            signOut({ callbackUrl: '/' })
          }, 1500);
        }),
        success: "Sesión cerrada con éxito!",
        error: "Error al cerrar sesión",
        autoDismiss: true
      }
    });
  };

  const {
    data: logins,
  } = useQuery<LoginAttempt[], Error>({
    queryKey: ["loginAttempts", user?.email],
    queryFn: getLoginAttempt,
  });

  const handleForgotPassword = async () => {
    setResetLoading(true);


    try {
      if (!executeRecaptcha) {
        throw new Error("reCAPTCHA no está disponible.");
      }

      const token = await executeRecaptcha("forgot_password");

      if (user?.email !== undefined) {
        const response: RequestPassResponse = await requestPasswordReset(user.email, token);

        if (response && response.statusCode === 404) {
          toast.error({
            text: 'Ha ocurrido un error',
            description: response.message
          })
        } else {
          toast.success({
            text: 'Enlace de recuperación enviado',
          })
          setShowForgotPasswordPopup(false);
        }
      }


    } catch {
      toast.error({
        text: 'Ha ocurrido un error'
      })
    } finally {
      setResetLoading(false);
    }
  };


  return (
    <div className="p-10">
      <PageHeader
        title="Mi Perfil"
        buttons={[
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
            </div>

            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-blue_principal mb-2 flex items-center gap-2">
                {user?.name || "Invitado"}
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
              value={user?.name}
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
            />
            <InfoItem
              icon={MapPin}
              label="Dirección"
              value="Col Brisas del Mar"
            />
          </div>
        </div>

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
              <button onClick={() => handleForgotPassword()} className="px-4 py-2 bg-white border border-blue_principal text-blue_principal rounded-lg hover:bg-blue-50">
                Cambiar
              </button>
            </div>
          </div>
        </div>

        <div className="p-2">
          <h2 className="text-2xl font-bold text-blue_principal mb-6 flex items-center gap-2">
            <Activity className="w-6 h-6" />
            Actividad Reciente
          </h2>

          <div className="space-y-4">
            {logins?.length === 0 ? (
              <div className="p-4 bg-gray-50 rounded-xl text-gray-500 italic">
                No hay registros de intentos de inicio de sesión
              </div>
            ) : (
              logins?.map((login) => (
                <div key={login._id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      {(login.device?.toLowerCase() || '').includes('desktop') ? (
                        <Monitor className="w-5 h-5 text-blue_principal" />
                      ) : (
                        <Smartphone className="w-5 h-5 text-blue_principal" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {login.browser === 'Chrome' ? (
                          <Chrome className="w-4 h-4 text-blue_principal" />
                        ) : (
                          <Globe className="w-4 h-4 text-blue_principal" />
                        )}
                        <span className="font-medium">{login.browser}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{login.device}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Globe className="w-4 h-4" />
                        <span>{login.country}</span>
                        <span>•</span>
                        <Calendar className="w-4 h-4" />
                        <span title={new Date(login.createdAt).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}>
                          {formatRelativeTime(login.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {showForgotPasswordPopup && (
        <ForgotPasswordModal hasLogin={true} handleForgotPassword={handleForgotPassword} resetEmail={resetEmail} resetLoading={resetLoading} setResetEmail={setResetEmail} setShowForgotPasswordPopup={setShowForgotPasswordPopup} />
      )}
    </div>
  );
}
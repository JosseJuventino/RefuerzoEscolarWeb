"use client";

import Sidenav from "@/components/Dashboard/Sidenav";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthService } from "@/services/auth.service";
import { useAuth } from "@/hooks/useAuth";
import UpdateRequiredForm from "@/components/Auth/UpdateRequiredForm";
import { Loading } from "@/components/Loading";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { user } = useAuth();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);


    useEffect(() => {
        const checkAuth = async () => {
            const isAuthenticated = await AuthService.checkAuth();
            if (!isAuthenticated) {
                router.push('/');
            } else {
                setIsChecking(false);
            }
        };
        checkAuth();
    }, [router]);

    if (isChecking) {
        return <Loading />;
    }


    if (user && !user.isActive) {
        return <UpdateRequiredForm username={user.nombreCompleto} />
    }

    return (
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
            <div className="w-full flex-none md:w-64">
                <Sidenav user={user} />
            </div>
            <main className="flex-grow md:overflow-y-auto mt-20 md:mt-0 z-40 bg-gray-50">
                <GoogleReCaptchaProvider
                    language="es"
                    reCaptchaKey={process.env.NEXT_PUBLIC_SITE_KEY_RECAPTCHA || ''}
                    scriptProps={{ async: true }}
                >
                    {children}
                </GoogleReCaptchaProvider>
            </main>
        </div>
    );
};

export default Layout;
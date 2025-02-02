"use client";

import Sidenav from "@/components/Dashboard/Sidenav";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthService } from "@/services/auth.service";
import { useAuth } from "@/hooks/useAuth";
import UpdateRequiredForm from "@/components/Auth/UpdateRequiredForm";

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
        return <div>Cargando...</div>;
    }  
    
    console.log(user);

    if (user && !user.isActive) {
        return <UpdateRequiredForm username={user.nombreCompleto} />
    }

    return (
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
            <div className="w-full flex-none md:w-64">
                <Sidenav user={user} />
            </div>
            <main className="flex-grow md:overflow-y-auto z-40 bg-gray-50">
                {children}
            </main>
        </div>
    );
};

export default Layout;
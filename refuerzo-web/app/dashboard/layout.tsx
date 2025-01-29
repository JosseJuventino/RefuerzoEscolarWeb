"use client";

import Sidenav from "@/components/Dashboard/Sidenav";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AuthService } from "@/services/auth.service";
interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {

    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const isAuthenticated = await AuthService.checkAuth();
            if (!isAuthenticated) {
                router.push('/');
            }
        };

        checkAuth();
    }, [router]);

    return (
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden ">
            <div className="w-full flex-none md:w-64">
                <Sidenav />
            </div>
            <main className="flex-grow md:overflow-y-auto z-40 bg-gray-50">
                {children}
            </main>
        </div>
    );
};

export default Layout;
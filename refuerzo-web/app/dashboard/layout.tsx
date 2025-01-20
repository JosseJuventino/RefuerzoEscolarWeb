"use client";

import Sidenav from "@/components/Dashboard/Sidenav";
import { useRouter } from "next/navigation";
import { useAuth } from "@/scripts/useAuth";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    if (!loading && !user) {
        router.push("/");
        return null;
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
            </div>
        );
    }
    return (
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden ">
            <div className="w-full flex-none md:w-64 z-40">
                <Sidenav />
            </div>
            <main className="flex-grow md:overflow-y-auto z-40 bg-gray-50">
                {children}
            </main>
        </div>
    );
};

export default Layout;

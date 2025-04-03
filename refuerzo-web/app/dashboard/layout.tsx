"use client";

import Sidenav from "@/components/Dashboard/Sidenav";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import UpdateRequiredForm from "@/components/Auth/UpdateRequiredForm";
import { Loading } from "@/components/Loading";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { useSession } from "next-auth/react";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);
    const { status, data: session } = useSession();
    const user = session?.user;

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push('/');
        } else if (status === "authenticated") {
            setIsChecking(false);
        }
    }, [status, router]);

    if (status === "loading" || isChecking) {
        return <Loading />;
    }

    if (isChecking) {
        return <Loading />;
    }

    if (user && user.isActive === false) {
        return <UpdateRequiredForm username={user.name} />
    }

    return (
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
            <div className="w-full flex-none md:w-64">
                <Sidenav />
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
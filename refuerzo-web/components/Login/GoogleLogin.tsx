"use client"

import { useAuth } from "@/scripts/useAuth";
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/scripts/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GoogleLogin() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                router.push("/dashboard");
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleGoogleLogin = async () => {
        console.log("Iniciando sesión con Google...");
        const provider = new GoogleAuthProvider();
        try {
            
            await signInWithPopup(auth, provider);
            router.push("/dashboard"); 
        } catch (error) {
            console.error("Error en el inicio con Google:", error);
        }
    };

    if (loading) return <p>Cargando...</p>;

    return user ? (
        <p className="text-center">Bienvenido, {user.displayName} <span>redirigiendo</span></p>
    ) : (
            <button
                 type="button"
            onClick={handleGoogleLogin}
            className="bg-gray-100 text-black py-2 px-4 rounded-lg"
        >
            Iniciar sesión con Google
        </button>
    );
}

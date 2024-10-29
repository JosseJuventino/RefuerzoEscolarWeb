"use client"
import { useAuth } from "@/scripts/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login"); // Redirige al login si no está autenticado
        }
    }, [user, loading, router]);

    if (loading) return <p>Cargando...</p>;
    return user ? <p>Bienvenido, {user.displayName}</p> : null;
}

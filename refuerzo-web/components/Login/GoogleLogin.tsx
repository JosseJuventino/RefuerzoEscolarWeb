// components/GoogleLogin.js
import { useAuth } from "@/scripts/useAuth";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/scripts/firebase";
import { useRouter } from "next/router";

export default function GoogleLogin() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            router.push("/dashboard"); // Redirige después del login
        } catch (error) {
            console.error("Error en el inicio con Google:", error);
        }
    };

    if (loading) return <p>Cargando...</p>;

    return user ? (
        <p>Bienvenido, {user.displayName}</p>
    ) : (
        <button
            onClick={handleGoogleLogin}
            className="bg-gray-100 text-black py-2 px-4 rounded-lg"
        >
            Iniciar sesión con Google
        </button>
    );
}

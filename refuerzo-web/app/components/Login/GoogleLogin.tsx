"use client";
import { auth } from "@/app/scripts/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import useUserStore from "@/app/scripts/userStore";
import { useEffect } from "react";

export default function GoogleLogin() {
    const { setUser } = useUserStore();

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            if (user) {
                setUser(user);
                window.location.href = "/home";
            }
        } catch (error) {
            console.error("Error en el inicio con Google:", error);
        }
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(user);
                window.location.href = "/dashboard";
            }
        });

        return () => unsubscribe();
    }, [setUser]);

    return (
        <div className="mt-8 flex justify-center">
            <button
                type="button"
                id="button_google"
                className="bg-gray-100 text-black py-2 px-4 rounded-lg flex items-center"
                onClick={handleGoogleLogin}
            >
                <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png"
                    alt="Google Logo"
                    className="w-6 h-6 mr-2"
                />
                Iniciar sesión con Google
            </button>
        </div>
    );
}
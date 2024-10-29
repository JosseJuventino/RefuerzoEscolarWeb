import { auth } from "../../scripts/firebaseConfig";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import login_styles from "../../css/login.module.css"

export default function LoginForm() {

  const handleGoogleLogin = async () => {
    console.log("Botón de Google clickeado"); // Agrega este log para comprobar el clic
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("Usuario autenticado con Google:", user);
    } catch (error) {
      console.error("Error en el inicio con Google:", error);
    }
  };

  return (
    <div className={login_styles.login_form}>
      <form>
        <label htmlFor="email">Correo Electrónico</label>
        <input type="email" id="email" name="email" required />

        <label htmlFor="password">Contraseña</label>
        <input type="password" id="password" name="password" required />

        <button type="submit">Iniciar Sesión</button>
      </form>

      <div className={login_styles.googleLogin}>
        <button
          type="button"
          id="button_google"
          className={login_styles.googleButton}
          onClick={handleGoogleLogin}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png"
            alt="Google Logo"
            className={login_styles.googleLogo}
          />
          Iniciar sesión con Google
        </button>
      </div>
    </div>
  );
};


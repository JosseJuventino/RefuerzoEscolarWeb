import pandas as pd
import requests
import time

# ——— CONFIGURACIÓN ———
INPUT_FILE      = "registro.xlsx"
SHEET_NAME      = "Noveno" 
OUTPUT_FILE     = "postulantes_credenciales.xlsx" 

# Endpoint de postulante (genera postulante + usuario + temporaryPassword)
POSTULANTE_API_URL = "http://localhost:7777/postulantes/"  # Ajusta si tu ruta es diferente

# Reemplaza con tu JWT token (debe iniciar con "eyJ...")
AUTH_TOKEN      = "$2a$10$Zoyl8w8vLX91RGEtW0CiBevAHGufogmNiNlVmZ8vJ6bRENFxrWCWK"

ID_GRADO        = "67fa77ed11b715493b8c8b45"  # Debes poner el id correcto
ID_RECOMENDADOR = "689f57801132ff48a8974d6f"  # Debes poner el id correcto

# Imagen por defecto
DEFAULT_IMAGE_URL = (
    "https://us.123rf.com/450wm/thesomeday123/thesomeday1231709/"
    "thesomeday123170900021/85622928-icono-de-perfil-de-avatar-predeterminado-"
    "marcador-de-posición-de-foto-gris-vectores-de-ilustraciones.jpg"
)

HEADERS = {
    "Authorization": f"Bearer {AUTH_TOKEN}",
    "Content-Type":  "application/json"
}

MAX_RETRIES = 3

def gen_email(nombres, apellidos):
    n = nombres if isinstance(nombres, str) else ""
    a = apellidos if isinstance(apellidos, str) else ""
    n = n.strip()
    a = a.strip()
    if not n and not a:
        return ""
    first_name = n.split()[0].lower() if n else ""
    last_name  = a.split()[0].replace(".", "").lower() if a else ""
    base = f"{first_name}.{last_name}" if first_name and last_name else first_name or last_name
    return f"{base}@refuerzo-mendoza.com"

def validate_token():
    if not AUTH_TOKEN or AUTH_TOKEN.startswith("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"):
        print("\n⚠️  ERROR: Token JWT no configurado o inválido.")
        return False
    return True

df = pd.read_excel(INPUT_FILE, sheet_name=SHEET_NAME, engine="openpyxl")
df["email"] = df.apply(lambda r: gen_email(r["Nombres"], r["Apellidos"]), axis=1)

resultados = []

for _, row in df.iterrows():
    nom = row["Nombres"] if isinstance(row["Nombres"], str) else ""
    ape = row["Apellidos"] if isinstance(row["Apellidos"], str) else ""
    nom = nom.strip()
    ape = ape.strip()
    if not nom and not ape:
        break

    nombre_full = f"{nom} {ape}".strip()
    email       = row["email"]
    telefono    = "00000000"
    image_url   = DEFAULT_IMAGE_URL
    telefono_encargado = "00000000"

    temp_pass = ""
    status    = ""

    # —①— Crear el postulante
    postulante_payload = {
        "nombre": nombre_full,
        "email": email,
        "imagen": image_url,
        "telefono": telefono,
        "telefonoEncargado": telefono_encargado,
        "grado": ID_GRADO,
        "isUser": False,
        "programa": '67b6986afd4ed32f7ff55feb',
        "direccion": 'Mi direccion'        
    }

    if not validate_token():
        exit(1)

    for intento in range(1, MAX_RETRIES + 1):
        try:
            resp = requests.post(
                POSTULANTE_API_URL + f"?recomendadorId={ID_RECOMENDADOR}",
                json=postulante_payload,
                headers=HEADERS
            )
            body = resp.json() if resp.text else {}
        except requests.RequestException as e:
            print(f"[EXCEPCIÓN postulante] {email}: {e}")
            body = {}
            resp = type("er", (), {"status_code": None})()

        if resp.status_code == 201:
            data = body.get("data") or {}
            temp_pass = (
                data.get("temporaryPassword")
                or data.get("temporary_password")
                or ""
            )
            status = "CREADO"
            print(f"[OK postulante] {email} → temp_password={temp_pass}")
            break
        else:
            msg = body.get("message", getattr(resp, "text", str(resp.status_code)))
            print(f"[ERROR postulante {resp.status_code}] {email}: {msg}")
            status = f"ERROR {resp.status_code}"

        if intento < MAX_RETRIES:
            print(f"  Reintentando ({intento}/{MAX_RETRIES})…")
            time.sleep(2)
        else:
            print(f"[FALLIDO postulante] {email} tras {MAX_RETRIES} intentos.")

    resultados.append({
        "Nombres":       nom,
        "Apellidos":     ape,
        "email":         email,
        "temp_password": temp_pass,
        "status":        status
    })

    time.sleep(5)

if resultados:
    df_out = pd.DataFrame(resultados)
    df_out.to_excel(OUTPUT_FILE, index=False,
                   columns=["Nombres", "Apellidos", "email", "temp_password"])
    print(f"\n✅ Resultados volcados en {OUTPUT_FILE}")
else:
    print("\n❌ No se procesaron registros.")

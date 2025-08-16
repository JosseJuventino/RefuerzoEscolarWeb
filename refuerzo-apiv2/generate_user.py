import pandas as pd
import requests
import time

# ——— CONFIGURACIÓN ———
INPUT_FILE      = "registro.xlsx"
SHEET_NAME      = "Septimo" 
OUTPUT_FILE     = "alumnos_credenciales.xlsx" 

# Endpoint de usuario (genera userId + temporaryPassword)
USER_API_URL    = "http://localhost:7777/users/"

# Reemplaza con tu JWT token (debe iniciar con "eyJ...")
AUTH_TOKEN      = "$2a$10$7aoMr7h2aA5vV5WIhHWKD.By84008DKNIyt2xzO8GBTPM1jrcRZQW"

ID_SECCION      = "67fa77d811b715493b8c8b3f"  # idDependingRole

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

# ——— FUNCIÓN PARA GENERAR EMAILS ÚNICOS ———
emails_count = {}
def gen_email(nombres, apellidos):
    # Trata valores no str como vacío
    n = nombres if isinstance(nombres, str) else ""
    a = apellidos if isinstance(apellidos, str) else ""
    n = n.strip()
    a = a.strip()
    # Si ambos vacíos, devolvemos cadena vacía
    if not n and not a:
        return ""
    # Solo primer nombre/apellido
    first_name = n.split()[0].lower() if n else ""
    last_name  = a.split()[0].replace(".", "").lower() if a else ""
    # Base para email
    if first_name and last_name:
        base = f"{first_name}.{last_name}"
    else:
        base = first_name or last_name
    # Control de duplicados
    cnt = emails_count.get(base, 0) + 1
    emails_count[base] = cnt
    if cnt > 1:
        base = f"{base}{cnt}"
    return f"{base}@refuerzo-mendoza.com"

# ——— LECTURA Y NORMALIZACIÓN ———
df = pd.read_excel(INPUT_FILE, sheet_name=SHEET_NAME, engine="openpyxl")
df["email"] = df.apply(lambda r: gen_email(r["Nombres"], r["Apellidos"]), axis=1)

resultados = []

def validate_token():
    if not AUTH_TOKEN or AUTH_TOKEN.startswith("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"):
        print("\n⚠️  ERROR: Token JWT no configurado o inválido.")
        return False
    return True

for _, row in df.iterrows():
    # Extraer y limpiar nombres/apellidos
    nom = row["Nombres"] if isinstance(row["Nombres"], str) else ""
    ape = row["Apellidos"] if isinstance(row["Apellidos"], str) else ""
    nom = nom.strip()
    ape = ape.strip()
    # Si ambos vacíos: fin de registros
    if not nom and not ape:
        break

    nombre_full = f"{nom} {ape}".strip()
    email       = row["email"]
    telefono    = "00000000"
    image_url   = DEFAULT_IMAGE_URL

    temp_pass = ""
    status    = ""

    # —①— Crear el usuario
    user_payload = {
        "nombre":          nombre_full,
        "email":           email,
        "telefono":        telefono,
        "password":        "ignored_by_api",   # se ignora en el servidor
        "image":           image_url,
        "role":            "alumno",
        "idDependingRole": ID_SECCION
    }

    if not validate_token():
        exit(1)

    # Intentos para crear usuario
    for intento in range(1, MAX_RETRIES + 1):
        try:
            resp = requests.post(USER_API_URL, json=user_payload, headers=HEADERS)
            body = resp.json() if resp.text else {}
        except requests.RequestException as e:
            print(f"[EXCEPCIÓN usuario] {email}: {e}")
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
            print(f"[OK usuario] {email} → temp_password={temp_pass}")
            break
        else:
            msg = body.get("message", getattr(resp, "text", str(resp.status_code)))
            print(f"[ERROR usuario {resp.status_code}] {email}: {msg}")
            status = f"ERROR {resp.status_code}"

        if intento < MAX_RETRIES:
            print(f"  Reintentando ({intento}/{MAX_RETRIES})…")
            time.sleep(2)
        else:
            print(f"[FALLIDO usuario] {email} tras {MAX_RETRIES} intentos.")

    resultados.append({
        "Nombres":       nom,
        "Apellidos":     ape,
        "email":         email,
        "temp_password": temp_pass,
        "status":        status
    })

    # Espera antes de la siguiente petición
    time.sleep(5)

# ——— VOLCAR RESULTADOS A EXCEL ———
if resultados:
    df_out = pd.DataFrame(resultados)
    # Selecciona solo las columnas requeridas
    df_out.to_excel(OUTPUT_FILE, index=False,
                   columns=["Nombres", "Apellidos", "email", "temp_password"])
    print(f"\n✅ Resultados volcados en {OUTPUT_FILE}")
else:
    print("\n❌ No se procesaron registros.")

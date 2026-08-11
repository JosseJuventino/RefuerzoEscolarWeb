# RefuerzoEscolarWeb

Plataforma de refuerzo escolar de William Mendoza. Este monorepo contiene el
backend, el panel/web pública y un prototipo estático del formulario de
postulantes.

Este README es para **levantar el proyecto**. Para entender cómo funciona por
dentro, eso está en [docs/](docs/).

## Cómo funciona la plataforma

La lógica de negocio está documentada aparte, en la carpeta [docs/](docs/), que
vive en la raíz porque casi ningún flujo pasa por un solo proyecto: la
postulación empieza en la web y termina creando tres documentos en Mongo, la
asistencia se calcula en el navegador y se normaliza en la API, y los permisos se
deciden en la API pero el menú se pinta en la web.

| Documento                                            | De qué trata                                                                        |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [Visión general](docs/vision-general.md)             | Las piezas y cómo se guardan los datos. **Empezá por acá.**                           |
| [Roles y permisos](docs/roles-y-permisos.md)         | Quién puede hacer qué, y por qué el menú de la web no es una protección.              |
| [Sesión y login](docs/sesion-y-login.md)             | Cómo se entra, qué es realmente el token, y la activación obligatoria de cuenta.       |
| [Postulación](docs/postulacion.md)                   | Del formulario hasta que el alumno aparece en su sección.                             |
| [Cuentas y usuarios](docs/cuentas-y-usuarios.md)     | Los tres caminos para crear cuentas y la recuperación de contraseña.                  |
| [Cursos y secciones](docs/cursos-y-secciones.md)     | Grados, secciones, quién entra a cada una y el tablón.                                |
| [Asistencia](docs/asistencia.md)                     | Cómo se registra y por qué una asistencia es un día, no una hora.                     |
| [Archivos e imágenes](docs/archivos.md)              | Qué pasa cuando alguien sube una foto o un PDF.                                       |

## Componentes

| Carpeta                                            | Stack                       | Puerto dev | Necesita `.env` |
| -------------------------------------------------- | --------------------------- | ---------- | --------------- |
| [refuerzo-apiv2/](refuerzo-apiv2/)                 | NestJS 10 + TypeORM/MongoDB | `3005`     | Sí — `.env`     |
| [refuerzo-web/](refuerzo-web/)                     | Next.js 15 + NextAuth v5    | `3000`     | Sí — `.env.local` |
| [formulario_postulantes/](formulario_postulantes/) | Astro 5 (estático)          | `4321`     | No              |
| [refuerzo-api/](refuerzo-api/)                     | API v1 (legado)             | —          | Fuera de alcance |

`refuerzo-web` **debe** correr en el puerto `3000`: el CORS de la API está
hardcodeado en [main.ts:19-27](refuerzo-apiv2/src/main.ts#L19-L27) y solo
permite `http://localhost:3000`, `http://66.70.189.110` y
`https://refuerzo-mendoza.me`.

---

## Requisitos previos

- **Node.js 20+** (probado con v23.11.1)
- **MongoDB** — local (Docker o `mongod`) o un cluster de MongoDB Atlas
- **npm 10+** (ya viene con Node)

No hace falta instalar `yarn` ni `bun` para desarrollar en local, aunque el
repo tenga `yarn.lock` y `bun.lock` (ver [Notas sobre los lockfiles](#notas-sobre-los-lockfiles)).

---

## 1. MongoDB

La API no arranca sin base de datos: se queda reintentando con
`MongoServerSelectionError: connect ECONNREFUSED ...:27017`.

**Opción A — Docker (recomendado en local)**

```bash
docker run -d --name refuerzo-mongo -p 27017:27017 mongo:7
```

**Opción B — MongoDB Atlas**

Crea un cluster gratuito y usa su cadena `mongodb+srv://...` como `MONGO_URI`.

### Sobre las transacciones

[users.service.ts:972](refuerzo-apiv2/src/users/users.service.ts#L972) usa una
transacción en el flujo de *reset password*, y las transacciones de MongoDB
exigen un **replica set**. Con un `mongod` suelto ese endpoint falla; todo lo
demás funciona igual. Si necesitas probarlo:

```bash
docker run -d --name refuerzo-mongo -p 27017:27017 mongo:7 --replSet rs0 --bind_ip_all
docker exec refuerzo-mongo mongosh --quiet --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'localhost:27017'}]})"
```

y usa `MONGO_URI=mongodb://localhost:27017/?replicaSet=rs0`.

---

## 2. refuerzo-apiv2 (backend)

### Instalación

```bash
cd refuerzo-apiv2
npm install --no-package-lock
```

> **No corras `npm install` sin `--no-package-lock` aquí.** npm detecta el
> `yarn.lock` existente y lo reescribe al formato de Yarn 1, rompiendo el
> `yarn install --frozen-lockfile` que usa [install.sh](install.sh) en el
> servidor. Si te pasa: `git checkout -- refuerzo-apiv2/yarn.lock`.

### Variables de entorno

Copia [refuerzo-apiv2/.env.example](refuerzo-apiv2/.env.example) a
`refuerzo-apiv2/.env`. Lo lee `ConfigModule` con
`envFilePath: ['.env']` ([app.module.ts:25-29](refuerzo-apiv2/src/app.module.ts#L25-L29)).

| Variable                | ¿Obligatoria?               | Para qué sirve |
| ----------------------- | --------------------------- | -------------- |
| `MONGO_URI`             | **Sí**                      | Cadena de conexión a MongoDB. |
| `MONGO_DB`              | **Sí**                      | Nombre de la base de datos. |
| `JWT`                   | **Sí**                      | Secreto de firma de los JWT. Se llama `JWT`, **no** `JWT_SECRET`. |
| `NEXT_PUBLIC_API_URLV2` | Sí, si subes archivos       | Prefijo con el que se guardan en Mongo las URLs de imágenes y documentos. Si falta, quedan como `undefined/uploads/...`. |
| `PORT`                  | No (default `3005`)         | Puerto de escucha. |
| `API_GLOBAL_PREFIX`     | No (default `api`)          | Solo rellena el `server` de Swagger. **No agrega prefijo a las rutas.** |
| `SWAGGER_DOC_PATH`      | No (default `docs`)         | Ruta de Swagger UI. |
| `AWS_REGION`            | Solo para enviar correos    | Región de AWS SES. |
| `AWS_ACCESS_KEY_ID`     | Solo para enviar correos    | Credencial de SES. |
| `AWS_SECRET_ACCESS_KEY` | Solo para enviar correos    | Credencial de SES. |
| `RECAPTCHA_SECRET_KEY`  | Solo para reset de password | Clave *secreta* de reCAPTCHA v3, del mismo par que la site key de la web. |

Ejemplo mínimo para levantar en local:

```dotenv
MONGO_URI=mongodb://localhost:27017
MONGO_DB=refuerzo_escolar
JWT=<pega aquí un secreto aleatorio>
PORT=3005
NEXT_PUBLIC_API_URLV2=http://localhost:3005
```

Genera el secreto con:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

> **Las rutas viven en la raíz, sin `/api`.** [main.ts](refuerzo-apiv2/src/main.ts)
> nunca llama a `app.setGlobalPrefix()`, así que el login local es
> `http://localhost:3005/auth/login`. El `/apiv2` de producción lo agrega el
> reverse proxy, no la aplicación.

### Arranque

```bash
npm run start:dev     # watch mode
npm run start         # una sola pasada
npm run build && npm run start:prod   # como en producción
```

- API: <http://localhost:3005>
- Swagger: <http://localhost:3005/docs>
- Archivos subidos: <http://localhost:3005/uploads> (sirve `refuerzo-apiv2/uploads/`)

---

## 3. refuerzo-web (Next.js)

### Instalación

```bash
cd refuerzo-web
npm ci --force
```

El `--force` es necesario por conflictos de peer deps entre `@nextui-org/*` y
`@heroui/*`; es el mismo comando que usa [install.sh](install.sh).

### Variables de entorno

Copia [refuerzo-web/.env.example](refuerzo-web/.env.example) a
`refuerzo-web/.env.local`.

| Variable                         | ¿Obligatoria?      | Para qué sirve |
| -------------------------------- | ------------------ | -------------- |
| `NEXT_PUBLIC_API_URL`            | **Sí**             | `baseURL` de axios ([lib/api.ts](refuerzo-web/lib/api.ts), [services/apiClient.ts](refuerzo-web/services/apiClient.ts)). Apunta a la **raíz** de la API, sin `/api`. |
| `AUTH_SECRET`                    | **Sí**             | Secreto de NextAuth v5 ([lib/auth.ts:126](refuerzo-web/lib/auth.ts#L126)). Distinto del `JWT` de la API. |
| `NEXT_PUBLIC_SITE_KEY_RECAPTCHA` | **Sí en práctica** | Site key de reCAPTCHA v3 (ver aviso abajo). |

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3005
AUTH_SECRET=<pega aquí un secreto aleatorio>
NEXT_PUBLIC_SITE_KEY_RECAPTCHA=<site key de reCAPTCHA v3>
```

Genera el secreto con:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

> **El login parece roto sin la site key de reCAPTCHA.** En
> [LoginForm.tsx](refuerzo-web/components/Login/LoginForm.tsx), `handleSubmit`
> primero hace `signIn()` y **después** comprueba `executeRecaptcha`. Si el
> script de Google no cargó (site key vacía o dominio no autorizado),
> `executeRecaptcha` es `undefined`, se lanza `"reCAPTCHA no está disponible."`,
> aparece un toast de error y nunca se ejecuta el `router.push("/dashboard")`
> — aunque la sesión sí quedó creada. Registra `localhost` como dominio
> permitido en la consola de reCAPTCHA v3.

Recuerda que las `NEXT_PUBLIC_*` se incrustan en el bundle en tiempo de build:
si las cambias, reinicia `npm run dev` o vuelve a compilar.

### Arranque

```bash
npm run dev     # http://localhost:3000
```

No cambies el puerto: el CORS de la API solo acepta `http://localhost:3000`.

---

## 4. formulario_postulantes (Astro)

**No necesita `.env`.** Es un prototipo estático: no hay ninguna referencia a
`import.meta.env` ni a `process.env`, y el `<form>` de
[FormBody.astro](formulario_postulantes/src/components/FormBody.astro) no tiene
`action` ni `fetch` — no envía nada a la API.

El formulario de postulantes **en uso** es el de la web, en
[refuerzo-web/app/formulario/page.tsx](refuerzo-web/app/formulario/page.tsx)
(<http://localhost:3000/formulario>).

```bash
cd formulario_postulantes
npm ci
npm run dev     # http://localhost:4321
```

---

## Levantar todo (resumen)

Tres terminales, en este orden:

```bash
# 0) Mongo
docker start refuerzo-mongo   # o docker run ... la primera vez

# 1) API  -> http://localhost:3005
cd refuerzo-apiv2 && npm run start:dev

# 2) Web  -> http://localhost:3000
cd refuerzo-web && npm run dev

# 3) Formulario (opcional) -> http://localhost:4321
cd formulario_postulantes && npm run dev
```

---

## Primer rol y primer usuario (bootstrap)

Con la base de datos vacía **no puedes entrar**, y hay un problema de
huevo-y-gallina:

- `POST /users` es público ([users.controller.ts:88-95](refuerzo-apiv2/src/users/users.controller.ts#L88-L95)),
  pero exige que el rol ya exista.
- `POST /roles` **no** es público: `AuthGuard` está registrado como `APP_GUARD`
  ([auth.module.ts:38-39](refuerzo-apiv2/src/auth/auth.module.ts#L38-L39)) y
  `RolesController` no tiene `@Public()`, así que necesitas un token… que
  requiere un usuario… que requiere un rol.
- Además, `POST /roles` **descarta la mayoría de los permisos**: `PagesDto`
  ([create-role.dto.ts](refuerzo-apiv2/src/roles/dto/create-role.dto.ts)) solo
  declara `blog`, `usuarios`, `programacion` y `role`, y el `ValidationPipe`
  corre con `whitelist: true`, por lo que claves como `postulantes`,
  `secciones` o `alumnos` se eliminan del body silenciosamente.

Por eso **el primer rol se inserta directo en MongoDB**. Las claves de `pages`
deben coincidir con los `@Resources(...)` de los controladores:

```bash
docker exec refuerzo-mongo mongosh refuerzo_escolar --quiet --eval '
db.Roles.insertOne({
  name: "admin",
  pages: {
    usuarios:       { view: true, edit: true },
    roles:          { view: true, edit: true },
    postulantes:    { view: true, edit: true },
    secciones:      { view: true, edit: true },
    alumnos:        { view: true, edit: true },
    profesores:     { view: true, edit: true },
    tutores:        { view: true, edit: true },
    grado:          { view: true, edit: true },
    programa:       { view: true, edit: true },
    asistencias:    { view: true, edit: true },
    document:       { view: true, edit: true },
    image:          { view: true, edit: true },
    email:          { view: true, edit: true },
    profile:        { view: true, edit: true },
  },
  createdAt: new Date(),
  updatedAt: new Date()
})'
```

Luego crea el usuario vía API. **La contraseña que mandas se ignora**: el
servicio genera una temporal y te la devuelve en la respuesta
([users.service.ts:89-108](refuerzo-apiv2/src/users/users.service.ts#L89-L108)).

```bash
curl -X POST http://localhost:3005/users \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Admin",
    "email": "admin@local.test",
    "telefono": "00000000",
    "password": "se-ignora",
    "image": "https://via.placeholder.com/150",
    "role": "admin"
  }'
```

La respuesta trae `data.temporaryPassword`: esa es la contraseña de acceso.
`CreateUserDto` no acepta `isActive`, así que actívalo a mano:

```bash
docker exec refuerzo-mongo mongosh refuerzo_escolar --quiet --eval '
db.Users.updateOne({ email: "admin@local.test" }, { $set: { isActive: true } })'
```

Ya puedes entrar en <http://localhost:3000> con `admin@local.test` y la
contraseña temporal.

> Los scripts [generate_user.py](refuerzo-apiv2/generate_user.py) y
> [generate_postulante.py](refuerzo-apiv2/generate_postulante.py) hacen carga
> masiva desde `registro.xlsx`. Requieren Python con `pandas` y `requests`, y
> tienen la URL, el token y el `ID_SECCION` hardcodeados al inicio del archivo:
> revísalos antes de usarlos.

---

## Notas sobre los lockfiles

`refuerzo-apiv2` tiene tres lockfiles y ninguno es intercambiable:

- **`yarn.lock`** — formato Yarn 4/Berry (`__metadata: version 8`). Es el que
  usa el despliegue ([install.sh](install.sh)). El `yarn` 1.x global **no**
  lo entiende; hace falta Yarn 4 (`corepack yarn@stable ...`), y `package.json`
  no fija `packageManager`, así que Corepack cae por defecto a Yarn 1.
- **`bun.lock`** — de un `bun install` previo.
- No hay `package-lock.json`, y por eso conviene `npm install --no-package-lock`
  en local: evita crear uno y evita que npm reescriba el `yarn.lock`.

`yarn install --immutable` con Yarn 4.18 falla en este lockfile por el hash del
patch de TypeScript (`hash=74658d` vs `hash=5786d5`), una diferencia entre
versiones menores de Yarn 4. Para reproducirlo exactamente habría que fijar
`"packageManager": "yarn@<versión>"` en `refuerzo-apiv2/package.json`.

`refuerzo-web` sí tiene `package-lock.json` (v3), así que `npm ci --force`
funciona sin sorpresas.

---

## Despliegue

- [install.sh](install.sh) despliega API + web en el VPS
  (`/var/www/html/RefuerzoEscolarWeb`) y reinicia los procesos `apiv2` y
  `refuerzo-web` de PM2.
- [refuerzo-web/.github/workflows/deploy.yml](refuerzo-web/.github/workflows/deploy.yml)
  hace lo mismo para la web por SSH en cada push a `main`. Necesita los secretos
  `VPS_IP`, `VPS_USER` y `VPS_SSH_KEY`.
- Los `.env` **no** están versionados: viven en el servidor y hay que
  mantenerlos ahí a mano. En producción usa
  `NEXT_PUBLIC_API_URL=https://refuerzo-mendoza.me/apiv2` y
  `NEXT_PUBLIC_API_URLV2=https://refuerzo-mendoza.me/apiv2`.

---

## Verificado

Con Node v23.11.1 y npm 10.9.2 en Windows 11:

| Proyecto                | Instalación                     | Build |
| ----------------------- | ------------------------------- | ----- |
| `refuerzo-apiv2`        | `npm install --no-package-lock` | `npm run build` ✅ |
| `refuerzo-web`          | `npm ci --force`                | `npm run build` ✅ (20 rutas) |
| `formulario_postulantes`| `npm ci`                        | `npm run build` ✅ (1 página estática) |

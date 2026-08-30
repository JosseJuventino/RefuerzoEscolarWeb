# RefuerzoEscolarWeb

Plataforma de refuerzo escolar de William Mendoza. Este monorepo contiene el
backend, el panel/web pública y un prototipo estático del formulario de
postulantes.

Este README es para **levantar el proyecto**. Para entender cómo funciona por
dentro, eso está en [docs/](docs/).

**¿Solo querés arrancar?** `docker compose up -d` y entrás en
<http://localhost:3000> con `admin@local.test` / `admin123`. El detalle está en
[Levantar todo con Docker](#levantar-todo-con-docker-camino-recomendado).

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
| [Probar el flujo en local](docs/probar-el-flujo.md)  | **Práctico.** Ejecutar el flujo completo con comandos, y qué ve cada rol.              |

## Componentes

| Carpeta                                            | Stack                       | Puerto dev | Necesita `.env` |
| -------------------------------------------------- | --------------------------- | ---------- | --------------- |
| [refuerzo-apiv2/](refuerzo-apiv2/)                 | NestJS 10 + TypeORM/MongoDB | `3005`     | Sí — `.env`     |
| [refuerzo-web/](refuerzo-web/)                     | Next.js 15 + NextAuth v5    | `3000`     | Sí — `.env.local` |

`refuerzo-web` **debe** correr en el puerto `3000`: el CORS de la API está
hardcodeado en [main.ts:19-27](refuerzo-apiv2/src/main.ts#L19-L27) y solo
permite `http://localhost:3000`, `http://66.70.189.110` y
`https://refuerzo-mendoza.me`.

---

## Levantar todo con Docker (camino recomendado)

Un solo comando deja Mongo, la API y la web corriendo, con un usuario admin ya
creado y listo para entrar. **No hace falta instalar Node, ni Mongo, ni copiar
ningún `.env`**: el [docker-compose.yml](docker-compose.yml) trae todas las
variables con valores de desarrollo.

El único requisito es **Docker Desktop**.

```bash
docker compose up -d
```

### Desde cero, paso a paso

Lo que hace alguien que recibe el proyecto y no tiene nada instalado. **No
necesita la cadena de conexión de Atlas ni ningún `.env`.**

```bash
# 1. Clonar
git clone <url-del-repo>
cd RefuerzoEscolarWeb

# 2. Levantar todo. La primera vez construye las imágenes (unos minutos).
docker compose up -d

# 3. Cargar los datos reales, que ya vienen en backup/
docker compose run --rm restore
docker compose run --rm seed
```

Y listo: <http://localhost:3000> con `admin@local.test` / `admin123`.

**Si salteás el paso 3**, el proyecto igual levanta y podés entrar: la base
queda vacía pero con el rol `admin` y ese usuario ya creados. Sirve para tocar
código; no vas a ver alumnos, secciones ni postulantes hasta que restaures un
dump.

**Por qué el paso 4 son dos comandos y no uno:** `restore` corre con `--drop`,
así que reemplaza las colecciones enteras — incluida `Users`, y ahí se va el
usuario del seed. El `seed` de después lo recrea sin tocar nada de lo
restaurado.

---

La primera vez tarda unos minutos porque construye las dos imágenes. Después:

| Servicio | Dónde | Qué es |
| -------- | ----- | ------ |
| Web      | <http://localhost:3000>      | El panel. Acá se entra. |
| API      | <http://localhost:3005>      | Las rutas van en la raíz, sin `/api`. |
| Swagger  | <http://localhost:3005/docs> | Documentación de la API. |
| Mongo    | `localhost:27017`            | Base `RefuerzoEscolar`. |

Y entrás en <http://localhost:3000> con:

```
email:    admin@local.test
password: admin123
```

### Qué hace solo, sin que tengas que pedirlo

`docker compose up` encadena cuatro cosas en orden, cada una esperando a la
anterior:

1. **`mongo`** arranca como replica set `rs0`. No es capricho: el reset de
   contraseña usa una transacción ([users.service.ts:972](refuerzo-apiv2/src/users/users.service.ts#L972))
   y las transacciones de Mongo exigen replica set. Con un `mongod` suelto ese
   endpoint falla.
2. **`mongo-init`** hace el `rs.initiate()` y espera a que haya PRIMARY. Corre
   una vez y sale.
3. **`seed`** crea los cinco roles (`admin`, `recomendador`, `alumno`, `tutor`,
   `profesor`) con los permisos que tienen en producción, más el usuario de
   arriba. Esto resuelve el huevo-y-gallina que está explicado más abajo en
   [Primer rol y primer usuario](#primer-rol-y-primer-usuario-bootstrap):
   `POST /users` exige que el rol exista, y `POST /roles` está detrás del
   `AuthGuard`. El script es [scripts/seed.js](refuerzo-apiv2/scripts/seed.js) y
   es **idempotente**: lo que ya existe no lo pisa.
4. **`api`** y **`web`** arrancan en modo watch, con el código montado desde tu
   disco. Si editás un archivo, recompila solo.

### Cargar los datos reales

El seed te da una base vacía con un admin. Los datos reales vienen en el propio
repo, en `backup/`, como un dump de MongoDB comprimido. Para cargarlos:

```bash
docker compose run --rm restore   # restaura el dump en el Mongo local
docker compose run --rm seed      # vuelve a crear el admin
```

**Los dos comandos, en ese orden.** `restore` usa `--drop`, así que reemplaza
las colecciones enteras y se lleva puesto el usuario del seed. Volver a correr
`seed` lo recrea sin tocar nada de lo que restauraste.

### Usuarios de prueba de otros roles

El seed también crea usuarios de cualquier rol, con una contraseña que vos
elegís:

```bash
SEED_ROLE=tutor SEED_EMAIL=tutor@local.test SEED_PASSWORD=tutor12345   docker compose run --rm seed
```

`SEED_ROLE` acepta `admin`, `recomendador`, `alumno`, `tutor` o `profesor`, y el
usuario queda **activo**, sin pasar por el formulario de activación.

Esto no es comodidad: `POST /tutores` y `POST /profesor` mandan la contraseña
temporal por AWS SES y no la devuelven en la respuesta. En local, sin
credenciales de AWS, el correo falla, el endpoint igual responde `201` y queda un
usuario cuya contraseña nadie puede saber. Está explicado en
[Probar el flujo en local](docs/probar-el-flujo.md#el-problema-de-crear-tutores-y-profesores).

### Generar un dump nuevo

Para refrescar el dump con datos más nuevos. Solo lo puede hacer alguien con la
cadena de conexión de Atlas. Sobrescribe `backup/`, así que después hay que
commitear el cambio:

```bash
docker run --rm --env-file refuerzo-apiv2/.env \
  -v "$PWD/backup:/dump" \
  mongo:7 sh -c 'mongodump --uri="$MONGO_URI" --out=/dump --gzip'
```

Se pasa por `--env-file` a propósito: así la contraseña no queda en el historial
de la terminal.

> **Un dump de Mongo no es un backup completo.** Las imágenes y los PDFs no
> están en la base: [images.service.ts:61-79](refuerzo-apiv2/src/images/images.service.ts#L61-L79)
> los escribe al disco del servidor, y Mongo solo guarda la URL. Un respaldo de
> verdad es el dump **más** la carpeta `uploads/` del VPS.


## Instalación manual (sin Docker)

Todo lo que sigue es el camino a mano. Sirve si no querés usar Docker o si
necesitás depurar algo puntual, pero para empezar a trabajar el camino de arriba
es más corto.

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

### Variables de entorno

Copia [refuerzo-apiv2/.env.example](refuerzo-apiv2/.env.example) a
`refuerzo-apiv2/.env`. Lo lee `ConfigModule` con
`envFilePath: ['.env']` ([app.module.ts:25-29](refuerzo-apiv2/src/app.module.ts#L25-L29)).

| Variable                | ¿Obligatoria?               | Para qué sirve |
| ----------------------- | --------------------------- | -------------- |
| `MONGO_URI`             | **Sí**                      | Cadena de conexión a MongoDB. |
| `MONGO_DB`              | **Sí**                      | Nombre de la base. En producción y en los dumps es `RefuerzoEscolar`, en CamelCase. Si acá ponés otro nombre, la app se conecta a una base vacía sin avisar. |
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
MONGO_DB=RefuerzoEscolar
JWT=<pega aquí un secreto aleatorio>
PORT=3005
NEXT_PUBLIC_API_URLV2=http://localhost:3005
```

Genera el secreto con:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```
### Arranque

```bash
npm run start:dev 
npm run start a
npm run build && npm run start:prod
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

## Levantar todo (resumen)

A mano, dos terminales (más Mongo), en este orden. Con Docker esto es un solo
`docker compose up -d`.

```bash
# 0) Mongo
docker start refuerzo-mongo   # o docker run ... la primera vez

# 1) API  -> http://localhost:3005
cd refuerzo-apiv2 && npm run start:dev

# 2) Web  -> http://localhost:3000
cd refuerzo-web && npm run dev
```

---

## Primer rol y primer usuario (bootstrap)

> Si levantaste con Docker, **esto ya está hecho**: lo resuelve el servicio
> `seed`. Lo de acá abajo es el procedimiento a mano, o para entender qué hace
> el seed por dentro. También podés correr solo el script, contra el Mongo que
> quieras: `MONGO_URI=... MONGO_DB=... npm run seed` desde `refuerzo-apiv2/`.

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

### El stack de Docker

Probado el 2026-08-29 con Docker 29.4.1 y Compose v5.1.3 en Windows 11, partiendo
de `docker compose down -v` (base borrada) para simular una máquina nueva:

| Paso | Resultado |
| ---- | --------- |
| `docker compose up -d` desde cero | ✅ 1m13s con las imágenes ya construidas |
| Lo mismo **sin ningún `.env` en el disco** | ✅ arranca igual; las variables salen del compose |
| Replica set `rs0` iniciado y con PRIMARY | ✅ automático, vía `mongo-init` |
| Seed en base vacía | ✅ crea rol `admin` (15 permisos) + usuario activo |
| API compilando y respondiendo | ✅ `POST /auth/login` → 201 |
| Login directo contra la API | ✅ 200, devuelve token y `role: admin` |
| Login vía NextAuth en la web | ✅ 302 → `/dashboard`, sesión con `role: admin` |
| `GET /dashboard` con sesión | ✅ 200 |
| `docker compose run --rm restore` | ✅ 1257 documentos, 0 fallidos |
| Seed después del restore | ✅ respeta el rol restaurado, recrea solo el usuario |
| Consulta autenticada con datos restaurados | ✅ `GET /grado` devuelve los 5 grados reales |

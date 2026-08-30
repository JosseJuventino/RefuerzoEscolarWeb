# Probar el flujo completo en local

Los otros documentos explican **cómo funciona** el sistema. Este explica **cómo
ejecutarlo vos mismo** en tu máquina, con comandos que se copian y pegan.

Todo lo que está acá fue ejecutado contra el stack de Docker del
[README](../README.md#levantar-todo-con-docker-camino-recomendado), con los datos
reales restaurados. Las respuestas que se muestran son las que devolvió la API.

Antes de empezar, necesitás el stack arriba:

```bash
docker compose up -d
```

## Crear usuarios de prueba de cualquier rol

El seed crea **los cinco roles** (`admin`, `recomendador`, `alumno`, `tutor`,
`profesor`) con los permisos que tienen en producción, y un usuario con la
contraseña que vos elijas.

Por defecto crea el admin:

```bash
docker compose run --rm seed
# admin@local.test / admin123
```

Para crear un usuario de otro rol:

```bash
SEED_ROLE=tutor SEED_EMAIL=tutor@local.test SEED_PASSWORD=tutor12345 \
  docker compose run --rm seed
```

`SEED_ROLE` acepta `admin`, `recomendador`, `alumno`, `tutor` o `profesor`. El
usuario se crea **activo**, así que entra directo sin pasar por el formulario de
activación.

> **Esto no es un lujo, es la única forma de tener un tutor o un profesor usable
> en local.** Está explicado abajo, en
> [El problema de crear tutores y profesores](#el-problema-de-crear-tutores-y-profesores).

## El flujo de postulación, de punta a punta

Este es el flujo que describe [Postulación](postulacion.md), ejecutado paso a
paso. Sirve para verificar que el entorno quedó bien armado.

### Paso 0: conseguir un token

Todo lo que sigue va con `Authorization: Bearer <token>`.

```bash
TOKEN=$(curl -s -X POST http://localhost:3005/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@local.test","password":"admin123"}' \
  | python -c "import sys,json; print(json.load(sys.stdin)['data']['token'])")
```

> El token **no es un JWT**, es un hash de bcrypt que empieza con `$2a$10$`. La
> API guarda el JWT real en la colección `Tokens` y lo busca por ese hash. Si
> venís de leer [generate_postulante.py](../refuerzo-apiv2/generate_postulante.py),
> su función `validate_token()` exige que el token empiece con `eyJ` — eso está
> mal y hay que ignorarlo.

### Paso 1: ver los grados y programas disponibles

El postulante necesita un `grado` y un `programa` que existan:

```bash
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3005/grado
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3005/programa
```

### Paso 2: crear el postulante

```bash
curl -s -X POST http://localhost:3005/postulantes \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{
    "nombre": "Prueba Handoff",
    "imagen": "http://localhost:3005/uploads/logos/logo.webp",
    "direccion": "Calle de prueba 123",
    "telefono": "70000001",
    "telefonoEncargado": "70000002",
    "email": "prueba.handoff@local.test",
    "grado": "<id de un grado>",
    "isUser": false,
    "programa": "<id de un programa>"
  }'
```

Respuesta:

```json
{
  "statusCode": 201,
  "message": "Postulante created successfully",
  "data": {
    "postulanteId": "...",
    "email": "prueba.handoff@local.test",
    "temporaryPassword": "161ae85afef3a901"
  }
}
```

**Guardá esa `temporaryPassword`.** Es la única vez que se ve: al alumno no se le
manda ningún correo.

El **recomendador sale del token**, no del body. El controller usa `req.user.id`
([postulante.controller.ts:39](../refuerzo-apiv2/src/postulante/controller/postulante.controller.ts#L39)),
así que el `?recomendadorId=` que manda el script de Python se ignora: el
recomendador va a ser el dueño del token que usaste.

En este punto la base tiene:

| Colección     | Estado                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------- |
| `Postulantes` | El documento, con `isUser: false`                                                            |
| `Users`       | La cuenta, con rol `alumno`, `isActive: false`, y `idDependingRole` apuntando al postulante   |
| `Alumnos`     | **Vacío.** Todavía no existe                                                                 |

### Paso 3: el alumno entra y activa la cuenta

```bash
TOKALU=$(curl -s -X POST http://localhost:3005/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"prueba.handoff@local.test","password":"161ae85afef3a901"}' \
  | python -c "import sys,json; print(json.load(sys.stdin)['data']['token'])")
```

El login devuelve `isActive: false`. Con eso la web no muestra el panel: manda al
formulario de activación obligatorio. Ese formulario es un `PATCH /profile/me`:

```bash
curl -s -X PATCH http://localhost:3005/profile/me \
  -H "Authorization: Bearer $TOKALU" -H "Content-Type: application/json" \
  -d '{"image":"http://localhost:3005/uploads/users/Mico.webp","telefono":"70000003","password":"alumno12345"}'
```

La contraseña tiene que ser de **8 a 30 caracteres** y el teléfono de **8 a 15**,
por el `UpdateProfileDto`. Si no, devuelve `400`.

### Paso 4: verificar que el alumno entró a su sección

Esa única llamada disparó tres cosas más. Para verlas:

```bash
docker compose exec -T mongo mongosh --quiet --eval '
var d = db.getSiblingDB("RefuerzoEscolar");
var p = d.Postulantes.findOne({email:"prueba.handoff@local.test"});
print("postulante.isUser: " + p.isUser);
var a = d.Alumnos.findOne({email:"prueba.handoff@local.test"});
print("alumno: " + (a ? a._id : "no existe"));
if (a) d.Secciones.find({alumnos: a._id.toString()}).forEach(s => print("seccion: " + s.nombre));'
```

Resultado esperado:

```
postulante.isUser: true
alumno: 6a939c5e69015f01f4793ef2
seccion: Matematicas - 7° Grado
```

Es decir: el postulante quedó marcado como convertido, se creó el `Alumno`, y
entró automáticamente a **todas** las secciones que tengan su mismo `gradoId`.

Recién en este punto el estudiante aparece en la pestaña de personas y en la
lista de asistencia. Si alguien pregunta *"¿por qué no me sale este alumno?"*, la
respuesta casi siempre es que todavía no activó la cuenta.

## Qué ve cada rol

Medido llamando a la API con un token de cada rol, contra los roles reales de
producción:

| Endpoint           | admin | recomendador | alumno | tutor | profesor |
| ------------------ | :---: | :----------: | :----: | :---: | :------: |
| `GET /seccion`     | 200   | 403          | 200    | 200   | 200      |
| `GET /documents`   | 200   | 403          | 403    | 200   | 200      |
| `GET /alumno`      | 200   | 403          | 403    | 403   | 200      |
| `GET /grado`       | 200   | 200          | 403    | 403   | 200      |
| `GET /postulantes` | 200   | 200          | 403    | 403   | 403      |
| `GET /users`       | 200   | 403          | 403    | 403   | 403      |

Los permisos exactos que tiene cada rol en producción:

| Rol            | Recursos con permiso                                                                          |
| -------------- | --------------------------------------------------------------------------------------------- |
| `admin`        | Los 14, todos con `view` y `edit`                                                              |
| `recomendador` | `asistencias`, `grado` (solo view), `image`, `postulantes`, `profile`, `programa` (solo view)   |
| `alumno`       | `image`, `profile`, `secciones`                                                                |
| `tutor`        | `document`, `image`, `profile`, `secciones`                                                    |
| `profesor`     | `alumnos`, `document`, `grado` (solo view), `image`, `profile`, `secciones`, `tutores`          |

Cómo se evalúan esos permisos está en [Roles y permisos](roles-y-permisos.md).

> **El rol `admin` de producción no tiene `profile`.** Es el único de los cinco al
> que le falta. Como `PATCH /profile/me` exige `profile` con `view` y `edit`, **un
> admin en producción no puede actualizar su propio perfil**: recibe `403`. El
> seed de local sí se lo agrega, para poder probar el flujo de activación con una
> cuenta de admin. Si vas a replicar el comportamiento exacto de producción,
> tenelo presente.

## Tutores y profesores

Los dos son **encargados de sección**. No se asignan a un alumno: se asignan a una
sección, y la sección tiene un arreglo `encargados` con los `_id` de los usuarios.
Está explicado en [Cursos y secciones](cursos-y-secciones.md).

La diferencia entre los dos es de permisos, no de mecánica:

- El **tutor** ve secciones y documentos. Publica en el tablón y registra
  asistencia.
- El **profesor** hace todo eso y además ve alumnos, grados y tutores.

En la web, las pestañas de asistencia de una sección solo se dibujan si el rol es
`admin`, `profesor` o `tutor`. El alumno ve nada más Tablón y Personas.

### El problema de crear tutores y profesores

`POST /tutores` y `POST /profesor` **no sirven en local**. Es el bloqueo más
molesto del entorno de desarrollo y conviene saberlo antes de perder una hora.

Lo que pasa cuando llamás a `POST /tutores`:

1. El usuario se crea bien, con `isActive: false` y una contraseña temporal
   aleatoria.
2. La API intenta mandar esa contraseña por AWS SES.
3. En local no hay credenciales de AWS, así que SES falla. En los logs aparece
   `Error sending email: InternalServerErrorException`.
4. El `try/catch` se traga el error y **el endpoint igual responde `201`**.
5. La respuesta trae `"data": null`, sin la contraseña.

Resultado: queda un usuario en la base cuya contraseña **nadie puede saber**. Ni
está en la respuesta, ni salió por correo, ni se puede deducir del hash.

La salida es no usar esos endpoints en local y crear el usuario con el seed:

```bash
SEED_ROLE=tutor SEED_EMAIL=tutor@local.test SEED_PASSWORD=tutor12345 \
  docker compose run --rm seed
```

Si ya creaste uno inservible, borralo antes:

```bash
docker compose exec -T mongo mongosh --quiet --eval \
  'db.getSiblingDB("RefuerzoEscolar").Users.deleteOne({email:"el-que-sea@local.test"})'
```

Esto **no** aplica al alumno: la postulación devuelve la contraseña en la
respuesta HTTP, así que ese flujo sí se puede seguir completo en local.

## Los scripts de Python

[generate_user.py](../refuerzo-apiv2/generate_user.py) y
[generate_postulante.py](../refuerzo-apiv2/generate_postulante.py) hacen carga
masiva desde `registro.xlsx` y escriben un `.xlsx` con las credenciales generadas.
Es como se cargaron los grupos hasta ahora.

Antes de usarlos hay que editar la configuración del inicio del archivo, porque
está toda quemada:

| Constante                             | Qué tiene hoy               | Qué debería tener                        |
| ------------------------------------- | --------------------------- | ---------------------------------------- |
| `POSTULANTE_API_URL` / `USER_API_URL` | `http://localhost:7777/...` | `http://localhost:3005/...`              |
| `AUTH_TOKEN`                          | Un token viejo              | Uno recién sacado del login              |
| `ID_GRADO`                            | Un `_id` de producción      | El `_id` del grado que corresponda       |
| `ID_RECOMENDADOR`                     | Un `_id` de producción      | **Se ignora**, ver abajo                 |
| `SHEET_NAME`                          | `"Noveno"` / `"Septimo"`    | La hoja del Excel que vayas a cargar     |

Dos cosas más:

- El **puerto 7777 está mal**. La API escucha en el 3005.
- `ID_RECOMENDADOR` se manda como query param pero **la API lo ignora**: toma el
  recomendador del token. Si querés que las postulaciones queden a nombre de
  alguien, tenés que usar el token de esa persona.

Necesitan Python con `pandas`, `requests` y `openpyxl`:

```bash
pip install pandas requests openpyxl
```

> Los `.xlsx` que producen tienen nombres, correos y contraseñas de estudiantes
> reales, igual que el dump de `backup/`. Es una de las razones por las que este
> repositorio tiene que seguir siendo privado.

## Limpiar los datos de prueba

Lo que creaste siguiendo esta guía se borra así:

```bash
docker compose exec -T mongo mongosh --quiet --eval '
var d = db.getSiblingDB("RefuerzoEscolar");
var a = d.Alumnos.findOne({email:"prueba.handoff@local.test"});
if (a) d.Secciones.updateMany({}, {$pull: {alumnos: a._id.toString()}});
d.Alumnos.deleteMany({email:"prueba.handoff@local.test"});
d.Users.deleteMany({email:{$in:["prueba.handoff@local.test","tutor@local.test"]}});
d.Postulantes.deleteMany({email:"prueba.handoff@local.test"});'
```

O, si preferís empezar de cero:

```bash
docker compose down -v && docker compose up -d
docker compose run --rm restore && docker compose run --rm seed
```
